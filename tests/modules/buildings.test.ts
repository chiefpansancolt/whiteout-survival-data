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
