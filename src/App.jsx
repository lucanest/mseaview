import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LinkIcon, DocumentDuplicateIcon,PencilSquareIcon,XMarkIcon, Bars3Icon  } from '@heroicons/react/24/outline';
import { FixedSizeGrid as Grid } from 'react-window';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import PhyloTreeViewer from './components/PhyloTreeViewer.jsx';
import Histogram from './components/Histogram.jsx';

const residueColors = {
  A: 'bg-green-200', C: 'bg-yellow-200', D: 'bg-red-200', E: 'bg-red-200',
  F: 'bg-purple-200', G: 'bg-gray-200', H: 'bg-pink-200', I: 'bg-blue-200',
  K: 'bg-orange-200', L: 'bg-blue-200', M: 'bg-blue-100', N: 'bg-red-100',
  P: 'bg-teal-200', Q: 'bg-red-100', R: 'bg-orange-300', S: 'bg-green-100',
  T: 'bg-green-100', V: 'bg-blue-100', W: 'bg-purple-300', Y: 'bg-purple-100',
  '-': 'bg-white'
};

function PanelHeader({
  id,
  prefix = '',
  filename,
  setPanelData,
  editing,
  setEditing,
  filenameInput,
  setFilenameInput,
  extraButtons = [],
  onDuplicate,
  onLinkClick,
  isLinkModeActive,
  isLinked,
  onRemove,
}) {
  return (
    <div className="panel-drag-handle bg-gray-100 p-1 mb-2 cursor-move flex items-center justify-between font-bold">
      <div className="w-12" />
      <div className="flex-1 flex justify-center">
        <EditableFilename
          id={id}
          filename={filename}
          setPanelData={setPanelData}
          prefix={prefix}
          editing={editing}
          setEditing={setEditing}
          filenameInput={filenameInput}
          setFilenameInput={setFilenameInput}
        />
      </div>
      <div className="flex items-center gap-1">
        {extraButtons.map((btn, i) => <React.Fragment key={i}>{btn}</React.Fragment>)}
        <DuplicateButton onClick={() => onDuplicate(id)} />
        <LinkButton
          onClick={() => onLinkClick(id)}
          isLinked={isLinked}
          isLinkModeActive={isLinkModeActive}
        />
        <RemoveButton onClick={() => onRemove(id)} />
      </div>
    </div>
  );
}

function parseFasta(content) {
  const lines = content.split(/\r?\n/);
  const result = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith(">")) {
      if (current) result.push(current);
      current = { id: line.slice(1).trim(), sequence: "" };
    } else if (current) {
      current.sequence += line.trim();
    }
  }
  if (current) result.push(current);

  return result;
}

function EditableFilename({ 
  id, 
  filename, 
  setPanelData, 
  prefix = '', 
  className = '' 
}) {
  const [editing, setEditing] = useState(false);
  const [filenameInput, setFilenameInput] = useState(filename);

  useEffect(() => {
    setFilenameInput(filename);
  }, [filename]);

  return editing ? (
    <form
      onSubmit={e => {
        e.preventDefault();
        setPanelData(prev => ({
          ...prev,
          [id]: { ...prev[id], filename: filenameInput }
        }));
        setEditing(false);
      }}
      className={`inline ${className}`}
    >
      <input
        className="border rounded px-1 w-32 text-sm"
        value={filenameInput}
        onChange={e => setFilenameInput(e.target.value)}
        autoFocus
        onBlur={() => setEditing(false)}
      />
    </form>
  ) : (
    <div className="flex items-center">
      <span>{prefix}{filename}</span>
      <button
        type="button"
        className="ml-2 p-0.5"
        onClick={() => setEditing(true)}
        title="Edit filename"
      >
        <span className="inline-flex items-center justify-center w-6 h-6">
          <PencilSquareIcon className="w-5 h-5 text-gray-700"/>
        </span>
      </button>
    </div>
  );
}


function DuplicateButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-0.5"
      title="Duplicate panel"
    >
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-200 border border-gray-400 hover:bg-blue-300">
        <DocumentDuplicateIcon className="w-5 h-5 text-gray-700" />
      </span>
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-0.5"
      title="Remove panel">
<span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-200 border border-gray-400 hover:bg-red-300">
        <XMarkIcon className="w-5 h-5 text-gray-700" />
      </span>
    </button>
  );
}

