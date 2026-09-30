import { BuildingQuery, buildings } from '@/modules/buildings';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('buildings', () => buildings());

describe('BuildingQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = buildings().get().slice(0, 1);
    expect(new BuildingQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new BuildingQuery().count()).toBeGreaterThan(0);
  });

  it('filters by category', () => {
    expect(buildings().byCategory('Military').count()).toBe(11);
    expect(buildings().byCategory('Inner City').count()).toBe(7);
    expect(buildings().byCategory('Entertainment').count()).toBe(9);
  });

  it('assigns every building the expected category', () => {
    const categoryByName: Record<string, string> = {
      Furnace: 'Military',
      Embassy: 'Military',
      'Research Center': 'Military',
      'Command Center': 'Military',
      'Infantry Camp': 'Military',
      'Marksman Camp': 'Military',
      'Lancer Camp': 'Military',
      'War Academy': 'Military',
      Infirmary: 'Military',
      Storehouse: 'Military',
      Barricade: 'Military',
      "Hunter's Hut": 'Inner City',
      Sawmill: 'Inner City',
      'Coal Mine': 'Inner City',
      'Iron Mine': 'Inner City',
      Clinic: 'Inner City',
      Cookhouse: 'Inner City',
      Shelter: 'Inner City',
      'The Bakery': 'Entertainment',
      'The Vinyl Shop': 'Entertainment',
      'Tea Milk Shop': 'Entertainment',
      Cinema: 'Entertainment',
      Cafe: 'Entertainment',
      Gym: 'Entertainment',
      Farm: 'Entertainment',
      'Yoga Studio': 'Entertainment',
      'Climbing Gym': 'Entertainment',
    };
    Object.entries(categoryByName).forEach(([name, category]) => {
      expect(buildings().findByName(name)!.category).toBe(category);
    });
  });
});

describe('Development Index', () => {
  it('is a positive, non-decreasing value across every level of every building', () => {
    buildings()
      .get()
      .forEach((building) => {
        building.levels.forEach((level) => {
          expect(level.developmentIndex).toBeGreaterThan(0);
        });
        const values = building.levels.map((l) => l.developmentIndex);
        expect(values).toEqual([...values].sort((a, b) => a - b));
      });
  });

  it('matches the SvS Wish Station values supplied for Furnace', () => {
    const furnace = buildings().findByName('Furnace')!;
    const developmentIndexByLabel: Record<string, number> = {
      '1': 1000,
      'FC 1': 836800,
      'FC 5': 1361800,
      'FC 10': 2118400,
    };
    Object.entries(developmentIndexByLabel).forEach(([label, developmentIndex]) => {
      expect(furnace.levels.find((l) => l.label === label)!.developmentIndex).toBe(
        developmentIndex,
      );
    });
  });
});

