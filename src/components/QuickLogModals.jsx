import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Scissors,
  Droplets,
  Layers,
  Wind,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UserCheck,
  Calendar,
  Hash,
} from 'lucide-react';

export default function QuickLogModals({
  activeModal,
  preselectedContext,
  onClose,
  activeOperator,
  patches,
  crops,
  approvedInputs,
  nurseryBatches,
  plantings,
  inputLogs,
  onLogHarvest,
  onLogInput,
  onLogPlanting,
  onLogNursery,
}) {
  if (!activeModal) return null;

  const todayStr = '2026-10-16';
  const compactDate = todayStr.replace(/-/g, '');

  // ==========================================
  // 1. HARVEST MODAL STATE
  // ==========================================
  const initialPatchId = preselectedContext?.patchId || patches[0]?.id || 'PA';
  const [hPatchId, setHPatchId] = useState(initialPatchId);
  const currentHPatch = patches.find((p) => p.id === hPatchId) || patches[0];
  const initialRowId =
    preselectedContext?.rowId ||
    currentHPatch.rows.find((r) => r.plantingId)?.id ||
    currentHPatch.rows[0]?.id;
  const [hRowId, setHRowId] = useState(initialRowId);
  const [hQty, setHQty] = useState(25);
  const [hUnit, setHUnit] = useState('bunches');
  const [hPickType, setHPickType] = useState('Continuous Pick #5');
  const [hGrade, setHGrade] = useState('Grade A Market Premium');
  const [hCullNotes, setHCullNotes] = useState('None — clean pick');

  const selectedHRow = currentHPatch.rows.find((r) => r.id === hRowId) || currentHPatch.rows[0];
  const activePlanting = plantings.find((pl) => pl.id === selectedHRow?.plantingId);
  const activeCrop = crops.find((c) => c.id === activePlanting?.cropId) || crops[0];

  // Sync default unit when row changes
  useEffect(() => {
    if (activeCrop?.defaultUnit) {
      setHUnit(activeCrop.defaultUnit);
    }
  }, [hRowId, activeCrop?.defaultUnit]);

  // Check active WHP lockout on selected row
  const activeWhpLog = inputLogs.find(
    (log) => log.whpActive && log.rowIds.includes(selectedHRow?.id)
  );
  const isRowWhpLocked = selectedHRow?.status === 'WHP Locked' || Boolean(activeWhpLog);

  const generatedHarvestBatchId = `HB-${compactDate}-${currentHPatch.code}-${selectedHRow?.code || 'R01'}-${activeCrop?.code || 'CRP'}`;

  // ==========================================
  // 2. INPUT / SPRAY MODAL STATE
  // ==========================================
  const [iPatchId, setIPatchId] = useState(preselectedContext?.patchId || 'PA');
  const currentIPatch = patches.find((p) => p.id === iPatchId) || patches[0];
  const [iRowIds, setIRowIds] = useState(
    preselectedContext?.rowId ? [preselectedContext.rowId] : [currentIPatch.rows[0]?.id]
  );
  const [iProductId, setIProductId] = useState(approvedInputs[0]?.id);
  const selectedInput = approvedInputs.find((inp) => inp.id === iProductId) || approvedInputs[0];
  const [iRateValue, setIRateValue] = useState(selectedInput?.defaultRate || '50');
  const [iVolumeL, setIVolumeL] = useState(15);
  const [iPurpose, setIPurpose] = useState(selectedInput?.defaultPurpose || '');
  const [iMethod, setIMethod] = useState(selectedInput?.defaultMethod || 'Backpack Foliar Spray');
  const [iWindKmh, setIWindKmh] = useState(6);
  const [iWindDir, setIWindDir] = useState('SE');
  const [iTempC, setITempC] = useState(19);
  const [iHumidity, setIHumidity] = useState('68% RH (Calm Morning)');

  useEffect(() => {
    if (selectedInput) {
      setIRateValue(selectedInput.defaultRate);
      setIPurpose(selectedInput.defaultPurpose);
      setIMethod(selectedInput.defaultMethod);
    }
  }, [iProductId]);

  const toggleIRow = (rId) => {
    setIRowIds((prev) =>
      prev.includes(rId) ? (prev.length > 1 ? prev.filter((id) => id !== rId) : prev) : [...prev, rId]
    );
  };

  const selectAllIRows = () => {
    setIRowIds(currentIPatch.rows.map((r) => r.id));
  };

  // Calculate safe harvest date based on WHP days
  const calcSafeDate = (days) => {
    const d = new Date('2026-10-16T08:00:00');
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString().split('T')[0];
  };

  // ==========================================
  // 3. PLANTING MODAL STATE
  // ==========================================
  const [pMethod, setPMethod] = useState('Seedling Transplant');
  const readyNurseryBatches = nurseryBatches.filter((nb) => nb.traysRemaining > 0);
  const [pNurseryId, setPNurseryId] = useState(
    preselectedContext?.nurseryBatchId || readyNurseryBatches[0]?.id || nurseryBatches[0]?.id
  );
  const [pDirectCropId, setPDirectCropId] = useState(crops[3]?.id || crops[0]?.id);
  const [pPatchId, setPPatchId] = useState(preselectedContext?.patchId || 'PA');
  const currentPPatch = patches.find((p) => p.id === pPatchId) || patches[0];
  const [pRowId, setPRowId] = useState(
    preselectedContext?.rowId ||
      currentPPatch.rows.find((r) => !r.plantingId)?.id ||
      currentPPatch.rows[0]?.id
  );
  const [pBedMeters, setPBedMeters] = useState(25);
  const [pTraysUsed, setPTraysUsed] = useState(2);

  const selectedNurseryBatch = nurseryBatches.find((nb) => nb.id === pNurseryId) || nurseryBatches[0];
  const selectedDirectCrop = crops.find((c) => c.id === pDirectCropId) || crops[0];

  // ==========================================
  // 4. NURSERY TRAY SOWING MODAL STATE
  // ==========================================
  const [nCropId, setNCropId] = useState(crops[0]?.id);
  const selectedNCrop = crops.find((c) => c.id === nCropId) || crops[0];
  const [nTrays, setNTrays] = useState(6);
  const [nCellDensity, setNCellDensity] = useState(128);
  const [nSeedLot, setNSeedLot] = useState(selectedNCrop?.defaultSeedLot || 'GH-2026-K88');
  const [nInvoice, setNInvoice] = useState('INV-GH-8945');

  useEffect(() => {
    if (selectedNCrop) {
      setNSeedLot(selectedNCrop.defaultSeedLot);
    }
  }, [nCropId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[94vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Top Modal Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between text-white ${
            activeModal === 'harvest'
              ? 'bg-emerald-900'
              : activeModal === 'input'
              ? 'bg-amber-900'
              : activeModal === 'planting'
              ? 'bg-teal-900'
              : 'bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15">
              {activeModal === 'harvest' && <Scissors className="w-6 h-6" />}
              {activeModal === 'input' && <Droplets className="w-6 h-6" />}
              {activeModal === 'planting' && <Sprout className="w-6 h-6" />}
              {activeModal === 'nursery' && <Layers className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  {activeModal === 'harvest' && 'Quick Harvest & Shed Batch'}
                  {activeModal === 'input' && 'Log Spray / Soil Input (FSQ4.2)'}
                  {activeModal === 'planting' && 'Field Planting & Bed Assignment'}
                  {activeModal === 'nursery' && 'Sow Nursery Seedling Trays'}
                </h2>
              </div>
              <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5" />
                Auto-tagged Operator: <strong className="underline">{activeOperator.name}</strong> •{' '}
                {todayStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ==========================================
              HARVEST LOGGING FORM
             ========================================== */}
          {activeModal === 'harvest' && (
            <>
              {/* Step 1: Select Patch */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  1. Select Patch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {patches.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setHPatchId(p.id);
                        setHRowId(p.rows[0]?.id);
                      }}
                      className={`touch-target px-4 py-3 rounded-xl font-semibold text-left border-2 transition flex items-center justify-between ${
                        hPatchId === p.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-sm">{p.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-200/80 text-stone-700">
                        {p.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Row (shows crop + WHP lock indicator) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  2. Tap Bed / Row (Auto-Checks SXC Withholding Lockout)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {currentHPatch.rows.map((r) => {
                    const pl = plantings.find((item) => item.id === r.plantingId);
                    const locked = r.status === 'WHP Locked';
                    const empty = !pl;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setHRowId(r.id)}
                        className={`touch-target p-3 rounded-xl border-2 text-left transition relative ${
                          hRowId === r.id
                            ? locked
                              ? 'border-red-600 bg-red-50/90 ring-2 ring-red-500/30'
                              : 'border-emerald-700 bg-emerald-50/90 ring-2 ring-emerald-500/30'
                            : locked
                            ? 'border-red-300 bg-red-50/40 text-red-900'
                            : empty
                            ? 'border-stone-200 bg-stone-100/60 text-stone-400'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-base">{r.code}</span>
                          {locked ? (
                            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                              WHP LOCK
                            </span>
                          ) : pl ? (
                            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              SAFE
                            </span>
                          ) : (
                            <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                              Empty
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs font-semibold truncate">
                          {pl ? pl.cropName : 'No Active Crop'}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {pl ? pl.variety : r.status}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE SXC WITHHOLDING SAFETY BANNER */}
              {isRowWhpLocked ? (
                <div className="p-4 rounded-2xl bg-red-950 text-white border-2 border-red-500 shadow-lg space-y-2">
                  <div className="flex items-center gap-2.5 text-red-300 font-bold text-sm uppercase tracking-wider">
                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                    <span>FSQ4.2 / SXC Harvest Lockout Active — Batch Blocked</span>
                  </div>
                  <p className="text-sm text-red-100 leading-relaxed">
                    <strong>
                      {currentHPatch.name} ({selectedHRow?.code})
                    </strong>{' '}
                    has an active chemical/botanical Withholding Period from{' '}
                    <span className="underline font-semibold">
                      {activeWhpLog?.productName || 'Recent Input Application'}
                    </span>{' '}
                    applied on <strong>{activeWhpLog?.date || '2026-10-15'}</strong> by{' '}
                    {activeWhpLog?.operator || 'Toby'}.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono bg-red-900/70 px-3 py-2 rounded-xl">
                    <span>WHP: {activeWhpLog?.whpDays || 3} Days</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">
                      Earliest Permissible Harvest: {activeWhpLog?.safeHarvestDate || '2026-10-18'}
                    </span>
                  </div>
                </div>
              ) : !activePlanting ? (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-sm font-medium flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    Selected bed ({selectedHRow?.code}) is currently unplanted / resting. Select an
                    active planted row to log a harvest.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-950">
                        SXC Safety Check Passed (Zero Active WHP)
                      </span>
                      <p className="text-emerald-800">
                        Linked to Planting{' '}
                        <span className="font-mono font-semibold">{activePlanting.id}</span> • Seed
                        Lot <span className="font-mono">{activePlanting.seedLot}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 font-mono text-xs font-bold text-emerald-950">
                    {generatedHarvestBatchId}
                  </div>
                </div>
              )}

              {/* Step 3: Quantity Stepper & Units (Large 48px+ Field Targets) */}
              {!isRowWhpLocked && activePlanting && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        3. Quantity Harvested ({activePlanting.cropName})
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHQty((q) => Math.max(1, q - 5))}
                          className="touch-target px-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 text-base"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => setHQty((q) => Math.max(1, q - 1))}
                          className="touch-target px-4 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 text-lg"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          value={hQty}
                          onChange={(e) => setHQty(Math.max(0.5, Number(e.target.value)))}
                          className="touch-target w-full text-center font-mono text-2xl font-extrabold bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setHQty((q) => q + 1)}
                          className="touch-target px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 font-bold text-emerald-900 text-lg"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => setHQty((q) => q + 5)}
                          className="touch-target px-3.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 font-bold text-emerald-900 text-base"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Measurement Unit
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['bunches', 'kg', 'field bins', 'crates'].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setHUnit(u)}
                            className={`touch-target px-3 py-2 rounded-xl font-bold text-sm uppercase border-2 transition ${
                              hUnit === u
                                ? 'border-emerald-700 bg-emerald-700 text-white'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Selective Continuous Pick & Quality Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        4. Harvest Mode (Multi-Pick / Staggered)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'First Cut #1',
                          'Continuous Pick #5',
                          'Selective Staggered Pick',
                          'Final Bed Clear-Out',
                        ].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setHPickType(mode)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                              hPickType === mode
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Quality Grading & Culls
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Grade A Market Premium',
                          'Grade A + Minor Field Trim',
                          'Seconds / Kitchen Grade',
                        ].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setHGrade(g)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                              hGrade === g
                                ? 'bg-emerald-800 text-white border-emerald-800'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ==========================================
              INPUT / SPRAY APPLICATION FORM
             ========================================== */}
          {activeModal === 'input' && (
            <>
              {/* Step 1: Select Approved Input from SXC Registry */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  1. Approved Input Product (Auto-Fills SXC Batch, DOM & WHP)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {approvedInputs.map((inp) => (
                    <button
                      key={inp.id}
                      type="button"
                      onClick={() => setIProductId(inp.id)}
                      className={`touch-target p-3 rounded-xl border-2 text-left transition ${
                        iProductId === inp.id
                          ? 'border-amber-700 bg-amber-50/90 ring-2 ring-amber-500/20'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-stone-900">{inp.name}</span>
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            inp.whpDays > 0
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {inp.whpDays === 0 ? '0-Day WHP' : `${inp.whpDays}d WHP LOCK`}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-stone-500 font-mono">
                        <span>Batch: {inp.batchNumber}</span>
                        <span>{inp.certNumber}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Linked SXC Compliance Metadata Box */}
              <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Batch & DOM</span>
                  <span className="font-mono font-bold text-stone-900">
                    {selectedInput.batchNumber} ({selectedInput.dom})
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Cert Reference</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedInput.certNumber}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Withholding Period</span>
                  <span className="font-bold text-stone-900">
                    {selectedInput.whpDays} Days (Safe: {calcSafeDate(selectedInput.whpDays)})
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">SXC Status</span>
                  <span className="font-bold text-emerald-700">
                    {selectedInput.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Step 2: Target Patch & Multi-Row Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    2. Target Patch & Row(s)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllIRows}
                    className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    Select All Rows in Patch
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {patches.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setIPatchId(p.id);
                        setIRowIds([p.rows[0]?.id]);
                      }}
                      className={`touch-target px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${
                        iPatchId === p.id
                          ? 'border-amber-800 bg-amber-900 text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {currentIPatch.rows.map((r) => {
                    const isSelected = iRowIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleIRow(r.id)}
                        className={`touch-target p-2.5 rounded-xl font-mono font-bold text-sm border-2 transition flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-amber-700 bg-amber-100 text-amber-950 ring-2 ring-amber-500/20'
                            : 'border-stone-200 bg-white text-stone-600'
                        }`}
                      >
                        <span>{r.code}</span>
                        <span className="text-[10px] font-sans font-normal truncate max-w-full">
                          {plantings.find((pl) => pl.id === r.plantingId)?.cropName || 'Resting'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Dosage Rate & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Application Rate ({selectedInput.defaultUnit})
                  </label>
                  <input
                    type="text"
                    value={iRateValue}
                    onChange={(e) => setIRateValue(e.target.value)}
                    className="touch-target w-full px-3.5 rounded-xl border-2 border-stone-300 font-mono font-bold text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Total Mix Applied (L or kg)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIVolumeL((v) => Math.max(1, v - 5))}
                      className="touch-target px-3 rounded-xl bg-stone-200 font-bold"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      value={iVolumeL}
                      onChange={(e) => setIVolumeL(Number(e.target.value))}
                      className="touch-target w-full text-center font-mono font-bold text-lg border-2 border-stone-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setIVolumeL((v) => v + 5)}
                      className="touch-target px-3 rounded-xl bg-amber-100 text-amber-950 font-bold"
                    >
                      +5
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Method / Equipment
                  </label>
                  <select
                    value={iMethod}
                    onChange={(e) => setIMethod(e.target.value)}
                    className="touch-target w-full px-3 rounded-xl border-2 border-stone-300 font-semibold text-sm bg-white"
                  >
                    <option>Backpack Foliar Spray</option>
                    <option>Venturi Fertigation</option>
                    <option>Broadfork & Surface Topdress</option>
                    <option>Boom Sprayer</option>
                  </select>
                </div>
              </div>

              {/* Step 4: Spray Drift Weather Protocol (1-Tap Presets + Wind Check) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-amber-700" />
                    3. Spray Drift Weather Protocol (Mandatory SXC / FSQ4.2)
                  </span>
                  {iWindKmh > 15 && (
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                      HIGH DRIFT RISK (&gt;15 km/h)
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Calm Morning (6 km/h SE • 19°C)', wind: 6, dir: 'SE', temp: 19, rh: '68% RH' },
                    { label: 'Light Breeze (11 km/h E • 23°C)', wind: 11, dir: 'E', temp: 23, rh: '56% RH' },
                    { label: 'Tunnel Enclosed (0 km/h • 22°C)', wind: 0, dir: 'Calm', temp: 22, rh: '75% RH' },
                    { label: 'Gusty Afternoon (18 km/h NW - Test Alert)', wind: 18, dir: 'NW', temp: 27, rh: '45% RH' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setIWindKmh(preset.wind);
                        setIWindDir(preset.dir);
                        setITempC(preset.temp);
                        setIHumidity(preset.rh);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        iWindKmh === preset.wind && iWindDir === preset.dir
                          ? 'bg-amber-900 text-white border-amber-900'
                          : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ==========================================
              FIELD PLANTING FORM
             ========================================== */}
          {activeModal === 'planting' && (
            <>
              {/* Step 1: Planting Method Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  1. Planting Method
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Seedling Transplant', 'Direct Field Sowing'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPMethod(m)}
                      className={`touch-target py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                        pMethod === m
                          ? 'border-teal-800 bg-teal-900 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Nursery Batch OR Direct Seed Crop */}
              {pMethod === 'Seedling Transplant' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    2. Select Nursery Batch ID (Auto-Links Seed Lot & Organic Cert)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {nurseryBatches.map((nb) => (
                      <button
                        key={nb.id}
                        type="button"
                        onClick={() => setPNurseryId(nb.id)}
                        className={`touch-target p-3.5 rounded-xl border-2 text-left transition flex items-center justify-between ${
                          pNurseryId === nb.id
                            ? 'border-teal-700 bg-teal-50/90 ring-2 ring-teal-500/20'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-teal-950">
                              {nb.id}
                            </span>
                            <span className="font-bold text-sm text-stone-900">
                              {nb.cropName} — {nb.variety}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            Seed Lot: <span className="font-mono">{nb.seedLot}</span> •{' '}
                            {nb.supplierName} • {nb.organicStatus}
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 shrink-0">
                          {nb.traysRemaining} trays avail
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    2. Select Direct-Sown Crop & Certified Seed Lot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {crops.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPDirectCropId(c.id)}
                        className={`touch-target p-3 rounded-xl border-2 text-left transition ${
                          pDirectCropId === c.id
                            ? 'border-teal-700 bg-teal-50 text-teal-950'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-stone-500 truncate">{c.variety}</div>
                        <div className="text-[11px] font-mono text-teal-800 mt-1">
                          Lot: {c.defaultSeedLot}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Target Patch & Row Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    3. Select Patch
                  </label>
                  <div className="flex flex-col gap-2">
                    {patches.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPPatchId(p.id);
                          setPRowId(
                            p.rows.find((r) => !r.plantingId)?.id || p.rows[0]?.id
                          );
                        }}
                        className={`touch-target px-3.5 py-2.5 rounded-xl font-bold text-sm border-2 text-left flex justify-between items-center ${
                          pPatchId === p.id
                            ? 'border-teal-800 bg-teal-900 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="text-xs font-mono opacity-80">{p.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Target Bed / Row & Bed Meters
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {currentPPatch.rows.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setPRowId(r.id);
                          setPBedMeters(r.lengthM);
                        }}
                        className={`touch-target p-2 rounded-xl font-mono font-bold text-sm border-2 ${
                          pRowId === r.id
                            ? 'border-teal-700 bg-teal-100 text-teal-950'
                            : !r.plantingId
                            ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                            : 'border-stone-200 bg-white text-stone-600'
                        }`}
                      >
                        <div>{r.code}</div>
                        <div className="text-[10px] font-sans font-normal">
                          {!r.plantingId ? 'Ready' : 'Occupied'}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-600">Bed Meters:</span>
                    {[10, 15, 20, 25, 30].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPBedMeters(m)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                          pBedMeters === m
                            ? 'bg-teal-900 text-white border-teal-900'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==========================================
              NURSERY TRAY SOWING FORM
             ========================================== */}
          {activeModal === 'nursery' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  1. Select Crop & Cultivar to Propagate
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {crops.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNCropId(c.id)}
                      className={`touch-target p-3 rounded-xl border-2 text-left transition ${
                        nCropId === c.id
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <div className="font-bold text-sm">{c.name}</div>
                      <div className="text-[11px] opacity-80 truncate">{c.variety}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    2. Number of Trays Sown
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNTrays((t) => Math.max(1, t - 1))}
                      className="touch-target px-4 rounded-xl bg-stone-200 font-bold text-lg"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      value={nTrays}
                      onChange={(e) => setNTrays(Math.max(1, Number(e.target.value)))}
                      className="touch-target w-full text-center font-mono text-2xl font-extrabold border-2 border-stone-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setNTrays((t) => t + 1)}
                      className="touch-target px-4 rounded-xl bg-emerald-100 text-emerald-950 font-bold text-lg"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setNTrays((t) => t + 4)}
                      className="touch-target px-3.5 rounded-xl bg-emerald-100 text-emerald-950 font-bold text-sm"
                    >
                      +4
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    3. Tray Cell Density
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 72, 128, 200].map((cells) => (
                      <button
                        key={cells}
                        type="button"
                        onClick={() => setNCellDensity(cells)}
                        className={`touch-target rounded-xl font-mono font-bold text-sm border-2 ${
                          nCellDensity === cells
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        {cells}c
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5 font-mono">
                    Total Seedlings: <strong>{nTrays * nCellDensity} cells</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-100 border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Seed Lot / Batch #
                  </label>
                  <input
                    type="text"
                    value={nSeedLot}
                    onChange={(e) => setNSeedLot(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Supplier Invoice Ref
                  </label>
                  <input
                    type="text"
                    value={nInvoice}
                    onChange={(e) => setNInvoice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-sm bg-white"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Modal Footer — Single-Tap Confirmation */}
        <div className="px-5 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="touch-target px-5 rounded-xl font-bold text-stone-600 hover:bg-stone-200 transition"
          >
            Cancel
          </button>

          {activeModal === 'harvest' && (
            <button
              type="button"
              disabled={isRowWhpLocked || !activePlanting}
              onClick={() => {
                onLogHarvest({
                  id: generatedHarvestBatchId,
                  date: todayStr,
                  time: new Date().toTimeString().slice(0, 5),
                  patchId: currentHPatch.id,
                  patchCode: currentHPatch.code,
                  patchName: currentHPatch.name,
                  rowId: selectedHRow.id,
                  rowCode: selectedHRow.code,
                  plantingId: activePlanting.id,
                  nurseryBatchId: activePlanting.nurseryBatchId,
                  cropId: activeCrop.id,
                  cropCode: activeCrop.code,
                  cropName: activePlanting.cropName,
                  variety: activePlanting.variety,
                  pickSequence: hPickType,
                  quantity: hQty,
                  unit: hUnit,
                  qualityGrade: hGrade,
                  cullNotes: hCullNotes,
                  whpVerified: 'Cleared by SXC Automated Safety Check',
                  operator: activeOperator.name,
                  allocations: [],
                });
                onClose();
              }}
              className={`touch-target flex-1 sm:flex-initial px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-md transition ${
                isRowWhpLocked || !activePlanting
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isRowWhpLocked
                  ? 'Blocked by Active WHP Lockout'
                  : `Confirm Harvest (${hQty} ${hUnit})`}
              </span>
            </button>
          )}

          {activeModal === 'input' && (
            <button
              type="button"
              onClick={() => {
                const targetRowCodes = currentIPatch.rows
                  .filter((r) => iRowIds.includes(r.id))
                  .map((r) => r.code);
                onLogInput({
                  id: `INP-${compactDate}-0${inputLogs.length + 1}`,
                  date: todayStr,
                  startTime: '07:30',
                  endTime: '08:05',
                  patchId: currentIPatch.id,
                  patchName: currentIPatch.name,
                  rowIds: iRowIds,
                  rowCodes: targetRowCodes,
                  activeCrop: 'Selected Patch Beds',
                  inputId: selectedInput.id,
                  productName: selectedInput.name,
                  batchNumber: selectedInput.batchNumber,
                  dom: selectedInput.dom,
                  supplier: selectedInput.supplier,
                  certNumber: selectedInput.certNumber,
                  rate: `${iRateValue} ${selectedInput.defaultUnit} (${iVolumeL}L applied)`,
                  purpose: iPurpose,
                  method: iMethod,
                  weather: {
                    windKmh: iWindKmh,
                    windDir: iWindDir,
                    tempC: iTempC,
                    humidity: iHumidity,
                  },
                  whpDays: selectedInput.whpDays,
                  safeHarvestDate: calcSafeDate(selectedInput.whpDays),
                  whpActive: selectedInput.whpDays > 0,
                  operator: activeOperator.name,
                });
                onClose();
              }}
              className="touch-target flex-1 sm:flex-initial px-6 rounded-xl font-bold bg-amber-800 hover:bg-amber-900 text-white flex items-center justify-center gap-2 shadow-md transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                Record Input ({iRowIds.length} {iRowIds.length === 1 ? 'Row' : 'Rows'})
              </span>
            </button>
          )}

          {activeModal === 'planting' && (
            <button
              type="button"
              onClick={() => {
                const targetRow =
                  currentPPatch.rows.find((r) => r.id === pRowId) || currentPPatch.rows[0];
                const isTransplant = pMethod === 'Seedling Transplant';
                const cropObj = isTransplant
                  ? crops.find((c) => c.id === selectedNurseryBatch.cropId) || crops[0]
                  : selectedDirectCrop;

                onLogPlanting({
                  id: `PL-${compactDate}-${currentPPatch.id}-${targetRow.code}`,
                  method: pMethod,
                  nurseryBatchId: isTransplant ? selectedNurseryBatch.id : null,
                  cropId: cropObj.id,
                  cropCode: cropObj.code,
                  cropName: cropObj.name,
                  variety: cropObj.variety,
                  seedSupplier: isTransplant
                    ? selectedNurseryBatch.supplierName
                    : 'Green Harvest Organic Seeds',
                  seedLot: isTransplant
                    ? selectedNurseryBatch.seedLot
                    : cropObj.defaultSeedLot,
                  organicCertRef: isTransplant
                    ? selectedNurseryBatch.organicStatus
                    : cropObj.seedCert,
                  patchId: currentPPatch.id,
                  patchName: currentPPatch.name,
                  rowIds: [targetRow.id],
                  rowCodes: [targetRow.code],
                  plantingDate: todayStr,
                  quantity: pBedMeters,
                  quantityUnit: `${pBedMeters} bed meters`,
                  traysUsed: isTransplant ? pTraysUsed : 0,
                  operator: activeOperator.name,
                });
                onClose();
              }}
              className="touch-target flex-1 sm:flex-initial px-6 rounded-xl font-bold bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center gap-2 shadow-md transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Assign & Log Planting</span>
            </button>
          )}

          {activeModal === 'nursery' && (
            <button
              type="button"
              onClick={() => {
                onLogNursery({
                  id: `NB-${compactDate}-${selectedNCrop.code}`,
                  cropId: selectedNCrop.id,
                  cropName: selectedNCrop.name,
                  variety: selectedNCrop.variety,
                  sowingDate: todayStr,
                  supplierName: 'Green Harvest Organic Seeds',
                  invoiceRef: nInvoice,
                  seedLot: nSeedLot,
                  organicStatus: selectedNCrop.seedCert,
                  traysSown: nTrays,
                  traysRemaining: nTrays,
                  cellDensity: nCellDensity,
                  totalCells: nTrays * nCellDensity,
                  operator: activeOperator.name,
                  status: 'Propagating',
                });
                onClose();
              }}
              className="touch-target flex-1 sm:flex-initial px-6 rounded-xl font-bold bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 shadow-md transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Generate Nursery Batch ({nTrays} Trays)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
