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
});