function LinkButton({ onClick, isLinked, isLinkModeActive }) {
  return (
  <button
        onClick={onClick}
        className="p-0.5"
        title={isLinked ? 'Unlink panels' : 'Link panel'}>
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-yellow-300
        ${isLinkModeActive ? 'bg-blue-200' :
        isLinked         ? 'bg-green-200' :
                           'bg-gray-200'}
        border border-gray-400`}>
          <LinkIcon
          className={`
            w-5 h-5
            ${isLinkModeActive ? 'text-blue-700' :
              isLinked         ? 'text-green-700' :
                                'text-gray-500'}`}
            aria-hidden="true"
          />
        </span>
      </button>
  );
}

function CodonToggleButton({ onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className="p-0.5"
      title="Toggle codon view"
    >
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded
        ${isActive ? 'bg-purple-200' : 'bg-gray-200'}
        border border-gray-400 hover:bg-purple-300`}>
        <span className="text-xs font-bold text-purple-800 leading-none">
          <Bars3Icon className="w-5 h-5" />
        </span>
      </span>
    </button>
  );
}

function Tooltip({ x, y, children }) {
  return (
    <div
      className="fixed px-1 py-0.5 text-xs bg-gray-200 rounded-xl pointer-events-none z-50"
      style={{ top: y+24, left: x+14}}
    >
      {children}
    </div>
  );
}

