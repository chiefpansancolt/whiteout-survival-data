import {
  DAYBREAK_ISLAND_TIMBERMILL,
  DAYBREAK_ISLAND_UNLOCK_FURNACE_LEVEL,
  decoration,
  DecorationQuery,
  lumberCamp,
  LumberCampQuery,
  treeOfLife,
  TreeOfLifeQuery,
} from '@/modules/daybreak-island';
import { items } from '@/modules/items';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('lumberCamp', () => lumberCamp());
testQueryBaseContract('treeOfLife', () => treeOfLife());
testQueryBaseContract('decoration', () => decoration());

describe('LumberCampQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = lumberCamp().get().slice(0, 1);
    expect(new LumberCampQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new LumberCampQuery().count()).toBeGreaterThan(0);
  });
});

describe('TreeOfLifeQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = treeOfLife().get().slice(0, 1);
    expect(new TreeOfLifeQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new TreeOfLifeQuery().count()).toBeGreaterThan(0);
  });
});

describe('DecorationQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = decoration().get().slice(0, 1);
    expect(new DecorationQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new DecorationQuery().count()).toBeGreaterThan(0);
  });

  it('byCategory() filters to the given category', () => {
    const rare = decoration().byCategory('Rare');
    expect(rare.count()).toBe(12);
    expect(rare.get().every((d) => d.category === 'Rare')).toBe(true);
  });
});

describe('Lumber Camp', () => {
  it('covers 10 levels, requiring higher Tree of Life levels and Life Essence as it climbs', () => {
    expect(lumberCamp().count()).toBe(10);
    const level1 = lumberCamp().find('lumber-camp-level-1')!;
    expect(level1).toMatchObject({
      workers: 1,
      ratePerSecond: 6,
      treeOfLifeLevelRequired: 1,
      lifeEssenceRequired: 0,
    });
    const level10 = lumberCamp().find('lumber-camp-level-10')!;
    expect(level10).toMatchObject({
      workers: 2,
      ratePerSecond: 15,
      treeOfLifeLevelRequired: 6,
      lifeEssenceRequired: 5000,
    });
  });
});

describe('Tree of Life', () => {
  it('covers 10 levels with a Prosperity/Life Essence requirement and a buff at each level', () => {
    expect(treeOfLife().count()).toBe(10);
    const level1 = treeOfLife().find('tree-of-life-level-1')!;
    expect(level1).toMatchObject({
      prosperityRequired: 0,
      lifeEssenceRequired: 0,
      lifeEssencePerHour: 120,
      buff: { stat: 'Healing Speed', value: '+30%', amount: 30, unit: 'percent' },
    });
    const level10 = treeOfLife().find('tree-of-life-level-10')!;
    expect(level10).toMatchObject({
      prosperityRequired: 20000,
      lifeEssenceRequired: 100000,
      lifeEssencePerHour: 390,
      buff: { stat: 'Troops Lethality', value: '+5%', amount: 5, unit: 'percent' },
    });
  });

  it('parses a flat (non-percent) buff into its expanded numeric amount, like VipBonus', () => {
    const level2 = treeOfLife().find('tree-of-life-level-2')!;
    expect(level2.buff).toEqual({
      stat: 'Troops Deployment Capacity',
      value: '+1K',
      amount: 1000,
      unit: 'flat',
    });
  });
});

