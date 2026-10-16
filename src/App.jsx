import React, { useState } from 'react';
import {
  Home,
  Sprout,
  Wrench,
  Scissors,
  Plus,
  Check,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Grid,
  ArrowRight,
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
  // 4 Core Tabs: 'home' | 'plant' | 'maintain' | 'harvest'
  const [activeTab, setActiveTab] = useState('home');

  // Active Operator (1-tap switcher)
  const [operator, setOperator] = useState(OPERATORS[0]);

  // Core State
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [trays, setTrays] = useState(INITIAL_TRAYS);
  const [logs, setLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [banner, setBanner] = useState(null);

  // Desktop Field Setup State (on Home tab)
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldCode, setNewFieldCode] = useState('');

  // ==========================================
  // PLANT TAB STATE
  // ==========================================
  // 'tray' (Sow Seedling Tray) | 'row' (Plant into Field Row)
  const [plantTarget, setPlantTarget] = useState('row');
  // If 'row': 'from-tray' vs 'direct'
  const [rowPlantSource, setRowPlantSource] = useState('from-tray');
  const [selectedTrayCode, setSelectedTrayCode] = useState(INITIAL_TRAYS[0].code);
  const [selectedCropId, setSelectedCropId] = useState(CROPS[0].id);
  const [trayCount, setTrayCount] = useState(4);
  const [plantFieldId, setPlantFieldId] = useState(INITIAL_FIELDS[0].id);
  const [plantRowId, setPlantRowId] = useState('PA-R05');

  // ==========================================
  // MAINTAIN TAB STATE
  // ==========================================
  const [maintFieldId, setMaintFieldId] = useState(INITIAL_FIELDS[0].id);
  const [maintRowId, setMaintRowId] = useState('PA-R02');
  const [selectedInputId, setSelectedInputId] = useState(MAINTENANCE_INPUTS[0].id);

  // ==========================================
  // HARVEST TAB STATE
  // ==========================================
  const [harvFieldId, setHarvFieldId] = useState(INITIAL_FIELDS[0].id);
  const [harvRowId, setHarvRowId] = useState('PA-R02');
  const [harvQty, setHarvQty] = useState(25);

  const notify = (msg, sub = '') => {
    setBanner({ msg, sub });
    setTimeout(() => {
      setBanner((prev) => (prev?.msg === msg ? null : prev));
    }, 3500);
  };

  // Helper to jump from Home row card directly into an action for that row
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

  // ==========================================
  // HANDLERS: DESKTOP FIELD & ROW SETUP
  // ==========================================
  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const id = (newFieldCode.trim() || `F${fields.length + 1}`).toUpperCase();
    const newField = {
      id,
      name: newFieldName.trim(),
      rows: [
        { id: `${id}-R01`, code: 'R01', lengthM: 25, planting: null, whpLockedUntil: null, lastInput: null },
        { id: `${id}-R02`, code: 'R02', lengthM: 25, planting: null, whpLockedUntil: null, lastInput: null },
        { id: `${id}-R03`, code: 'R03', lengthM: 25, planting: null, whpLockedUntil: null, lastInput: null },
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
              whpLockedUntil: null,
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
                r.id === rowId ? { ...r, planting: null, whpLockedUntil: null } : r
              ),
            }
      )
    );
    notify(`ROW ${rowId} CLEARED`, 'Ready for new planting');
  };

  // ==========================================
  // HANDLER: PLANT (TRAY OR ROW)
  // ==========================================
  const handleConfirmPlant = () => {
    const dateStamp = '1016';

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
        sownDate: '2026-10-16',
        operator,
        status: 'Ready',
      };
      setTrays((prev) => [newTray, ...prev]);
      setSelectedTrayCode(newTrayCode);
      setLogs((prev) => [
        {
          id: newTrayCode,
          type: 'PLANT-TRAY',
          date: '2026-10-16',
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

    // Otherwise planting into a Field Row
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
                        plantedDate: '2026-10-16',
                      },
                      whpLockedUntil: null,
                    }
              ),
            }
      )
    );

    setLogs((prev) => [
      {
        id: trackingCode,
        type: 'PLANT-ROW',
        date: '2026-10-16',
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

  // ==========================================
  // HANDLER: MAINTAIN (SPRAY / FEED / WEED)
  // ==========================================
  const handleConfirmMaintain = () => {
    const field = fields.find((f) => f.id === maintFieldId) || fields[0];
    const row = field.rows.find((r) => r.id === maintRowId) || field.rows[0];
    const input =
      MAINTENANCE_INPUTS.find((i) => i.id === selectedInputId) || MAINTENANCE_INPUTS[0];

    let lockDate = null;
    if (input.whpDays > 0) {
      const d = new Date('2026-10-16T08:00:00');
      d.setDate(d.getDate() + input.whpDays);
      lockDate = d.toISOString().split('T')[0];
    }

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
                      whpLockedUntil: lockDate || r.whpLockedUntil,
                      lastInput: `${input.name} (${input.whpDays}d WHP)`,
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
        id: `MT-1016-${field.id}-${row.code}`,
        type: 'MAINTAIN',
        date: '2026-10-16',
        location: `${field.name} • ${row.code}`,
        crop: cropLabel,
        detail: `${input.name} (${input.rate})${
          lockDate ? ` • WHP LOCK UNTIL ${lockDate}` : ' • 0d WHP'
        }`,
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

  // ==========================================
  // HANDLER: HARVEST
  // ==========================================
  const handleConfirmHarvest = () => {
    const field = fields.find((f) => f.id === harvFieldId) || fields[0];
    const row = field.rows.find((r) => r.id === harvRowId) || field.rows[0];
    if (!row.planting || row.whpLockedUntil) return;

    const harvestCode = `HV-1016-${field.id}-${row.code}-${row.planting.cropId}`;

    setLogs((prev) => [
      {
        id: harvestCode,
        type: 'HARVEST',
        date: '2026-10-16',
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

  // Derived selections for Maintain & Harvest views
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* ============================================================
          TOP BAR: BRAND + 1-TAP OPERATOR SWITCHER + DESKTOP NAV
         ============================================================ */}
      <header className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-emerald-500 text-zinc-950 font-mono font-black text-xs tracking-wider">
              AG-LOG
            </div>
            <span className="hidden sm:inline text-xs font-mono uppercase tracking-widest text-zinc-400">
              MT COTTON ORGANIC
            </span>
          </div>

          {/* Desktop Primary Tabs */}
          <nav className="hidden md:flex items-center border border-zinc-800 bg-zinc-900">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-5 h-10 text-xs font-mono font-bold tracking-wider flex items-center gap-2 border-r border-zinc-800 last:border-r-0 transition ${
                    active
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 1-Tap Operator Selector */}
          <div className="flex items-center border border-zinc-800 bg-zinc-900">
            {OPERATORS.map((op) => (
              <button
                key={op}
                onClick={() => setOperator(op)}
                className={`px-2.5 sm:px-3 h-9 text-xs font-mono font-bold uppercase border-r border-zinc-800 last:border-r-0 transition ${
                  operator === op
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Instant Feedback Strip */}
      {banner && (
        <div className="bg-emerald-500 text-zinc-950 px-4 py-2.5 border-b border-emerald-400 font-mono text-xs flex items-center justify-between max-w-6xl w-full mx-auto">
          <div>
            <strong className="font-black mr-2">✓ {banner.msg}</strong>
            <span>{banner.sub}</span>
          </div>
          <button onClick={() => setBanner(null)} className="font-bold underline ml-4">
            OK
          </button>
        </div>
      )}

      {/* ============================================================
          MAIN CONTENT AREA
         ============================================================ */}
      <main className="max-w-6xl w-full mx-auto flex-1 px-3 sm:px-6 pt-4 pb-24 md:pb-12">
        {/* ============================================================
            1. HOME TAB
            - Mobile: Fast 3-button launcher + Active Rows Status + Recent Log
            - Desktop: Full Field & Row Setup Builder + Live Row Status
           ============================================================ */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Mobile Quick Launcher */}
            <div className="grid grid-cols-3 gap-2 md:hidden">
              <button
                onClick={() => setActiveTab('plant')}
                className="p-4 bg-zinc-900 border border-zinc-700 active:bg-emerald-500 active:text-zinc-950 text-left flex flex-col justify-between h-24"
              >
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span className="font-mono font-bold text-xs tracking-wider">1. PLANT</span>
              </button>
              <button
                onClick={() => setActiveTab('maintain')}
                className="p-4 bg-zinc-900 border border-zinc-700 active:bg-amber-500 active:text-zinc-950 text-left flex flex-col justify-between h-24"
              >
                <Wrench className="w-5 h-5 text-amber-400" />
                <span className="font-mono font-bold text-xs tracking-wider">2. MAINTAIN</span>
              </button>
              <button
                onClick={() => setActiveTab('harvest')}
                className="p-4 bg-zinc-900 border border-zinc-700 active:bg-emerald-500 active:text-zinc-950 text-left flex flex-col justify-between h-24"
              >
                <Scissors className="w-5 h-5 text-emerald-400" />
                <span className="font-mono font-bold text-xs tracking-wider">3. HARVEST</span>
              </button>
            </div>

            {/* DESKTOP FIELD & ROW SETUP HEADER */}
            <div className="hidden md:flex items-end justify-between bg-zinc-900 border border-zinc-800 p-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  DESKTOP FIELD & ROW CONFIGURATION
                </div>
                <h1 className="text-lg font-bold text-zinc-100 mt-0.5">
                  Fields, Rows & Active Crop Tracking
                </h1>
              </div>

              {/* Add New Field Form on Desktop */}
              <form onSubmit={handleAddField} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="New Field Name (e.g. Patch C)"
                  className="h-10 px-3 bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={newFieldCode}
                  onChange={(e) => setNewFieldCode(e.target.value.toUpperCase())}
                  placeholder="Code (PC)"
                  className="h-10 w-24 px-3 bg-zinc-950 border border-zinc-700 text-sm font-mono uppercase text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Field</span>
                </button>
              </form>
            </div>

            {/* FIELDS & ROWS OVERVIEW (Works on both Desktop & Mobile) */}
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="bg-zinc-900 border border-zinc-800">
                  {/* Field Bar */}
                  <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-200 font-mono text-xs font-bold">
                        {field.id}
                      </span>
                      <h2 className="font-bold text-sm sm:text-base text-zinc-100">
                        {field.name}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleAddRowToField(field.id)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ADD ROW</span>
                    </button>
                  </div>

                  {/* Rows List */}
                  <div className="divide-y divide-zinc-800">
                    {field.rows.map((row) => {
                      const p = row.planting;
                      const locked = Boolean(row.whpLockedUntil);
                      return (
                        <div
                          key={row.id}
                          className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-800/40"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <span
                              className={`w-12 h-9 flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                                locked
                                  ? 'bg-red-950 border-red-600 text-red-200'
                                  : p
                                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {row.code}
                            </span>

                            {p ? (
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-zinc-100">
                                    {p.cropName} ({p.variety})
                                  </span>
                                  {locked && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[11px] font-bold">
                                      WHP LOCK UNTIL {row.whpLockedUntil}
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-xs text-zinc-400 truncate">
                                  Code: <span className="text-zinc-200">{p.trackingCode}</span> •
                                  Source: {p.sourceTrayCode}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs font-mono text-zinc-500">
                                EMPTY ROW ({row.lengthM}m) — READY TO PLANT
                              </div>
                            )}
                          </div>

                          {/* Quick Row Actions */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {!p ? (
                              <button
                                onClick={() => jumpToRowAction('plant', field.id, row.id)}
                                className="px-3 py-1.5 bg-emerald-500 text-zinc-950 font-mono text-xs font-bold uppercase"
                              >
                                + PLANT
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => jumpToRowAction('maintain', field.id, row.id)}
                                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-300 font-mono text-xs font-bold uppercase"
                                >
                                  SPRAY/FEED
                                </button>
                                <button
                                  onClick={() => jumpToRowAction('harvest', field.id, row.id)}
                                  className={`px-2.5 py-1.5 font-mono text-xs font-bold uppercase border ${
                                    locked
                                      ? 'bg-red-950 border-red-800 text-red-300'
                                      : 'bg-emerald-500 border-emerald-500 text-zinc-950'
                                  }`}
                                >
                                  {locked ? 'LOCKED' : 'HARVEST'}
                                </button>
                                <button
                                  onClick={() => handleClearRowCrop(field.id, row.id)}
                                  className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
                                  title="Clear finished crop from row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nursery Seedling Trays */}
              <div className="bg-zinc-900 border border-zinc-800">
                <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                    ACTIVE SEEDLING TRAYS ({trays.length})
                  </span>
                  <button
                    onClick={() => {
                      setPlantTarget('tray');
                      setActiveTab('plant');
                    }}
                    className="font-mono text-xs font-bold text-emerald-400 hover:underline"
                  >
                    + SOW TRAY
                  </button>
                </div>
                <div className="divide-y divide-zinc-800">
                  {trays.map((t) => (
                    <div key={t.code} className="p-3 px-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-emerald-400 mr-2">
                          {t.code}
                        </span>
                        <strong className="text-zinc-100">
                          {t.cropName} ({t.variety})
                        </strong>
                        <div className="text-zinc-500 font-mono mt-0.5">
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
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-mono font-bold text-zinc-200"
                      >
                        PLANT TO ROW →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Traceability Log */}
              <div className="bg-zinc-900 border border-zinc-800">
                <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                    RECENT LOGS & TRACKING CODES
                  </span>
                </div>
                <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
                  {logs.map((l, idx) => (
                    <div key={idx} className="p-3 px-4 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span
                          className={`px-1.5 py-0.5 font-bold text-[10px] ${
                            l.type === 'HARVEST'
                              ? 'bg-emerald-500 text-zinc-950'
                              : l.type === 'MAINTAIN'
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-200 text-zinc-950'
                          }`}
                        >
                          {l.type}
                        </span>
                        <span className="text-zinc-500">
                          {l.date} • {l.operator}
                        </span>
                      </div>
                      <div className="font-bold text-zinc-100">
                        {l.location} — {l.crop}
                      </div>
                      <div className="text-zinc-400">{l.detail}</div>
                      <div className="font-mono text-[11px] text-emerald-400">{l.linkedCode}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            2. PLANT TAB (EITHER IN A FIELD ROW OR A SEEDLING TRAY)
           ============================================================ */}
        {activeTab === 'plant' && (
          <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <h1 className="font-mono text-base font-bold uppercase tracking-wider text-emerald-400">
                PLANTING LOG
              </h1>
              <span className="font-mono text-xs text-zinc-400">OPERATOR: {operator}</span>
            </div>

            {/* Step 1: Where are we planting? */}
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                1. WHERE ARE YOU PLANTING?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlantTarget('row')}
                  className={`touch-target p-3.5 font-mono text-xs sm:text-sm font-bold uppercase border text-left flex items-center justify-between ${
                    plantTarget === 'row'
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <span>FIELD ROW</span>
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlantTarget('tray')}
                  className={`touch-target p-3.5 font-mono text-xs sm:text-sm font-bold uppercase border text-left flex items-center justify-between ${
                    plantTarget === 'tray'
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <span>SEEDLING TRAY</span>
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FLOW A: SOWING A SEEDLING TRAY */}
            {plantTarget === 'tray' && (
              <>
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    2. SELECT CROP
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CROPS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCropId(c.id)}
                        className={`touch-target p-3 border text-left ${
                          selectedCropId === c.id
                            ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                        }`}
                      >
                        <div className="text-sm font-bold">{c.name}</div>
                        <div className="text-[11px] opacity-75 truncate">{c.variety}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    3. HOW MANY TRAYS?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTrayCount((n) => Math.max(1, n - 1))}
                      className="touch-target px-5 bg-zinc-950 border border-zinc-700 font-mono text-lg font-bold"
                    >
                      -1
                    </button>
                    <div className="touch-target flex-1 bg-zinc-950 border border-zinc-700 flex items-center justify-center font-mono text-xl font-black">
                      {trayCount} TRAYS
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrayCount((n) => n + 1)}
                      className="touch-target px-5 bg-zinc-950 border border-zinc-700 font-mono text-lg font-bold"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Auto-generated Tracking Code Box */}
                <div className="p-4 bg-zinc-950 border border-emerald-500/60 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400">
                    AUTO TRACKING CODE:
                  </span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    TR-1016-{selectedCropId}
                    {trays.filter((t) => t.cropId === selectedCropId).length + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPlant}
                  className="touch-target w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-black text-sm uppercase tracking-wider"
                >
                  CREATE SEEDLING TRAY & CODE
                </button>
              </>
            )}

            {/* FLOW B: PLANTING INTO A FIELD ROW */}
            {plantTarget === 'row' && (
              <>
                {/* Select Field & Row */}
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    2. SELECT FIELD & ROW
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {fields.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setPlantFieldId(f.id);
                          setPlantRowId(f.rows[0]?.id);
                        }}
                        className={`touch-target p-2.5 font-mono text-xs font-bold border ${
                          plantFieldId === f.id
                            ? 'bg-zinc-100 text-zinc-950 border-white'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {currentPlantField.rows.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setPlantRowId(r.id)}
                        className={`touch-target p-2 font-mono text-xs font-bold border flex flex-col items-center justify-center ${
                          plantRowId === r.id
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : r.planting
                            ? 'bg-zinc-950 text-zinc-400 border-zinc-800'
                            : 'bg-zinc-950 text-emerald-400 border-emerald-900'
                        }`}
                      >
                        <span>{r.code}</span>
                        <span className="text-[10px] font-normal truncate max-w-full">
                          {r.planting ? r.planting.cropName : 'Empty'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source: From Seedling Tray vs Direct Seed */}
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    3. PLANTING SOURCE
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setRowPlantSource('from-tray')}
                      className={`touch-target p-2.5 font-mono text-xs font-bold border ${
                        rowPlantSource === 'from-tray'
                          ? 'bg-zinc-100 text-zinc-950 border-white'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      FROM SEEDLING TRAY
                    </button>
                    <button
                      type="button"
                      onClick={() => setRowPlantSource('direct')}
                      className={`touch-target p-2.5 font-mono text-xs font-bold border ${
                        rowPlantSource === 'direct'
                          ? 'bg-zinc-100 text-zinc-950 border-white'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      DIRECT SEED
                    </button>
                  </div>

                  {rowPlantSource === 'from-tray' ? (
                    <div className="space-y-2">
                      {trays.map((t) => (
                        <button
                          key={t.code}
                          type="button"
                          onClick={() => setSelectedTrayCode(t.code)}
                          className={`touch-target w-full p-3 border text-left flex items-center justify-between ${
                            selectedTrayCode === t.code
                              ? 'bg-zinc-800 border-emerald-500 text-zinc-100'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-emerald-400 mr-2">
                              {t.code}
                            </span>
                            <span className="font-bold text-sm text-zinc-100">
                              {t.cropName} ({t.variety})
                            </span>
                          </div>
                          <span className="font-mono text-xs">{t.trays} trays</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CROPS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCropId(c.id)}
                          className={`touch-target p-3 border text-left ${
                            selectedCropId === c.id
                              ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                          }`}
                        >
                          <div className="text-sm font-bold">{c.name}</div>
                          <div className="text-[11px] opacity-75">{c.variety}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generated Row Tracking Code Preview */}
                <div className="p-4 bg-zinc-950 border border-emerald-500/60 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400">ROW TRACKING CODE:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    PL-1016-{currentPlantField.id}-{currentPlantRow?.code}-
                    {rowPlantSource === 'from-tray'
                      ? trays.find((t) => t.code === selectedTrayCode)?.cropId || 'CRP'
                      : selectedCropId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPlant}
                  className="touch-target w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-black text-sm uppercase tracking-wider"
                >
                  PLANT INTO {currentPlantField.id} • {currentPlantRow?.code}
                </button>
              </>
            )}
          </div>
        )}

        {/* ============================================================
            3. MAINTAIN TAB (SELECT ROW -> APP KNOWS WHAT IS IN THERE)
           ============================================================ */}
        {activeTab === 'maintain' && (
          <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <h1 className="font-mono text-base font-bold uppercase tracking-wider text-amber-400">
                MAINTENANCE & SPRAY LOG
              </h1>
              <span className="font-mono text-xs text-zinc-400">OPERATOR: {operator}</span>
            </div>

            {/* Step 1: Select Field & Row */}
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                1. SELECT FIELD & ROW
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {fields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setMaintFieldId(f.id);
                      setMaintRowId(f.rows[0]?.id);
                    }}
                    className={`touch-target p-2.5 font-mono text-xs font-bold border ${
                      maintFieldId === f.id
                        ? 'bg-zinc-100 text-zinc-950 border-white'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {currentMaintField.rows.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setMaintRowId(r.id)}
                    className={`touch-target p-2 font-mono text-xs font-bold border flex flex-col items-center justify-center ${
                      maintRowId === r.id
                        ? 'bg-amber-500 text-zinc-950 border-amber-400'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <span>{r.code}</span>
                    <span className="text-[10px] font-normal truncate max-w-full opacity-80">
                      {r.planting ? r.planting.cropName : 'Empty'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AUTO-DETECTED CROP & TRACKING CODE IN THIS ROW */}
            <div className="p-4 bg-zinc-950 border-l-4 border-amber-500 space-y-1">
              <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                AUTO-DETECTED IN {currentMaintField.id} • {currentMaintRow?.code}:
              </div>
              {currentMaintRow?.planting ? (
                <>
                  <div className="text-lg font-extrabold text-zinc-100">
                    {currentMaintRow.planting.cropName} — {currentMaintRow.planting.variety}
                  </div>
                  <div className="font-mono text-xs text-emerald-400">
                    Tracking Code: {currentMaintRow.planting.trackingCode} (Source:{' '}
                    {currentMaintRow.planting.sourceTrayCode})
                  </div>
                </>
              ) : (
                <div className="text-sm font-mono text-zinc-400">
                  Empty / Unplanted Row (Logs as Pre-Planting Bed Prep)
                </div>
              )}
            </div>

            {/* Step 2: Select Spray / Maintenance Action */}
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                2. SELECT SPRAY / INPUT / ACTION
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MAINTENANCE_INPUTS.map((inp) => (
                  <button
                    key={inp.id}
                    type="button"
                    onClick={() => setSelectedInputId(inp.id)}
                    className={`touch-target p-3 border text-left flex items-center justify-between ${
                      selectedInputId === inp.id
                        ? 'bg-zinc-100 text-zinc-950 border-white'
                        : 'bg-zinc-950 text-zinc-200 border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{inp.name}</div>
                      <div className="font-mono text-[11px] opacity-75">
                        {inp.type} • {inp.rate}
                      </div>
                    </div>
                    {inp.whpDays > 0 && (
                      <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold">
                        {inp.whpDays}D LOCK
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmMaintain}
              className="touch-target w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-black text-sm uppercase tracking-wider"
            >
              LOG MAINTENANCE ON {currentMaintField.id} • {currentMaintRow?.code}
            </button>
          </div>
        )}

        {/* ============================================================
            4. HARVEST TAB (SELECT ROW -> AUTO-CHECKS CROP & WHP LOCK)
           ============================================================ */}
        {activeTab === 'harvest' && (
          <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <h1 className="font-mono text-base font-bold uppercase tracking-wider text-emerald-400">
                HARVEST LOG
              </h1>
              <span className="font-mono text-xs text-zinc-400">OPERATOR: {operator}</span>
            </div>

            {/* Step 1: Select Field & Row */}
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                1. SELECT FIELD & ROW TO HARVEST
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {fields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setHarvFieldId(f.id);
                      setHarvRowId(f.rows[0]?.id);
                    }}
                    className={`touch-target p-2.5 font-mono text-xs font-bold border ${
                      harvFieldId === f.id
                        ? 'bg-zinc-100 text-zinc-950 border-white'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {currentHarvField.rows.map((r) => {
                  const locked = Boolean(r.whpLockedUntil);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setHarvRowId(r.id)}
                      className={`touch-target p-2 font-mono text-xs font-bold border flex flex-col items-center justify-center ${
                        harvRowId === r.id
                          ? locked
                            ? 'bg-red-600 text-white border-red-400'
                            : 'bg-emerald-500 text-zinc-950 border-emerald-400'
                          : locked
                          ? 'bg-red-950/60 text-red-300 border-red-800'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      <span>{r.code}</span>
                      <span className="text-[10px] font-normal truncate max-w-full">
                        {locked ? 'LOCKED' : r.planting ? r.planting.cropName : 'Empty'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Auto-Detected Crop & WHP Safety Status */}
            {currentHarvRow?.whpLockedUntil ? (
              <div className="p-4 bg-red-950 border-2 border-red-500 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-red-300">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <span>HARVEST BLOCKED — ACTIVE SPRAY WITHHOLDING PERIOD</span>
                </div>
                <div className="text-sm text-zinc-100">
                  <strong>
                    {currentHarvField.name} • {currentHarvRow.code} (
                    {currentHarvRow.planting?.cropName})
                  </strong>{' '}
                  was sprayed with <strong>{currentHarvRow.lastInput}</strong>.
                </div>
                <div className="font-mono text-xs text-amber-300">
                  SAFE TO HARVEST ON: {currentHarvRow.whpLockedUntil}
                </div>
              </div>
            ) : !currentHarvRow?.planting ? (
              <div className="p-4 bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-400">
                No active crop planted in {currentHarvField.id} • {currentHarvRow?.code}. Select a
                planted row above.
              </div>
            ) : (
              <>
                <div className="p-4 bg-zinc-950 border-l-4 border-emerald-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase text-zinc-400">
                      HARVESTING FROM {currentHarvField.id} • {currentHarvRow.code}:
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                      ✓ WHP CLEARED
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-zinc-100">
                    {currentHarvRow.planting.cropName} ({currentHarvRow.planting.variety})
                  </div>
                  <div className="font-mono text-xs text-zinc-400">
                    Row Code: {currentHarvRow.planting.trackingCode} ←{' '}
                    {currentHarvRow.planting.sourceTrayCode}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    2. QUANTITY ({currentHarvRow.planting.unit.toUpperCase()})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => Math.max(1, q - 5))}
                      className="touch-target px-4 bg-zinc-950 border border-zinc-700 font-mono font-bold"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => Math.max(1, q - 1))}
                      className="touch-target px-4 bg-zinc-950 border border-zinc-700 font-mono font-bold"
                    >
                      -1
                    </button>
                    <div className="touch-target flex-1 bg-zinc-950 border border-zinc-700 flex items-center justify-center font-mono text-xl font-black text-emerald-400">
                      {harvQty} {currentHarvRow.planting.unit}
                    </div>
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => q + 1)}
                      className="touch-target px-4 bg-zinc-950 border border-zinc-700 font-mono font-bold"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setHarvQty((q) => q + 5)}
                      className="touch-target px-4 bg-zinc-950 border border-zinc-700 font-mono font-bold"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Auto-generated Harvest Batch Code */}
                <div className="p-4 bg-zinc-950 border border-emerald-500/60 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400">HARVEST BATCH CODE:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    HV-1016-{currentHarvField.id}-{currentHarvRow.code}-
                    {currentHarvRow.planting.cropId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmHarvest}
                  className="touch-target w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-black text-sm uppercase tracking-wider"
                >
                  LOG HARVEST ({harvQty} {currentHarvRow.planting.unit})
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* ============================================================
          MOBILE BOTTOM NAVIGATION BAR (4 SHARP TABS)
         ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950 border-t border-zinc-800 grid grid-cols-4">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`h-14 flex flex-col items-center justify-center gap-1 border-r border-zinc-800 last:border-r-0 font-mono text-[11px] font-bold tracking-wider ${
                active ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
