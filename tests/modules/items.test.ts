import { experts } from '@/modules/experts';
import { ItemQuery, items } from '@/modules/items';
import { existsSync } from 'fs';
import { join } from 'path';
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
    expect(chests.count()).toBe(60);
    expect(chests.get().every((i) => i.category === 'Chest')).toBe(true);
  });
});

describe('Item catalog', () => {
  it('tracks 326 items across 12 categories', () => {
    expect(items().count()).toBe(326);
    expect(items().byCategory('Hero Items').count()).toBe(23);
    expect(items().byCategory('Pet').count()).toBe(6);
    expect(items().byCategory('Gear Materials').count()).toBe(10);
    expect(items().byCategory('Chest').count()).toBe(60);
    expect(items().byCategory('Buff').count()).toBe(31);
    expect(items().byCategory('Fire Crystal').count()).toBe(4);
    expect(items().byCategory('Experts').count()).toBe(17);
    expect(items().byCategory('Teleporter').count()).toBe(4);
    expect(items().byCategory('Others').count()).toBe(41);
    expect(items().byCategory('Event').count()).toBe(58);
    expect(items().byCategory('Speedups').count()).toBe(30);
    expect(items().byCategory('Furniture').count()).toBe(42);
  });

  it('has the Wish Sigil, the currency of the Wish Shop, with an icon file', () => {
    const sigil = items().find('wish-sigil')!;
    expect(sigil).toMatchObject({
      name: 'Wish Sigil',
      category: 'Others',
      img: '/images/items/wish-sigil.png',
      sources: ['Wish Station', 'Development Index Daily Reward'],
    });
    expect(existsSync(join(__dirname, '../..', sigil.img))).toBe(true);
  });

  it('buys every furniture item in the Wish Shop and has no icon for it', () => {
    for (const item of items().byCategory('Furniture').get()) {
      expect(item.sources).toEqual(['Wish Shop']);
      expect(item.img).toBe('');
    }
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

  it('has an icon file for every Speedups item except the placeholders', () => {
    items()
      .byCategory('Speedups')
      .get()
      .filter((item) => item.img !== '')
      .forEach((item) => expect(existsSync(join(__dirname, '../..', item.img))).toBe(true));
  });

  it('has 1m, 5m, 1h, 3h, and 8h speedups of every type', () => {
    for (const type of ['general', 'construction', 'research', 'troop', 'learning', 'healing']) {
      for (const length of ['1m', '5m', '1h', '3h', '8h']) {
        expect(items().find(`speedup-${type}-${length}`)).toBeDefined();
      }
    }
  });

  it('marks the placeholder speedups with an empty img and no sources', () => {
    const placeholders = items()
      .byCategory('Speedups')
      .get()
      .filter((item) => item.img === '');
    expect(placeholders.map((item) => item.id)).toEqual([
      'speedup-construction-3h',
      'speedup-construction-8h',
      'speedup-troop-3h',
      'speedup-troop-8h',
      'speedup-research-3h',
      'speedup-research-8h',
      'speedup-learning-8h',
      'speedup-healing-3h',
      'speedup-healing-8h',
    ]);
    for (const item of placeholders) expect(item.sources).toEqual([]);
  });

  it('names speedups by duration and type', () => {
    const speedup = items().find('speedup-general-5m')!;
    expect(speedup.name).toBe('5m General Speedup');
    expect(items().find('speedup-healing-1h')!.name).toBe('1h Troop Healing Speedup');
  });

  it('has the three Frostdragon Tyrant trophies with icon files', () => {
    ['triumph-of-tyrant', 'glory-of-kings', 'trail-of-heroes'].forEach((id) => {
      const trophy = items().find(id)!;
      expect(trophy.category).toBe('Event');
      expect(existsSync(join(__dirname, '../..', trophy.img))).toBe(true);
    });
  });

  it('lists everything a Journey of Light Radiance Treasure holds as rewardRates of 100 percent', () => {
    const chests = ['common', 'premium', 'exquisite', 'dazzling'].map((n) =>
      items().find(`${n}-radiance-treasure`)!,
    );
    chests.forEach((c) => {
      expect(c.rewardRates).toHaveLength(3);
      c.rewardRates!.forEach((r) => expect(r.probabilityPercent).toBe(100));
    });
    expect(chests[3].rewardRates![0]).toEqual({
      reward: 'Mythic General Hero Shard',
      amount: 10,
      probabilityPercent: 100,
    });
  });
});

describe('speedup items', () => {
  const speedups = items()
    .get()
    .filter((i) => i.speedup !== undefined);

  it('has a speedup field on the 30 speedup items', () => {
    expect(speedups).toHaveLength(30);
  });

  it('reads the type and the minutes from the id', () => {
    for (const item of speedups) {
      const match = /^speedup-([a-z]+)-(\d+)(m|h)$/.exec(item.id)!;
      expect(item.speedup!.type).toBe(match[1]);
      expect(item.speedup!.minutes).toBe(Number(match[2]) * (match[3] === 'h' ? 60 : 1));
    }
  });

  it('keeps every speedup item in the Speedups category', () => {
    for (const item of speedups) expect(item.category).toBe('Speedups');
  });

  it('has a general 8 hour speedup of 480 minutes', () => {
    expect(items().find('speedup-general-8h')!.speedup).toEqual({ type: 'general', minutes: 480 });
  });
});

describe('expert sigils', () => {
  const sigilId = (expertId: string) =>
    expertId === 'baldur' ? 'baldurs-sigil' : `${expertId}-sigil`;

  it('has a sigil item with an icon file for every expert', () => {
    for (const expert of experts().get()) {
      const sigil = items().find(sigilId(expert.id));
      expect(sigil).toBeDefined();
      expect(sigil!.category).toBe('Experts');
      expect(existsSync(join(__dirname, '../..', sigil!.img))).toBe(true);
    }
  });

  it('gives the sigils of the experts one description pattern and the same sources', () => {
    for (const expert of experts().get()) {
      const sigil = items().find(sigilId(expert.id))!;
      expect(sigil.description).toBe(
        `Advances your relationship with Expert ${expert.name}. Once maxed, it can be used for Expert Research.`,
      );
      expect(sigil.sources).toEqual(['Tundra & Frontier Treks', 'Packs', 'Exchange Common Sigils']);
    }
  });

  it('names the Gareth Sigil like the other sigils', () => {
    expect(items().find('gareth-sigil')).toMatchObject({
      name: 'Gareth Sigil',
      img: '/images/items/gareth-sigil.png',
    });
  });
});