describe('Decorations', () => {
  it('covers all 103 decorations across 8 categories', () => {
    expect(decoration().count()).toBe(103);
    const counts: [string, number][] = [
      ['Basic', 9],
      ['Vegetation', 5],
      ['Common', 10],
      ['Uncommon', 6],
      ['Rare', 12],
      ['Epic', 11],
      ['Mythic', 48],
      ['Unique', 3],
    ];
    counts.forEach(([category, count]) => {
      expect(
        decoration()
          .byCategory(category as never)
          .count(),
      ).toBe(count);
    });
  });

  it('tags time-limited decorations with `limited: true`, folded into their real Epic/Mythic tier rather than a separate category', () => {
    const limited = decoration()
      .get()
      .filter((d) => d.limited);
    expect(limited).toHaveLength(46);
    expect(limited.every((d) => d.category === 'Epic' || d.category === 'Mythic')).toBe(true);

    const epicLimited = limited.filter((d) => d.category === 'Epic');
    expect(epicLimited).toHaveLength(4);
    expect(epicLimited.every((d) => d.levels?.length === 5)).toBe(true);

    const mythicLimited = limited.filter((d) => d.category === 'Mythic');
    expect(mythicLimited).toHaveLength(42);
    expect(mythicLimited.every((d) => d.levels?.length === 10)).toBe(true);

    const blacksmith = decoration().find('blacksmith')!;
    expect(blacksmith.limited).toBeUndefined();
  });

  it('resolves every Basic/Vegetation cost itemId against a real cataloged item', () => {
    const costItemIds = decoration()
      .get()
      .flatMap((d) => d.cost?.map((c) => c.itemId) ?? []);
    expect(costItemIds.length).toBeGreaterThan(0);
    expect(costItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('gives Basic/Vegetation decorations a cost and limit but no levels', () => {
    const heatedPool = decoration().find('heated-pool')!;
    expect(heatedPool.category).toBe('Basic');
    expect(heatedPool.cost).toEqual([{ itemId: 'gems', amount: 200 }]);
    expect(heatedPool.limit).toBe(500);
    expect(heatedPool.levels).toBeUndefined();
  });

  it('fills in the full per-level breakdown for Rare/Epic/Mythic, imported from the user-filled workbook', () => {
    const blacksmith = decoration().find('blacksmith')!;
    expect(blacksmith.category).toBe('Rare');
    expect(blacksmith.lifeEssenceCost).toBe(3000);
    expect(blacksmith.limit).toBe(1);
    expect(blacksmith.levels).toHaveLength(5);
    expect(blacksmith.levels![0]).toEqual({
      level: 1,
      cost: 1,
      prosperity: 200,
      buff: { stat: 'Iron Gathering Speed', value: '+6%', amount: 6, unit: 'percent' },
    });
    expect(blacksmith.levels![4]).toEqual({
      level: 5,
      cost: 5,
      prosperity: 1000,
      buff: { stat: 'Iron Gathering Speed', value: '+30%', amount: 30, unit: 'percent' },
    });
  });

  it('expands a flat buff to its full numeric amount, matching VipBonus conventions', () => {
    const basicDock = decoration().find('basic-dock')!;
    expect(basicDock.levels![4].buff).toEqual({
      stat: 'Troop Deployment Capacity',
      value: '+1K',
      amount: 1000,
      unit: 'flat',
    });
  });

  it('fills incomplete rows with blank/zero values rather than omitting them', () => {
    const christmasCarol = decoration().find('christmas-carol')!;
    expect(christmasCarol.category).toBe('Mythic');
    expect(christmasCarol.limited).toBe(true);
    expect(christmasCarol.levels).toHaveLength(10);
    expect(christmasCarol.levels![0]).toEqual({
      level: 1,
      cost: 1,
      prosperity: 1000,
      buff: { stat: '', value: '+0', amount: 0, unit: 'flat' },
    });
  });

  it('confirms the Snow Castle Life Essence exception (12,000, not the usual 10,000)', () => {
    const snowCastle = decoration().find('snow-castle')!;
    expect(snowCastle.category).toBe('Mythic');
    expect(snowCastle.lifeEssenceCost).toBe(12000);

    // Limited Mythics come from shop rotations and event packs, outside the Life Essence
    // curve. They have no lifeEssenceCost.
    const otherStandardMythics = decoration()
      .byCategory('Mythic')
      .get()
      .filter((d) => d.id !== 'snow-castle' && !d.limited);
    expect(otherStandardMythics.length).toBeGreaterThan(0);
    otherStandardMythics.forEach((d) => {
      expect(d.lifeEssenceCost).toBe(10000);
    });
  });

  it('resolves the corrected-spelling Hero’s Sanctum entry to the original fan-site id', () => {
    // The original scraped id keeps the fan-site typo "Sanctun". The import updates that
    // entry instead of adding a duplicate.
    expect(decoration().find('heros-sanctum')).toBeUndefined();
    const heroSanctum = decoration().find('hero-s-sanctun')!;
    expect(heroSanctum.category).toBe('Epic');
    expect(heroSanctum.limited).toBe(true);
    expect(heroSanctum.levels).toHaveLength(5);
  });

  it('folds the Starry Lighthouse in as a Unique decoration', () => {
    const starryLighthouse = decoration().find('starry-lighthouse')!;
    expect(starryLighthouse.category).toBe('Unique');
    expect(starryLighthouse.limited).toBeUndefined();
    expect(starryLighthouse.limit).toBe(1);
    expect(starryLighthouse.levels).toHaveLength(10);
    expect(starryLighthouse.levels![0]).toEqual({
      level: 1,
      cost: 0,
      prosperity: 2000,
      buff: {
        stat: "Troops' Lethality, Troops' Health",
        value: '+1%',
        amount: 1,
        unit: 'percent',
      },
    });
    expect(starryLighthouse.levels![9]).toEqual({
      level: 10,
      cost: 180,
      prosperity: 20000,
      buff: {
        stat: "Troops' Lethality, Troops' Health",
        value: '+10%',
        amount: 10,
        unit: 'percent',
      },
    });
  });

  it('reclassifies Harbor of Hope as Unique rather than a limited Mythic, since it has no standard rarity progression', () => {
    const harborOfHope = decoration().find('harbor-of-hope')!;
    expect(harborOfHope.category).toBe('Unique');
    expect(harborOfHope.limited).toBeUndefined();
    expect(harborOfHope.levels).toHaveLength(10);

    const unique = decoration()
      .byCategory('Unique')
      .get()
      .map((d) => d.id);
    expect(unique.sort()).toEqual(['harbor-of-hope', 'starry-lighthouse']);
  });

  it('has an icon file for every decoration that has an img', () => {
    const withImg = decoration()
      .get()
      .filter((d) => d.img !== undefined);
    expect(withImg.map((d) => d.id)).toEqual([
      'hero-s-sanctun',
      'cannon',
      'conquering-sword',
      'dragon-pagoda',
      'giant-horn',
      'icefire-way',
      'luminari-citadel',
      'serpent-sanctuary',
      'tundra-truck',
      'war-chariot',
    ]);
    withImg.forEach((d) => expect(existsSync(join(__dirname, '../..', d.img!))).toBe(true));
  });
});

describe('decoration names', () => {
  it('uses the corrected spelling of Hero’s Sanctum and Floating Market', () => {
    expect(decoration().find('hero-s-sanctun')?.name).toBe('Hero’s Sanctum');
    expect(decoration().find('floating-markert')?.name).toBe('Floating Market');
  });

  it('has no decoration with an old misspelling in its name', () => {
    const names = decoration()
      .get()
      .map((d) => d.name);
    expect(names.some((n) => /Sanctun|Markert/.test(n))).toBe(false);
  });
});

describe('Daybreak Island unlock', () => {
  it('unlocks at Furnace level 19', () => {
    expect(DAYBREAK_ISLAND_UNLOCK_FURNACE_LEVEL).toBe(19);
  });
});

describe('Daybreak Island Timbermill', () => {
  it('produces 40 Life Essence an hour for each worker, up to a capacity of 2,000', () => {
    expect(DAYBREAK_ISLAND_TIMBERMILL).toEqual({ lifeEssencePerHourPerWorker: 40, capacity: 2000 });
  });

  it('gets the workers of the two Lumber Camps, which hold 2 workers each at level 4 or higher', () => {
    const maxWorkers = lumberCamp().find('lumber-camp-level-10')!.workers;
    expect(maxWorkers).toBe(2);
    const perHour = 2 * maxWorkers * DAYBREAK_ISLAND_TIMBERMILL.lifeEssencePerHourPerWorker;
    expect(perHour).toBe(160);
    expect(DAYBREAK_ISLAND_TIMBERMILL.capacity / perHour).toBe(12.5);
  });
});
