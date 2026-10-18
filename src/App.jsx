import React, { useState } from 'react';
import {
  Home,
  Sprout,
  Wrench,
  Scissors,
  Plus,
  Layers,
  Grid,
  Trash2,
} from 'lucide-react';

import {
  FARM_DATA,
  buildRowsForDimensions,
  buildInitialPatches,
  buildInitialLogs,
} from './data/mockFarmData';

export default function App() {
  const [cropsCatalog] = useState(FARM_DATA.crops);
  const cropList = Object.values(cropsCatalog);
  const inputList = Object.values(FARM_DATA.maintenanceInputs);

  const [activeTab, setActiveTab] = useState('home');
  const [operator, setOperator] = useState(FARM_DATA.operators[0]);

  const [patches, setPatches] = useState(() => buildInitialPatches(FARM_DATA));
  const [trays, setTrays] = useState(FARM_DATA.initialTrays);
  const [logs, setLogs] = useState(() => buildInitialLogs());
  const [banner, setBanner] = useState(null);

  // Active Patch & Row selection on HOME tab
  const [homePatchId, setHomePatchId] = useState(FARM_DATA.patches[0].id);
  const [homeRowId, setHomeRowId] = useState(`${FARM_DATA.patches[0].id}-R01`);

  // Desktop New Patch Builder State
  const [newPatchName, setNewPatchName] = useState('');
  const [newPatchCode, setNewPatchCode] = useState('');
  const [newPatchGridRows, setNewPatchGridRows] = useState(8);
  const [newPatchGridCols, setNewPatchGridCols] = useState(1);

  // PLANT TAB STATE
  const [plantTarget, setPlantTarget] = useState('row'); // 'row' | 'tray'
  const [rowPlantSource, setRowPlantSource] = useState('from-tray'); // 'from-tray' | 'direct'
  const [selectedTrayCode, setSelectedTrayCode] = useState(FARM_DATA.initialTrays[0].code);
  const [selectedCropId, setSelectedCropId] = useState(cropList[0].id);
  const [trayCount, setTrayCount] = useState(4);
  const [plantPatchId, setPlantPatchId] = useState(FARM_DATA.patches[0].id);
  const [plantRowId, setPlantRowId] = useState(`${FARM_DATA.patches[0].id}-R07`);

  // MAINTAIN TAB STATE
  const [maintPatchId, setMaintPatchId] = useState(FARM_DATA.patches[0].id);
  const [maintRowId, setMaintRowId] = useState(`${FARM_DATA.patches[0].id}-R03`);
  const [selectedInputId, setSelectedInputId] = useState(inputList[0].id);

  // HARVEST TAB STATE
  const [harvPatchId, setHarvPatchId] = useState(FARM_DATA.patches[0].id);
  const [harvRowId, setHarvRowId] = useState(`${FARM_DATA.patches[0].id}-R03`);
  const [harvQty, setHarvQty] = useState(25);

  const notify = (msg, sub = '') => {
    setBanner({ msg, sub });
    setTimeout(() => {
      setBanner((prev) => (prev?.msg === msg ? null : prev));
    }, 3500);
  };

  // Single-source-of-truth lookups
  const getCrop = (cropId) => cropsCatalog[cropId] || cropList[0];
  const getInput = (inputId) => FARM_DATA.maintenanceInputs[inputId] || null;
  const getPatch = (patchId) => patches.find((p) => p.id === patchId) || patches[0];

  const jumpToRowAction = (tab, patchId, rowId) => {
    if (tab === 'plant') {
      setPlantPatchId(patchId);
      setPlantRowId(rowId);
      setPlantTarget('row');
    } else if (tab === 'maintain') {
      setMaintPatchId(patchId);
      setMaintRowId(rowId);
    } else if (tab === 'harvest') {
      setHarvPatchId(patchId);
      setHarvRowId(rowId);
    }
    setActiveTab(tab);
  };

  // ==========================================================================
  // PATCH & ROW DIMENSIONS HANDLERS (Rows x Columns)
  // ==========================================================================
  const handleUpdatePatchDimensions = (patchId, nextRows, nextCols) => {
    const safeRows = Math.max(1, Math.min(100, Number(nextRows) || 1));
    const safeCols = Math.max(1, Math.min(20, Number(nextCols) || 1));

    setPatches((prev) =>
      prev.map((p) => {
        if (p.id !== patchId) return p;
        const updatedRows = buildRowsForDimensions(
          p.id,
          safeRows,
          safeCols,
          p.rows,
          {},
          p.defaultRowLengthM || 25
        );
        return {
          ...p,
          gridRows: safeRows,
          gridCols: safeCols,
          rows: updatedRows,
        };
      })
    );
  };

  const handleAddPatch = (e) => {
    e.preventDefault();
    if (!newPatchName.trim()) return;
    const id = (
      newPatchCode.trim() ||
      newPatchName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
    ).toUpperCase();

    const gRows = Math.max(1, Math.min(100, Number(newPatchGridRows) || 8));
    const gCols = Math.max(1, Math.min(20, Number(newPatchGridCols) || 1));
    const rows = buildRowsForDimensions(id, gRows, gCols, [], {}, 25);

    const newPatch = {
      id,
      name: newPatchName.trim(),
      gridRows: gRows,
      gridCols: gCols,
      defaultRowLengthM: 25,
      rows,
    };

    setPatches((prev) => [...prev, newPatch]);
    setHomePatchId(id);
    setHomeRowId(rows[0].id);
    setNewPatchName('');
    setNewPatchCode('');
    notify(
      `PATCH CREATED: ${newPatch.name}`,
      `Layout: ${gRows} × ${gCols} (${rows.length} rows)`
    );
  };

  const handleClearRowCrop = (patchId, rowId) => {
    setPatches((prev) =>
      prev.map((p) =>
        p.id !== patchId
          ? p
          : {
              ...p,
              rows: p.rows.map((r) =>
                r.id === rowId ? { ...r, planting: null } : r
              ),
            }
      )
    );
    notify(`ROW ${rowId} CLEARED`, 'Ready for new planting');
  };

  // ==========================================================================
  // PLANT HANDLER
  // ==========================================================================
  const handleConfirmPlant = () => {
    const dateStamp = '1019';

    if (plantTarget === 'tray') {
      const crop = getCrop(selectedCropId);
      const seq = trays.filter((t) => t.cropId === crop.id).length + 1;
      const newTrayCode = `TR-${dateStamp}-${crop.id}${seq}`;
      const newTray = {
        code: newTrayCode,
        cropId: crop.id,
        trays: trayCount,
        cellsPerTray: 128,
        sownDate: '2026-10-19',
        operator,
      };
      setTrays((prev) => [newTray, ...prev]);
      setSelectedTrayCode(newTrayCode);
      setLogs((prev) => [
        {
          id: newTrayCode,
          type: 'PLANT-TRAY',
          date: '2026-10-19',
          patchId: null,
          rowCode: 'Nursery',
          cropId: crop.id,
          detail: `${trayCount} Trays Sown`,
          linkedCode: `Tracking Code: ${newTrayCode}`,
          operator,
        },
        ...prev,
      ]);
      notify(`SEEDLING TRAY LOGGED: ${newTrayCode}`, `${trayCount} trays of ${crop.name}`);
      return;
    }

    const patch = getPatch(plantPatchId);
    const row = patch.rows.find((r) => r.id === plantRowId) || patch.rows[0];
    const trayObj = trays.find((t) => t.code === selectedTrayCode);
    const cropId =
      rowPlantSource === 'from-tray' && trayObj ? trayObj.cropId : selectedCropId;
    const crop = getCrop(cropId);

    const trackingCode = `PL-${dateStamp}-${patch.id}-${row.code}-${crop.id}`;
    const sourceTrayCode =
      rowPlantSource === 'from-tray' && trayObj ? trayObj.code : 'DIRECT-SEED';

    setPatches((prev) =>
      prev.map((p) =>
        p.id !== patch.id
          ? p
          : {
              ...p,
              rows: p.rows.map((r) =>
                r.id !== row.id
                  ? r
                  : {
                      ...r,
                      planting: {
                        trackingCode,
                        sourceTrayCode,
                        cropId: crop.id,
                        plantedDate: '2026-10-19',
                      },
                    }
              ),
            }
      )
    );

    setLogs((prev) => [
      {
        id: trackingCode,
        type: 'PLANT-ROW',
        date: '2026-10-19',
        patchId: patch.id,
        rowCode: row.code,
        cropId: crop.id,
        detail:
          sourceTrayCode === 'DIRECT-SEED'
            ? 'Direct Sown in Row'
            : `Transplanted from Tray ${sourceTrayCode}`,
        linkedCode: `${trackingCode} ← ${sourceTrayCode}`,
        operator,
      },
      ...prev,
    ]);

    notify(
      `ROW PLANTED: ${trackingCode}`,
      `${crop.name} in ${patch.name} ${row.code} (Source: ${sourceTrayCode})`
    );
  };

  // ==========================================================================
  // MAINTAIN HANDLER
  // ==========================================================================
  const handleConfirmMaintain = () => {
    const patch = getPatch(maintPatchId);
    const row = patch.rows.find((r) => r.id === maintRowId) || patch.rows[0];
    const input = getInput(selectedInputId) || inputList[0];

    setPatches((prev) =>
      prev.map((p) =>
        p.id !== patch.id
          ? p
          : {
              ...p,
              rows: p.rows.map((r) =>
                r.id !== row.id ? r : { ...r, lastInputId: input.id }
              ),
            }
      )
    );

    const crop = row.planting ? getCrop(row.planting.cropId) : null;
    const codeLabel = row.planting ? row.planting.trackingCode : 'BED-PREP';

    setLogs((prev) => [
      {
        id: `MT-1019-${patch.id}-${row.code}`,
        type: 'MAINTAIN',
        date: '2026-10-19',
        patchId: patch.id,
        rowCode: row.code,
        cropId: crop ? crop.id : null,
        detail: `${input.name} (${input.rate})`,
        linkedCode: codeLabel,
        operator,
      },
      ...prev,
    ]);

    notify(
      `MAINTENANCE LOGGED: ${patch.name} ${row.code}`,
      `${input.name} applied to ${crop ? crop.name : 'Unplanted Row'} [${codeLabel}]`
    );
  };

  // ==========================================================================
  // HARVEST HANDLER
  // ==========================================================================
  const handleConfirmHarvest = () => {
    const patch = getPatch(harvPatchId);
    const row = patch.rows.find((r) => r.id === harvRowId) || patch.rows[0];
    if (!row.planting) return;

    const crop = getCrop(row.planting.cropId);
    const harvestCode = `HV-1019-${patch.id}-${row.code}-${crop.id}`;

    setLogs((prev) => [
      {
        id: harvestCode,
        type: 'HARVEST',
        date: '2026-10-19',
        patchId: patch.id,
        rowCode: row.code,
        cropId: crop.id,
        detail: `${harvQty} ${crop.unit} harvested`,
        linkedCode: `${harvestCode} ← ${row.planting.trackingCode} ← ${row.planting.sourceTrayCode}`,
        operator,
      },
      ...prev,
    ]);

    notify(
      `HARVEST LOGGED: ${harvestCode}`,
      `${harvQty} ${crop.unit} ${crop.name} from ${patch.name} ${row.code}`
    );
  };

  // ==========================================================================
  // REUSABLE PATCH & ROW DROPDOWN SELECTOR
  // ==========================================================================
  const renderLocationDropdowns = ({
    selectedPatchId,
    onSelectPatch,
    selectedRowId,
    onSelectRow,
  }) => {
    const patch = getPatch(selectedPatchId);

    return (
      <div className="grid-2">
        <div>
          <label className="section-label">PATCH / FIELD</label>
          <select
            value={patch.id}
            onChange={(e) => {
              const nextPatch = getPatch(e.target.value);
              onSelectPatch(nextPatch.id);
              if (nextPatch.rows[0]) {
                onSelectRow(nextPatch.rows[0].id);
              }
            }}
            className="select-field"
          >
            {patches.map((p) => {
              const plantedCount = p.rows.filter((r) => r.planting).length;
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.gridRows}×{p.gridCols} • {plantedCount}/{p.rows.length} planted)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="section-label">ROW ({patch.rows.length} ROWS)</label>
          <select
            value={selectedRowId}
            onChange={(e) => onSelectRow(e.target.value)}
            className="select-field"
          >
            {patch.rows.map((r) => {
              const crop = r.planting ? getCrop(r.planting.cropId) : null;
              return (
                <option key={r.id} value={r.id}>
                  {r.code} — {crop ? `${crop.name} (${crop.variety})` : '[ Empty ]'}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  };

  // Current selected objects for each tab
  const currentHomePatch = getPatch(homePatchId);
  const currentHomeRow =
    currentHomePatch.rows.find((r) => r.id === homeRowId) || currentHomePatch.rows[0];
  const currentHomeCrop = currentHomeRow?.planting
    ? getCrop(currentHomeRow.planting.cropId)
    : null;

  const currentPlantPatch = getPatch(plantPatchId);
  const currentPlantRow =
    currentPlantPatch.rows.find((r) => r.id === plantRowId) || currentPlantPatch.rows[0];

  const currentMaintPatch = getPatch(maintPatchId);
  const currentMaintRow =
    currentMaintPatch.rows.find((r) => r.id === maintRowId) || currentMaintPatch.rows[0];
  const currentMaintCrop = currentMaintRow?.planting
    ? getCrop(currentMaintRow.planting.cropId)
    : null;

  const currentHarvPatch = getPatch(harvPatchId);
  const currentHarvRow =
    currentHarvPatch.rows.find((r) => r.id === harvRowId) || currentHarvPatch.rows[0];
  const currentHarvCrop = currentHarvRow?.planting
    ? getCrop(currentHarvRow.planting.cropId)
    : null;

  const navTabs = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'plant', label: 'PLANT', icon: Sprout },
    { id: 'maintain', label: 'MAINTAIN', icon: Wrench },
    { id: 'harvest', label: 'HARVEST', icon: Scissors },
  ];

  return (
    <div className="app-shell">
      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge">AG-LOG</div>
            <span className="brand-subtitle desktop-only">MT COTTON ORGANIC</span>
          </div>

          <nav className="desktop-nav">
            {navTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="operator-strip">
            {FARM_DATA.operators.map((op) => (
              <button
                key={op}
                onClick={() => setOperator(op)}
                className={`operator-btn ${operator === op ? 'active' : ''}`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* TOAST BANNER */}
      {banner && (
        <div className="banner-toast">
          <div>
            <strong>✓ {banner.msg}</strong> <span>{banner.sub}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-mono">
            [OK]
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <main className="main-container">
        {/* ============================================================
            1. HOME TAB
           ============================================================ */}
        {activeTab === 'home' && (
          <div className="stack">
            {/* Mobile 3-Button Quick Action Launcher */}
            <div className="grid-3 mobile-only">
              <button onClick={() => setActiveTab('plant')} className="choice-tile">
                <Sprout size={18} className="text-accent" />
                <span className="text-mono text-xs" style={{ marginTop: 8 }}>
                  1. PLANT
                </span>
              </button>
              <button onClick={() => setActiveTab('maintain')} className="choice-tile">
                <Wrench size={18} className="text-warn" />
                <span className="text-mono text-xs" style={{ marginTop: 8 }}>
                  2. MAINTAIN
                </span>
              </button>
              <button onClick={() => setActiveTab('harvest')} className="choice-tile">
                <Scissors size={18} className="text-accent" />
                <span className="text-mono text-xs" style={{ marginTop: 8 }}>
                  3. HARVEST
                </span>
              </button>
            </div>

            {/* Desktop Patch & Row Setup Bar */}
            <div className="panel panel-header desktop-only">
              <div>
                <div className="text-mono text-xs text-accent">
                  SINGLE SOURCE OF TRUTH • PATCH & ROW SETUP
                </div>
                <div className="text-lg">
                  {patches.length} Patches ({patches.reduce((sum, p) => sum + p.rows.length, 0)}{' '}
                  Total Rows)
                </div>
              </div>

              <form onSubmit={handleAddPatch} className="stepper">
                <input
                  type="text"
                  value={newPatchName}
                  onChange={(e) => setNewPatchName(e.target.value)}
                  placeholder="New Patch Name"
                  className="input-field"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={newPatchCode}
                  onChange={(e) => setNewPatchCode(e.target.value.toUpperCase())}
                  placeholder="Code"
                  className="input-field text-mono"
                  style={{ width: 72 }}
                />
                <div className="dim-control">
                  <span>ROWS:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newPatchGridRows}
                    onChange={(e) => setNewPatchGridRows(e.target.value)}
                    className="dim-input"
                  />
                  <span>× COLS:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newPatchGridCols}
                    onChange={(e) => setNewPatchGridCols(e.target.value)}
                    className="dim-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>Add Patch</span>
                </button>
              </form>
            </div>

            {/* Patch & Row Inspector (Dropdown Selector + Rows x Columns Overview Grid) */}
            <div className="panel">
              <div className="panel-header">
                <div className="row-item-main">
                  <span className="badge">{currentHomePatch.id}</span>
                  <strong>{currentHomePatch.name}</strong>
                  <span className="text-mono text-xs text-muted">
                    ({currentHomePatch.gridRows} × {currentHomePatch.gridCols} ={' '}
                    {currentHomePatch.rows.length} rows)
                  </span>
                </div>

                {/* Specify Rows x Columns directly in the Overview */}
                <div className="dim-control">
                  <span>LAYOUT ROWS:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={currentHomePatch.gridRows}
                    onChange={(e) =>
                      handleUpdatePatchDimensions(
                        currentHomePatch.id,
                        e.target.value,
                        currentHomePatch.gridCols
                      )
                    }
                    className="dim-input"
                  />
                  <span>× COLS:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={currentHomePatch.gridCols}
                    onChange={(e) =>
                      handleUpdatePatchDimensions(
                        currentHomePatch.id,
                        currentHomePatch.gridRows,
                        e.target.value
                      )
                    }
                    className="dim-input"
                  />
                </div>
              </div>

              <div className="panel-body stack">
                {/* Dropdown Selector for Patch & Row */}
                {renderLocationDropdowns({
                  selectedPatchId: homePatchId,
                  onSelectPatch: setHomePatchId,
                  selectedRowId: homeRowId,
                  onSelectRow: setHomeRowId,
                })}

                {/* Selected Row Details & 1-Tap Actions */}
                {currentHomeRow && (
                  <div className="callout">
                    <div className="row-item" style={{ padding: 0 }}>
                      <div>
                        <div className="text-mono text-xs text-muted">
                          SELECTED ROW: {currentHomePatch.name.toUpperCase()} •{' '}
                          {currentHomeRow.code} ({currentHomeRow.lengthM}m)
                        </div>
                        {currentHomeRow.planting && currentHomeCrop ? (
                          <>
                            <div className="text-lg">
                              {currentHomeCrop.name} ({currentHomeCrop.variety})
                            </div>
                            <div className="text-mono text-xs text-accent">
                              Tracking Code: {currentHomeRow.planting.trackingCode} ← Source:{' '}
                              {currentHomeRow.planting.sourceTrayCode}
                              {currentHomeRow.lastInputId
                                ? ` • Last Input: ${getInput(currentHomeRow.lastInputId)?.name}`
                                : ''}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted" style={{ marginTop: 4 }}>
                            Empty row — ready to plant
                          </div>
                        )}
                      </div>

                      <div className="row-actions">
                        {!currentHomeRow.planting ? (
                          <button
                            onClick={() =>
                              jumpToRowAction('plant', currentHomePatch.id, currentHomeRow.id)
                            }
                            className="btn btn-primary"
                          >
                            + PLANT {currentHomeRow.code}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                jumpToRowAction('maintain', currentHomePatch.id, currentHomeRow.id)
                              }
                              className="btn btn-warn"
                            >
                              SPRAY / FEED
                            </button>
                            <button
                              onClick={() =>
                                jumpToRowAction('harvest', currentHomePatch.id, currentHomeRow.id)
                              }
                              className="btn btn-primary"
                            >
                              HARVEST
                            </button>
                            <button
                              onClick={() =>
                                handleClearRowCrop(currentHomePatch.id, currentHomeRow.id)
                              }
                              className="btn"
                              title="Clear row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Rows x Columns Map of all rows in current patch */}
                <div>
                  <span className="section-label">
                    {currentHomePatch.name.toUpperCase()} OVERVIEW ({currentHomePatch.gridRows}{' '}
                    ROWS × {currentHomePatch.gridCols}{' '}
                    {currentHomePatch.gridCols === 1 ? 'COLUMN' : 'COLUMNS'})
                  </span>
                  <div
                    className="row-matrix"
                    style={{
                      gridTemplateColumns: `repeat(${currentHomePatch.gridCols}, minmax(0, 1fr))`,
                    }}
                  >
                    {currentHomePatch.rows.map((r) => {
                      const isSelected = r.id === currentHomeRow?.id;
                      const crop = r.planting ? getCrop(r.planting.cropId) : null;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setHomeRowId(r.id)}
                          className={`row-cell ${
                            isSelected ? 'selected' : crop ? 'planted' : ''
                          }`}
                        >
                          <span className="row-cell-code">{r.code}</span>
                          <span className="row-cell-crop">
                            {crop ? `${crop.name} (${crop.variety})` : '---'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Seedling Trays + Recent Log */}
            <div className="grid-2">
              <div className="panel">
                <div className="panel-header">
                  <span className="text-mono text-xs">
                    ACTIVE SEEDLING TRAYS ({trays.length})
                  </span>
                  <button
                    onClick={() => {
                      setPlantTarget('tray');
                      setActiveTab('plant');
                    }}
                    className="btn btn-sm"
                  >
                    + SOW TRAY
                  </button>
                </div>
                <div className="divider-list">
                  {trays.map((t) => {
                    const c = getCrop(t.cropId);
                    return (
                      <div key={t.code} className="row-item">
                        <div>
                          <span className="text-mono text-xs text-accent">{t.code}</span>{' '}
                          <strong className="text-sm">
                            {c.name} ({c.variety})
                          </strong>
                          <div className="text-mono text-xs text-muted">
                            {t.trays} Trays • Sown {t.sownDate} by {t.operator}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTrayCode(t.code);
                            setPlantTarget('row');
                            setRowPlantSource('from-tray');
                            setActiveTab('plant');
                          }}
                          className="btn btn-sm"
                        >
                          PLANT TO ROW →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="text-mono text-xs">RECENT LOGS & TRACKING CODES</span>
                </div>
                <div className="divider-list">
                  {logs.slice(0, 6).map((l, idx) => {
                    const patchName = l.patchId ? getPatch(l.patchId).name : 'Nursery';
                    const cropObj = l.cropId ? getCrop(l.cropId) : null;
                    return (
                      <div key={idx} className="row-item">
                        <div className="stack-sm" style={{ width: '100%' }}>
                          <div
                            className="row-item-main"
                            style={{ justifyContent: 'space-between' }}
                          >
                            <span
                              className={`badge ${
                                l.type === 'HARVEST'
                                  ? 'badge-accent'
                                  : l.type === 'MAINTAIN'
                                  ? 'badge-warn'
                                  : ''
                              }`}
                            >
                              {l.type}
                            </span>
                            <span className="text-mono text-xs text-muted">
                              {l.date} • {l.operator}
                            </span>
                          </div>
                          <strong className="text-sm">
                            {patchName} ({l.rowCode}) —{' '}
                            {cropObj ? `${cropObj.name} (${cropObj.variety})` : 'Bed Prep'}
                          </strong>
                          <div className="text-xs text-muted">{l.detail}</div>
                          <div className="text-mono text-xs text-accent">{l.linkedCode}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            2. PLANT TAB
           ============================================================ */}
        {activeTab === 'plant' && (
          <div className="panel panel-narrow stack">
            <div className="form-header">
              <strong className="text-mono text-accent">PLANTING LOG</strong>
              <span className="text-mono text-xs text-muted">OPERATOR: {operator}</span>
            </div>

            <div>
              <label className="section-label">1. WHERE ARE YOU PLANTING?</label>
              <div className="grid-2">
                <button
                  type="button"
                  onClick={() => setPlantTarget('row')}
                  className={`choice-tile choice-row ${
                    plantTarget === 'row' ? 'active-accent' : ''
                  }`}
                >
                  <span className="text-mono text-xs">FIELD ROW</span>
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPlantTarget('tray')}
                  className={`choice-tile choice-row ${
                    plantTarget === 'tray' ? 'active-accent' : ''
                  }`}
                >
                  <span className="text-mono text-xs">SEEDLING TRAY</span>
                  <Layers size={16} />
                </button>
              </div>
            </div>

            {plantTarget === 'tray' ? (
              <>
                <div>
                  <label className="section-label">2. SELECT CROP</label>
                  <div className="grid-4">
                    {cropList.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCropId(c.id)}
                        className={`choice-tile ${
                          selectedCropId === c.id ? 'active' : ''
                        }`}
                      >
                        <div className="text-sm">{c.name}</div>
                        <div className="text-xs text-muted">{c.variety}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="section-label">3. HOW MANY TRAYS?</label>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => setTrayCount((n) => Math.max(1, n - 1))}
                      className="btn"
                    >
                      -1
                    </button>
                    <div className="stepper-display">{trayCount} TRAYS</div>
                    <button
                      type="button"
                      onClick={() => setTrayCount((n) => n + 1)}
                      className="btn"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div className="code-box">
                  <span className="text-xs text-muted">AUTO TRACKING CODE:</span>
                  <strong className="text-accent">
                    TR-1019-{selectedCropId}
                    {trays.filter((t) => t.cropId === selectedCropId).length + 1}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPlant}
                  className="btn btn-primary btn-block"
                >
                  CREATE SEEDLING TRAY & CODE
                </button>
              </>
            ) : (
              <>
                {renderLocationDropdowns({
                  selectedPatchId: plantPatchId,
                  onSelectPatch: setPlantPatchId,
                  selectedRowId: plantRowId,
                  onSelectRow: setPlantRowId,
                })}

                <div>
                  <label className="section-label">3. PLANTING SOURCE</label>
                  <div className="grid-2" style={{ marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => setRowPlantSource('from-tray')}
                      className={`choice-tile ${
                        rowPlantSource === 'from-tray' ? 'active' : ''
                      }`}
                    >
                      <span className="text-mono text-xs">FROM SEEDLING TRAY</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRowPlantSource('direct')}
                      className={`choice-tile ${
                        rowPlantSource === 'direct' ? 'active' : ''
                      }`}
                    >
                      <span className="text-mono text-xs">DIRECT SEED</span>
                    </button>
                  </div>

                  {rowPlantSource === 'from-tray' ? (
                    <div className="stack-sm">
                      {trays.map((t) => {
                        const c = getCrop(t.cropId);
                        return (
                          <button
                            key={t.code}
                            type="button"
                            onClick={() => setSelectedTrayCode(t.code)}
                            className={`choice-tile choice-row ${
                              selectedTrayCode === t.code ? 'active' : ''
                            }`}
                          >
                            <div>
                              <span className="text-mono text-xs text-accent">
                                {t.code}
                              </span>{' '}
                              <strong className="text-sm">
                                {c.name} ({c.variety})
                              </strong>
                            </div>
                            <span className="text-mono text-xs">{t.trays} trays</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid-4">
                      {cropList.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCropId(c.id)}
                          className={`choice-tile ${
                            selectedCropId === c.id ? 'active' : ''
                          }`}
                        >
                          <div className="text-sm">{c.name}</div>
                          <div className="text-xs text-muted">{c.variety}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="code-box">
                  <span className="text-xs text-muted">ROW TRACKING CODE:</span>
                  <strong className="text-accent">
                    PL-1019-{currentPlantPatch.id}-{currentPlantRow?.code}-
                    {rowPlantSource === 'from-tray'
                      ? trays.find((t) => t.code === selectedTrayCode)?.cropId || 'CRP'
                      : selectedCropId}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPlant}
                  className="btn btn-primary btn-block"
                >
                  PLANT INTO {currentPlantPatch.name.toUpperCase()} • {currentPlantRow?.code}
                </button>
              </>
            )}
          </div>
        )}

        {/* ============================================================
            3. MAINTAIN TAB
           ============================================================ */}
        {activeTab === 'maintain' && (
          <div className="panel panel-narrow stack">
            <div className="form-header">
              <strong className="text-mono text-warn">MAINTENANCE & SPRAY LOG</strong>
              <span className="text-mono text-xs text-muted">OPERATOR: {operator}</span>
            </div>

            {renderLocationDropdowns({
              selectedPatchId: maintPatchId,
              onSelectPatch: setMaintPatchId,
              selectedRowId: maintRowId,
              onSelectRow: setMaintRowId,
            })}

            <div className="callout callout-warn stack-sm">
              <div className="text-mono text-xs text-muted">
                AUTO-DETECTED IN {currentMaintPatch.name.toUpperCase()} •{' '}
                {currentMaintRow?.code}:
              </div>
              {currentMaintRow?.planting && currentMaintCrop ? (
                <>
                  <div className="text-lg">
                    {currentMaintCrop.name} — {currentMaintCrop.variety}
                  </div>
                  <div className="text-mono text-xs text-accent">
                    Tracking Code: {currentMaintRow.planting.trackingCode} (Source:{' '}
                    {currentMaintRow.planting.sourceTrayCode})
                  </div>
                </>
              ) : (
                <div className="text-mono text-xs text-muted">
                  Empty / Unplanted Row (Logs as Pre-Planting Bed Prep)
                </div>
              )}
            </div>

            <div>
              <label className="section-label">SELECT SPRAY / INPUT / ACTION</label>
              <div className="grid-2">
                {inputList.map((inp) => (
                  <button
                    key={inp.id}
                    type="button"
                    onClick={() => setSelectedInputId(inp.id)}
                    className={`choice-tile ${
                      selectedInputId === inp.id ? 'active' : ''
                    }`}
                  >
                    <div className="text-sm">{inp.name}</div>
                    <div className="text-mono text-xs text-muted">
                      {inp.type} • {inp.rate}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmMaintain}
              className="btn btn-warn btn-block"
            >
              LOG MAINTENANCE ON {currentMaintPatch.name.toUpperCase()} •{' '}
              {currentMaintRow?.code}
            </button>
          </div>
        )}

        {/* ============================================================
            4. HARVEST TAB
           ============================================================ */}
        {activeTab === 'harvest' && (
          <div className="panel panel-narrow stack">
            <div className="form-header">
              <strong className="text-mono text-accent">HARVEST LOG</strong>
              <span className="text-mono text-xs text-muted">OPERATOR: {operator}</span>
            </div>

            {renderLocationDropdowns({
              selectedPatchId: harvPatchId,
              onSelectPatch: setHarvPatchId,
              selectedRowId: harvRowId,
              onSelectRow: setHarvRowId,
            })}

            {!currentHarvRow?.planting || !currentHarvCrop ? (
              <div className="callout text-mono text-xs text-muted">
                No active crop planted in {currentHarvPatch.name} • {currentHarvRow?.code}. Select
                a planted row from the dropdown above.
              </div>
            ) : (
              <>
                <div className="callout stack-sm">
                  <div className="text-mono text-xs text-muted">
                    HARVESTING FROM {currentHarvPatch.name.toUpperCase()} •{' '}
                    {currentHarvRow.code}:
                  </div>
                  <div className="text-lg">
                    {currentHarvCrop.name} ({currentHarvCrop.variety})
                  </div>
                  <div className="text-mono text-xs text-muted">
                    Row Code: {currentHarvRow.planting.trackingCode} ←{' '}
                    {currentHarvRow.planting.sourceTrayCode}
                  </div>
                </div>

                <div>
                  <label className="section-label">
                    QUANTITY ({currentHarvCrop.unit.toUpperCase()})
                  </label>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => Math.max(1, q - 5))}
                      className="btn"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => Math.max(1, q - 1))}
                      className="btn"
                    >
                      -1
                    </button>
                    <div className="stepper-display">
                      {harvQty} {currentHarvCrop.unit}
                    </div>
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => q + 1)}
                      className="btn"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => q + 5)}
                      className="btn"
                    >
                      +5
                    </button>
                  </div>
                </div>

                <div className="code-box">
                  <span className="text-xs text-muted">HARVEST BATCH CODE:</span>
                  <strong className="text-accent">
                    HV-1019-{currentHarvPatch.id}-{currentHarvRow.code}-{currentHarvCrop.id}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmHarvest}
                  className="btn btn-primary btn-block"
                >
                  LOG HARVEST ({harvQty} {currentHarvCrop.unit})
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        {navTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