function PanelContainer({ id, linkedTo, hoveredPanelId, setHoveredPanelId, children, onDoubleClick }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden h-full flex flex-col bg-white
        shadow-lg
        ${hoveredPanelId === id ? 'shadow-xl' : ''}
        ${linkedTo && (hoveredPanelId === id || hoveredPanelId === linkedTo) ? 'shadow-blue-400/50' : ''}
      `}
      onMouseEnter={() => setHoveredPanelId(id)}
      onMouseLeave={() => setHoveredPanelId(null)}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
}



const AlignmentPanel = React.memo(function AlignmentPanel({
  id,
  data,
  onRemove, onReupload, onDuplicate,
  onLinkClick, isLinkModeActive, isLinked, linkedTo,
  highlightedSite, highlightOrigin, onHighlight,
  onSyncScroll, externalScrollLeft,
  highlightedSequenceId, setHighlightedSequenceId,hoveredPanelId,
  setHoveredPanelId, setPanelData
}) {
  const msaData = data.data;
  const filename = data.filename;
  const containerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const gridRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [filenameInput, setFilenameInput] = useState(filename);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [hoveredCol, setHoveredCol] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [codonMode, setCodonMode] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const LABEL_WIDTH = 66;
  const CELL_SIZE = 24;

  useEffect(() => {
  setFilenameInput(filename);
}, [filename]);

  useEffect(() => {
    if (!gridContainerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (let { contentRect } of entries) {
        setDims({
          width: contentRect.width,
          height: contentRect.height
        });
      }
    });
    ro.observe(gridContainerRef.current);
    const { width, height } = gridContainerRef.current.getBoundingClientRect();
    setDims({ width, height });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (gridRef.current && typeof externalScrollLeft === 'number') {
      gridRef.current.scrollTo({ scrollLeft: externalScrollLeft });
    }
  }, [externalScrollLeft]);

  const rowCount = msaData.length;
  const colCount = msaData[0]?.sequence.length || 0;

  const onScroll = ({ scrollTop, scrollLeft }) => {
    setScrollTop(scrollTop);
    if (linkedTo != null && scrollLeft != null) {
      onSyncScroll(scrollLeft, id);
    }
  };

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const char = msaData[rowIndex].sequence[columnIndex];
    const baseBg = residueColors[char.toUpperCase()] || 'bg-white';

    const isHoverHighlight = codonMode
      ? hoveredCol != null && Math.floor(hoveredCol / 3) === Math.floor(columnIndex / 3)
      : hoveredCol === columnIndex;

    const isLinkedHighlight =
      linkedTo &&
      highlightedSite != null &&
      (linkedTo === highlightOrigin || id === highlightOrigin) &&
      (codonMode
        ? columnIndex >= Math.floor(highlightedSite / 3) * 3 &&
          columnIndex < Math.floor(highlightedSite / 3) * 3 + 3
        : columnIndex === highlightedSite);

    return (
      <div
        style={style}
        className={`flex items-center justify-center ${baseBg} ${
          isHoverHighlight || isLinkedHighlight ? 'alignment-highlight' : ''
        }`}
        onMouseEnter={e => {
          setHoveredCol(columnIndex);
          onHighlight(columnIndex, id);
          const rect = containerRef.current.getBoundingClientRect();
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseMove={e => {
          const rect = containerRef.current.getBoundingClientRect();
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => {
          setHoveredCol(null);
          if (id === highlightOrigin) {
            onHighlight(null, id);
          }
        }}
      >
        {char}
      </div>
    );
  }, [msaData, hoveredCol, highlightedSite, highlightOrigin, linkedTo, id, onHighlight, codonMode]);

  return (
    <PanelContainer
  id={id}
  linkedTo={linkedTo}
  hoveredPanelId={hoveredPanelId}
  setHoveredPanelId={setHoveredPanelId}
  onDoubleClick={() => onReupload(id)}
>
      <div
        ref={containerRef}
        className="relative flex flex-col h-full border rounded-xl bg-white"
        onMouseLeave={() => {
          setHoveredCol(null);
          if (id === highlightOrigin) {
            onHighlight(null, id);
          }
        }}
      >
      <PanelHeader
         id={id}
         prefix="MSA: "
         filename={filename}
         setPanelData={setPanelData}
         editing={editing}
         setEditing={setEditing}
         filenameInput={filenameInput}
         setFilenameInput={setFilenameInput}
         extraButtons={[
           <CodonToggleButton
             onClick={() => setCodonMode(m => !m)}
             isActive={codonMode}
           />
         ]}
         onDuplicate={onDuplicate}
         onLinkClick={onLinkClick}
         isLinkModeActive={isLinkModeActive}
         isLinked={isLinked}
         onRemove={onRemove}
       />
      

        {hoveredCol != null && id === highlightOrigin && (
          <Tooltip x={tooltipPos.x} y={tooltipPos.y}>
            {codonMode
              ? `Codon ${Math.floor(hoveredCol / 3) + 1}`
              : `Site ${hoveredCol + 1}`}
          </Tooltip>
        )}

        {highlightedSite != null &&
          linkedTo === highlightOrigin &&
          id !== highlightOrigin && (
            <Tooltip x={tooltipPos.x} y={tooltipPos.y}>
              {codonMode
                ? `Codon ${Math.floor(highlightedSite / 3) + 1}`
                : `Site ${highlightedSite + 1}`}
            </Tooltip>
          )}

        <div
          ref={gridContainerRef}
          className="flex-1 flex overflow-hidden font-mono text-sm"
        >
          <div
            style={{
              width: LABEL_WIDTH * 1.9,
              height: dims.height,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                transform: `translateY(-${scrollTop || 0}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              {msaData.map((seq, index) => {
                const rawId = seq.id.replace(/\s+/g, ' ').trim();
                const shortId = rawId.length > 10 ? rawId.slice(0, 8) + '..' : rawId;
                const isLinkedNameHighlight =
                  linkedTo &&
                  highlightedSequenceId === seq.id &&
                  (linkedTo === highlightOrigin || id === highlightOrigin);

                return (
                  <div
                    key={index}
                    style={{
                      height: CELL_SIZE,
                      lineHeight: `${CELL_SIZE}px`
                    }}
                    className={`flex items-center pr-2 pl-2 text-right font-bold truncate ${
                      isLinkedNameHighlight ? 'bg-yellow-100' : ''
                    }`}
                    title={rawId}
onMouseEnter={() => {
  if (linkedTo) {
    setHighlightedSequenceId(seq.id);
  }
}}
onMouseLeave={() => {
  if (linkedTo) {
    setHighlightedSequenceId(null);
  }
}}
                  >
                    {shortId}
                  </div>
                );
              })}
            </div>
          </div>

          <Grid
            ref={gridRef}
            columnCount={colCount}
            columnWidth={CELL_SIZE}
            height={dims.height}
            rowCount={rowCount}
            rowHeight={CELL_SIZE}
            width={Math.max(dims.width - LABEL_WIDTH, 0)}
            onScroll={onScroll}
          >
            {Cell}
          </Grid>
        </div>
      </div>
    </PanelContainer>
  );
});
const TreePanel = React.memo(function TreePanel({
  id, data, onRemove, onReupload, onDuplicate,
  highlightedSequenceId, onHoverTip,
  linkedTo, highlightOrigin,
  onLinkClick, isLinkModeActive, isLinked,hoveredPanelId,
  setHoveredPanelId, setPanelData
}) {
  const { data: newick, filename, isNhx } = data;
  const [editing, setEditing] = useState(false);
  const [filenameInput, setFilenameInput] = useState(filename);

  useEffect(() => {
  setFilenameInput(filename);
}, [filename]);
  return (
    <PanelContainer
  id={id}
  linkedTo={linkedTo}
  hoveredPanelId={hoveredPanelId}
  setHoveredPanelId={setHoveredPanelId}
  onDoubleClick={() => onReupload(id)}
>
        <PanelHeader
        id={id}
        prefix="Tree: "
        filename={filename}
        setPanelData={setPanelData}
        editing={editing}
        setEditing={setEditing}
        filenameInput={filenameInput}
        setFilenameInput={setFilenameInput}
        onDuplicate={onDuplicate}
        onLinkClick={onLinkClick}
        isLinkModeActive={isLinkModeActive}
        isLinked={isLinked}
        onRemove={onRemove}
      />
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <PhyloTreeViewer
          newick={newick}
          isNhx={isNhx}
          highlightedSequenceId={highlightedSequenceId}
          onHoverTip={onHoverTip}
          linkedTo={linkedTo}
          highlightOrigin={highlightOrigin}
        />
      </div>
    </PanelContainer>
  );
});

