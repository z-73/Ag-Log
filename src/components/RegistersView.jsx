import React, { useState } from 'react';
import {
  Layers,
  Sprout,
  Droplets,
  Scissors,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Wind,
  GitBranch,
  ArrowUpRight,
  UserCheck,
  Search,
} from 'lucide-react';

export default function RegistersView({
  initialSubTab = 'harvest',
  nurseryBatches,
  plantings,
  inputLogs,
  harvests,
  onOpenQuickModal,
  onInspectBatchTraceback,
}) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');

  const registerTabs = [
    { id: 'harvest', label: 'D. Harvest & Shed Batches', short: 'Harvests', count: harvests.length, icon: Scissors, color: 'bg-emerald-800' },
    { id: 'input', label: 'C. Spray & Soil Inputs (FSQ4.2)', short: 'Inputs / Sprays', count: inputLogs.length, icon: Droplets, color: 'bg-amber-800' },
    { id: 'planting', label: 'B. Field Planting Register', short: 'Plantings', count: plantings.length, icon: Sprout, color: 'bg-teal-800' },
    { id: 'nursery', label: 'A. Nursery & Seedling Trays', short: 'Nursery', count: nurseryBatches.length, icon: Layers, color: 'bg-stone-800' },
  ];

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="space-y-5">
      {/* Register Selector Pills + Quick Add Action */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              SXC Organic Certification Registers
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Audit-ready operational logs tagged with active operator identity and batch traceability.
            </p>
          </div>

          <button
            onClick={() => onOpenQuickModal(subTab)}
            className="touch-target px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>
              {subTab === 'harvest' && 'Log New Harvest Batch'}
              {subTab === 'input' && 'Log Input / Spray'}
              {subTab === 'planting' && 'Log Field Planting'}
              {subTab === 'nursery' && 'Sow Nursery Trays'}
            </span>
          </button>
        </div>

        {/* 4 Register Sub-Tab Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {registerTabs.map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className={`touch-target p-3 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                  active
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs sm:text-sm truncate">{t.short}</span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Instant Filter Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Batch ID, Crop, Patch/Row, Seed Lot, Product, or Operator..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:border-emerald-700 focus:outline-none"
          />
        </div>
      </div>

      {/* ==========================================
          D. HARVEST & SHED BATCH REGISTER
         ========================================== */}
      {subTab === 'harvest' && (
        <div className="space-y-3">
          {harvests
            .filter(
              (h) =>
                !q ||
                h.id.toLowerCase().includes(q) ||
                h.cropName.toLowerCase().includes(q) ||
                h.variety.toLowerCase().includes(q) ||
                h.patchName.toLowerCase().includes(q) ||
                h.operator.toLowerCase().includes(q)
            )
            .map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-emerald-500 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl bg-emerald-950 text-emerald-200">
                      {h.id}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {h.whpVerified}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {h.date} at {h.time}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="text-lg font-extrabold text-stone-900">
                      {h.cropName} — <span className="font-semibold text-stone-600">{h.variety}</span>
                    </h3>
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {h.pickSequence}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                    <span>
                      Location: <strong>{h.patchName} ({h.rowCode})</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono">Planting Ref: {h.plantingId}</span>
                    {h.nurseryBatchId && (
                      <>
                        <span>•</span>
                        <span className="font-mono">Nursery Lot: {h.nurseryBatchId}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Grade: {h.qualityGrade}</span>
                  </div>
                  {h.cullNotes && (
                    <p className="text-xs text-stone-500 italic">Cull / Loss Notes: {h.cullNotes}</p>
                  )}
                </div>

                <div className="flex sm:flex-row items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                  <div className="text-left lg:text-right">
                    <div className="font-mono text-2xl font-extrabold text-emerald-800">
                      {h.quantity} <span className="text-sm font-sans uppercase">{h.unit}</span>
                    </div>
                    <div className="text-xs text-stone-500 flex items-center lg:justify-end gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Picked by <strong>{h.operator}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectBatchTraceback(h.id)}
                    className="touch-target px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>Trace Chain</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ==========================================
          C. CHEMICAL, FERTILISER & SOIL INPUT REGISTER
         ========================================== */}
      {subTab === 'input' && (
        <div className="space-y-3">
          {inputLogs
            .filter(
              (log) =>
                !q ||
                log.productName.toLowerCase().includes(q) ||
                log.patchName.toLowerCase().includes(q) ||
                log.batchNumber.toLowerCase().includes(q) ||
                log.operator.toLowerCase().includes(q)
            )
            .map((log) => (
              <div
                key={log.id}
                className={`bg-white rounded-2xl border-2 p-4 sm:p-5 shadow-xs space-y-3 ${
                  log.whpActive ? 'border-red-400' : 'border-stone-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-900 text-amber-100">
                      {log.id}
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-600">
                      {log.date} ({log.startTime}–{log.endTime})
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold">
                      Cert: {log.certNumber}
                    </span>
                  </div>

                  {log.whpActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      WHP LOCKOUT ACTIVE ({log.whpDays}d • Safe {log.safeHarvestDate})
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      WHP Cleared ({log.whpDays}d WHP)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900">{log.productName}</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Batch: <span className="font-mono font-bold">{log.batchNumber}</span> • DOM:{' '}
                      <span className="font-mono">{log.dom}</span> • {log.supplier}
                    </p>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-stone-500">Target Location: </span>
                      <strong className="text-stone-900">
                        {log.patchName} ({log.rowCodes.join(', ')})
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500">Rate & Method: </span>
                      <strong className="text-stone-900">
                        {log.rate} via {log.method}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500">Justification: </span>
                      <span className="text-stone-800">{log.purpose}</span>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-stone-800">
                      <Wind className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        Weather: {log.weather.windKmh} km/h {log.weather.windDir} •{' '}
                        {log.weather.tempC}°C • {log.weather.humidity}
                      </span>
                    </div>
                    <div className="text-stone-500 mt-1.5 flex items-center justify-between">
                      <span>FSQ4.2 Verified Sign-off:</span>
                      <strong className="text-stone-900">{log.operator}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ==========================================
          B. FIELD PLANTING REGISTER
         ========================================== */}
      {subTab === 'planting' && (
        <div className="space-y-3">
          {plantings
            .filter(
              (pl) =>
                !q ||
                pl.id.toLowerCase().includes(q) ||
                pl.cropName.toLowerCase().includes(q) ||
                pl.patchName.toLowerCase().includes(q) ||
                pl.seedLot.toLowerCase().includes(q)
            )
            .map((pl) => (
              <div
                key={pl.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-950 text-teal-200">
                      {pl.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        pl.method === 'Seedling Transplant'
                          ? 'bg-teal-100 text-teal-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {pl.method}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      Planted: {pl.plantingDate}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-stone-900">
                    {pl.cropName} — <span className="font-medium text-stone-600">{pl.variety}</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                    <span>
                      Location: <strong>{pl.patchName} ({pl.rowCodes.join(', ')})</strong>
                    </span>
                    <span>•</span>
                    {pl.nurseryBatchId ? (
                      <span className="font-mono text-teal-800 font-bold">
                        Nursery Tray Batch: {pl.nurseryBatchId}
                      </span>
                    ) : (
                      <span>Direct Sown in Field</span>
                    )}
                    <span>•</span>
                    <span className="font-mono">
                      Seed Lot: {pl.seedLot} ({pl.seedSupplier})
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                  <div className="font-mono text-base font-extrabold text-stone-900">
                    {pl.quantityUnit}
                  </div>
                  <div className="text-xs text-emerald-800 font-semibold">{pl.organicCertRef}</div>
                  <div className="text-xs text-stone-500 mt-0.5">Logged by {pl.operator}</div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ==========================================
          A. NURSERY & SEEDLING REGISTER
         ========================================== */}
      {subTab === 'nursery' && (
        <div className="space-y-3">
          {nurseryBatches
            .filter(
              (nb) =>
                !q ||
                nb.id.toLowerCase().includes(q) ||
                nb.cropName.toLowerCase().includes(q) ||
                nb.seedLot.toLowerCase().includes(q)
            )
            .map((nb) => (
              <div
                key={nb.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-stone-900 text-white">
                      {nb.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        nb.traysRemaining > 0
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {nb.status} ({nb.traysRemaining}/{nb.traysSown} trays left)
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      Sown: {nb.sowingDate}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-stone-900">
                    {nb.cropName} — <span className="font-medium text-stone-600">{nb.variety}</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                    <span>
                      Supplier: <strong>{nb.supplierName}</strong> ({nb.invoiceRef})
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold">Seed Lot: {nb.seedLot}</span>
                    <span>•</span>
                    <span className="text-emerald-800 font-semibold">{nb.organicStatus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-base font-extrabold text-stone-900">
                      {nb.traysSown} Trays × {nb.cellDensity}c
                    </div>
                    <div className="text-xs text-stone-500">
                      {nb.totalCells} seedlings • Sown by {nb.operator}
                    </div>
                  </div>

                  {nb.traysRemaining > 0 && (
                    <button
                      onClick={() =>
                        onOpenQuickModal('planting', { nurseryBatchId: nb.id })
                      }
                      className="touch-target px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Sprout className="w-4 h-4" />
                      <span>Transplant</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
