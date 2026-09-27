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

  it('caps out at FC 10 with no prerequisites column', () => {
    const fc10 = furnace.levels.find((l) => l.label === 'FC 10')!;
    expect(fc10.tier).toBe('fireCrystal');
    expect(fc10.fcStage).toBe(10);
    expect(fc10.fcSubLevel).toBeUndefined();
    expect(fc10.prerequisites).toBeUndefined();
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
