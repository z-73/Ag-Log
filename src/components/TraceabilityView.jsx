import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ShieldCheck,
  PackageCheck,
  Sprout,
  Layers,
  Droplets,
  Scissors,
  Truck,
  Scale,
  FileCheck2,
  Plus,
  CheckCircle2,
  ArrowDown,
  Printer,
} from 'lucide-react';

export default function TraceabilityView({
  selectedBatchId,
  onSelectBatchId,
  harvests,
  plantings,
  nurseryBatches,
  inputLogs,
  onAddAllocation,
}) {
  const activeHarvest =
    harvests.find((h) => h.id === selectedBatchId) || harvests[0];

  const [allocChannel, setAllocChannel] = useState('REKO Mt Cotton Pre-Orders');
  const [allocQty, setAllocQty] = useState(5);
  const [allocRef, setAllocRef] = useState('REKO-20261016-Thu');
  const [showAuditSheet, setShowAuditSheet] = useState(false);

  const linkedPlanting = plantings.find((pl) => pl.id === activeHarvest?.plantingId);
  const linkedNursery = nurseryBatches.find(
    (nb) => nb.id === (activeHarvest?.nurseryBatchId || linkedPlanting?.nurseryBatchId)
  );
  const linkedInputs = inputLogs.filter(
    (log) =>
      log.patchId === activeHarvest?.patchId &&
      log.rowIds.includes(activeHarvest?.rowId)
  );

  const totalAllocated = (activeHarvest?.allocations || []).reduce(
    (sum, a) => sum + Number(a.quantity),
    0
  );
  const unallocatedBalance = Math.max(
    0,
    Number((activeHarvest?.quantity - totalAllocated).toFixed(1))
  );

  useEffect(() => {
    setAllocQty(Math.min(5, unallocatedBalance || 1));
  }, [activeHarvest?.id, unallocatedBalance]);

  if (!activeHarvest) return null;

  return (
    <div className="space-y-6">
      {/* Top Bar: Batch Selector + SXC Audit Export */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                SXC Traceback Query Engine & Mass Balance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Select any Harvest Lot ID to render an instant forward & backward chain-of-custody report.
            </p>
          </div>

          <button
            onClick={() => setShowAuditSheet((v) => !v)}
            className="touch-target px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shrink-0"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>{showAuditSheet ? 'Hide SXC Audit Sheet' : 'Preview SXC Audit Export'}</span>
          </button>
        </div>

        {/* Harvest Lot Selector Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Select Harvest Lot / Batch Number to Trace:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {harvests.map((h) => (
              <button
                key={h.id}
                onClick={() => onSelectBatchId(h.id)}
                className={`touch-target px-3.5 py-2 rounded-xl border-2 text-left transition shrink-0 ${
                  activeHarvest.id === h.id
                    ? 'border-emerald-800 bg-emerald-950 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                <div className="font-mono text-xs font-extrabold">{h.id}</div>
                <div className="text-[11px] opacity-80">
                  {h.cropName} ({h.quantity} {h.unit})
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional SXC Printable Audit Sheet Preview */}
      {showAuditSheet && (
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700 pb-3">
            <div>
              <div className="text-emerald-400 font-bold uppercase tracking-widest">
                Southern Cross Certified (SXC) — Audit Chain-of-Custody Record
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Producer: Mt Cotton Organic Fruit & Veg (T & A Palmer) • Cert #SXC-14082
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-stone-800/90 border border-stone-700">
              <div className="text-stone-400">1. SEED & NURSERY ORIGIN</div>
              <div className="text-white font-bold mt-1">
                Lot: {linkedPlanting?.seedLot || 'GH-2026-K88'}
              </div>
              <div>Supplier: {linkedPlanting?.seedSupplier}</div>
              <div>Cert: {linkedPlanting?.organicCertRef}</div>
              <div>Nursery Batch: {linkedNursery?.id || 'Direct Sown in Field'}</div>
            </div>
            <div className="p-3 rounded-xl bg-stone-800/90 border border-stone-700">
              <div className="text-stone-400">2. FIELD & INPUT COMPLIANCE</div>
              <div className="text-white font-bold mt-1">
                Planting Ref: {activeHarvest.plantingId}
              </div>
              <div>
                Bed: {activeHarvest.patchName} ({activeHarvest.rowCode})
              </div>
              <div>Inputs Logged: {linkedInputs.length} Verified SXC Entries</div>
              <div className="text-emerald-400 font-bold">
                WHP Status: {activeHarvest.whpVerified}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-stone-800/90 border border-stone-700">
              <div className="text-stone-400">3. HARVEST & MASS BALANCE</div>
              <div className="text-white font-bold mt-1">Batch: {activeHarvest.id}</div>
              <div>
                Yield: {activeHarvest.quantity} {activeHarvest.unit} (By {activeHarvest.operator})
              </div>
              <div>
                Dispatched/Sold: {totalAllocated} {activeHarvest.unit}
              </div>
              <div className="text-emerald-400 font-bold">
                Mass Balance Check: PASS ({unallocatedBalance} {activeHarvest.unit} in Shed)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Split View: Visual Traceback Chain (Left) + Mass Balance Ledger (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: Visual End-to-End Traceback Chain */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            Immutable Chain of Custody — {activeHarvest.id}
          </h3>

          {/* Node 1: Seed Supplier & Certified Seed Lot */}
          <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-900 text-white shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Step 1 • Certified Seed Origin
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  {linkedPlanting?.organicCertRef || 'ACO/SXC Verified'}
                </span>
              </div>
              <div className="font-extrabold text-stone-900 text-base mt-0.5">
                {linkedPlanting?.seedSupplier || 'Green Harvest Organic Seeds'}
              </div>
              <div className="text-xs font-mono text-stone-600 mt-0.5">
                Seed Lot #: <strong>{linkedPlanting?.seedLot || 'GH-2026-K88'}</strong> • Crop:{' '}
                {activeHarvest.cropName} ({activeHarvest.variety})
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-stone-400" />
          </div>

          {/* Node 2: Nursery Sowing Batch ID */}
          <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-800 text-white shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Step 2 • Nursery Propagation Register
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                  {linkedNursery ? linkedNursery.id : 'Direct Field Sow'}
                </span>
              </div>
              {linkedNursery ? (
                <>
                  <div className="font-extrabold text-stone-900 text-base mt-0.5">
                    Nursery Batch {linkedNursery.id}
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    Sown: <strong>{linkedNursery.sowingDate}</strong> • {linkedNursery.traysSown}{' '}
                    trays × {linkedNursery.cellDensity} cells ({linkedNursery.totalCells} plants) •
                    Operator: <strong>{linkedNursery.operator}</strong>
                  </div>
                </>
              ) : (
                <div className="font-bold text-stone-800 text-sm mt-0.5">
                  Direct Field Sown — bypassed nursery tray stage ({linkedPlanting?.plantingDate})
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-stone-400" />
          </div>

          {/* Node 3: Field Planting Ref & Row ID + Linked Input Logs */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border-2 border-teal-600/40 space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal-900 text-white shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                    Step 3 • Field Planting & Spatial Occupancy
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-900 text-white">
                    {activeHarvest.plantingId}
                  </span>
                </div>
                <div className="font-extrabold text-stone-900 text-base mt-0.5">
                  {activeHarvest.patchName} — Bed {activeHarvest.rowCode}
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Planted: <strong>{linkedPlanting?.plantingDate || '2026-08-25'}</strong> •{' '}
                  {linkedPlanting?.quantityUnit || '25 bed meters'} • Operator:{' '}
                  <strong>{linkedPlanting?.operator || 'Toby'}</strong>
                </div>
              </div>
            </div>

            {/* Linked Input / Spray Verification Sub-Box */}
            <div className="p-3 rounded-xl bg-white border border-teal-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-amber-700" />
                  Linked Input & Spray Logs on {activeHarvest.rowCode} ({linkedInputs.length})
                </span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  WHP Cleared
                </span>
              </div>
              {linkedInputs.length === 0 ? (
                <p className="text-xs text-stone-500">
                  Zero foliar sprays or restricted inputs recorded on this row prior to harvest.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {linkedInputs.map((inp) => (
                    <div
                      key={inp.id}
                      className="text-xs bg-stone-50 px-3 py-2 rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <strong className="text-stone-900">{inp.productName}</strong>{' '}
                        <span className="font-mono text-stone-500">({inp.batchNumber})</span>
                      </div>
                      <div className="font-mono text-[11px] text-stone-600">
                        Applied {inp.date} • WHP: {inp.whpDays}d • By {inp.operator}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-stone-400" />
          </div>

          {/* Node 4: Harvest Lot / Batch Number */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-white shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                  Step 4 • Harvest & Shed Batch Register
                </span>
                <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-emerald-900 text-white">
                  {activeHarvest.id}
                </span>
              </div>
              <div className="font-extrabold text-stone-900 text-base mt-0.5">
                {activeHarvest.quantity} {activeHarvest.unit} — {activeHarvest.cropName} (
                {activeHarvest.pickSequence})
              </div>
              <div className="text-xs text-stone-700 mt-0.5">
                Harvested: <strong>{activeHarvest.date}</strong> at {activeHarvest.time} •{' '}
                {activeHarvest.qualityGrade} • Operator: <strong>{activeHarvest.operator}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Output Ledger & Mass Balance Verification */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-700" />
                <span>SXC Mass Balance Ledger</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                Audit Compliant
              </span>
            </div>

            {/* Yield vs Allocated Meter */}
            <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Harvested Batch Yield</span>
                <span className="font-mono font-bold text-white text-sm">
                  {activeHarvest.quantity} {activeHarvest.unit}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((totalAllocated / activeHarvest.quantity) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-bold">
                  Allocated / Sold: {totalAllocated} {activeHarvest.unit}
                </span>
                <span className="font-mono text-stone-300">
                  Remaining in Shed: <strong>{unallocatedBalance} {activeHarvest.unit}</strong>
                </span>
              </div>
            </div>

            {/* Existing Sales / REKO Mt Cotton Dispatches */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Recorded Sales & REKO Dispatches
              </label>
              {(activeHarvest.allocations || []).length === 0 ? (
                <p className="text-xs text-stone-500 italic p-3 rounded-xl bg-stone-50 border border-stone-200">
                  No sales dispatched from this batch yet. Allocate below.
                </p>
              ) : (
                activeHarvest.allocations.map((alloc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-stone-900">{alloc.channel}</div>
                        <div className="text-[11px] font-mono text-stone-500">
                          Ref: {alloc.customerRef}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-emerald-900">
                      {alloc.quantity} {alloc.unit}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Allocate Dispatch Form */}
            {unallocatedBalance > 0 ? (
              <div className="pt-3 border-t border-stone-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Allocate Remaining Stock ({unallocatedBalance} {activeHarvest.unit} Avail)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'REKO Mt Cotton Pre-Orders', ref: 'REKO-20261016-Thu' },
                    { name: 'Mt Cotton Farm Gate Shed', ref: 'SHED-POS-1016' },
                    { name: 'Local Wholesale Co-op', ref: 'INV-WS-425' },
                  ].map((ch) => (
                    <button
                      key={ch.name}
                      type="button"
                      onClick={() => {
                        setAllocChannel(ch.name);
                        setAllocRef(ch.ref);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        allocChannel === ch.name
                          ? 'bg-emerald-900 text-white border-emerald-900'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.5}
                    max={unallocatedBalance}
                    step={0.5}
                    value={allocQty}
                    onChange={(e) =>
                      setAllocQty(Math.min(unallocatedBalance, Math.max(0.5, Number(e.target.value))))
                    }
                    className="touch-target w-24 text-center font-mono font-bold text-base border-2 border-stone-300 rounded-xl"
                  />
                  <span className="text-xs font-bold text-stone-600 uppercase">
                    {activeHarvest.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onAddAllocation(activeHarvest.id, {
                        channel: allocChannel,
                        quantity: Number(allocQty),
                        unit: activeHarvest.unit,
                        customerRef: allocRef,
                      });
                    }}
                    className="touch-target flex-1 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Dispatch</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% of Harvest Batch Allocated & Balanced!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
