// ============================================================================
// SINGLE SOURCE OF TRUTH FOR ALL FARM ENTITIES (Operators, Crops, Patches, Inputs)
// ============================================================================
export const FARM_DATA = {
  operators: ['Toby', 'Ashley', 'Hannah', 'Staff'],

  crops: {
    KAL: { id: 'KAL', name: 'Kale', variety: 'Lacinato', unit: 'bunches' },
    LET: { id: 'LET', name: 'Lettuce', variety: 'Salanova Mix', unit: 'kg' },
    BRO: { id: 'BRO', name: 'Broccoli', variety: 'Marathon', unit: 'kg' },
    BEA: { id: 'BEA', name: 'Bush Bean', variety: 'Provider', unit: 'kg' },
    ZUC: { id: 'ZUC', name: 'Zucchini', variety: 'Blackjack', unit: 'kg' },
    TOM: { id: 'TOM', name: 'Tomato', variety: 'Brandywine', unit: 'kg' },
    BET: { id: 'BET', name: 'Beetroot', variety: 'Detroit Red', unit: 'bunches' },
    RAD: { id: 'RAD', name: 'Radish', variety: 'French Breakfast', unit: 'bunches' },
  },

  patches: [
    {
      id: 'TP',
      name: 'The Patch',
      gridRows: 12,
      gridCols: 2,
      defaultRowLengthM: 25,
      // Seeded initial plantings by bed number -> references cropId from FARM_DATA.crops
      initialPlantings: {
        1: { cropId: 'LET', sourceTrayCode: 'TR-0814-LET', plantedDate: '2026-09-02', lastInputId: 'dipel' },
        2: { cropId: 'LET', sourceTrayCode: 'TR-0814-LET', plantedDate: '2026-09-02', lastInputId: 'dipel' },
        3: { cropId: 'KAL', sourceTrayCode: 'TR-0802-KAL', plantedDate: '2026-08-25', lastInputId: 'kelp' },
        4: { cropId: 'KAL', sourceTrayCode: 'TR-0802-KAL', plantedDate: '2026-08-25', lastInputId: 'kelp' },
        5: { cropId: 'BRO', sourceTrayCode: 'TR-0820-BRO', plantedDate: '2026-09-10', lastInputId: 'pyrethrum' },
        6: { cropId: 'BRO', sourceTrayCode: 'TR-0820-BRO', plantedDate: '2026-09-10', lastInputId: 'pyrethrum' },
        8: { cropId: 'BEA', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-28', lastInputId: null },
        9: { cropId: 'BEA', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-28', lastInputId: null },
        12: { cropId: 'RAD', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-10-01', lastInputId: null },
        15: { cropId: 'BET', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-19', lastInputId: 'compost' },
        16: { cropId: 'BET', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-19', lastInputId: 'compost' },
        21: { cropId: 'ZUC', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-12', lastInputId: 'kelp' },
        22: { cropId: 'TOM', sourceTrayCode: 'TR-0720-TOM', plantedDate: '2026-08-18', lastInputId: 'ecooil' },
      },
    },
    {
      id: 'LP',
      name: 'Lower Patch',
      gridRows: 8,
      gridCols: 1,
      defaultRowLengthM: 30,
      initialPlantings: {
        1: { cropId: 'ZUC', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-05', lastInputId: null },
        2: { cropId: 'ZUC', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-05', lastInputId: null },
        4: { cropId: 'BET', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-10-02', lastInputId: null },
        5: { cropId: 'KAL', sourceTrayCode: 'TR-1008-KAL', plantedDate: '2026-10-10', lastInputId: 'kelp' },
        7: { cropId: 'BEA', sourceTrayCode: 'DIRECT-SEED', plantedDate: '2026-09-25', lastInputId: null },
      },
    },
    {
      id: 'PA',
      name: 'Patch past the avos',
      gridRows: 8,
      gridCols: 1,
      defaultRowLengthM: 25,
      initialPlantings: {
        1: { cropId: 'TOM', sourceTrayCode: 'TR-0720-TOM', plantedDate: '2026-08-12', lastInputId: 'kelp' },
        2: { cropId: 'TOM', sourceTrayCode: 'TR-0720-TOM', plantedDate: '2026-08-15', lastInputId: 'ecooil' },
        6: { cropId: 'BRO', sourceTrayCode: 'TR-0820-BRO', plantedDate: '2026-09-14', lastInputId: 'dipel' },
      },
    },
  ],

  maintenanceInputs: {
    dipel: { id: 'dipel', name: 'DiPel Bt Spray', type: 'Pest Spray', rate: '50g / 100L' },
    ecooil: { id: 'ecooil', name: 'Eco-Oil Spray', type: 'Miticide / Aphid', rate: '500mL / 100L' },
    pyrethrum: { id: 'pyrethrum', name: 'Pyrethrum Spray', type: 'Knockdown Spray', rate: '300mL / 100L' },
    kelp: { id: 'kelp', name: 'Kelp & Fish Fertigation', type: 'Liquid Feed', rate: '4L / Field' },
    compost: { id: 'compost', name: 'Organic Compost', type: 'Soil Input', rate: '120kg / Row' },
    weed: { id: 'weed', name: 'Wheel Hoe / Weeding', type: 'Cultivation', rate: 'Mechanical' },
  },

  initialTrays: [
    {
      code: 'TR-1002-LET',
      cropId: 'LET',
      trays: 6,
      cellsPerTray: 128,
      sownDate: '2026-10-02',
      operator: 'Ashley',
    },
    {
      code: 'TR-1008-KAL',
      cropId: 'KAL',
      trays: 4,
      cellsPerTray: 128,
      sownDate: '2026-10-08',
      operator: 'Toby',
    },
    {
      code: 'TR-1012-BRO',
      cropId: 'BRO',
      trays: 5,
      cellsPerTray: 72,
      sownDate: '2026-10-12',
      operator: 'Hannah',
    },
  ],
};

// ============================================================================
// HELPER BUILDERS (Derive state from FARM_DATA so nothing is duplicated)
// ============================================================================
export const formatRowCode = (num) => (num < 10 ? `R0${num}` : `R${num}`);

export function buildRowsForDimensions(patchId, gridRows, gridCols, existingRows = [], seedMap = {}, defaultLengthM = 25) {
  const totalCount = Math.max(1, Number(gridRows) * Number(gridCols));
  return Array.from({ length: totalCount }, (_, i) => {
    const rowNum = i + 1;
    const code = formatRowCode(rowNum);
    const rowId = `${patchId}-${code}`;

    // Preserve existing row state if resizing live in the app
    const existing = existingRows.find((r) => r.number === rowNum || r.id === rowId);
    if (existing) {
      return existing;
    }

    const seed = seedMap?.[rowNum];
    let planting = null;
    if (seed && FARM_DATA.crops[seed.cropId]) {
      const dateCompact = seed.plantedDate.slice(5).replace('-', '');
      planting = {
        trackingCode: `PL-${dateCompact}-${patchId}-${code}-${seed.cropId}`,
        sourceTrayCode: seed.sourceTrayCode,
        cropId: seed.cropId,
        plantedDate: seed.plantedDate,
      };
    }

    return {
      id: rowId,
      number: rowNum,
      code,
      lengthM: defaultLengthM,
      planting,
      lastInputId: seed?.lastInputId || null,
    };
  });
}

export function buildInitialPatches(farmData = FARM_DATA) {
  return farmData.patches.map((patchDef) => {
    const rows = buildRowsForDimensions(
      patchDef.id,
      patchDef.gridRows,
      patchDef.gridCols,
      [],
      patchDef.initialPlantings,
      patchDef.defaultRowLengthM
    );

    return {
      id: patchDef.id,
      name: patchDef.name,
      gridRows: patchDef.gridRows,
      gridCols: patchDef.gridCols,
      defaultRowLengthM: patchDef.defaultRowLengthM,
      rows,
    };
  });
}

export function buildInitialLogs() {
  return [
    {
      id: 'HV-1019-TP-R03-KAL',
      type: 'HARVEST',
      date: '2026-10-19 06:20',
      patchId: 'TP',
      rowCode: 'R03',
      cropId: 'KAL',
      detail: '48 bunches harvested',
      linkedCode: 'PL-0825-TP-R03-KAL ← TR-0802-KAL',
      operator: 'Toby',
    },
    {
      id: 'MT-1019-PA-R02',
      type: 'MAINTAIN',
      date: '2026-10-19 07:10',
      patchId: 'PA',
      rowCode: 'R02',
      cropId: 'TOM',
      detail: 'Eco-Oil Spray (500mL / 100L)',
      linkedCode: 'PL-0815-PA-R02-TOM',
      operator: 'Hannah',
    },
    {
      id: 'TR-1008-KAL',
      type: 'PLANT-TRAY',
      date: '2026-10-08 09:15',
      patchId: null,
      rowCode: 'Nursery',
      cropId: 'KAL',
      detail: '4 Trays (128-cell) sown',
      linkedCode: 'Tracking Code: TR-1008-KAL',
      operator: 'Toby',
    },
  ];
}
