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
  OPERATORS,
  CROPS,
  MAINTENANCE_INPUTS,
  INITIAL_TRAYS,
  INITIAL_FIELDS,
  INITIAL_ACTIVITY_LOGS,
} from './data/mockFarmData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [operator, setOperator] = useState(OPERATORS[0]);

  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [trays, setTrays] = useState(INITIAL_TRAYS);
  const [logs, setLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [banner, setBanner] = useState(null);

  // Desktop Field Setup State
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldCode, setNewFieldCode] = useState('');

  // PLANT TAB STATE
  const [plantTarget, setPlantTarget] = useState('row'); // 'row' | 'tray'
  const [rowPlantSource, setRowPlantSource] = useState('from-tray'); // 'from-tray' | 'direct'
  const [selectedTrayCode, setSelectedTrayCode] = useState(INITIAL_TRAYS[0].code);
  const [selectedCropId, setSelectedCropId] = useState(CROPS[0].id);
  const [trayCount, setTrayCount] = useState(4);
  const [plantFieldId, setPlantFieldId] = useState(INITIAL_FIELDS[0].id);
  const [plantRowId, setPlantRowId] = useState('PA-R05');

  // MAINTAIN TAB STATE
  const [maintFieldId, setMaintFieldId] = useState(INITIAL_FIELDS[0].id);
  const [maintRowId, setMaintRowId] = useState('PA-R02');
  const [selectedInputId, setSelectedInputId] = useState(MAINTENANCE_INPUTS[0].id);

  // HARVEST TAB STATE
  const [harvFieldId, setHarvFieldId] = useState(INITIAL_FIELDS[0].id);
  const [harvRowId, setHarvRowId] = useState('PA-R02');
  const [harvQty, setHarvQty] = useState(25);

  const notify = (msg, sub = '') => {
    setBanner({ msg, sub });
    setTimeout(() => {
      setBanner((prev) => (prev?.msg === msg ? null : prev));
    }, 3500);
  };

  const jumpToRowAction = (tab, fieldId, rowId) => {
    if (tab === 'plant') {
      setPlantFieldId(fieldId);
      setPlantRowId(rowId);
      setPlantTarget('row');
    } else if (tab === 'maintain') {
      setMaintFieldId(fieldId);
      setMaintRowId(rowId);
    } else if (tab === 'harvest') {
      setHarvFieldId(fieldId);
      setHarvRowId(rowId);
    }
    setActiveTab(tab);
  };

  // DESKTOP FIELD & ROW SETUP
  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const id = (newFieldCode.trim() || `F${fields.length + 1}`).toUpperCase();
    const newField = {
      id,
      name: newFieldName.trim(),
      rows: [
        { id: `${id}-R01`, code: 'R01', lengthM: 25, planting: null, lastInput: null },
        { id: `${id}-R02`, code: 'R02', lengthM: 25, planting: null, lastInput: null },
        { id: `${id}-R03`, code: 'R03', lengthM: 25, planting: null, lastInput: null },
      ],
    };
    setFields((prev) => [...prev, newField]);
    setNewFieldName('');
    setNewFieldCode('');
    notify(`FIELD CREATED: ${newField.name}`, `Initialized with 3 rows (R01–R03)`);
  };

  const handleAddRowToField = (fieldId) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        const nextNum = f.rows.length + 1;
        const code = nextNum < 10 ? `R0${nextNum}` : `R${nextNum}`;
        return {
          ...f,
          rows: [
            ...f.rows,
            {
              id: `${f.id}-${code}`,
              code,
              lengthM: 25,
              planting: null,
              lastInput: null,
            },
          ],
        };
      })
    );
    notify(`ADDED ROW TO ${fieldId}`);
  };

  const handleClearRowCrop = (fieldId, rowId) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id !== fieldId
          ? f
          : {
              ...f,
              rows: f.rows.map((r) =>
                r.id === rowId ? { ...r, planting: null } : r
              ),
            }
      )
    );
    notify(`ROW ${rowId} CLEARED`, 'Ready for new planting');
  };

  // PLANT HANDLER
  const handleConfirmPlant = () => {
    const dateStamp = '1019';

    if (plantTarget === 'tray') {
      const crop = CROPS.find((c) => c.id === selectedCropId) || CROPS[0];
      const seq = trays.filter((t) => t.cropId === crop.id).length + 1;
      const newTrayCode = `TR-${dateStamp}-${crop.id}${seq}`;
      const newTray = {
        code: newTrayCode,
        cropId: crop.id,
        cropName: crop.name,
        variety: crop.variety,
        trays: trayCount,
        cellsPerTray: 128,
        sownDate: '2026-10-19',
        operator,
        status: 'Ready',
      };
      setTrays((prev) => [newTray, ...prev]);
      setSelectedTrayCode(newTrayCode);
      setLogs((prev) => [
        {
          id: newTrayCode,
          type: 'PLANT-TRAY',
          date: '2026-10-19',
          location: 'Nursery',
          crop: `${crop.name} (${crop.variety})`,
          detail: `${trayCount} Trays Sown`,
          linkedCode: `Tracking Code: ${newTrayCode}`,
          operator,
        },
        ...prev,
      ]);
      notify(`SEEDLING TRAY LOGGED: ${newTrayCode}`, `${trayCount} trays of ${crop.name}`);
      return;
    }

    const field = fields.find((f) => f.id === plantFieldId) || fields[0];
    const row = field.rows.find((r) => r.id === plantRowId) || field.rows[0];
    const trayObj = trays.find((t) => t.code === selectedTrayCode);
    const crop =
      rowPlantSource === 'from-tray' && trayObj
        ? CROPS.find((c) => c.id === trayObj.cropId) || CROPS[0]
        : CROPS.find((c) => c.id === selectedCropId) || CROPS[0];

    const trackingCode = `PL-${dateStamp}-${field.id}-${row.code}-${crop.id}`;
    const sourceTrayCode =
      rowPlantSource === 'from-tray' && trayObj ? trayObj.code : 'DIRECT-SEED';

    setFields((prev) =>
      prev.map((f) =>
        f.id !== field.id
          ? f
          : {
              ...f,
              rows: f.rows.map((r) =>
                r.id !== row.id
                  ? r
                  : {
                      ...r,
                      planting: {
                        trackingCode,
                        sourceTrayCode,
                        cropId: crop.id,
                        cropName: crop.name,
                        variety: crop.variety,
                        unit: crop.unit,
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
        location: `${field.name} • ${row.code}`,
        crop: `${crop.name} (${crop.variety})`,
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
      `${crop.name} in ${field.name} ${row.code} (Source: ${sourceTrayCode})`
    );
  };

  // MAINTAIN HANDLER
  const handleConfirmMaintain = () => {
    const field = fields.find((f) => f.id === maintFieldId) || fields[0];
    const row = field.rows.find((r) => r.id === maintRowId) || field.rows[0];
    const input =
      MAINTENANCE_INPUTS.find((i) => i.id === selectedInputId) || MAINTENANCE_INPUTS[0];

    setFields((prev) =>
      prev.map((f) =>
        f.id !== field.id
          ? f
          : {
              ...f,
              rows: f.rows.map((r) =>
                r.id !== row.id
                  ? r
                  : {
                      ...r,
                      lastInput: input.name,
                    }
              ),
            }
      )
    );

    const cropLabel = row.planting
      ? `${row.planting.cropName} (${row.planting.variety})`
      : 'Unplanted Bed';
    const codeLabel = row.planting ? row.planting.trackingCode : 'BED-PREP';

    setLogs((prev) => [
      {
        id: `MT-1019-${field.id}-${row.code}`,
        type: 'MAINTAIN',
        date: '2026-10-19',
        location: `${field.name} • ${row.code}`,
        crop: cropLabel,
        detail: `${input.name} (${input.rate})`,
        linkedCode: codeLabel,
        operator,
      },
      ...prev,
    ]);

    notify(
      `MAINTENANCE LOGGED: ${field.id} ${row.code}`,
      `${input.name} applied to ${cropLabel} [${codeLabel}]`
    );
  };

  // HARVEST HANDLER
  const handleConfirmHarvest = () => {
    const field = fields.find((f) => f.id === harvFieldId) || fields[0];
    const row = field.rows.find((r) => r.id === harvRowId) || field.rows[0];
    if (!row.planting) return;

    const harvestCode = `HV-1019-${field.id}-${row.code}-${row.planting.cropId}`;

    setLogs((prev) => [
      {
        id: harvestCode,
        type: 'HARVEST',
        date: '2026-10-19',
        location: `${field.name} • ${row.code}`,
        crop: `${row.planting.cropName} (${row.planting.variety})`,
        detail: `${harvQty} ${row.planting.unit} harvested`,
        linkedCode: `${harvestCode} ← ${row.planting.trackingCode} ← ${row.planting.sourceTrayCode}`,
        operator,
      },
      ...prev,
    ]);

    notify(
      `HARVEST LOGGED: ${harvestCode}`,
      `${harvQty} ${row.planting.unit} ${row.planting.cropName} from ${field.id} ${row.code}`
    );
  };

  const currentPlantField = fields.find((f) => f.id === plantFieldId) || fields[0];
  const currentPlantRow =
    currentPlantField.rows.find((r) => r.id === plantRowId) || currentPlantField.rows[0];

  const currentMaintField = fields.find((f) => f.id === maintFieldId) || fields[0];
  const currentMaintRow =
    currentMaintField.rows.find((r) => r.id === maintRowId) || currentMaintField.rows[0];

  const currentHarvField = fields.find((f) => f.id === harvFieldId) || fields[0];
  const currentHarvRow =
    currentHarvField.rows.find((r) => r.id === harvRowId) || currentHarvField.rows[0];

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
            {OPERATORS.map((op) => (
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
              <button
                onClick={() => setActiveTab('plant')}
                className="choice-tile"
              >
                <Sprout size={18} className="text-accent" />
                <span className="text-mono text-xs" style={{ marginTop: 8 }}>
                  1. PLANT
                </span>
              </button>
              <button
                onClick={() => setActiveTab('maintain')}
                className="choice-tile"
              >
                <Wrench size={18} className="text-warn" />
                <span className="text-mono text-xs" style={{ marginTop: 8 }}>
                  2. MAINTAIN
                </span>
              </button>
              <button
                onClick={() => setActiveTab('harvest')}
                className="choice-tile"
              >
                <Scissors size={18} className="text-accent" />
                <span className="text-mono text-xs" style={{ marginTop: 8 }}>
                  3. HARVEST
                </span>
              </button>
            </div>

            {/* Desktop Field & Row Setup Bar */}
            <div className="panel panel-header desktop-only">
              <div>
                <div className="text-mono text-xs text-accent">
                  DESKTOP FIELD & ROW CONFIGURATION
                </div>
                <div className="text-lg">Fields, Rows & Active Crop Tracking</div>
              </div>

              <form onSubmit={handleAddField} className="stepper">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="New Field Name (e.g. Patch C)"
                  className="input-field"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={newFieldCode}
                  onChange={(e) => setNewFieldCode(e.target.value.toUpperCase())}
                  placeholder="Code (PC)"
                  className="input-field text-mono"
                  style={{ width: 96 }}
                />
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>Add Field</span>
                </button>
              </form>
            </div>

            {/* Fields & Rows List */}
            <div className="stack">
              {fields.map((field) => (
                <div key={field.id} className="panel">
                  <div className="panel-header">
                    <div className="row-item-main">
                      <span className="badge">{field.id}</span>
                      <strong>{field.name}</strong>
                    </div>

                    <button
                      onClick={() => handleAddRowToField(field.id)}
                      className="btn btn-sm"
                    >
                      <Plus size={14} className="text-accent" />
                      <span>ADD ROW</span>
                    </button>
                  </div>

                  <div className="divider-list">
                    {field.rows.map((row) => {
                      const p = row.planting;
                      return (
                        <div key={row.id} className="row-item">
                          <div className="row-item-main">
                            <span
                              className={`badge badge-row ${
                                p ? 'badge-accent' : ''
                              }`}
                            >
                              {row.code}
                            </span>

                            {p ? (
                              <div>
                                <div className="row-item-main">
                                  <strong className="text-sm">
                                    {p.cropName} ({p.variety})
                                  </strong>
                                </div>
                                <div className="text-mono text-xs text-muted">
                                  Code: {p.trackingCode} • Source: {p.sourceTrayCode}
                                  {row.lastInput ? ` • Last Input: ${row.lastInput}` : ''}
                                </div>
                              </div>
                            ) : (
                              <div className="text-mono text-xs text-muted">
                                EMPTY ROW ({row.lengthM}m) — READY TO PLANT
                              </div>
                            )}
                          </div>

                          <div className="row-actions">
                            {!p ? (
                              <button
                                onClick={() => jumpToRowAction('plant', field.id, row.id)}
                                className="btn btn-sm btn-primary"
                              >
                                + PLANT
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => jumpToRowAction('maintain', field.id, row.id)}
                                  className="btn btn-sm"
                                >
                                  SPRAY/FEED
                                </button>
                                <button
                                  onClick={() => jumpToRowAction('harvest', field.id, row.id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  HARVEST
                                </button>
                                <button
                                  onClick={() => handleClearRowCrop(field.id, row.id)}
                                  className="btn btn-sm"
                                  title="Clear row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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
                  {trays.map((t) => (
                    <div key={t.code} className="row-item">
                      <div>
                        <span className="text-mono text-xs text-accent">{t.code}</span>{' '}
                        <strong className="text-sm">
                          {t.cropName} ({t.variety})
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
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="text-mono text-xs">RECENT LOGS & TRACKING CODES</span>
                </div>
                <div className="divider-list">
                  {logs.slice(0, 6).map((l, idx) => (
                    <div key={idx} className="row-item">
                      <div className="stack-sm" style={{ width: '100%' }}>
                        <div className="row-item-main" style={{ justifyContent: 'space-between' }}>
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
                          {l.location} — {l.crop}
                        </strong>
                        <div className="text-xs text-muted">{l.detail}</div>
                        <div className="text-mono text-xs text-accent">{l.linkedCode}</div>
                      </div>
                    </div>
                  ))}
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
                    {CROPS.map((c) => (
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
                <div>
                  <label className="section-label">2. SELECT FIELD & ROW</label>
                  <div className="grid-3" style={{ marginBottom: 8 }}>
                    {fields.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setPlantFieldId(f.id);
                          setPlantRowId(f.rows[0]?.id);
                        }}
                        className={`choice-tile ${
                          plantFieldId === f.id ? 'active' : ''
                        }`}
                      >
                        <span className="text-mono text-xs">{f.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid-5">
                    {currentPlantField.rows.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setPlantRowId(r.id)}
                        className={`choice-tile ${
                          plantRowId === r.id ? 'active-accent' : ''
                        }`}
                      >
                        <span className="text-mono text-xs">{r.code}</span>
                        <span className="text-xs">
                          {r.planting ? r.planting.cropName : 'Empty'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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
                      {trays.map((t) => (
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
                              {t.cropName} ({t.variety})
                            </strong>
                          </div>
                          <span className="text-mono text-xs">{t.trays} trays</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid-4">
                      {CROPS.map((c) => (
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
                    PL-1019-{currentPlantField.id}-{currentPlantRow?.code}-
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
                  PLANT INTO {currentPlantField.id} • {currentPlantRow?.code}
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

            <div>
              <label className="section-label">1. SELECT FIELD & ROW</label>
              <div className="grid-3" style={{ marginBottom: 8 }}>
                {fields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setMaintFieldId(f.id);
                      setMaintRowId(f.rows[0]?.id);
                    }}
                    className={`choice-tile ${
                      maintFieldId === f.id ? 'active' : ''
                    }`}
                  >
                    <span className="text-mono text-xs">{f.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid-5">
                {currentMaintField.rows.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setMaintRowId(r.id)}
                    className={`choice-tile ${
                      maintRowId === r.id ? 'active-warn' : ''
                    }`}
                  >
                    <span className="text-mono text-xs">{r.code}</span>
                    <span className="text-xs">
                      {r.planting ? r.planting.cropName : 'Empty'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="callout callout-warn stack-sm">
              <div className="text-mono text-xs text-muted">
                AUTO-DETECTED IN {currentMaintField.id} • {currentMaintRow?.code}:
              </div>
              {currentMaintRow?.planting ? (
                <>
                  <div className="text-lg">
                    {currentMaintRow.planting.cropName} — {currentMaintRow.planting.variety}
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
              <label className="section-label">2. SELECT SPRAY / INPUT / ACTION</label>
              <div className="grid-2">
                {MAINTENANCE_INPUTS.map((inp) => (
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
              LOG MAINTENANCE ON {currentMaintField.id} • {currentMaintRow?.code}
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

            <div>
              <label className="section-label">1. SELECT FIELD & ROW TO HARVEST</label>
              <div className="grid-3" style={{ marginBottom: 8 }}>
                {fields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setHarvFieldId(f.id);
                      setHarvRowId(f.rows[0]?.id);
                    }}
                    className={`choice-tile ${
                      harvFieldId === f.id ? 'active' : ''
                    }`}
                  >
                    <span className="text-mono text-xs">{f.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid-5">
                {currentHarvField.rows.map((r) => {
                  const isSelected = harvRowId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setHarvRowId(r.id)}
                      className={`choice-tile ${
                        isSelected ? 'active-accent' : ''
                      }`}
                    >
                      <span className="text-mono text-xs">{r.code}</span>
                      <span className="text-xs">
                        {r.planting ? r.planting.cropName : 'Empty'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!currentHarvRow?.planting ? (
              <div className="callout text-mono text-xs text-muted">
                No active crop planted in {currentHarvField.id} • {currentHarvRow?.code}. Select a
                planted row above.
              </div>
            ) : (
              <>
                <div className="callout stack-sm">
                  <div className="row-item-main" style={{ justifyContent: 'space-between' }}>
                    <span className="text-mono text-xs text-muted">
                      HARVESTING FROM {currentHarvField.id} • {currentHarvRow.code}:
                    </span>
                  </div>
                  <div className="text-lg">
                    {currentHarvRow.planting.cropName} ({currentHarvRow.planting.variety})
                  </div>
                  <div className="text-mono text-xs text-muted">
                    Row Code: {currentHarvRow.planting.trackingCode} ←{' '}
                    {currentHarvRow.planting.sourceTrayCode}
                  </div>
                </div>

                <div>
                  <label className="section-label">
                    2. QUANTITY ({currentHarvRow.planting.unit.toUpperCase()})
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
                      {harvQty} {currentHarvRow.planting.unit}
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
                    HV-1019-{currentHarvField.id}-{currentHarvRow.code}-
                    {currentHarvRow.planting.cropId}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmHarvest}
                  className="btn btn-primary btn-block"
                >
                  LOG HARVEST ({harvQty} {currentHarvRow.planting.unit})
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
