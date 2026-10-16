import React, { useState } from 'react';
import {
  Sprout,
  Scissors,
  Droplets,
  Layers,
  MapPin,
  ClipboardList,
  GitBranch,
  Settings,
  Wifi,
  WifiOff,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Monitor,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import {
  OPERATORS,
  SUPPLIERS,
  CROPS,
  APPROVED_INPUTS,
  INITIAL_PATCHES,
  INITIAL_NURSERY_BATCHES,
  INITIAL_PLANTINGS,
  INITIAL_INPUT_LOGS,
  INITIAL_HARVESTS,
} from './data/mockFarmData';

import QuickLogModals from './components/QuickLogModals';
import FarmMapView from './components/FarmMapView';
import RegistersView from './components/RegistersView';
import TraceabilityView from './components/TraceabilityView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Active Navigation Tab: 'hub' | 'map' | 'registers' | 'trace' | 'settings'
  const [activeTab, setActiveTab] = useState('hub');
  const [registerSubTab, setRegisterSubTab] = useState('harvest');

  // Lightweight Persistent Operator Quick-Selector
  const [activeOperator, setActiveOperator] = useState(OPERATORS[0]);

  // Offline-first PWA status simulation
  const [isOffline, setIsOffline] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  // Desktop Phone Preview frame toggle (for testing mobile ergonomics on desktop web)
  const [mobilePreviewMode, setMobilePreviewMode] = useState(false);

  // Interactive Farm State (in-memory for UX prototyping)
  const [patches, setPatches] = useState(INITIAL_PATCHES);
  const [crops, setCrops] = useState(CROPS);
  const [approvedInputs, setApprovedInputs] = useState(APPROVED_INPUTS);
  const [nurseryBatches, setNurseryBatches] = useState(INITIAL_NURSERY_BATCHES);
  const [plantings, setPlantings] = useState(INITIAL_PLANTINGS);
  const [inputLogs, setInputLogs] = useState(INITIAL_INPUT_LOGS);
  const [harvests, setHarvests] = useState(INITIAL_HARVESTS);

  // Selected Harvest Batch for Traceback Engine
  const [selectedTraceBatchId, setSelectedTraceBatchId] = useState(INITIAL_HARVESTS[0].id);

  // Active Quick-Log Modal ('harvest' | 'input' | 'planting' | 'nursery' | null)
  const [activeModal, setActiveModal] = useState(null);
  const [modalContext, setModalContext] = useState(null);

  // Toast feedback banner
  const [toast, setToast] = useState(null);

  const showToast = (title, subtitle, tone = 'emerald') => {
    setToast({ title, subtitle, tone });
    if (isOffline) {
      setQueuedCount((c) => c + 1);
    }
    setTimeout(() => {
      setToast((current) => (current?.title === title ? null : current));
    }, 4200);
  };

  const openQuickModal = (type, context = null) => {
    setModalContext(context);
    setActiveModal(type);
  };

  // Handlers for logging actions
  const handleLogHarvest = (newHarvest) => {
    setHarvests((prev) => [newHarvest, ...prev]);
    setSelectedTraceBatchId(newHarvest.id);
    showToast(
      `Harvest Batch Created: ${newHarvest.id}`,
      `${newHarvest.quantity} ${newHarvest.unit} ${newHarvest.cropName} logged by ${newHarvest.operator}`,
      'emerald'
    );
  };

  const handleLogInput = (newInputLog) => {
    setInputLogs((prev) => [newInputLog, ...prev]);
    if (newInputLog.whpDays > 0) {
      setPatches((prev) =>
        prev.map((p) =>
          p.id !== newInputLog.patchId
            ? p
            : {
                ...p,
                rows: p.rows.map((r) =>
                  newInputLog.rowIds.includes(r.id) ? { ...r, status: 'WHP Locked' } : r
                ),
              }
        )
      );
      showToast(
        `Input Logged + ${newInputLog.whpDays}-Day WHP Lock Applied`,
        `${newInputLog.productName} on ${newInputLog.patchName} (${newInputLog.rowCodes.join(', ')})`,
        'amber'
      );
    } else {
      showToast(
        `Input Logged (0-Day WHP — Safe to Harvest)`,
        `${newInputLog.productName} applied by ${newInputLog.operator}`,
        'emerald'
      );
    }
  };

  const handleLogPlanting = (newPlanting) => {
    setPlantings((prev) => [newPlanting, ...prev]);
    setPatches((prev) =>
      prev.map((p) =>
        p.id !== newPlanting.patchId
          ? p
          : {
              ...p,
              rows: p.rows.map((r) =>
                newPlanting.rowIds.includes(r.id)
                  ? { ...r, status: 'Growing', plantingId: newPlanting.id }
                  : r
              ),
            }
      )
    );
    if (newPlanting.nurseryBatchId && newPlanting.traysUsed > 0) {
      setNurseryBatches((prev) =>
        prev.map((nb) =>
          nb.id === newPlanting.nurseryBatchId
            ? {
                ...nb,
                traysRemaining: Math.max(0, nb.traysRemaining - newPlanting.traysUsed),
                status:
                  nb.traysRemaining - newPlanting.traysUsed <= 0
                    ? 'Transplanted'
                    : 'Ready for Field',
              }
            : nb
        )
      );
    }
    showToast(
      `Field Planting Recorded: ${newPlanting.id}`,
      `${newPlanting.cropName} (${newPlanting.variety}) assigned to ${newPlanting.patchName} ${newPlanting.rowCodes.join(', ')}`,
      'teal'
    );
  };

  const handleLogNursery = (newBatch) => {
    setNurseryBatches((prev) => [newBatch, ...prev]);
    showToast(
      `Nursery Batch Generated: ${newBatch.id}`,
      `${newBatch.traysSown} trays (${newBatch.totalCells} cells) of ${newBatch.cropName} sown by ${newBatch.operator}`,
      'stone'
    );
  };

  const handleClearWhpLock = (patchId, rowId) => {
    setPatches((prev) =>
      prev.map((p) =>
        p.id !== patchId
          ? p
          : {
              ...p,
              rows: p.rows.map((r) =>
                r.id === rowId ? { ...r, status: 'Harvest Ready' } : r
              ),
            }
      )
    );
    setInputLogs((prev) =>
      prev.map((log) =>
        log.patchId === patchId && log.rowIds.includes(rowId)
          ? { ...log, whpActive: false }
          : log
      )
    );
    showToast(
      'Withholding Period Cleared',
      `Bed ${rowId} is now unlocked and cleared for SXC harvest.`,
      'emerald'
    );
  };

  const handleAddAllocation = (batchId, allocation) => {
    setHarvests((prev) =>
      prev.map((h) =>
        h.id === batchId
          ? { ...h, allocations: [...(h.allocations || []), allocation] }
          : h
      )
    );
    showToast(
      `Sales Dispatch Allocated (${allocation.quantity} ${allocation.unit})`,
      `Linked to ${allocation.channel} from Batch ${batchId}`,
      'emerald'
    );
  };

  const handleAddBedToPatch = (patchId) => {
    setPatches((prev) =>
      prev.map((p) => {
        if (p.id !== patchId) return p;
        const nextNum = p.rows.length + 1;
        const code = `R0${nextNum}`;
        return {
          ...p,
          rows: [
            ...p.rows,
            {
              id: `${p.id}-${code}`,
              code,
              number: nextNum,
              lengthM: 25,
              widthM: 1.2,
              alignment: p.orientation,
              status: 'Prepped / Resting',
              plantingId: null,
              lastRotation: 'New Bed Establishment',
            },
          ],
        };
      })
    );
    showToast('New Permanent Bed Added', `Added new bed to ${patchId}`, 'emerald');
  };

  const handleToggleInputStatus = (inputId, newStatus) => {
    setApprovedInputs((prev) =>
      prev.map((inp) =>
        inp.id === inputId ? { ...inp, verificationStatus: newStatus } : inp
      )
    );
    showToast('Input Compliance Status Updated', `Set verification status to ${newStatus}`, 'stone');
  };

  const handleAddCrop = (newCrop) => {
    setCrops((prev) => [newCrop, ...prev]);
    showToast(`Added Crop Variety: ${newCrop.name}`, `${newCrop.variety} (${newCrop.code})`, 'emerald');
  };

  const handleResetPrototypeData = () => {
    setPatches(INITIAL_PATCHES);
    setCrops(CROPS);
    setApprovedInputs(APPROVED_INPUTS);
    setNurseryBatches(INITIAL_NURSERY_BATCHES);
    setPlantings(INITIAL_PLANTINGS);
    setInputLogs(INITIAL_INPUT_LOGS);
    setHarvests(INITIAL_HARVESTS);
    setQueuedCount(0);
    showToast('Prototype State Reset', 'Restored initial Mt Cotton Organic demo records.', 'stone');
  };

  // Compute active WHP locked beds for dashboard banner
  const lockedBeds = [];
  patches.forEach((p) => {
    p.rows.forEach((r) => {
      const whpLog = inputLogs.find((l) => l.whpActive && l.rowIds.includes(r.id));
      if (r.status === 'WHP Locked' || whpLog) {
        const pl = plantings.find((item) => item.id === r.plantingId);
        lockedBeds.push({
          patchId: p.id,
          patchName: p.name,
          rowId: r.id,
          rowCode: r.code,
          cropName: pl?.cropName || 'Active Bed',
          productName: whpLog?.productName || 'Restricted Input',
          safeDate: whpLog?.safeHarvestDate || '2026-10-18',
        });
      }
    });
  });

  // Compute ready-to-harvest beds
  const readyBeds = [];
  patches.forEach((p) => {
    p.rows.forEach((r) => {
      if (r.status === 'Harvest Ready' && r.plantingId) {
        const pl = plantings.find((item) => item.id === r.plantingId);
        if (pl) {
          readyBeds.push({
            patchId: p.id,
            patchName: p.name,
            patchCode: p.code,
            rowId: r.id,
            rowCode: r.code,
            planting: pl,
          });
        }
      }
    });
  });

  const navItems = [
    { id: 'hub', label: 'Field Hub', icon: Zap },
    { id: 'map', label: 'Farm Map', icon: MapPin },
    { id: 'registers', label: 'Registers', icon: ClipboardList },
    { id: 'trace', label: 'SXC Trace', icon: GitBranch },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className={`min-h-screen bg-stone-100 text-stone-900 flex flex-col ${
        mobilePreviewMode ? 'items-center py-6 bg-stone-800' : ''
      }`}
    >
      {/* Wrapper that can optionally constrain to a 420px Mobile Handset Frame on desktop */}
      <div
        className={`w-full flex-1 flex flex-col bg-stone-100 ${
          mobilePreviewMode
            ? 'max-w-[420px] rounded-[40px] border-[10px] border-stone-950 shadow-2xl overflow-hidden max-h-[880px]'
            : ''
        }`}
      >
        {/* ============================================================
            PERSISTENT TOP HEADER & SINGLE-TAP OPERATOR QUICK-SELECTOR
           ============================================================ */}
        <header className="sticky top-0 z-30 bg-emerald-950 text-white shadow-md border-b border-emerald-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col gap-2">
            {/* Top Row: Farm Title + Offline PWA Toggle + Desktop Mobile Frame Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                  AG
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight">
                      Mt Cotton Organic
                    </span>
                    <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-800/90 text-emerald-200 border border-emerald-700">
                      SXC Cert #14082
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/90 truncate">
                    T & A Palmer • Local-First Compliance Log
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Offline / Online Sync Simulator Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isOffline) {
                      setIsOffline(false);
                      setQueuedCount(0);
                      showToast(
                        'Network Restored — Auto-Synced!',
                        'All queued local IndexedDB logs synchronized with central database.',
                        'emerald'
                      );
                    } else {
                      setIsOffline(true);
                      showToast(
                        'Offline Field Mode Active',
                        'Logs will cache locally in IndexedDB and sync automatically when back in shed Wi-Fi.',
                        'amber'
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    isOffline
                      ? 'bg-amber-500 text-stone-950 border-amber-300'
                      : 'bg-emerald-900/90 text-emerald-200 border-emerald-700 hover:bg-emerald-800'
                  }`}
                  title="Click to simulate Offline vs Online field sync"
                >
                  {isOffline ? (
                    <>
                      <WifiOff className="w-3.5 h-3.5" />
                      <span>Offline ({queuedCount} Queued)</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden xs:inline">Local-First</span>
                      <span>Synced</span>
                    </>
                  )}
                </button>

                {/* Desktop-only toggle to preview Mobile Handset Viewport */}
                <button
                  type="button"
                  onClick={() => setMobilePreviewMode((m) => !m)}
                  className="hidden lg:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold items-center gap-1.5 border border-white/15 transition"
                  title="Switch between Full Web View and Mobile Handset Frame"
                >
                  {mobilePreviewMode ? (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Exit Phone Frame</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Mobile Frame</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Row of Header: Persistent 1-Tap Operator Quick-Selector */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-900/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 shrink-0 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Active Operator:</span>
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 justify-end">
                {OPERATORS.map((op) => {
                  const isActive = activeOperator.id === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setActiveOperator(op);
                        showToast(
                          `Operator Switched: ${op.name}`,
                          `All field logs & signatures now tagged as ${op.name} (${op.role})`,
                          'stone'
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-white text-emerald-950 ring-2 ring-emerald-400 shadow-xs'
                          : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/70'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white ${op.color}`}
                      >
                        {op.initials}
                      </span>
                      <span>{op.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Live Toast Feedback Banner */}
        {toast && (
          <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-3">
            <div
              className={`p-4 rounded-2xl shadow-2xl border-2 flex items-start gap-3 ${
                toast.tone === 'amber'
                  ? 'bg-amber-950 text-white border-amber-400'
                  : toast.tone === 'teal'
                  ? 'bg-teal-950 text-white border-teal-400'
                  : toast.tone === 'stone'
                  ? 'bg-stone-900 text-white border-stone-600'
                  : 'bg-emerald-950 text-white border-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-extrabold text-sm">{toast.title}</div>
                <div className="text-stone-200">{toast.subtitle}</div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MAIN WORKSPACE (Desktop Horizontal Nav + Responsive Content)
           ============================================================ */}
        <div className="max-w-7xl w-full mx-auto flex-1 px-3 sm:px-6 pt-4 pb-24 md:pb-10 space-y-5">
          {/* Desktop / Tablet Top Navigation Bar (Hidden on small phones or inside Mobile Preview Frame) */}
          {!mobilePreviewMode && (
            <nav className="hidden md:flex items-center justify-between bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`touch-target px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
                        active
                          ? 'bg-emerald-900 text-white shadow-xs'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => openQuickModal('harvest')}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Scissors className="w-4 h-4" />
                  <span>+ Quick Harvest</span>
                </button>
                <button
                  onClick={() => openQuickModal('input')}
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Droplets className="w-4 h-4" />
                  <span>+ Log Spray/Input</span>
                </button>
              </div>
            </nav>
          )}

          {/* ============================================================
              TAB 1: FIELD HUB (HIGH-CONTRAST 1-2 TAP FIELD DASHBOARD)
             ============================================================ */}
          {activeTab === 'hub' && (
            <div className="space-y-6">
              {/* 4 GIANT FIELD QUICK-ACTION CARDS (Engineered for 1-Tap Mobile & Tablet Use) */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                    1-Tap Field Logging Actions (Tagged as {activeOperator.name})
                  </h2>
                  <span className="text-xs font-mono text-stone-500">48px+ Glove-Friendly UI</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Action 1: Harvest Pick */}
                  <button
                    onClick={() => openQuickModal('harvest')}
                    className="p-4 sm:p-5 rounded-3xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-left shadow-md transition flex flex-col justify-between min-h-[132px] group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-3 rounded-2xl bg-white/15">
                        <Scissors className="w-7 h-7 text-emerald-200" />
                      </div>
                      <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-200 font-bold">
                        WHP Checked
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-lg font-extrabold tracking-tight leading-tight">
                        Harvest Pick
                      </div>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        Log yield & generate shed batch ID
                      </p>
                    </div>
                  </button>

                  {/* Action 2: Spray / Soil Input */}
                  <button
                    onClick={() => openQuickModal('input')}
                    className="p-4 sm:p-5 rounded-3xl bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white text-left shadow-md transition flex flex-col justify-between min-h-[132px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-3 rounded-2xl bg-white/15">
                        <Droplets className="w-7 h-7 text-amber-200" />
                      </div>
                      <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-200 font-bold">
                        FSQ4.2 / SXC
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-lg font-extrabold tracking-tight leading-tight">
                        Spray / Soil Input
                      </div>
                      <p className="text-xs text-amber-200 mt-0.5">
                        Auto-fills batch, cert & weather
                      </p>
                    </div>
                  </button>

                  {/* Action 3: Plant / Transplant Bed */}
                  <button
                    onClick={() => openQuickModal('planting')}
                    className="p-4 sm:p-5 rounded-3xl bg-teal-800 hover:bg-teal-900 active:scale-[0.99] text-white text-left shadow-md transition flex flex-col justify-between min-h-[132px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-3 rounded-2xl bg-white/15">
                        <Sprout className="w-7 h-7 text-teal-200" />
                      </div>
                      <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-teal-950/60 text-teal-200 font-bold">
                        Bed Trace
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-lg font-extrabold tracking-tight leading-tight">
                        Plant Bed / Row
                      </div>
                      <p className="text-xs text-teal-200 mt-0.5">
                        Transplant trays or direct sow
                      </p>
                    </div>
                  </button>

                  {/* Action 4: Sow Nursery Trays */}
                  <button
                    onClick={() => openQuickModal('nursery')}
                    className="p-4 sm:p-5 rounded-3xl bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white text-left shadow-md transition flex flex-col justify-between min-h-[132px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-3 rounded-2xl bg-white/15">
                        <Layers className="w-7 h-7 text-stone-200" />
                      </div>
                      <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/10 text-stone-200 font-bold">
                        Propagation
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-lg font-extrabold tracking-tight leading-tight">
                        Sow Nursery Trays
                      </div>
                      <p className="text-xs text-stone-300 mt-0.5">
                        Log organic seed lot & cell count
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ACTIVE WITHHOLDING PERIOD (WHP) LOCKOUT SAFETY BANNER */}
              {lockedBeds.length > 0 && (
                <div className="bg-red-950 text-white p-4 sm:p-5 rounded-3xl border-2 border-red-500 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-red-200">
                          Active Withholding Period (WHP) Harvest Lockouts ({lockedBeds.length} Beds)
                        </h3>
                        <p className="text-xs text-red-100">
                          System automatically blocks harvest batch creation on these rows until WHP expires.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {lockedBeds.map((lb) => (
                      <div
                        key={lb.rowId}
                        className="p-3.5 rounded-2xl bg-red-900/70 border border-red-700/80 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                              {lb.patchName.split('—')[0].trim()} • {lb.rowCode}
                            </span>
                            <span className="font-bold text-sm text-white">{lb.cropName}</span>
                          </div>
                          <div className="text-xs text-red-200 mt-1">
                            Input: <strong>{lb.productName}</strong> • Safe Date:{' '}
                            <strong className="text-amber-300 font-mono">{lb.safeDate}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            openQuickModal('harvest', { patchId: lb.patchId, rowId: lb.rowId })
                          }
                          className="touch-target px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs shrink-0"
                        >
                          Test Lockout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two-Column Lower Hub: 1-Tap Harvest-Ready Beds + Recent Traceable Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 Cols: Ready to Pick Today (1-Tap Harvest) */}
                <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                        <span>Beds Ready to Harvest Today ({readyBeds.length})</span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        Zero active WHP — tap any bed to log a field pick in 2 taps.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>Full Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {readyBeds.map((item) => (
                      <div
                        key={item.rowId}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-400 transition flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-900 text-white">
                              {item.patchCode} • {item.rowCode}
                            </span>
                            <span className="font-extrabold text-sm text-stone-900 truncate">
                              {item.planting.cropName} — {item.planting.variety}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1 font-mono truncate">
                            Ref: {item.planting.id} • Lot: {item.planting.seedLot}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            openQuickModal('harvest', {
                              patchId: item.patchId,
                              rowId: item.rowId,
                            })
                          }
                          className="touch-target px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Pick Now</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 6 Cols: Recent Harvest Batches & One-Tap Audit Traceback */}
                <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-emerald-700" />
                        <span>Recent Shed Harvest Batches</span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        Tap any batch to view full seed-to-sale SXC traceability.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRegisterSubTab('harvest');
                        setActiveTab('registers');
                      }}
                      className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>All Registers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {harvests.slice(0, 4).map((h) => (
                      <div
                        key={h.id}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-900 text-emerald-300">
                              {h.id}
                            </span>
                            <span className="text-xs font-bold text-stone-500">{h.date}</span>
                          </div>
                          <div className="font-extrabold text-sm text-stone-900 mt-1 truncate">
                            {h.quantity} {h.unit} • {h.cropName} ({h.variety})
                          </div>
                          <div className="text-xs text-stone-500">
                            {h.patchName} ({h.rowCode}) • Logged by <strong>{h.operator}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedTraceBatchId(h.id);
                            setActiveTab('trace');
                          }}
                          className="touch-target px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Trace</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 2: INTERACTIVE PATCH & ROW FARM MAP
             ============================================================ */}
          {activeTab === 'map' && (
            <FarmMapView
              patches={patches}
              plantings={plantings}
              inputLogs={inputLogs}
              harvests={harvests}
              onOpenQuickModal={openQuickModal}
              onClearWhpLock={handleClearWhpLock}
            />
          )}

          {/* ============================================================
              TAB 3: OPERATIONAL REGISTERS (NURSERY, PLANTING, INPUT, HARVEST)
             ============================================================ */}
          {activeTab === 'registers' && (
            <RegistersView
              initialSubTab={registerSubTab}
              nurseryBatches={nurseryBatches}
              plantings={plantings}
              inputLogs={inputLogs}
              harvests={harvests}
              onOpenQuickModal={openQuickModal}
              onInspectBatchTraceback={(batchId) => {
                setSelectedTraceBatchId(batchId);
                setActiveTab('trace');
              }}
            />
          )}

          {/* ============================================================
              TAB 4: SXC TRACEBACK QUERY ENGINE & MASS BALANCE LEDGER
             ============================================================ */}
          {activeTab === 'trace' && (
            <TraceabilityView
              selectedBatchId={selectedTraceBatchId}
              onSelectBatchId={setSelectedTraceBatchId}
              harvests={harvests}
              plantings={plantings}
              nurseryBatches={nurseryBatches}
              inputLogs={inputLogs}
              onAddAllocation={handleAddAllocation}
            />
          )}

          {/* ============================================================
              TAB 5: ADMINISTRATIVE SETTINGS & MASTER CATALOGUES
             ============================================================ */}
          {activeTab === 'settings' && (
            <SettingsView
              patches={patches}
              crops={crops}
              approvedInputs={approvedInputs}
              suppliers={SUPPLIERS}
              onAddBedToPatch={handleAddBedToPatch}
              onToggleInputStatus={handleToggleInputStatus}
              onAddCrop={handleAddCrop}
              onResetPrototypeData={handleResetPrototypeData}
            />
          )}
        </div>

        {/* ============================================================
            MOBILE BOTTOM NAVIGATION BAR (Always shown on Mobile & Phone Preview)
           ============================================================ */}
        <nav
          className={`${
            mobilePreviewMode ? 'flex' : 'flex md:hidden'
          } sticky bottom-0 z-30 bg-white border-t border-stone-200 px-2 py-1.5 justify-around items-center shadow-lg`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`touch-target flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                  active
                    ? 'text-emerald-900 font-extrabold bg-emerald-50'
                    : 'text-stone-500 font-semibold'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick-Log Field Modals */}
        <QuickLogModals
          activeModal={activeModal}
          preselectedContext={modalContext}
          onClose={() => setActiveModal(null)}
          activeOperator={activeOperator}
          patches={patches}
          crops={crops}
          approvedInputs={approvedInputs}
          nurseryBatches={nurseryBatches}
          plantings={plantings}
          inputLogs={inputLogs}
          onLogHarvest={handleLogHarvest}
          onLogInput={handleLogInput}
          onLogPlanting={handleLogPlanting}
          onLogNursery={handleLogNursery}
        />
      </div>
    </div>
  );
}
