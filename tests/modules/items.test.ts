import { experts } from '@/modules/experts';
import { heroes } from '@/modules/heroes';
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
    expect(chests.count()).toBe(55);
    expect(chests.get().every((i) => i.category === 'Chest')).toBe(true);
  });
});

describe('Item catalog', () => {
  it('tracks 417 items across 14 categories', () => {
    expect(items().count()).toBe(417);
    expect(items().byCategory('Hero Items').count()).toBe(75);
    expect(items().byCategory('Pet').count()).toBe(7);
    expect(items().byCategory('Chief Material').count()).toBe(7);
    expect(items().byCategory('Hero Gear Material').count()).toBe(6);
    expect(items().byCategory('Chest').count()).toBe(55);
    expect(items().byCategory('Resources').count()).toBe(45);
    expect(items().byCategory('Buff').count()).toBe(31);
    expect(items().byCategory('Fire Crystal').count()).toBe(4);
    expect(items().byCategory('Experts').count()).toBe(17);
    expect(items().byCategory('Teleporter').count()).toBe(4);
    expect(items().byCategory('Others').count()).toBe(38);
    expect(items().byCategory('Event').count()).toBe(58);
    expect(items().byCategory('Speedups').count()).toBe(25);
    expect(items().byCategory('Furniture').count()).toBe(45);
  });

  it('has the Custom Resource Chests and their Secured versions in Resources', () => {
    for (const level of [1, 2, 3]) {
      const chest = items().find(`lv-${level}-custom-resource-chest`)!;
      const secured = items().find(`lv-${level}-custom-secured-resource-chest`)!;
      expect(chest.name).toBe(`Lv.${level} Custom Resource Chest`);
      expect(secured.name).toBe(`Lv.${level} Custom Secured Resource Chest`);
      expect(chest.category).toBe('Resources');
      expect(secured.category).toBe('Resources');
      expect(secured.img).toBe(chest.img);
      expect(existsSync(join(__dirname, '../..', secured.img))).toBe(true);
    }
  });

  it('has a pack of each size and a Secured version for Meat, Wood, Coal, and Iron', () => {
    const sizes = {
      meat: ['1k', '10k', '100k', '1m'],
      wood: ['1k', '10k', '100k', '1m'],
      coal: ['100', '1k', '10k', '100k', '1m'],
      iron: ['100', '1k', '10k', '100k', '1m'],
    };
    for (const [resource, list] of Object.entries(sizes)) {
      for (const size of list) {
        const id = `${resource}-${size}`;
        const pack = items().find(id)!;
        expect(pack.category).toBe('Resources');
        expect(pack.img).toBe(`/images/items/resources/${id}.png`);
        expect(existsSync(join(__dirname, '../..', pack.img))).toBe(true);
        if (size !== '100') {
          const secured = items().find(`${id}-secured`)!;
          expect(secured.name).toBe(`${pack.name} (Secured)`);
          expect(secured.category).toBe('Resources');
          expect(existsSync(join(__dirname, '../..', secured.img))).toBe(true);
        }
      }
    }
    expect(items().find('coal-100-secured')).toBeUndefined();
    expect(items().find('1k-meat-secured')).toBeUndefined();
    expect(items().find('meat-1k-secured')!.name).toBe('1k Meat (Secured)');
    expect(items().find('meat-1m')!.name).toBe('1M Meat');
  });

  it('has the plain Meat, Wood, Coal, Iron, and Steel in Resources, with the icon of their resource', () => {
    for (const id of ['meat', 'wood', 'coal', 'iron', 'steel']) {
      const item = items().find(id)!;
      expect(item.category).toBe('Resources');
      expect(item.img).toBe(`/images/items/${id}.png`);
      expect(existsSync(join(__dirname, '../..', item.img))).toBe(true);
    }
  });

  it('has an Enhancement XP Component item for the 10 and one for the 100, with one icon', () => {
    for (const size of [10, 100]) {
      const item = items().find(`enhancement-xp-component-${size}`)!;
      expect(item.name).toBe(`${size} Enhancement XP Component`);
      expect(item.category).toBe('Hero Gear Material');
      expect(item.img).toBe('/images/items/enhancement-xp-component.png');
      expect(existsSync(join(__dirname, '../..', item.img))).toBe(true);
    }
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

  it('buys every furniture item in the Wish Shop', () => {
    for (const item of items().byCategory('Furniture').get()) {
      expect(item.sources).toEqual(['Wish Shop']);
    }
  });

  it('has an icon file for the furniture and the Blueprint of the Farm, the Climbing Gym, and the Yoga Studio only', () => {
    const withIcon = [
      'farm-blueprint',
      'climbing-gym-blueprint',
      'yoga-studio-blueprint',
      'fertile-soil',
      'seed-pack',
      'fertigation-unit',
      'underfloor-heating',
      'storage-box',
      'indoor-training-wall',
      'protective-mat',
      'outdoor-climbing-wall',
      'indoor-climbing-wall',
      'rope-and-belay-set',
      'yoga-mat',
      'yoga-wall-rope',
      'yoga-equipment',
      'meditation-equipment',
    ];
    const furniture = items().byCategory('Furniture').get();
    expect(furniture.filter((i) => i.img !== '').map((i) => i.id)).toEqual(
      furniture.filter((i) => withIcon.includes(i.id)).map((i) => i.id),
    );
    for (const id of withIcon) {
      const item = items().find(id)!;
      expect(item.img).toBe(`/images/items/furniture/${id}.png`);
      expect(existsSync(join(__dirname, '../..', item.img))).toBe(true);
    }
    expect(furniture.filter((i) => i.img === '')).toHaveLength(28);
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

  it('has an icon file for every Speedups item', () => {
    for (const item of items().byCategory('Speedups').get()) {
      expect(item.img).toBe(`/images/items/speedups/${item.id}.png`);
      expect(existsSync(join(__dirname, '../..', item.img))).toBe(true);
    }
  });

  it('has the speedups that are in the game: 1m to 8h, except the lengths that the game does not have', () => {
    const lengths = {
      general: ['1m', '5m', '1h', '3h', '8h'],
      troop: ['1m', '5m', '1h', '3h', '8h'],
      construction: ['1m', '5m', '1h', '3h'],
      research: ['1m', '5m', '1h', '3h'],
      learning: ['1m', '5m', '1h', '3h'],
      healing: ['1m', '5m', '1h'],
    };
    for (const [type, list] of Object.entries(lengths)) {
      const ids = items()
        .get()
        .filter((i) => i.speedup?.type === type)
        .map((i) => i.id);
      expect(ids).toEqual(list.map((length) => `speedup-${type}-${length}`));
    }
  });

  it('has no speedup of the lengths that are not in the game', () => {
    for (const id of [
      'speedup-construction-8h',
      'speedup-research-8h',
      'speedup-learning-8h',
      'speedup-healing-3h',
      'speedup-healing-8h',
    ]) {
      expect(items().find(id)).toBeUndefined();
    }
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

  it('has a speedup field on the 25 speedup items', () => {
    expect(speedups).toHaveLength(25);
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

describe('items of the activity bar of the Daily Missions', () => {
  const packs = {
    'meat-10k': ['10k Meat', '/images/items/resources/meat-10k.png'],
    'wood-10k': ['10k Wood', '/images/items/resources/wood-10k.png'],
    'coal-1k': ['1k Coal', '/images/items/resources/coal-1k.png'],
    'iron-1k': ['1k Iron', '/images/items/resources/iron-1k.png'],
  };

  it('gives Alliance XP and Activity Triumph Points an icon file, and the Daily Missions as the source', () => {
    for (const id of ['alliance-xp', 'activity-triumph-points']) {
      const item = items().find(id)!;
      expect(item.category).toBe('Others');
      expect(item.img).toBe(`/images/items/${id}.png`);
      expect(existsSync(join(__dirname, '../..', item.img))).toBe(true);
      expect(item.sources).toEqual(['Daily Missions']);
    }
  });

  it('puts the 4 resource packs in Resources with an icon file, and the Daily Missions as the source', () => {
    for (const [id, [name, img]] of Object.entries(packs)) {
      const item = items().find(id)!;
      expect(item.name).toBe(name);
      expect(item.category).toBe('Resources');
      expect(item.img).toBe(img);
      expect(existsSync(join(__dirname, '../..', item.img))).toBe(true);
      expect(item.sources).toEqual(['Daily Missions']);
    }
  });

  it('has 64 items without an icon in all', () => {
    expect(
      items()
        .get()
        .filter((i) => i.img === ''),
    ).toHaveLength(64);
  });

  it('has a Shard item for every hero, named after the hero', () => {
    for (const hero of heroes().get()) {
      const shard = items().findByName(`${hero.name} Shard`);
      expect(shard).toBeDefined();
      expect(shard!.category).toBe('Hero Items');
    }
  });

  it('has one Shot Token item, with the sources of both former entries', () => {
    expect(items().find('short-token')).toBeUndefined();
    expect(items().findByName('Shot Token')!.id).toBe('shot-token');
    expect(items().find('shot-token')!.sources).toEqual([
      'State of Power',
      'King of Icefield',
      'Armament Competition',
      'Officer Project',
      'Defeat nearby Beasts',
      'Frostfire Mine',
      'Foundry Battle',
      'Dead Shot (Sign-in Rewards)',
      'Castle Battle',
    ]);
  });

  it('has the Mythic Hero Gear as a Hero Gear Material with no icon yet', () => {
    expect(items().find('mythic-hero-gear')).toMatchObject({
      name: 'Mythic Hero Gear',
      category: 'Hero Gear Material',
      img: '',
    });
  });
});

describe('Activeness', () => {
  it('is an item of the Others category, with an icon, for the activeness of the Daily Missions', () => {
    const activeness = items().find('activeness')!;
    expect(activeness).toMatchObject({
      name: 'Activeness',
      category: 'Others',
      img: '/images/items/activeness.png',
      sources: ['Daily Missions'],
    });
    expect(existsSync(join(__dirname, '../../images/items/activeness.png'))).toBe(true);
  });
});
