import { heroGearEnhancement, HeroGearEnhancementQuery } from '@/modules/hero-gear-enhancement';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroGearEnhancement', () => heroGearEnhancement());

describe('HeroGearEnhancementQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroGearEnhancement().get().slice(0, 1);
    expect(new HeroGearEnhancementQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroGearEnhancementQuery().count()).toBeGreaterThan(0);
  });

  it('byLevel() filters to the given level', () => {
    const level50 = heroGearEnhancement().byLevel(50);
    expect(level50.count()).toBe(1);
    expect(level50.get()[0].level).toBe(50);
  });
});

describe('Hero Gear Enhancement table', () => {
  it('has 100 levels', () => {
    expect(heroGearEnhancement().count()).toBe(100);
  });

  it('costs Enhancement XP Component at every level', () => {
    expect(
      heroGearEnhancement()
        .get()
        .every((l) => l.cost.length === 1 && l.cost[0].itemId === 'enhancement-xp-component'),
    ).toBe(true);
  });

  it('resolves every cost itemId against a real cataloged item', () => {
    const allItemIds = heroGearEnhancement()
      .get()
      .flatMap((l) => l.cost.map((c) => c.itemId));
    expect(allItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });
});
