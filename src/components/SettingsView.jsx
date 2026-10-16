import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Sprout,
  Droplets,
  MapPin,
  Truck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';

export default function SettingsView({
  patches,
  crops,
  approvedInputs,
  suppliers,
  onAddBedToPatch,
  onToggleInputStatus,
  onAddCrop,
  onResetPrototypeData,
}) {
  const [activeSection, setActiveSection] = useState('inputs');
  const [newCropName, setNewCropName] = useState('');
  const [newCropVariety, setNewCropVariety] = useState('');
  const [newCropCode, setNewCropCode] = useState('');

  const sections = [
    { id: 'inputs', label: 'Approved Inputs Registry', icon: Droplets, count: approvedInputs.length },
    { id: 'crops', label: 'Crop Varieties Catalogue', icon: Sprout, count: crops.length },
    { id: 'patches', label: 'Patch & Row Builder', icon: MapPin, count: patches.length },
    { id: 'suppliers', label: 'Suppliers Registry', icon: Truck, count: suppliers.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>Administrative & Farm Configuration</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Configure SXC approved inputs, crop catalogues, suppliers, and permanent bed layouts.
          </p>
        </div>

        <button
          onClick={onResetPrototypeData}
          className="touch-target px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-300 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Prototype Demo State</span>
        </button>
      </div>

      {/* Sub-navigation pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {sections.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`touch-target p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                active
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs sm:text-sm truncate">{s.label}</span>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {s.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. APPROVED INPUTS INVENTORY */}
      {activeSection === 'inputs' && (
        <div className="space-y-3">
          {approvedInputs.map((inp) => (
            <div
              key={inp.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {inp.category}
                  </span>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {inp.certNumber}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      inp.whpDays > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    WHP: {inp.whpDays} Days
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-stone-900">
                  {inp.name}{' '}
                  <span className="text-sm font-normal text-stone-500">
                    ({inp.manufacturer})
                  </span>
                </h3>

                <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    Active: <strong>{inp.activeIngredient}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono">
                    Batch: <strong>{inp.batchNumber}</strong> (DOM: {inp.dom})
                  </span>
                  <span>•</span>
                  <span>Supplier: {inp.supplier}</span>
                </div>
              </div>

              {/* Interactive Verification Status Toggle (Pass / Hold / Pending Review) */}
              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                <span className="text-xs font-bold text-stone-500 mr-1">SXC Status:</span>
                {['Pass', 'Pending Review', 'Hold'].map((st) => (
                  <button
                    key={st}
                    onClick={() => onToggleInputStatus(inp.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      inp.verificationStatus === st
                        ? st === 'Pass'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : st === 'Pending Review'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-red-700 text-white border-red-700'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. CROP VARIETIES CATALOGUE */}
      {activeSection === 'crops' && (
        <div className="space-y-4">
          {/* Quick Add Variety Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-stone-600 mb-1">Crop Species</label>
              <input
                type="text"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                placeholder="e.g. Silverbeet"
                className="touch-target w-full px-3 rounded-xl border border-stone-300 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Cultivar / Variety
              </label>
              <input
                type="text"
                value={newCropVariety}
                onChange={(e) => setNewCropVariety(e.target.value)}
                placeholder="e.g. Fordhook Giant"
                className="touch-target w-full px-3 rounded-xl border border-stone-300 text-sm"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-bold text-stone-600 mb-1">3-Letter Code</label>
              <input
                type="text"
                maxLength={3}
                value={newCropCode}
                onChange={(e) => setNewCropCode(e.target.value.toUpperCase())}
                placeholder="SLV"
                className="touch-target w-full px-3 rounded-xl border border-stone-300 font-mono uppercase text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newCropName.trim()) return;
                onAddCrop({
                  id: `crop-${Date.now()}`,
                  code: (newCropCode || newCropName.slice(0, 3)).toUpperCase(),
                  name: newCropName.trim(),
                  variety: newCropVariety.trim() || 'Standard Organic',
                  defaultUnit: 'bunches',
                  multiPick: true,
                  dtm: 50,
                  category: 'Market Garden',
                  supplierId: 'sup-1',
                  defaultSeedLot: `GH-2026-${Math.floor(10 + Math.random() * 89)}`,
                  seedCert: 'ACO-10492 Verified Organic',
                });
                setNewCropName('');
                setNewCropVariety('');
                setNewCropCode('');
              }}
              className="touch-target px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cultivar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crops.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-stone-900 text-white">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">{c.category}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-stone-900">{c.name}</h4>
                  <p className="text-xs font-medium text-stone-600">{c.variety}</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
                  <span>Lot: {c.defaultSeedLot}</span>
                  <span>Unit: {c.defaultUnit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PATCH & PERMANENT BED BUILDER */}
      {activeSection === 'patches' && (
        <div className="space-y-4">
          {patches.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-stone-900 text-white">
                      {p.code}
                    </span>
                    <h3 className="text-lg font-extrabold text-stone-900">{p.name}</h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {p.zone} • Alignment: {p.orientation} • {p.rows.length} Permanent Beds
                  </p>
                </div>

                <button
                  onClick={() => onAddBedToPatch(p.id)}
                  className="touch-target px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Row R0{p.rows.length + 1}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {p.rows.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-stone-900">
                      <span>{r.code}</span>
                      <span className="text-[11px] text-stone-500">{r.alignment}</span>
                    </div>
                    <div className="font-mono text-stone-600">
                      {r.lengthM}m × {r.widthM}m
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold truncate">
                      {r.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. SUPPLIERS REGISTRY */}
      {activeSection === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-xs font-bold uppercase text-emerald-800">{sup.type}</span>
                <h4 className="text-base font-extrabold text-stone-900 mt-0.5">{sup.name}</h4>
                <p className="text-xs font-mono text-stone-600 mt-1">
                  Organic Cert: <strong>{sup.certNumber}</strong> • {sup.contact}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 shrink-0">
                {sup.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