const HistogramPanel = React.memo(function HistogramPanel({ id, data, onRemove, onReupload, onDuplicate,
  onLinkClick, isLinkModeActive, isLinked, linkedTo,
  highlightedSite, highlightOrigin, onHighlight, hoveredPanelId,
  setHoveredPanelId, setPanelData
}) {
  const { filename } = data;
  const [editing, setEditing] = useState(false);
  const [filenameInput, setFilenameInput] = useState(filename);
  const isTabular = !Array.isArray(data.data);
  const [selectedCol, setSelectedCol] = useState(
    // Try to restore from data.selectedCol, fallback to first numeric col
    isTabular
      ? (data.selectedCol ||
         data.data.headers.find(h => typeof data.data.rows[0][h] === 'number'))
      : null
  );
  const numericCols = isTabular
    ? data.data.headers.filter(h =>
        data.data.rows.every(row => typeof row[h] === 'number')
      )
    : [];
  const valuesToPlot = isTabular && selectedCol
    ? data.data.rows.map(row => row[selectedCol])
    : !isTabular
      ? data.data
      : [];

  const chartContainerRef = useRef(null);
  const [height, setHeight] = useState(300); // default height
  useEffect(() => {
  setFilenameInput(filename);
}, [filename]);
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const handleResize = () => {
      setHeight(chartContainerRef.current.offsetHeight);
    };
    handleResize();
    const ro = new window.ResizeObserver(handleResize);
    ro.observe(chartContainerRef.current);
    return () => ro.disconnect();
  }, []);
  // pass highlight props into Histogram
  return (
    <PanelContainer
  id={id}
  linkedTo={linkedTo}
  hoveredPanelId={hoveredPanelId}
  setHoveredPanelId={setHoveredPanelId}
  onDoubleClick={() => onReupload(id)}
>
        <PanelHeader
        id={id}
        prefix="Data: "
        filename={filename}
        setPanelData={setPanelData}
        editing={editing}
        setEditing={setEditing}
        filenameInput={filenameInput}
        setFilenameInput={setFilenameInput}
        onDuplicate={onDuplicate}
        onLinkClick={onLinkClick}
        isLinkModeActive={isLinkModeActive}
        isLinked={isLinked}
        onRemove={onRemove}
      />
      <div className="p-2">
        {isTabular && (
          <>
            <label className="mr-2">Select column:</label>
            <select
              value={selectedCol}
                   onChange={e => {
                setSelectedCol(e.target.value);
                // Persist selectedCol in panelData
                setPanelData(prev => ({
                  ...prev,
                  [id]: {
                    ...prev[id],
                    selectedCol: e.target.value
                  }
                }));
              }}
              className="border rounded-xl p-1"
            >
              {numericCols.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </>
        )}
      </div>
      <div ref={chartContainerRef} className="flex flex-col h-full px-2 pb-2 overflow-hidden">
  <Histogram
    values={valuesToPlot}
    panelId={id}
    onHighlight={onHighlight}
    highlightedSite={highlightedSite}
    highlightOrigin={highlightOrigin}
    linkedTo={linkedTo}
    height={height}
  />
</div>
  </PanelContainer>
  );
});


