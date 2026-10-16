import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Scissors,
  Droplets,
  History,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function FarmMapView({
  patches,
  plantings,
  inputLogs,
  harvests,
  onOpenQuickModal,
  onClearWhpLock,
}) {
  const [selectedPatchFilter, setSelectedPatchFilter] = useState('ALL');
  const [selectedRowDetail, setSelectedRowDetail] = useState(null);

  const visiblePatches =
    selectedPatchFilter === 'ALL'
      ? patches
      : patches.filter((p) => p.id === selectedPatchFilter);

  return (
    <div className="space-y-6">
      {/* Header & Patch Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>Interactive Patch & Permanent Bed Map</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Tap any bed to inspect crop rotation history, WHP lockouts, or launch a 1-tap field log.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPatchFilter('ALL')}
            className={`touch-target px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap border-2 transition ${
              selectedPatchFilter === 'ALL'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
            }`}
          >
            All Patches ({patches.reduce((acc, p) => acc + p.rows.length, 0)} Beds)
          </button>
          {patches.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatchFilter(p.id)}
              className={`touch-target px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap border-2 transition ${
                selectedPatchFilter === p.id
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {p.name.split('—')[0].trim()} ({p.rows.length})
            </button>
          ))}
        </div>
      </div>

      {/* Status Legend Strip */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold px-1">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          Harvest Ready (Safe)
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-900 border border-red-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          WHP Locked (Harvest Blocked)
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          Growing / Maturing
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200 text-stone-700 border border-stone-300">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
          Prepped / Resting Bed
        </span>
      </div>

      {/* Patches Spatial Grid */}
      <div className="space-y-6">
        {visiblePatches.map((patch) => (
          <div
            key={patch.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden"
          >
            {/* Patch Header */}
            <div className="bg-stone-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {patch.code}
                  </span>
                  <h3 className="text-lg font-bold">{patch.name}</h3>
                </div>
                <p className="text-xs text-stone-300 mt-1 flex flex-wrap items-center gap-3">
                  <span>{patch.zone}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    Alignment: {patch.orientation}
                  </span>
                  <span>•</span>
                  <span>Soil: {patch.soilType}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenQuickModal('input', { patchId: patch.id })}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Droplets className="w-4 h-4" />
                  <span>Spray/Feed Patch</span>
                </button>
              </div>
            </div>

            {/* Permanent Beds / Rows Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {patch.rows.map((row) => {
                const planting = plantings.find((pl) => pl.id === row.plantingId);
                const whpLog = inputLogs.find(
                  (log) => log.whpActive && log.rowIds.includes(row.id)
                );
                const isLocked = row.status === 'WHP Locked' || Boolean(whpLog);
                const isReady = row.status === 'Harvest Ready' && !isLocked;
                const isEmpty = !planting;

                return (
                  <div
                    key={row.id}
                    onClick={() => setSelectedRowDetail({ patch, row, planting, whpLog, isLocked })}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition flex flex-col justify-between relative group ${
                      isLocked
                        ? 'border-red-500 bg-red-50/60 hover:bg-red-50'
                        : isReady
                        ? 'border-emerald-600/80 bg-emerald-50/40 hover:bg-emerald-50/80'
                        : isEmpty
                        ? 'border-stone-200 border-dashed bg-stone-50/70 hover:bg-stone-100'
                        : 'border-teal-500/60 bg-teal-50/30 hover:bg-teal-50/60'
                    }`}
                  >
                    <div>
                      {/* Row Top Bar */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold px-2.5 py-1 rounded-xl bg-stone-900 text-white">
                            {row.code}
                          </span>
                          <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                            <Ruler className="w-3.5 h-3.5" />
                            {row.lengthM}m × {row.widthM}m ({row.alignment})
                          </span>
                        </div>

                        {isLocked ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white flex items-center gap-1 shadow-xs">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            WHP LOCK
                          </span>
                        ) : isReady ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Harvest Ready
                          </span>
                        ) : isEmpty ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700">
                            Resting Bed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-700 text-white flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Growing
                          </span>
                        )}
                      </div>

                      {/* Active Crop Details */}
                      {planting ? (
                        <div className="space-y-1">
                          <div className="text-base font-extrabold text-stone-900">
                            {planting.cropName}{' '}
                            <span className="font-medium text-stone-600 text-sm">
                              — {planting.variety}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-stone-600 flex flex-wrap items-center gap-2">
                            <span>Ref: {planting.id}</span>
                            <span>•</span>
                            <span>Planted: {planting.plantingDate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <p className="text-sm font-bold text-stone-600">
                            Bed Prepped & Available for Planting
                          </p>
                          <p className="text-xs text-stone-500">
                            Broadforked & composted — ready for direct sow or trays
                          </p>
                        </div>
                      )}

                      {/* Active WHP Lockout Callout */}
                      {isLocked && (
                        <div className="mt-3 p-2.5 rounded-xl bg-red-950 text-white text-xs space-y-0.5">
                          <div className="font-bold text-red-300">
                            Locked by: {whpLog?.productName || 'Botanical Input'}
                          </div>
                          <div className="font-mono text-[11px] text-red-100">
                            Safe to Pick: <strong>{whpLog?.safeHarvestDate || '2026-10-18'}</strong>{' '}
                            ({whpLog?.whpDays || 3}d WHP)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer: Rotation & Quick Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
                        <History className="w-3.5 h-3.5 shrink-0" />
                        Prev: {row.lastRotation}
                      </span>

                      <div
                        className="flex items-center gap-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isEmpty && !isLocked && (
                          <button
                            onClick={() =>
                              onOpenQuickModal('harvest', { patchId: patch.id, rowId: row.id })
                            }
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Pick</span>
                          </button>
                        )}
                        {isEmpty && (
                          <button
                            onClick={() =>
                              onOpenQuickModal('planting', { patchId: patch.id, rowId: row.id })
                            }
                            className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Sprout className="w-3.5 h-3.5" />
                            <span>Plant Bed</span>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            onOpenQuickModal('input', { patchId: patch.id, rowId: row.id })
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold"
                          title="Apply Spray or Fertiliser"
                        >
                          +Input
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Row Detail Drawer / Modal */}
      {selectedRowDetail && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedRowDetail(null)}
        >
          <div
            className="bg-white w-full max-w-lg sm:rounded-3xl rounded-t-3xl p-5 space-y-4 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-900 text-white">
                  {selectedRowDetail.patch.code} • {selectedRowDetail.row.code}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900 mt-1">
                  {selectedRowDetail.patch.name} — Bed {selectedRowDetail.row.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 font-bold text-xs text-stone-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-500 block">Dimensions & Alignment</span>
                <span className="font-bold text-stone-900">
                  {selectedRowDetail.row.lengthM}m × {selectedRowDetail.row.widthM}m (
                  {selectedRowDetail.row.alignment})
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Prior Crop Rotation</span>
                <span className="font-bold text-stone-900">
                  {selectedRowDetail.row.lastRotation}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Current Planting ID</span>
                <span className="font-mono font-bold text-emerald-900">
                  {selectedRowDetail.planting?.id || 'Unplanted'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Seed / Nursery Source</span>
                <span className="font-mono font-bold text-stone-900">
                  {selectedRowDetail.planting?.nurseryBatchId ||
                    selectedRowDetail.planting?.seedLot ||
                    'N/A'}
                </span>
              </div>
            </div>

            {selectedRowDetail.isLocked && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 flex items-center justify-between gap-3">
                <div className="text-xs text-red-900">
                  <strong className="block">Active WHP Lockout on this Bed</strong>
                  <span>
                    Prototype testing helper: Simulate WHP expiry to test unlocking this bed for
                    harvest.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClearWhpLock(selectedRowDetail.patch.id, selectedRowDetail.row.id);
                    setSelectedRowDetail(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shrink-0"
                >
                  Simulate WHP Expiry
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => {
                  const ctx = {
                    patchId: selectedRowDetail.patch.id,
                    rowId: selectedRowDetail.row.id,
                  };
                  setSelectedRowDetail(null);
                  onOpenQuickModal('harvest', ctx);
                }}
                className="touch-target rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 p-2"
              >
                <Scissors className="w-4 h-4" />
                <span>Harvest Row</span>
              </button>
              <button
                onClick={() => {
                  const ctx = {
                    patchId: selectedRowDetail.patch.id,
                    rowId: selectedRowDetail.row.id,
                  };
                  setSelectedRowDetail(null);
                  onOpenQuickModal('input', ctx);
                }}
                className="touch-target rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 p-2"
              >
                <Droplets className="w-4 h-4" />
                <span>Log Input/Spray</span>
              </button>
              <button
                onClick={() => {
                  const ctx = {
                    patchId: selectedRowDetail.patch.id,
                    rowId: selectedRowDetail.row.id,
                  };
                  setSelectedRowDetail(null);
                  onOpenQuickModal('planting', ctx);
                }}
                className="touch-target rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 p-2"
              >
                <Sprout className="w-4 h-4" />
                <span>Plant / Re-Sow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