describe('Furnace levels', () => {
  const furnace = buildings().findByName('Furnace')!;

  it('tracks all 80 levels', () => {
    expect(furnace.levels).toHaveLength(80);
  });

  it('starts at Level 1 with no prerequisites', () => {
    const level1 = furnace.levels.find((l) => l.label === '1')!;
    expect(level1.tier).toBe('standard');
    expect(level1.prerequisites).toBeUndefined();
  });

  it('caps out at FC 10, requiring FC 9-4', () => {
    const fc10 = furnace.levels.find((l) => l.label === 'FC 10')!;
    expect(fc10.tier).toBe('fireCrystal');
    expect(fc10.fcStage).toBe(10);
    expect(fc10.fcSubLevel).toBeUndefined();
    expect(fc10.prerequisites).toEqual([{ building: 'Furnace', level: 'FC 9-4' }]);
  });

  it("has a tier base row require the previous tier's last sub-level", () => {
    const fc2 = furnace.levels.find((l) => l.label === 'FC 2')!;
    expect(fc2.prerequisites).toEqual([{ building: 'Furnace', level: 'FC 1-4' }]);
  });

  it("has a tier's first sub-level require the previous tier's base row", () => {
    const fc21 = furnace.levels.find((l) => l.label === 'FC 2-1')!;
    expect(fc21.prerequisites).toEqual([{ building: 'Furnace', level: 'FC 1' }]);
  });

  it('has FC 1-1 require standard Level 30, since tier 0 has no base row', () => {
    const fc11 = furnace.levels.find((l) => l.label === 'FC 1-1')!;
    expect(fc11.prerequisites).toEqual([{ building: 'Furnace', level: 30 }]);
  });

  it('chains the pre-FC stage (30-1..30-4) off standard Level 30', () => {
    const thirtyOne = furnace.levels.find((l) => l.label === '30-1')!;
    const thirtyTwo = furnace.levels.find((l) => l.label === '30-2')!;
    expect(thirtyOne.prerequisites).toEqual([{ building: 'Furnace', level: 30 }]);
    expect(thirtyTwo.prerequisites).toEqual([{ building: 'Furnace', level: '30-1' }]);
  });

  it('introduces Refined Fire Crystals starting at FC 5-1', () => {
    const fc5 = furnace.levels.find((l) => l.label === 'FC 5')!;
    const fc51 = furnace.levels.find((l) => l.label === 'FC 5-1')!;
    expect(fc5.cost.some((c) => c.name === 'Refined Fire Crystals')).toBe(false);
    expect(fc51.cost.some((c) => c.name === 'Refined Fire Crystals')).toBe(true);
  });

  it("uses the wiki's exact Fire Crystal Power values, not wostools's rounded ones", () => {
    // Regression guard: these were previously rounded to the nearest 100,000
    // (e.g. "30-1" was 1,600,000 instead of the wiki's exact 1,580,900).
    const exactPowerByLabel: Record<string, number> = {
      '30-1': 1580900,
      '30-2': 1638300,
      '30-3': 1695700,
      '30-4': 1753100,
      'FC 1': 1810500,
      'FC 5': 3016500,
      'FC 5-1': 3084100,
      'FC 10': 4754500,
    };
    Object.entries(exactPowerByLabel).forEach(([label, power]) => {
      expect(furnace.levels.find((l) => l.label === label)!.power).toBe(power);
    });
  });

  it('has levels in ascending order', () => {
    const orders = furnace.levels.map((l) => l.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe('Embassy levels', () => {
  const embassy = buildings().findByName('Embassy')!;

  it('tracks all 80 levels', () => {
    expect(embassy.levels).toHaveLength(80);
  });

  it('requires Furnace as a prerequisite at every standard level', () => {
    const standardLevels = embassy.levels.filter((l) => l.tier === 'standard');
    expect(standardLevels.every((l) => l.prerequisites?.[0].building === 'Furnace')).toBe(true);
  });

  it('caps out at FC 10, requiring FC 9-4', () => {
    const fc10 = embassy.levels.find((l) => l.label === 'FC 10')!;
    expect(fc10.tier).toBe('fireCrystal');
    expect(fc10.fcStage).toBe(10);
    expect(fc10.prerequisites).toEqual([{ building: 'Embassy', level: 'FC 9-4' }]);
  });

  it('tracks Ally Assists, Ally Help Time, and Reinforce Capacity at every level', () => {
    const level1 = embassy.levels.find((l) => l.label === '1')!;
    expect(level1.allyAssists).toBe(1);
    expect(level1.allyHelpTimeSeconds).toBe(10);
    expect(level1.reinforceCapacity).toBe(1500);
  });
});

describe('Research Center levels', () => {
  const researchCenter = buildings().findByName('Research Center')!;

  it('caps at Level 30 with no Fire Crystal tier', () => {
    expect(researchCenter.levels).toHaveLength(30);
    expect(researchCenter.maxLevelLabel).toBe('30');
    expect(researchCenter.levels.every((l) => l.tier === 'standard')).toBe(true);
    expect(researchCenter.fireCrystalImg).toBeUndefined();
  });

  it('requires Furnace as a prerequisite at every level', () => {
    expect(researchCenter.levels.every((l) => l.prerequisites?.[0].building === 'Furnace')).toBe(
      true,
    );
  });

  it('carries a research speed bonus at every level', () => {
    const level1 = researchCenter.levels.find((l) => l.label === '1')!;
    expect(level1.researchSpeedBonusPercent).toBe(0.1);
  });
});

describe('Command Center levels', () => {
  const commandCenter = buildings().findByName('Command Center')!;

  it('tracks all 80 levels and rally/march capacity at standard levels', () => {
    expect(commandCenter.levels).toHaveLength(80);
    const level1 = commandCenter.levels.find((l) => l.label === '1')!;
    expect(level1.rallyCapacity).toBe(1500);
    expect(level1.marchCapacity).toBe(400);
  });

  it('requires both Furnace and Embassy at standard levels', () => {
    const level1 = commandCenter.levels.find((l) => l.label === '1')!;
    expect(level1.prerequisites).toEqual([
      { building: 'Furnace', level: 10 },
      { building: 'Embassy', level: 1 },
    ]);
  });

  it('gates Fire Crystal levels behind matching Furnace and Embassy FC tiers, on top of its own chain', () => {
    const fc21 = commandCenter.levels.find((l) => l.label === 'FC 2-1')!;
    expect(fc21.prerequisites).toEqual([
      { building: 'Command Center', level: 'FC 1' },
      { building: 'Furnace', level: 'FC 3' },
      { building: 'Embassy', level: 'FC 3' },
    ]);
  });
});

describe.each([
  ['Infantry Camp', 7],
  ['Marksman Camp', 8],
  ['Lancer Camp', 9],
])('%s levels', (name, furnaceFloor) => {
  const camp = buildings().findByName(name)!;

  it('tracks all 80 levels with training capacity and speed bonus at standard levels', () => {
    expect(camp.levels).toHaveLength(80);
    const level1 = camp.levels.find((l) => l.label === '1')!;
    expect(level1.trainingCapacity).toBe(17);
    expect(level1.trainingSpeedBonusPercent).toBe(0.3);
  });

  it(`requires Furnace Lv.${furnaceFloor} at Level 1, then tracks the matching Furnace level from Level ${furnaceFloor} on`, () => {
    const level1 = camp.levels.find((l) => l.label === '1')!;
    const atFloor = camp.levels.find((l) => l.label === String(furnaceFloor))!;
    const oneAboveFloor = camp.levels.find((l) => l.label === String(furnaceFloor + 1))!;
    expect(level1.prerequisites).toEqual([{ building: 'Furnace', level: furnaceFloor }]);
    expect(atFloor.prerequisites).toEqual([{ building: 'Furnace', level: furnaceFloor }]);
    expect(oneAboveFloor.prerequisites).toEqual([{ building: 'Furnace', level: furnaceFloor + 1 }]);
  });

  it('carries a training speed bonus only on standard levels and FC tier base rows', () => {
    const fc1 = camp.levels.find((l) => l.label === 'FC 1')!;
    const fc11 = camp.levels.find((l) => l.label === 'FC 1-1')!;
    const thirtyOne = camp.levels.find((l) => l.label === '30-1')!;
    expect(fc1.trainingSpeedBonusPercent).toBe(8.3);
    expect(fc11.trainingSpeedBonusPercent).toBeUndefined();
    expect(thirtyOne.trainingSpeedBonusPercent).toBeUndefined();
  });

  it('gates Fire Crystal levels behind a matching Furnace FC tier, on top of its own chain', () => {
    const fc21 = camp.levels.find((l) => l.label === 'FC 2-1')!;
    expect(fc21.prerequisites).toEqual([
      { building: name, level: 'FC 1' },
      { building: 'Furnace', level: 'FC 3' },
    ]);
  });
});

describe('War Academy levels', () => {
  const warAcademy = buildings().findByName('War Academy')!;

  it('has no standard tier: all 46 levels are fireCrystal', () => {
    expect(warAcademy.levels).toHaveLength(46);
    expect(warAcademy.levels.every((l) => l.tier === 'fireCrystal')).toBe(true);
    expect(warAcademy.fireCrystalImg).toBeUndefined();
  });

  it('starts at FC 1 with only a Furnace FC 1 requirement, no self-chain', () => {
    const fc1 = warAcademy.levels.find((l) => l.label === 'FC 1')!;
    expect(fc1.fcStage).toBe(1);
    expect(fc1.fcSubLevel).toBeUndefined();
    expect(fc1.prerequisites).toEqual([{ building: 'Furnace', level: 'FC 1' }]);
    expect(fc1.cost).toEqual([]);
  });

  it('has FC 1-1 require FC 1 directly, since there is no tier 0 to jump back to', () => {
    const fc11 = warAcademy.levels.find((l) => l.label === 'FC 1-1')!;
    expect(fc11.prerequisites).toEqual([
      { building: 'War Academy', level: 'FC 1' },
      { building: 'Furnace', level: 'FC 2' },
    ]);
  });

  it('carries a research speed bonus on every level, unlike the sparse training speed bonus', () => {
    expect(warAcademy.levels.every((l) => l.researchSpeedBonusPercent !== undefined)).toBe(true);
    expect(warAcademy.levels.find((l) => l.label === 'FC 10')!.researchSpeedBonusPercent).toBe(15);
  });
});

describe('Infirmary levels', () => {
  const infirmary = buildings().findByName('Infirmary')!;

  it('tracks all 80 levels with capacity only on standard levels and FC tier base rows', () => {
    expect(infirmary.levels).toHaveLength(80);
    const level1 = infirmary.levels.find((l) => l.label === '1')!;
    const fc1 = infirmary.levels.find((l) => l.label === 'FC 1')!;
    const fc11 = infirmary.levels.find((l) => l.label === 'FC 1-1')!;
    expect(level1.infirmaryCapacity).toBe(200);
    expect(fc1.infirmaryCapacity).toBe(72000);
    expect(fc11.infirmaryCapacity).toBeUndefined();
  });

  it('requires Furnace Lv.8 at Level 1, then tracks the matching Furnace level from Level 8 on', () => {
    const level1 = infirmary.levels.find((l) => l.label === '1')!;
    expect(level1.prerequisites).toEqual([{ building: 'Furnace', level: 8 }]);
  });
});

describe('Storehouse levels', () => {
  const storehouse = buildings().findByName('Storehouse')!;

  it('caps at Level 30 with no Fire Crystal tier', () => {
    expect(storehouse.levels).toHaveLength(30);
    expect(storehouse.maxLevelLabel).toBe('30');
    expect(storehouse.fireCrystalImg).toBeUndefined();
  });

  it('requires Furnace Lv.9 at Level 1, then tracks the matching Furnace level from Level 9 on', () => {
    const level1 = storehouse.levels.find((l) => l.label === '1')!;
    expect(level1.prerequisites).toEqual([{ building: 'Furnace', level: 9 }]);
  });

  it('tracks storage capacity at every level', () => {
    const level1 = storehouse.levels.find((l) => l.label === '1')!;
    expect(level1.storehouseCapacity).toBe(100000);
  });
});

describe('Barricade levels', () => {
  const barricade = buildings().findByName('Barricade')!;

  it('caps at Level 10 with no Fire Crystal tier', () => {
    expect(barricade.levels).toHaveLength(10);
    expect(barricade.maxLevelLabel).toBe('10');
    expect(barricade.fireCrystalImg).toBeUndefined();
  });

  it('has no prerequisite at Level 1, unlike every other tracked building', () => {
    const level1 = barricade.levels.find((l) => l.label === '1')!;
    expect(level1.prerequisites).toBeUndefined();
  });

  it('skips several Furnace levels between its own levels rather than gating every one', () => {
    const level2 = barricade.levels.find((l) => l.label === '2')!;
    const level3 = barricade.levels.find((l) => l.label === '3')!;
    expect(level2.prerequisites).toEqual([{ building: 'Furnace', level: 7 }]);
    expect(level3.prerequisites).toEqual([{ building: 'Furnace', level: 10 }]);
  });

  it('tracks durability at every level', () => {
    const level1 = barricade.levels.find((l) => l.label === '1')!;
    expect(level1.barricadeDurability).toBe(1000);
  });
});

describe.each([
  ["Hunter's Hut", [1, 5, 6]],
  ['Sawmill', [1, 5, 6]],
  ['Coal Mine', [3, 5, 6]],
  ['Iron Mine', [5, 5, 6]],
])('%s levels', (name, [level1Floor, level5Floor, level6Floor]) => {
  const building = buildings().findByName(name)!;

  it('has 30 standard levels plus a single bonus FC 1 level', () => {
    expect(building.levels).toHaveLength(31);
    expect(building.maxLevelLabel).toBe('FC 1');
    expect(building.fireCrystalImg).toBeUndefined();
  });

  it('gates Level 1, Level 5, and Level 6 against the expected Furnace floor', () => {
    const level1 = building.levels.find((l) => l.label === '1')!;
    const level5 = building.levels.find((l) => l.label === '5')!;
    const level6 = building.levels.find((l) => l.label === '6')!;
    expect(level1.prerequisites).toEqual([{ building: 'Furnace', level: level1Floor }]);
    expect(level5.prerequisites).toEqual([{ building: 'Furnace', level: level5Floor }]);
    expect(level6.prerequisites).toEqual([{ building: 'Furnace', level: level6Floor }]);
  });

  it('has a sole FC 1 level requiring Furnace FC 2 (not FC 1) and its own Level 30', () => {
    const fc1 = building.levels.find((l) => l.label === 'FC 1')!;
    expect(fc1.tier).toBe('fireCrystal');
    expect(fc1.fcStage).toBe(1);
    expect(fc1.fcSubLevel).toBeUndefined();
    expect(fc1.prerequisites).toEqual([
      { building: name, level: 30 },
      { building: 'Furnace', level: 'FC 2' },
    ]);
    expect(fc1.cost.some((c) => c.name === 'Fire Crystals')).toBe(false);
  });
});

describe.each([
  ['The Bakery', 'FC 3'],
  ['The Vinyl Shop', 'FC 3'],
  ['Tea Milk Shop', 'FC 3'],
  ['Cinema', 'FC 4'],
  ['Cafe', 'FC 4'],
  ['Gym', 'FC 4'],
  ['Farm', 'FC 5'],
  ['Yoga Studio', 'FC 5'],
  ['Climbing Gym', 'FC 5'],
])('%s (entertainment building)', (name, furnaceFcGate) => {
  const building = buildings().findByName(name)!;

  it('has a single standard-tier level and no portrait yet', () => {
    expect(building.levels).toHaveLength(1);
    expect(building.maxLevelLabel).toBe('1');
    expect(building.img).toBeUndefined();
    expect(building.levels[0].tier).toBe('standard');
  });

  it(`requires Furnace ${furnaceFcGate}`, () => {
    expect(building.levels[0].prerequisites).toEqual([
      { building: 'Furnace', level: furnaceFcGate },
    ]);
  });

  it('carries instant build time, Power, Development Index, and Troop Deployment Capacity', () => {
    const level = building.levels[0];
    expect(level.buildTimeSeconds).toBe(0);
    expect(level.power).toBe(30000);
    expect(level.developmentIndex).toBe(100000);
    expect(level.troopDeploymentCapacity).toBe(100);
  });
});

describe('The Bakery cost', () => {
  it('matches the exact furniture list, quantities, and per-item price', () => {
    const bakery = buildings().findByName('The Bakery')!;
    expect(bakery.levels[0].cost).toEqual([
      { name: 'Blueprint', count: 1, pricePerItem: 3000 },
      { name: 'Counter', count: 1, pricePerItem: 2500 },
      { name: 'Oven', count: 1, pricePerItem: 2000 },
      { name: 'Dough Maker', count: 1, pricePerItem: 1500 },
      { name: 'Proofing Cabinet', count: 1, pricePerItem: 1500 },
      { name: 'Table & Chair Set', count: 2, pricePerItem: 1000 },
    ]);
  });
});

describe.each([
  ['Clinic', [4, 5, 6]],
  ['Cookhouse', [1, 5, 6]],
  ['Shelter', [1, 5, 6]],
])('%s levels', (name, [level1Floor, level5Floor, level6Floor]) => {
  const building = buildings().findByName(name)!;

  it('has 10 standard levels plus a single bonus FC 1 level', () => {
    expect(building.levels).toHaveLength(11);
    expect(building.maxLevelLabel).toBe('FC 1');
    expect(building.fireCrystalImg).toBeUndefined();
  });

  it('gates Level 1, Level 5, and Level 6 against the expected Furnace floor', () => {
    const level1 = building.levels.find((l) => l.label === '1')!;
    const level5 = building.levels.find((l) => l.label === '5')!;
    const level6 = building.levels.find((l) => l.label === '6')!;
    expect(level1.prerequisites).toEqual([{ building: 'Furnace', level: level1Floor }]);
    expect(level5.prerequisites).toEqual([{ building: 'Furnace', level: level5Floor }]);
    expect(level6.prerequisites).toEqual([{ building: 'Furnace', level: level6Floor }]);
  });

  it('has a sole FC 1 level requiring Furnace FC 1 (matching, unlike the production buildings) and its own Level 10', () => {
    const fc1 = building.levels.find((l) => l.label === 'FC 1')!;
    expect(fc1.tier).toBe('fireCrystal');
    expect(fc1.fcStage).toBe(1);
    expect(fc1.prerequisites).toEqual([
      { building: name, level: 10 },
      { building: 'Furnace', level: 'FC 1' },
    ]);
  });
});