function App() {
  const [panels, setPanels] = useState([]);
  const [layout, setLayout] = useState([]);
  const [linkMode, setLinkMode] = useState(null);
  const [panelLinks, setPanelLinks] = useState({}); // { [id]: linkedId }
  const [scrollPositions, setScrollPositions] = useState({});
  const [highlightSite, setHighlightSite] = useState(null);
  const [highlightOrigin, setHighlightOrigin] = useState(null);
  const [highlightedSequenceId, setHighlightedSequenceId] = useState(null);
  const [panelData, setPanelData] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredPanelId, setHoveredPanelId] = useState(null);
  const fileInputRef = useRef(null);
  const fileInputRefWorkspace = useRef(null);
  const pendingTypeRef = useRef(null);
  const pendingPanelRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onSyncScroll = (scrollLeft, originId) => {
    const targetId = panelLinks[originId];
    if (targetId) {
      setScrollPositions(prev => ({
        ...prev,
        [targetId]: scrollLeft
      }));
    }
  };

  const duplicatePanel = (id) => {
  const panel = panels.find(p => p.i === id);
  const data = panelData[id];
  if (!panel || !data) return;

  const newId = `${panel.type}-${Date.now()}`;
  const newPanel = { ...panel, i: newId };

  // Copy panel layout
  const originalLayout = layout.find(l => l.i === id);
  const newLayout = {
    ...originalLayout,
    i: newId,
    x: (originalLayout.x + 1) % 12, // offset to prevent overlap
    y: originalLayout.y + 1
  };

  setPanels(prev => [...prev.filter(p => p.i !== '__footer'), newPanel, { i: '__footer', type: 'footer' }]);
  setLayout(prev => {
    const withoutFooter = prev.filter(l => l.i !== '__footer');
    const footer = prev.find(l => l.i === '__footer');
    return [...withoutFooter, newLayout, footer];
  });
  setPanelData(prev => ({ ...prev, [newId]: JSON.parse(JSON.stringify(data)) }));
  };

  const handleLinkClick = (id) => {
    if (!linkMode) {
      // no panel selected yet
      if (panelLinks[id]) {
        // currently linked: unlink both
        const other = panelLinks[id];
        setPanelLinks(pl => {
          const copy = { ...pl };
          delete copy[id]; delete copy[other];
          return copy;
        });
      } else {
        // start linking
        setLinkMode(id);
      }
    } else {
      // linking in progress
      if (linkMode === id) {
        // cancelled
        setLinkMode(null);
      } else {
        // link or unlink
        const a = linkMode;
        const b = id;
        if (panelLinks[a] === b) {
          // already linked: unlink
          setPanelLinks(pl => {
            const copy = { ...pl };
            delete copy[a]; delete copy[b];
            return copy;
          });
        } else {
          // create new link: first unlink any existing
          setPanelLinks(pl => {
  const copy = { ...pl };
  // Unlink any existing partner of “a”
  const oldA = copy[a];
  if (oldA) {
    delete copy[a];
    delete copy[oldA];
  }
  // Unlink any existing partner of “b”
  const oldB = copy[b];
  if (oldB) {
    delete copy[b];
    delete copy[oldB];
  }
  // Create new link
  copy[a] = b;
  copy[b] = a;
  return copy;
});
        }
        setLinkMode(null);
      }
    }
    // clear any existing highlights
    setHighlightSite(null);
    setHighlightOrigin(null);
  };

  const CELL_SIZE = 24;
  const handleHighlight = (site, originId) => {
    setHighlightSite(site);
    setHighlightOrigin(originId);

    const targetId = panelLinks[originId];
    if (!targetId || site == null) return;

    const sourcePanel = panels.find(p => p.i === originId);
    const targetPanel = panels.find(p => p.i === targetId);
    if (!sourcePanel || !targetPanel) return;

    if (sourcePanel.type === 'histogram' && targetPanel.type === 'alignment') {
      setScrollPositions(prev => ({
        ...prev,
        [targetId]: site * CELL_SIZE
      }));
    }
  };

  // Trigger upload or reupload
  const triggerUpload = (type, panelId = null) => {
    pendingTypeRef.current = type;
    pendingPanelRef.current = panelId;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = pendingTypeRef.current;
    const isReupload = Boolean(pendingPanelRef.current);
    const id = isReupload ? pendingPanelRef.current : `${type}-${Date.now()}`;
    const filename = file.name;

    let panelPayload;
  if (type === 'alignment') {
    const text = await file.text();
    const parsed = parseFasta(text);
    panelPayload = { data: parsed, filename };
  } else if (type === 'tree') {
      const text = await file.text();
      const isNhx = /\.nhx$/i.test(filename) || text.includes('[&&NHX');
      panelPayload = { data: text, filename, isNhx };
  } else if (type === 'histogram') {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      if (
  (filename.toLowerCase().endsWith('.tsv') && lines[0].includes('\t')) ||
  (filename.toLowerCase().endsWith('.csv') && lines[0].includes(','))
  ) {
  const isTSV = filename.toLowerCase().endsWith('.tsv');
  const delimiter = isTSV ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(delimiter);
    const obj = {};
    headers.forEach((h, i) => {
      const v = cols[i]?.trim();
      const n = Number(v);
      obj[h] = isNaN(n) ? v : n;
    });
    return obj;
  });
  panelPayload = { data: { headers, rows }, filename };
  }
      else {
        const values = text.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
        panelPayload = { data: values, filename };
      }
    }

    // Update or add panel data
    setPanelData(prev => ({ ...prev, [id]: panelPayload }));

    if (!isReupload) {
      // Add new panel in layout
      setPanels(prev => {
        const withoutFooter = prev.filter(p => p.i !== '__footer');
        return [
          ...withoutFooter,
          { i: id, type },
          { i: '__footer', type: 'footer' }
        ];
      });
      const layoutWithoutFooter = layout.filter(l => l.i !== '__footer');
      const maxY = layoutWithoutFooter.reduce((max, l) => Math.max(max, l.y + l.h), 0);
      const newPanelLayout = { i: id, x: (layoutWithoutFooter.length * 4) % 12, y: maxY, w: 4, h: 20, minW: 3, minH: 5 };
      setLayout([...layoutWithoutFooter, newPanelLayout, { i: '__footer', x: 0, y: maxY + 1, w: 12, h: 2, static: true }]);
    }

    // Reset input
    pendingTypeRef.current = null;
    pendingPanelRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

