import {
  heroGearMasteryForging,
  HeroGearMasteryForgingQuery,
} from '@/modules/hero-gear-mastery-forging';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroGearMasteryForging', () => heroGearMasteryForging());

describe('HeroGearMasteryForgingQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroGearMasteryForging().get().slice(0, 1);
    expect(new HeroGearMasteryForgingQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroGearMasteryForgingQuery().count()).toBeGreaterThan(0);
  });

  it('byLevel() filters to every stage row at the given level', () => {
    const level19 = heroGearMasteryForging().byLevel(19);
    expect(level19.count()).toBe(5);
    expect(level19.get().every((l) => l.level === 19)).toBe(true);
  });
});

describe('Hero Master Forging table', () => {
  it('has 84 rows across 20 levels', () => {
    expect(heroGearMasteryForging().count()).toBe(84);
  });

  it('resolves every cost itemId against a real cataloged item', () => {
    const allItemIds = heroGearMasteryForging()
      .get()
      .flatMap((l) => l.cost.map((c) => c.itemId));
    expect(allItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('costs only Essence Stones at low levels, adding a chest material from level 19 on', () => {
    const level1 = heroGearMasteryForging().find('level-1')!;
    expect(level1.cost).toEqual([{ itemId: 'essence-stones', amount: 10 }]);

    const level19Stage0 = heroGearMasteryForging().find('level-19-stage-0')!;
    expect(level19Stage0.cost.map((c) => c.itemId)).toEqual([
      'essence-stones',
      'custom-mythic-hero-gear-chest',
    ]);
  });
});
