import { heroGearEmpowerment, HeroGearEmpowermentQuery } from '@/modules/hero-gear-empowerment';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroGearEmpowerment', () => heroGearEmpowerment());

describe('HeroGearEmpowermentQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroGearEmpowerment().get().slice(0, 1);
    expect(new HeroGearEmpowermentQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroGearEmpowermentQuery().count()).toBeGreaterThan(0);
  });

  it('byLevel() filters to the given level', () => {
    const level50 = heroGearEmpowerment().byLevel(50);
    expect(level50.count()).toBe(1);
    expect(level50.get()[0].level).toBe(50);
  });
});

describe('Hero Gear Empowerment table', () => {
  it('has 100 levels', () => {
    expect(heroGearEmpowerment().count()).toBe(100);
  });

  it('resolves every cost itemId against a real cataloged item', () => {
    const allItemIds = heroGearEmpowerment()
      .get()
      .flatMap((l) => l.cost.map((c) => c.itemId));
    expect(allItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('continues the unforged power from enhancement level 100 up to 1,054,175', () => {
    expect(heroGearEmpowerment().find('level-1')!.power).toBe(279500);
    expect(heroGearEmpowerment().find('level-100')!.power).toBe(1054175);
  });

  it('has a milestone power of 200,000 at levels 20, 40, 60, 80, and 100 only', () => {
    const withMilestone = heroGearEmpowerment()
      .get()
      .filter((l) => l.milestonePower !== undefined);
    expect(withMilestone.map((l) => l.level)).toEqual([20, 40, 60, 80, 100]);
    withMilestone.forEach((l) => expect(l.milestonePower).toBe(200000));
  });

  it('costs a chest item at level 1, XP Component through the middle, and a chest plus Mithril at level 100', () => {
    const level1 = heroGearEmpowerment().find('level-1')!;
    expect(level1.cost).toEqual([{ itemId: 'custom-mythic-hero-gear-chest', amount: 2 }]);

    const level50 = heroGearEmpowerment().find('level-50')!;
    expect(level50.cost).toHaveLength(1);
    expect(level50.cost[0].itemId).toBe('enhancement-xp-component');

    const level100 = heroGearEmpowerment().find('level-100')!;
    expect(level100.cost.map((c) => c.itemId)).toEqual([
      'custom-mythic-hero-gear-chest',
      'mithril',
    ]);
  });
});