const removePanel = id => {
  setPanels(p => p.filter(p => p.i !== id));
  setPanelData(d => { const c={...d}; delete c[id]; return c; });
  setLayout(l => l.filter(e => e.i !== id));
  setPanelLinks(pl => {
    const c = { ...pl };
    const other = c[id];
    delete c[id];
    if (other) delete c[other];
    return c;
  });
  setScrollPositions(sp => {
    const c = { ...sp };
    delete c[id];
    return c;
  });
  if (highlightOrigin === id) {
    setHighlightOrigin(null);
    setHighlightSite(null);
  }
};

  const handleLoadWorkspace = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const workspace = JSON.parse(text);
    setPanels(workspace.panels || []);
    setLayout(workspace.layout || []);
    setPanelData(workspace.panelData || {});
    setPanelLinks(workspace.panelLinks || {});
  } catch (err) {
    alert('Invalid workspace file');
  }
  fileInputRefWorkspace.current.value = null;
};

const handleSaveWorkspace = () => {
  const workspace = {
    panels,
    layout,
    panelData,
    panelLinks
  };
  const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mseaview-workspace.json';
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-black">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center justify-start w-full">
          {'MSEAVIEW'.split('').map((char, i) => (
            <span key={i} className={`w-16 h-16 flex items-center justify-center text-5xl font-bold leading-none ${residueColors[char]} `}>{char}</span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
  onClick={handleSaveWorkspace}
  className="w-40 h-20 bg-gray-200 text-black px-4 py-2 rounded-xl hover:bg-gray-300 shadow-lg hover:shadow-xl"
>
  Save Workspace
</button>
<button
  onClick={() => fileInputRefWorkspace.current.click()}
  className="w-40 h-20 bg-gray-200 text-black px-4 py-2 rounded-xl hover:bg-gray-300 shadow-lg hover:shadow-xl"
>
  Load Workspace
</button>
<input
  ref={fileInputRefWorkspace}
  type="file"
  accept=".json"
  onChange={handleLoadWorkspace}
  style={{ display: 'none' }}
/>
          <button onClick={() => triggerUpload('alignment')} className="w-40 h-20 bg-green-200 text-black px-4 py-2 rounded-xl hover:bg-green-300 shadow-lg hover:shadow-xl">
            Upload MSA (.fasta)
          </button>
          <button onClick={() => triggerUpload('tree')} className="w-40 h-20 bg-blue-200 text-black px-4 py-2 rounded-xl hover:bg-blue-300 shadow-lg hover:shadow-xl">
            Upload Tree (.nwk/.nhx)
          </button>
          <button onClick={() => triggerUpload('histogram')} className="w-40 h-20 bg-orange-200 text-black px-4 py-2 rounded-xl hover:bg-orange-300 shadow-lg hover:shadow-xl">
            Upload data (.txt/.tsv/.csv)
          </button>
          <div className="relative group">
  <a
    href="https://github.com/lucanest/mseaview"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-2 py-1 rounded hover:bg-gray-200"
  >
 <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-7 h-7 text-gray-800"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.867 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.578.688.48C19.135 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
            </svg>
  </a>

  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                  bg-gray-700 text-white text-xs px-2 py-1 rounded-md
                  opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
    GitHub
  </div>
</div>
          <input ref={fileInputRef} type="file" accept=".fasta,.nwk,.nhx,.txt,.tsv,.csv,.fas" onChange={handleFileUpload} style={{ display: 'none' }} />
        </div>
      </div>

      {panels.length > 0 && (
        <div className="flex-grow overflow-auto pb-20">
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={30}
            width={windowWidth}
            autoSize={false}
            isResizable
            isDraggable
            margin={[10, 10]}
            containerPadding={[10, 10]}
            draggableHandle=".panel-drag-handle"
            draggableCancel="select, option, input, textarea, button"
            onLayoutChange={(newLayout) => {
              const footer = newLayout.find(l => l.i === '__footer');
              const others = newLayout.filter(l => l.i !== '__footer');
              const maxY = others.reduce((max, l) => Math.max(max, l.y + l.h), 0);
              const fixedFooter = { ...footer, y: maxY };
              setLayout([...others, fixedFooter]);
            }}
          >
{panels.map(panel => {
  if (panel.i === '__footer') {
    return (
      <div key="__footer" className="flex items-center justify-center text-gray-500 text-sm" />
    );
  }
  const data = panelData[panel.i];
  if (!data) return null;

  const commonProps = {
    id: panel.i,
    data,
    onRemove: removePanel,
    onReupload: id => triggerUpload(panel.type, id),
    onDuplicate: duplicatePanel,
    onLinkClick: handleLinkClick,
    isLinkModeActive: linkMode === panel.i,
    isLinked: !!panelLinks[panel.i],
    linkedTo: panelLinks[panel.i] || null,
    highlightedSite: highlightSite,
    highlightOrigin: highlightOrigin,
    onHighlight: handleHighlight,
    hoveredPanelId,                    
    setHoveredPanelId      
  };

  return (
<div key={panel.i}>
  {panel.type === 'alignment' ? (
    <AlignmentPanel
      {...commonProps}
      setPanelData={setPanelData}
      onSyncScroll={onSyncScroll}
      externalScrollLeft={scrollPositions[panel.i]}
      highlightedSequenceId={highlightedSequenceId}
      setHighlightedSequenceId={setHighlightedSequenceId}
    />
  ) : panel.type === 'tree' ? (
    <TreePanel
      {...commonProps}
      setPanelData={setPanelData}
      highlightedSequenceId={highlightedSequenceId}
      onHoverTip={setHighlightedSequenceId}
    />
  ) : (
    <HistogramPanel
      {...commonProps}
      setPanelData={setPanelData}
    />
  )}
</div>
  );
})}
          </GridLayout>
        </div>
      )}
    </div>
  );
}

export default App;
