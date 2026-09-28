import { ItemQuery, items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('items', () => items());

describe('ItemQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = items().get().slice(0, 1);
    expect(new ItemQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ItemQuery().count()).toBeGreaterThan(0);
  });

  it('byCategory() filters to the given category', () => {
    const chests = items().byCategory('Chest');
    expect(chests.count()).toBe(50);
    expect(chests.get().every((i) => i.category === 'Chest')).toBe(true);
  });
});

describe('Item catalog', () => {
  it('tracks 226 items across 10 categories', () => {
    expect(items().count()).toBe(226);
    expect(items().byCategory('Hero Items').count()).toBe(10);
    expect(items().byCategory('Pet').count()).toBe(6);
    expect(items().byCategory('Gear Materials').count()).toBe(10);
    expect(items().byCategory('Chest').count()).toBe(50);
    expect(items().byCategory('Buff').count()).toBe(31);
    expect(items().byCategory('Fire Crystal').count()).toBe(4);
    expect(items().byCategory('Experts').count()).toBe(16);
    expect(items().byCategory('Teleporter').count()).toBe(4);
    expect(items().byCategory('Others').count()).toBe(40);
    expect(items().byCategory('Event').count()).toBe(55);
  });

  it('resolves items tagged under both Chest and another tab to Chest', () => {
    const arenaStarChest = items().find('arena-star-chest')!;
    const seekersChest = items().find('seekers-chest')!;
    expect(arenaStarChest.category).toBe('Chest');
    expect(seekersChest.category).toBe('Chest');
  });

  it('has a parsed rewardRates loot table on some chests but not others', () => {
    const splendidLabyrinthTreasure = items().find('splendid-labyrinth-treasure')!;
    expect(splendidLabyrinthTreasure.rewardRates).toHaveLength(5);
    expect(
      splendidLabyrinthTreasure.rewardRates!.reduce((sum, r) => sum + r.probabilityPercent, 0),
    ).toBeCloseTo(100, 1);

    const frostseaHeroChest = items().find('frostsea-hero-chest')!;
    expect(frostseaHeroChest.rewardRates).toBeUndefined();
  });

  it('carries forward the rowspan-grouped item name for table-shaped reward rates', () => {
    const chefGearVarietyChest = items().find('chief-gear-variety-chest')!;
    expect(chefGearVarietyChest.rewardRates).toHaveLength(12);
    expect(new Set(chefGearVarietyChest.rewardRates!.map((r) => r.reward)).size).toBe(3);
  });

  it('has an empty sources array rather than a missing field when no sources are listed', () => {
    const wood = items().find('wood')!;
    expect(wood.sources).toEqual([]);
  });

  it('parses the French-spelled Resource Chest slug correctly', () => {
    const resourceChest = items().find('ressource-chest')!;
    expect(resourceChest.name).toBe('Resource Chest');
    expect(resourceChest.description).toBeDefined();
  });
});
