import { allianceFacility } from '@/modules/alliance/facility';
import { alliancePrestige } from '@/modules/alliance/prestige';
import { allianceTech } from '@/modules/alliance/tech';
import { buildings } from '@/modules/buildings';
import {
  BUFF_CHARMS_PER_GEAR_SLOT,
  BUFF_ENTERTAINMENT_BUILDINGS,
  BUFF_EXPERT_SKILLS,
  BUFF_GROUPS,
  BUFF_HERO_ONLY_SKILLS,
  BUFF_MARCH_QUEUE_PACK,
  BUFF_STARTING_MARCH_QUEUE,
  BUFF_TREE_OF_LIFE_MAX_LEVEL,
  BUFF_VIP_MAX_LEVEL,
  buffGroupOf,
  calculateBuffs as calculateBuffsWithAccount,
} from '@/modules/calculators';
import { castleAppointments } from '@/modules/castle-appointments';
import { chiefCharm } from '@/modules/chief-charm';
import { chiefGear, chiefGearSetBonuses } from '@/modules/chief-gear';
import { decoration, treeOfLife } from '@/modules/daybreak-island';
import { experts } from '@/modules/experts';
import { heroes } from '@/modules/heroes';
import { PET_REFINEMENT_STATS, pets } from '@/modules/pets';
import { research } from '@/modules/research';
import { skins } from '@/modules/skins';
import { tundraAlbum } from '@/modules/tundra-album';
import { vip } from '@/modules/vip';
import { BuffCalculation, BuffPet, BuffProfile } from '@/types';
import { withoutAccountSources } from '../helpers';

const calculateBuffs = (profile: BuffProfile = {}) =>
  withoutAccountSources(calculateBuffsWithAccount(profile));

const RESOURCE_GATHERING_KEYS = [
  'meat-gathering-speed',
  'wood-gathering-speed',
  'coal-gathering-speed',
  'iron-gathering-speed',
];

const category = (result: BuffCalculation, statKey: string, unit = 'percent') =>
  result.categories.find((c) => c.statKey === statKey && c.unit === unit);

describe('calculateBuffs', () => {
  it('has no categories for an empty profile', () => {
    expect(calculateBuffs().categories).toEqual([]);
    expect(calculateBuffs({}).categories).toEqual([]);
  });

  it('exports the top level of the VIP and the Tree of Life', () => {
    expect(BUFF_VIP_MAX_LEVEL).toBe(12);
    expect(BUFF_TREE_OF_LIFE_MAX_LEVEL).toBe(10);
  });
});

describe('calculateBuffs March Queue of the account', () => {
  const marchQueue = (result: BuffCalculation) => category(result, 'march-queue', 'flat')!;

  it('exports the starting March Queue and the pack', () => {
    expect(BUFF_STARTING_MARCH_QUEUE).toBe(1);
    expect(BUFF_MARCH_QUEUE_PACK).toBe(1);
  });

  it('gives a March Queue of 1 to every profile, even an empty one', () => {
    for (const result of [calculateBuffsWithAccount(), calculateBuffsWithAccount({})]) {
      expect(result.categories).toHaveLength(1);
      expect(marchQueue(result)).toMatchObject({
        name: 'March Queue',
        total: 1,
        sources: [
          {
            type: 'account',
            id: 'starting-march-queue',
            label: 'Account: Starting March Queue',
            amount: 1,
          },
        ],
      });
    }
  });

  it('adds 1 March Queue for the pack, and nothing when the pack is false', () => {
    const withPack = calculateBuffsWithAccount({ marchQueuePack: true });
    expect(marchQueue(withPack).total).toBe(2);
    expect(marchQueue(withPack).sources).toEqual([
      {
        type: 'account',
        id: 'starting-march-queue',
        label: 'Account: Starting March Queue',
        amount: 1,
      },
      { type: 'account', id: 'march-queue-pack', label: 'Account: March Queue pack', amount: 1 },
    ]);
    expect(marchQueue(calculateBuffsWithAccount({ marchQueuePack: false })).total).toBe(1);
  });

  it('adds the account to the March Queue of research and VIP, with the account first', () => {
    const vipQueue = vip()
      .find('vip-12')!
      .bonuses.filter((b) => b.statKey === 'march-queue')
      .reduce((sum, b) => sum + b.amount, 0);
    const research = ['command-tactics-i', 'command-tactics-ii', 'command-tactics-iii'];
    const result = calculateBuffsWithAccount({
      marchQueuePack: true,
      vipLevel: 12,
      researchLevels: Object.fromEntries(research.map((id) => [id, 1])),
    });
    expect(vipQueue).toBeGreaterThan(0);
    expect(marchQueue(result).total).toBe(1 + 1 + vipQueue + 3);
    expect(marchQueue(result).sources.map((s) => s.type)).toEqual([
      'account',
      'account',
      'research',
      'research',
      'research',
      'vip',
    ]);
  });

  it('puts March Queue first in the Military group', () => {
    const result = calculateBuffsWithAccount({ marchQueuePack: true, vipLevel: 12 });
    const military = result.groups.find((g) => g.id === 'military')!;
    expect(military.categories[0].statKey).toBe('march-queue');
    expect(BUFF_GROUPS.find((g) => g.id === 'military')!.statKeys[0]).toBe('march-queue');
  });

  it('does not add anything else for the account', () => {
    const result = calculateBuffsWithAccount({ marchQueuePack: true, vipLevel: 1 });
    expect(
      result.categories.flatMap((c) => c.sources).filter((s) => s.type === 'account'),
    ).toHaveLength(2);
    expect(buffGroupOf('march-queue')).toBe('military');
  });
});

describe('calculateBuffs Alliance Facilities', () => {
  const statKeys: Record<string, string> = {
    construction: 'construction-speed',
    defense: 'troops-defense',
    expedition: 'troops-march-speed',
    gathering: 'resource-gathering-speed',
    production: 'resource-production-speed',
    tech: 'research-speed',
    training: 'training-speed',
    weapons: 'troops-attack',
  };

  it('maps every facility of the data to a stat', () => {
    expect(
      allianceFacility()
        .get()
        .map((f) => f.id)
        .sort(),
    ).toEqual(Object.keys(statKeys).sort());
  });

  it('gives the booster of every level of every facility to its stat', () => {
    let checked = 0;
    for (const facility of allianceFacility().get()) {
      for (const level of facility.levels) {
        const result = calculateBuffs({ allianceFacilities: { [facility.id]: [level.level] } });
        const keys =
          facility.id === 'gathering' ? RESOURCE_GATHERING_KEYS : [statKeys[facility.id]];
        expect(result.categories.map((c) => c.statKey).sort()).toEqual([...keys].sort());
        for (const key of keys) {
          expect(category(result, key)).toMatchObject({
            total: level.boosterPercent,
            sources: [
              {
                type: 'allianceFacility',
                id: facility.id,
                label: `Alliance Facility: ${facility.name} Lv ${level.level}`,
                amount: level.boosterPercent,
              },
            ],
          });
        }
        checked++;
      }
    }
    expect(checked).toBe(12);
  });

  it('adds the boosters of both levels of a facility', () => {
    const result = calculateBuffs({ allianceFacilities: { construction: [3, 1] } });
    expect(category(result, 'construction-speed')).toMatchObject({
      total: 13,
      sources: [
        { label: 'Alliance Facility: Construction Lv 1', amount: 5 },
        { label: 'Alliance Facility: Construction Lv 3', amount: 8 },
      ],
    });
  });

  it('adds nothing for an empty list of levels', () => {
    const levels = Object.fromEntries(
      allianceFacility()
        .get()
        .map((f) => [f.id, []]),
    );
    expect(calculateBuffs({ allianceFacilities: levels }).categories).toEqual([]);
  });

  it('adds every level of every facility, one total for each stat', () => {
    const all = Object.fromEntries(
      allianceFacility()
        .get()
        .map((f) => [f.id, f.levels.map((l) => l.level)]),
    );
    const result = calculateBuffs({ allianceFacilities: all });
    const totals = Object.fromEntries(result.categories.map((c) => [c.statKey, c.total]));
    expect(totals).toEqual({
      'construction-speed': 13,
      'troops-defense': 13,
      'troops-march-speed': 15,
      'meat-gathering-speed': 5,
      'wood-gathering-speed': 5,
      'coal-gathering-speed': 5,
      'iron-gathering-speed': 5,
      'resource-production-speed': 5,
      'research-speed': 13,
      'training-speed': 5,
      'troops-attack': 13,
    });
    expect(result.categories.flatMap((c) => c.sources)).toHaveLength(15);
  });

  it('adds the facilities to the other sources of a stat, after Alliance Tech', () => {
    const result = calculateBuffs({
      allianceTech: { 'rapid-deployment-i': 1 },
      allianceFacilities: { expedition: [3] },
    });
    const march = category(result, 'troops-march-speed')!;
    expect(march.sources.map((s) => s.type)).toEqual(['allianceTech', 'allianceFacility']);
    expect(march.total).toBe(march.sources[0].amount + 15);
  });

  it('throws for an unknown facility, a level that the facility does not have, and a repeated level', () => {
    expect(() => calculateBuffs({ allianceFacilities: { nothing: [1] } })).toThrow(
      'Unknown Alliance Facility: nothing',
    );
    expect(() => calculateBuffs({ allianceFacilities: { construction: [2] } })).toThrow(RangeError);
    expect(() => calculateBuffs({ allianceFacilities: { construction: [1, 2] } })).toThrow(
      'The levels of the Alliance Facility construction must be from 1, 3',
    );
    expect(() => calculateBuffs({ allianceFacilities: { construction: [0] } })).toThrow(RangeError);
    expect(() => calculateBuffs({ allianceFacilities: { construction: [3, 3] } })).toThrow(
      'The Alliance Facility construction can hold each level once',
    );
  });
});

describe('calculateBuffs Alliance Prestige Buildings', () => {
  it('gives the bonus of every tier of every building to each of the four resources', () => {
    let checked = 0;
    for (const building of alliancePrestige().get()) {
      for (const level of building.levels) {
        const result = calculateBuffs({ alliancePrestige: { [building.id]: level.name } });
        expect(result.categories.map((c) => c.statKey).sort()).toEqual(
          [...RESOURCE_GATHERING_KEYS].sort(),
        );
        for (const key of RESOURCE_GATHERING_KEYS) {
          expect(category(result, key)).toMatchObject({
            total: level.bonuses[0].amount,
            sources: [
              {
                type: 'alliancePrestige',
                id: building.id,
                label: `Alliance Prestige: ${building.name} ${level.name}`,
                amount: level.bonuses[0].amount,
              },
            ],
          });
        }
        checked++;
      }
    }
    expect(checked).toBe(24);
  });

  it('adds the buildings together, one tier for each building', () => {
    const all = Object.fromEntries(
      alliancePrestige()
        .get()
        .map((b) => [b.id, b.levels[3].name]),
    );
    const result = calculateBuffs({ alliancePrestige: all });
    for (const key of RESOURCE_GATHERING_KEYS) {
      expect(category(result, key)!.total).toBe(60);
      expect(category(result, key)!.sources).toHaveLength(6);
    }
    const gold = calculateBuffs({ alliancePrestige: { 'championship-statue': 'Gold' } });
    expect(category(gold, 'iron-gathering-speed')!.total).toBe(5);
  });

  it('puts the prestige buildings after the facilities and before VIP in a list of sources', () => {
    const result = calculateBuffs({
      vipLevel: 12,
      allianceFacilities: { gathering: [1] },
      alliancePrestige: { guardian: 'Tier 1' },
    });
    const types = category(result, 'meat-gathering-speed')!.sources.map((s) => s.type);
    expect(types).toEqual(['allianceFacility', 'alliancePrestige', ...types.slice(2)]);
  });

  it('throws for an unknown building and for a tier that the building does not have', () => {
    expect(() => calculateBuffs({ alliancePrestige: { nothing: 'Gold' } })).toThrow(
      'Unknown Alliance Prestige Building: nothing',
    );
    expect(() => calculateBuffs({ alliancePrestige: { guardian: 'Gold' } })).toThrow(RangeError);
    expect(() => calculateBuffs({ alliancePrestige: { guardian: 'Gold' } })).toThrow(
      'The tier of the Alliance Prestige Building guardian must be one of Tier 1, Tier 2, Tier 3, Tier 4',
    );
  });
});

describe('calculateBuffs Tundra Albums', () => {
  it('gives the buff of a complete album, and nothing for an album that is not listed', () => {
    for (const album of tundraAlbum().get()) {
      const result = calculateBuffs({ tundraAlbums: [album.id] });
      const key = album.buff.statKey;
      const keys = key === 'resource-gathering-speed' ? RESOURCE_GATHERING_KEYS : [key];
      expect(result.categories.map((c) => c.statKey).sort()).toEqual([...keys].sort());
      for (const statKey of keys) {
        expect(category(result, statKey)).toMatchObject({
          total: album.buff.amount,
          unit: 'percent',
          sources: [
            {
              type: 'tundraAlbum',
              id: album.id,
              label: `Tundra Album: ${album.name}`,
              amount: album.buff.amount,
            },
          ],
        });
      }
    }
    expect(calculateBuffs({ tundraAlbums: [] }).categories).toEqual([]);
  });

  it.each([
    ['crystalline-mysteries', 'troops-attack', 2],
    ['daybreak-island', 'troops-defense', 2],
    ['explore-the-world', 'troops-attack', 2],
    ['song-of-heroes', 'meat-gathering-speed', 5],
    ['rekindled-flames', 'resource-production-speed', 5],
  ])('gives %s the stat %s with %d percent', (id, statKey, amount) => {
    expect(category(calculateBuffs({ tundraAlbums: [id] }), statKey)!.total).toBe(amount);
  });

  it('adds up the albums that give the same stat', () => {
    const result = calculateBuffs({
      tundraAlbums: ['crystalline-mysteries', 'explore-the-world', 'daybreak-island'],
    });
    expect(category(result, 'troops-attack')!.total).toBe(4);
    expect(category(result, 'troops-attack')!.sources).toHaveLength(2);
    expect(category(result, 'troops-defense')!.total).toBe(2);
  });

  it('puts the albums after the skins in a list of sources', () => {
    const skin = skins()
      .get()
      .find((s) => s.bonus?.statKey === 'troops-attack')!;
    const result = calculateBuffs({
      tundraAlbums: ['crystalline-mysteries'],
      skins: [skin.id],
      vipLevel: 12,
    });
    const types = category(result, 'troops-attack')!.sources.map((s) => s.type);
    expect(types.indexOf('skin')).toBeLessThan(types.indexOf('tundraAlbum'));
    expect(types.indexOf('vip')).toBeLessThan(types.indexOf('skin'));
  });

  it('lists the albums under their own source group', () => {
    const result = calculateBuffs({ tundraAlbums: ['song-of-heroes'] });
    expect(result.bySource.map((g) => g.name)).toEqual(['Tundra Album']);
  });
});

describe('calculateBuffs general Resource Gathering Speed', () => {
  it('counts a general gathering speed in each of the four resources and has no category of its own', () => {
    const skin = skins()
      .get()
      .find((s) => s.bonus?.statKey === 'resource-gathering-speed')!;
    const result = calculateBuffs({ skins: [skin.id] });
    expect(result.categories.map((c) => c.statKey).sort()).toEqual(
      [...RESOURCE_GATHERING_KEYS].sort(),
    );
    expect(result.categories.some((c) => c.statKey === 'resource-gathering-speed')).toBe(false);
    for (const key of RESOURCE_GATHERING_KEYS) {
      expect(category(result, key)).toMatchObject({
        total: skin.bonus!.amount,
        group: 'resources',
        sources: [{ type: 'skin', id: skin.id }],
      });
    }
    expect(result.groups.map((g) => g.id)).toEqual(['resources']);
  });

  it('adds the general gathering speed to the speed of one resource from a hero or research', () => {
    const result = calculateBuffs({
      heroSkills: [{ heroId: 'smith', skills: { Craftsmanship: 5 } }],
      allianceFacilities: { gathering: [1] },
      alliancePrestige: { 'championship-statue': 'Ultimate' },
    });
    expect(category(result, 'iron-gathering-speed')).toMatchObject({ total: 25 + 5 + 10 });
    expect(category(result, 'iron-gathering-speed')!.sources.map((s) => s.type)).toEqual([
      'hero',
      'allianceFacility',
      'alliancePrestige',
    ]);
    expect(category(result, 'wood-gathering-speed')!.total).toBe(15);
  });

  it('keeps the gathering speed of one resource as it is when no general gathering speed is given', () => {
    const result = calculateBuffs({
      heroSkills: [{ heroId: 'smith', skills: { Craftsmanship: 5 } }],
    });
    expect(result.categories.map((c) => c.statKey)).toEqual(['iron-gathering-speed']);
  });
});

describe('calculateBuffs bySource', () => {
  const profile = {
    marchQueuePack: true,
    vipLevel: 12,
    researchLevels: { 'trainer-tools-i': 3, 'flame-legion': 12, 'meat-output-i': 3 },
    heroSkills: [{ heroId: 'ling-xue', skills: { 'Total Control': 4 } }],
    allianceFacilities: { gathering: [1], construction: [1, 3] },
    alliancePrestige: { 'championship-statue': 'Gold' },
    treeOfLifeLevel: 5,
    decorations: [
      {
        id: decoration()
          .get()
          .find((d) => (d.levels?.length ?? 0) > 0)!.id,
        level: 1,
        copies: 1,
      },
    ],
    buildingLevels: { 'command-center': 'FC 5', 'research-center': '30' },
    experts: [{ expertId: 'gareth', skills: { 'Rallying Cry': 3 } }],
  };
  const groupOf = (result: BuffCalculation, id: string) => result.bySource.find((g) => g.id === id);

  it('gives only the account for an empty profile', () => {
    expect(calculateBuffsWithAccount().bySource).toEqual([
      {
        id: 'account',
        name: 'Account',
        stats: [{ statKey: 'march-queue', name: 'March Queue', unit: 'flat', total: 1 }],
      },
    ]);
  });

  it('gives each source group its name and the name and total of each stat, with no sources', () => {
    const result = calculateBuffsWithAccount(profile);
    for (const group of result.bySource) {
      expect(Object.keys(group)).toEqual(['id', 'name', 'stats']);
      expect(group.stats.length).toBeGreaterThan(0);
      for (const stat of group.stats) {
        expect(Object.keys(stat)).toEqual(['statKey', 'name', 'unit', 'total']);
      }
    }
    expect(groupOf(result, 'hero')).toEqual({
      id: 'hero',
      name: 'Heroes',
      stats: [{ statKey: 'training-speed', name: 'Training Speed', unit: 'percent', total: 16 }],
    });
    expect(groupOf(result, 'alliancePrestige')!.stats.map((s) => [s.name, s.total])).toEqual([
      ['Meat Gathering Speed', 5],
      ['Wood Gathering Speed', 5],
      ['Coal Gathering Speed', 5],
      ['Iron Gathering Speed', 5],
    ]);
  });

  it('splits research by queue and joins the Tree of Life and the decorations', () => {
    const result = calculateBuffsWithAccount(profile);
    expect(groupOf(result, 'research')!.name).toBe('Research (Research Center)');
    expect(groupOf(result, 'warAcademyResearch')!.name).toBe('Research (War Academy)');
    expect(groupOf(result, 'warAcademyResearch')!.stats.map((s) => s.statKey)).toEqual([
      'rally-capacity',
    ]);
    expect(groupOf(result, 'research')!.stats.map((s) => s.statKey)).toContain('training-speed');
    expect(groupOf(result, 'research')!.stats.map((s) => s.statKey)).not.toContain(
      'rally-capacity',
    );
    expect(groupOf(result, 'island')!.name).toBe('My Island');
    expect(groupOf(result, 'treeOfLife')).toBeUndefined();
    expect(groupOf(result, 'decoration')).toBeUndefined();
    const island = calculateBuffsWithAccount({ treeOfLifeLevel: 5 });
    expect(groupOf(island, 'island')!.stats.length).toBeGreaterThan(0);
  });

  it('lists the source groups in a fixed order and leaves out the ones with nothing', () => {
    const result = calculateBuffsWithAccount(profile);
    expect(result.bySource.map((g) => g.id)).toEqual([
      'account',
      'hero',
      'expert',
      'research',
      'warAcademyResearch',
      'allianceFacility',
      'alliancePrestige',
      'vip',
      'building',
      'island',
    ]);
  });

  it('lists the stats of a source group in the order of the stat groups', () => {
    const result = calculateBuffsWithAccount(profile);
    const order = result.groups.flatMap((g) => g.categories.map((c) => `${c.statKey}|${c.unit}`));
    for (const group of result.bySource) {
      const positions = group.stats.map((s) => order.indexOf(`${s.statKey}|${s.unit}`));
      expect(positions.every((p) => p >= 0)).toBe(true);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });

  it('adds up to the total of every category', () => {
    const profiles = [
      profile,
      { vipLevel: 12, castleAppointment: 'supreme-president' },
      { allianceFacilities: { construction: [1, 3] }, buildingLevels: { 'research-center': '30' } },
      { researchLevels: { 'meat-output-i': 3, 'meat-output-ii': 3 }, marchQueuePack: true },
    ];
    for (const p of profiles) {
      const result = calculateBuffsWithAccount(p);
      for (const category of result.categories) {
        const sum = result.bySource
          .flatMap((g) => g.stats)
          .filter((s) => s.statKey === category.statKey && s.unit === category.unit)
          .reduce((total, s) => total + s.total, 0);
        expect(sum).toBeCloseTo(category.total, 3);
      }
      const known = new Set(result.categories.map((c) => `${c.statKey}|${c.unit}`));
      for (const stat of result.bySource.flatMap((g) => g.stats)) {
        expect(known.has(`${stat.statKey}|${stat.unit}`)).toBe(true);
      }
    }
  });

  it('gives the same view for the sources that the helper keeps', () => {
    const result = calculateBuffs({ vipLevel: 12 });
    expect(result.bySource.map((g) => g.id)).toEqual(['vip']);
  });
});

describe('calculateBuffs groups', () => {
  it('lists the groups in the order Military, Resources, Resource Output, Growth, Alliance, Other', () => {
    expect(BUFF_GROUPS.map((g) => g.name)).toEqual([
      'Military',
      'Resources',
      'Resource Output',
      'Growth',
      'Alliance',
      'Other',
    ]);
    expect(BUFF_GROUPS.map((g) => g.id)).toEqual([
      'military',
      'resources',
      'resource-output',
      'growth',
      'alliance',
      'other',
    ]);
  });

  it('draws the moved stats in their new groups from real sources', () => {
    const result = calculateBuffs({
      researchLevels: {
        'meat-output-i': 3,
        'wood-output-i': 3,
        'coal-output-i': 3,
        'iron-output-i': 3,
      },
      heroSkills: [{ heroId: 'zinman', skills: { Bastionist: 5 } }],
      experts: [
        { expertId: 'agnes', skills: { 'Project Management': 5 } },
        { expertId: 'romulus', skills: { 'One Heart': 20, "Commander's Crest": 11 } },
      ],
    });
    const keysOf = (id: string) =>
      result.groups.find((g) => g.id === id)!.categories.map((c) => c.statKey);
    expect(result.groups.map((g) => g.id)).toEqual(['military', 'resource-output', 'growth']);
    expect(keysOf('military')).toEqual(['troops-deployment-capacity', 'rally-capacity']);
    expect(keysOf('resource-output')).toEqual([
      'meat-output',
      'wood-output',
      'coal-output',
      'iron-output',
    ]);
    expect(keysOf('growth')).toEqual([
      'construction-speed',
      'research-speed',
      'resource-consumption-reduction',
      'construction-speed-boost',
    ]);
    expect(result.groups.find((g) => g.id === 'resource-output')!.name).toBe('Resource Output');
  });

  it('puts Rally Capacity in Military right after Troops Deployment Capacity', () => {
    const keys = BUFF_GROUPS.find((g) => g.id === 'military')!.statKeys;
    expect(keys.indexOf('rally-capacity')).toBe(keys.indexOf('troops-deployment-capacity') + 1);
  });

  it('puts the four outputs in Resource Output and the two stats in Growth', () => {
    const keysOf = (id: string) => BUFF_GROUPS.find((g) => g.id === id)!.statKeys;
    expect(keysOf('resource-output')).toEqual([
      'meat-output',
      'wood-output',
      'coal-output',
      'iron-output',
    ]);
    expect(keysOf('growth').slice(-4)).toEqual([
      'resource-consumption-reduction',
      'construction-speed-boost',
      'resource-production-speed',
      'storehouse-capacity',
    ]);
  });

  it('puts Infirmary Capacity, Reinforce Capacity, and Troop Formation at the bottom of Military', () => {
    const keys = BUFF_GROUPS.find((g) => g.id === 'military')!.statKeys;
    expect(keys.slice(-3)).toEqual(['infirmary-capacity', 'reinforce-capacity', 'troop-formation']);
  });

  it('puts the Embassy stats and Rally Governor Cap in Alliance, in the order of the names', () => {
    const result = calculateBuffs({
      buildingLevels: { embassy: '30' },
      allianceTech: { 'alliance-regimentation-i': 1 },
    });
    const alliance = result.groups.find((g) => g.id === 'alliance')!;
    const names = alliance.categories.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['Ally Assists', 'Ally Help Time']));
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(BUFF_GROUPS.find((g) => g.id === 'alliance')!.statKeys).toEqual([]);
  });

  it.each([
    ['march-queue', 'military'],
    ['troops-deployment-capacity', 'military'],
    ['troops-march-speed', 'military'],
    ['wilderness-march-speed', 'military'],
    ['training-capacity', 'military'],
    ['training-speed', 'military'],
    ['healing-speed', 'military'],
    ['troops-attack', 'military'],
    ['troops-lethality', 'military'],
    ['infantry-health', 'military'],
    ['lancer-defense', 'military'],
    ['marksman-attack', 'military'],
    ['meat-gathering-speed', 'resources'],
    ['wood-gathering-speed', 'resources'],
    ['coal-gathering-speed', 'resources'],
    ['iron-gathering-speed', 'resources'],
    ['rally-capacity', 'military'],
    ['meat-output', 'resource-output'],
    ['wood-output', 'resource-output'],
    ['coal-output', 'resource-output'],
    ['iron-output', 'resource-output'],
    ['resource-consumption-reduction', 'growth'],
    ['construction-speed-boost', 'growth'],
    ['construction-speed', 'growth'],
    ['research-speed', 'growth'],
    ['hunting-march-speed', 'growth'],
    ['alliance-help-time', 'alliance'],
    ['alliance-construction-speed', 'alliance'],
    ['enemy-alliance-building-destruction-speed', 'alliance'],
    ['rally-governor-cap', 'alliance'],
    ['ally-assists', 'alliance'],
    ['ally-help-time', 'alliance'],
    ['infirmary-capacity', 'military'],
    ['reinforce-capacity', 'military'],
    ['troop-formation', 'military'],
    ['resource-production-speed', 'growth'],
    ['storehouse-capacity', 'growth'],
    ['sawmill-output', 'other'],
    ['stamina-cost-reduction', 'other'],
  ])('puts %s in %s', (statKey, group) => {
    expect(buffGroupOf(statKey)).toBe(group);
  });

  it('gives every category its group and lists the categories again in the groups', () => {
    const result = calculateBuffs({
      heroSkills: [{ heroId: 'ling-xue', skills: { 'Total Control': 4 } }],
      researchLevels: { 'trainer-tools-i': 3 },
      allianceTech: { 'advanced-training-i': 2, 'treaties-i': 1 },
      buildingLevels: { 'research-center': '30' },
      vipLevel: 12,
      chiefOrders: ['double-time'],
    });
    for (const c of result.categories) expect(c.group).toBe(buffGroupOf(c.statKey));
    expect(
      result.groups.flatMap((g) => g.categories).sort((a, b) => a.name.localeCompare(b.name)),
    ).toEqual(result.categories);
    expect(result.groups.map((g) => g.id)).toEqual(['military', 'growth', 'alliance', 'other']);
  });

  it('orders the categories of a group as the group lists them', () => {
    const result = calculateBuffs({ vipLevel: 12, castleAppointment: 'supreme-president' });
    const military = result.groups.find((g) => g.id === 'military')!;
    expect(military.categories.map((c) => c.statKey)).toEqual([
      'march-queue',
      'troops-attack',
      'troops-defense',
      'troops-lethality',
      'troops-health',
      'troop-formation',
    ]);
  });

  it('orders the Alliance group by name', () => {
    const nodes = allianceTech()
      .get()
      .filter((n) => n.statKey?.startsWith('alliance-'));
    const result = calculateBuffs({
      allianceTech: Object.fromEntries(nodes.map((n) => [n.id, 1])),
    });
    const names = result.groups.find((g) => g.id === 'alliance')!.categories.map((c) => c.name);
    expect(names.length).toBeGreaterThan(3);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('gives the deployment capacity of research and of the island one stat key', () => {
    const result = calculateBuffs({
      researchLevels: Object.fromEntries(
        research()
          .get()
          .filter((n) => n.levels[0].bonus.some((b) => b.statKey === 'troops-deployment-capacity'))
          .map((n) => [n.id, 1]),
      ),
      treeOfLifeLevel: treeOfLife()
        .get()
        .find((l) => /Deployment/.test(l.buff.stat))!.level,
    });
    const capacity = result.categories.filter((c) => c.statKey.includes('deployment-capacity'));
    expect(capacity.map((c) => c.statKey)).toEqual(['troops-deployment-capacity']);
    expect(new Set(capacity[0].sources.map((s) => s.type))).toEqual(
      new Set(['research', 'treeOfLife']),
    );
  });
});

describe('calculateBuffs hero skills', () => {
  it('gives the Training Speed of Total Control of Ling Xue at level 4', () => {
    const result = calculateBuffs({
      heroSkills: [{ heroId: 'ling-xue', skills: { 'Total Control': 4 } }],
    });
    expect(result.categories).toEqual([
      {
        statKey: 'training-speed',
        group: 'military',
        name: 'Training Speed',
        unit: 'percent',
        total: 16,
        sources: [
          {
            type: 'hero',
            id: 'ling-xue',
            label: 'Hero: Ling Xue, Skill: Total Control Lv 4',
            amount: 16,
          },
        ],
      },
    ]);
  });

  it('reads the amount of the level that is given', () => {
    const levels = heroes()
      .find('ling-xue')!
      .skills.expedition.find((s) => s.name === 'Total Control')!.levels;
    for (const level of [1, 2, 3, 4, 5]) {
      const result = calculateBuffs({
        heroSkills: [{ heroId: 'ling-xue', skills: { 'Total Control': level } }],
      });
      expect(category(result, 'training-speed')!.total).toBe(levels[level - 1].effects[0].amount);
    }
  });

  it('adds nothing for a battle skill, a skill at level 0, or a talent without a city effect', () => {
    const result = calculateBuffs({
      heroSkills: [
        { heroId: 'gina', skills: { 'Incendiary Arrow': 3, 'Endurance Training': 0 } },
        { heroId: 'jeronimo', skills: { 'Natural Leader': 5 } },
      ],
    });
    expect(result.categories).toEqual([]);
  });

  it('lists the skills that only apply while you use the hero', () => {
    expect(BUFF_HERO_ONLY_SKILLS).toEqual([
      { heroId: 'smith', skill: 'Burnished Iron' },
      { heroId: 'eugene', skill: 'Woodland Inheritor' },
      { heroId: 'charlie', skill: 'Demolitions Expert' },
      { heroId: 'cloris', skill: 'Top Hunter' },
      { heroId: 'gina', skill: 'Endurance Training' },
      { heroId: 'gina', skill: 'Quick Paced' },
      { heroId: 'lumak-bokan', skill: 'Emerald Warrior' },
    ]);
  });

  it('adds nothing for these skills at any level', () => {
    for (const { heroId, skill } of BUFF_HERO_ONLY_SKILLS) {
      const levels = heroes()
        .find(heroId)!
        .skills.expedition.find((s) => s.name === skill)!.levels.length;
      for (let level = 0; level <= levels; level++) {
        const result = calculateBuffs({ heroSkills: [{ heroId, skills: { [skill]: level } }] });
        expect(result.categories).toEqual([]);
      }
    }
  });

  it('still checks the level of a skill that adds nothing', () => {
    expect(() =>
      calculateBuffs({ heroSkills: [{ heroId: 'gina', skills: { 'Quick Paced': 6 } }] }),
    ).toThrow(RangeError);
    expect(() =>
      calculateBuffs({ heroSkills: [{ heroId: 'smith', skills: { 'Burnished Iron': 99 } }] }),
    ).toThrow(RangeError);
  });

  it('counts the city skills of eight heroes, and every skill on the list adds nothing', () => {
    const counted = new Set<string>();
    for (const hero of heroes().get()) {
      const skills = [
        ...hero.skills.exploration,
        ...hero.skills.expedition,
        ...(hero.skills.talent ? [hero.skills.talent] : []),
      ];
      for (const skill of skills) {
        const gives = calculateBuffs({
          heroSkills: [{ heroId: hero.id, skills: { [skill.name]: skill.levels.length } }],
        }).categories.length;
        const listed = BUFF_HERO_ONLY_SKILLS.some(
          (s) => s.heroId === hero.id && s.skill === skill.name,
        );
        if (listed) expect(gives).toBe(0);
        if (gives > 0) counted.add(hero.id);
      }
    }
    expect([...counted].sort()).toEqual([
      'charlie',
      'cloris',
      'eugene',
      'jasser',
      'ling-xue',
      'seo-yoon',
      'smith',
      'zinman',
    ]);
  });

  it.each([
    ['ling-xue', 'Total Control', { 'training-speed': 20 }],
    ['jasser', 'Enlightened Warfare', { 'research-speed': 15 }],
    ['seo-yoon', 'Soothing Dance', { 'healing-speed': 50 }],
    ['zinman', 'Bastionist', { 'construction-speed': 15, 'resource-consumption-reduction': 15 }],
    ['smith', 'Craftsmanship', { 'iron-gathering-speed': 25 }],
    ['eugene', 'Master Woodcutter', { 'wood-gathering-speed': 25 }],
    ['charlie', 'Coal Extraction', { 'coal-gathering-speed': 25 }],
    ['cloris', 'Predator', { 'meat-gathering-speed': 25 }],
  ])('gives the skill %s %s at its top level', (heroId, skill, expected) => {
    const levels = heroes()
      .find(heroId)!
      .skills.expedition.find((s) => s.name === skill)!.levels.length;
    const result = calculateBuffs({ heroSkills: [{ heroId, skills: { [skill]: levels } }] });
    expect(Object.fromEntries(result.categories.map((c) => [c.statKey, c.total]))).toEqual(
      expected,
    );
  });

  it('sums the skills of several heroes in one category', () => {
    const training = heroes()
      .get()
      .flatMap((h) =>
        [...h.skills.exploration, ...h.skills.expedition].map((s) => ({ hero: h.id, skill: s })),
      )
      .filter((x) => x.skill.levels[0].effects.some((e) => e.name === 'Training Speed'));
    const result = calculateBuffs({
      heroSkills: training.map((x) => ({ heroId: x.hero, skills: { [x.skill.name]: 5 } })),
    });
    const sum = training.reduce(
      (total, x) =>
        total + x.skill.levels[4].effects.find((e) => e.name === 'Training Speed')!.amount,
      0,
    );
    expect(category(result, 'training-speed')!.total).toBe(sum);
    expect(category(result, 'training-speed')!.sources).toHaveLength(training.length);
  });

  it('works at the top level of every skill of every hero', () => {
    const heroSkills = heroes()
      .get()
      .map((h) => ({
        heroId: h.id,
        skills: Object.fromEntries(
          [
            ...h.skills.exploration,
            ...h.skills.expedition,
            ...(h.skills.talent ? [h.skills.talent] : []),
          ].map((s) => [s.name, s.levels.length]),
        ),
      }));
    const result = calculateBuffs({ heroSkills });
    expect(result.categories.map((c) => c.statKey).sort()).toEqual([
      'coal-gathering-speed',
      'construction-speed',
      'healing-speed',
      'iron-gathering-speed',
      'meat-gathering-speed',
      'research-speed',
      'resource-consumption-reduction',
      'training-speed',
      'wood-gathering-speed',
    ]);
    for (const c of result.categories) {
      expect(c.statKey).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(c.sources.length).toBeGreaterThan(0);
    }
  });
});

describe('calculateBuffs experts', () => {
  const talent = experts().find('gareth')!.talent;
  const progression = (label: string) => talent.progressions.find((p) => p.label === label)!.values;

  it('gives the Healing Speed and Infirmary Capacity of the talent of Gareth at its level', () => {
    const result = calculateBuffs({
      experts: [{ expertId: 'gareth', skills: { 'Rallying Cry': 3 } }],
    });
    expect(category(result, 'healing-speed')).toMatchObject({
      total: 10,
      sources: [
        {
          type: 'expert',
          id: 'gareth',
          label: 'Expert: Gareth, Talent: Rallying Cry Lv 3',
          amount: 10,
        },
      ],
    });
    expect(category(result, 'infirmary-capacity', 'flat')!.total).toBe(80000);
  });

  it('reads every level of the talent from its progressions', () => {
    const healing = progression('Healing Speed');
    const capacity = progression('Infirmary Capacity');
    expect(healing).toEqual([3, 6, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
    for (let level = 1; level <= talent.maxLevel; level++) {
      const result = calculateBuffs({
        experts: [{ expertId: 'gareth', skills: { 'Rallying Cry': level } }],
      });
      expect(category(result, 'healing-speed')!.total).toBe(healing[level - 1]);
      expect(category(result, 'infirmary-capacity', 'flat')!.total).toBe(capacity[level - 1]);
    }
  });

  it('gives the skills of Gareth to Troops Defense and Health, and the enemy Lethality', () => {
    const result = calculateBuffs({
      experts: [
        {
          expertId: 'gareth',
          skills: { Porcupine: 20, 'Undefeated Will': 10, 'Fearsome Reputation': 20 },
        },
      ],
    });
    expect(category(result, 'troops-defense')!.total).toBe(50);
    expect(category(result, 'troops-health')!.total).toBe(15);
    expect(category(result, 'enemy-lethality-reduction')!.total).toBe(5);
    expect(category(result, 'enemy-lethality-reduction')!.sources[0].label).toBe(
      'Expert: Gareth, Skill: Fearsome Reputation Lv 20',
    );
  });

  it('gives each skill of Romulus to two stats with the same amount', () => {
    const result = calculateBuffs({
      experts: [{ expertId: 'romulus', skills: { 'Last Line': 3, 'Spirit of Aeetis': 20 } }],
    });
    expect(category(result, 'troops-attack')!.total).toBe(1.5);
    expect(category(result, 'troops-defense')!.total).toBe(1.5);
    expect(category(result, 'troops-lethality')!.total).toBe(10);
    expect(category(result, 'troops-health')!.total).toBe(10);
  });

  it("gives the Deployment Capacity of the talent Commander's Crest of Romulus", () => {
    const values = experts()
      .find('romulus')!
      .talent.progressions.find((p) => p.label === 'Deployment Capacity')!.values;
    expect(values).toEqual([300, 600, 1000, 1500, 2000, 3000, 4000, 5500, 7000, 8500, 10000]);
    values.forEach((amount, i) => {
      const result = calculateBuffs({
        experts: [{ expertId: 'romulus', skills: { "Commander's Crest": i + 1 } }],
      });
      expect(category(result, 'troops-deployment-capacity', 'flat')).toMatchObject({
        total: amount,
        sources: [
          {
            type: 'expert',
            label: `Expert: Romulus, Talent: Commander's Crest Lv ${i + 1}`,
            amount,
          },
        ],
      });
    });
  });

  it('gives the Rally Capacity of One Heart of Romulus in flat troops', () => {
    const values = experts()
      .find('romulus')!
      .skills.find((s) => s.name === 'One Heart')!
      .progressions.find((p) => p.label === 'Rally Capacity')!.values;
    for (const level of [1, 10, 20]) {
      const result = calculateBuffs({
        experts: [{ expertId: 'romulus', skills: { 'One Heart': level } }],
      });
      expect(category(result, 'rally-capacity', 'flat')).toMatchObject({
        name: 'Rally Capacity',
        total: values[level - 1],
        sources: [{ type: 'expert', label: `Expert: Romulus, Skill: One Heart Lv ${level}` }],
      });
    }
    expect(values[0]).toBe(5000);
    expect(values[19]).toBe(100000);
  });

  it('gives Project Management of Agnes as hours saved on every build and a Research Speed', () => {
    const skill = experts()
      .find('agnes')!
      .skills.find((s) => s.name === 'Project Management')!;
    const hours = skill.progressions.find((p) => p.label === 'Speed Boost (Hours)')!.values;
    const research = skill.progressions.find((p) => p.label === 'Increases Research Speed')!.values;
    expect(hours).toEqual([2, 3, 4, 6, 8]);
    expect(research).toEqual([1, 2, 3, 4, 5]);
    for (let level = 1; level <= 5; level++) {
      const result = calculateBuffs({
        experts: [{ expertId: 'agnes', skills: { 'Project Management': level } }],
      });
      expect(category(result, 'construction-speed-boost', 'hours')).toMatchObject({
        name: 'Construction Speed Boost',
        total: hours[level - 1],
      });
      expect(category(result, 'research-speed')!.total).toBe(research[level - 1]);
    }
  });

  it('adds the Research Speed of Agnes to the other sources, but not the hours', () => {
    const result = calculateBuffs({
      experts: [{ expertId: 'agnes', skills: { 'Project Management': 5 } }],
      buildingLevels: { 'research-center': '30' },
    });
    expect(category(result, 'research-speed')!.total).toBe(8);
    expect(category(result, 'research-speed')!.sources.map((s) => s.type)).toEqual([
      'expert',
      'building',
    ]);
    expect(category(result, 'construction-speed')).toBeUndefined();
  });

  it('adds nothing for a skill at level 0 or for a skill that does not always apply', () => {
    const result = calculateBuffs({
      experts: [
        { expertId: 'gareth', skills: { 'Rallying Cry': 0 } },
        { expertId: 'cyrille', skills: { Entrapment: 10 } },
      ],
    });
    expect(result.categories).toEqual([]);
  });

  it('adds the talent of Gareth to the Healing Speed of Seo-yoon, the hero first', () => {
    const skill = heroes()
      .find('seo-yoon')!
      .skills.expedition.find((s) => s.levels[0].effects.some((e) => e.name === 'Healing Speed'))!;
    const hero = skill.levels[4].effects.find((e) => e.name === 'Healing Speed')!.amount;
    const result = calculateBuffs({
      experts: [{ expertId: 'gareth', skills: { 'Rallying Cry': 3 } }],
      heroSkills: [{ heroId: 'seo-yoon', skills: { [skill.name]: 5 } }],
    });
    const healing = category(result, 'healing-speed')!;
    expect(hero).toBe(50);
    expect(healing.total).toBe(60);
    expect(healing.sources.map((s) => s.type)).toEqual(['hero', 'expert']);
  });

  it('lists the skills that count', () => {
    expect(BUFF_EXPERT_SKILLS).toEqual([
      { expertId: 'gareth', skill: 'Porcupine' },
      { expertId: 'gareth', skill: 'Undefeated Will' },
      { expertId: 'gareth', skill: 'Fearsome Reputation' },
      { expertId: 'gareth', skill: 'Rallying Cry' },
      { expertId: 'romulus', skill: 'Last Line' },
      { expertId: 'romulus', skill: "Commander's Crest" },
      { expertId: 'romulus', skill: 'One Heart' },
      { expertId: 'romulus', skill: 'Spirit of Aeetis' },
      { expertId: 'agnes', skill: 'Project Management' },
    ]);
  });

  it('works at the top level of every skill that counts', () => {
    const grouped = new Map<string, Record<string, number>>();
    for (const { expertId, skill } of BUFF_EXPERT_SKILLS) {
      const expert = experts().find(expertId)!;
      const found = [...expert.skills, expert.talent].find((s) => s.name === skill)!;
      grouped.set(expertId, { ...(grouped.get(expertId) ?? {}), [skill]: found.maxLevel });
    }
    const result = calculateBuffs({
      experts: [...grouped].map(([expertId, skills]) => ({ expertId, skills })),
    });
    expect(category(result, 'healing-speed')!.total).toBe(50);
    expect(category(result, 'troops-defense')!.total).toBe(60);
    expect(category(result, 'troops-health')!.total).toBe(60);
    expect(category(result, 'rally-capacity', 'flat')!.total).toBe(100000);
    expect(category(result, 'troops-deployment-capacity', 'flat')!.total).toBe(10000);
    expect(category(result, 'research-speed')!.total).toBe(5);
    expect(category(result, 'construction-speed-boost', 'hours')!.total).toBe(8);
  });
});

describe('calculateBuffs research and Alliance Tech', () => {
  it('gives Trainer Tools II to VII to Training Speed and not to Training Capacity', () => {
    const ids = ['ii', 'iii', 'iv', 'v', 'vi', 'vii'].map((n) => `trainer-tools-${n}`);
    const result = calculateBuffs({
      researchLevels: Object.fromEntries(ids.map((id) => [id, 1])),
    });
    expect(result.categories.map((c) => c.statKey)).toEqual(['training-speed']);
    expect(category(result, 'training-speed')!.sources).toHaveLength(6);
    expect(category(result, 'training-speed')!.total).toBeCloseTo(
      4.6 + 6.8 + 9 + 11.2 + 13.4 + 13.4,
      6,
    );
  });

  it('reads the total amount of the level of a research node', () => {
    const node = research().find('trainer-tools-i')!;
    const result = calculateBuffs({ researchLevels: { 'trainer-tools-i': 3 } });
    const bonus = node.levels[2].bonus.find((b) => b.statKey === 'training-speed')!;
    expect(category(result, 'training-speed')).toMatchObject({
      total: bonus.totalAmount,
      sources: [
        {
          type: 'research',
          id: 'trainer-tools-i',
          label: 'Research: Trainer Tools I Lv 3',
          amount: bonus.totalAmount,
        },
      ],
    });
  });

  it('adds nothing for a research level of 0 or a bonus without a stat', () => {
    expect(calculateBuffs({ researchLevels: { 'trainer-tools-i': 0 } }).categories).toEqual([]);
    expect(calculateBuffs({ researchLevels: { 'helios-infantry': 1 } }).categories).toEqual([]);
  });

  it('reads the amount of the level of an Alliance Tech node', () => {
    const node = allianceTech().find('advanced-training-i')!;
    const result = calculateBuffs({ allianceTech: { 'advanced-training-i': 2 } });
    expect(category(result, 'training-speed')).toMatchObject({
      total: node.levels[1].amount,
      sources: [{ type: 'allianceTech', label: 'Alliance Tech: Advanced Training I Lv 2' }],
    });
  });

  it('adds nothing for an Alliance Tech level of 0 or a node without a stat', () => {
    expect(calculateBuffs({ allianceTech: { 'advanced-training-i': 0 } }).categories).toEqual([]);
    expect(calculateBuffs({ allianceTech: { 'tundra-surveying': 1 } }).categories).toEqual([]);
  });
});

describe('calculateBuffs troop types', () => {
  it.each(['infantry', 'lancer', 'marksman'])('keeps the %s Lethality and Health apart', (type) => {
    const nodeWith = (statKey: string) =>
      research()
        .get()
        .find((n) => n.levels[0].bonus.some((b) => b.statKey === statKey))!;
    const lethality = nodeWith(`${type}-lethality`);
    const health = nodeWith(`${type}-health`);
    const result = calculateBuffs({
      researchLevels: { [lethality.id]: 1, [health.id]: 1 },
      vipLevel: 12,
    });
    const own = (statKey: string, node: typeof lethality) =>
      node.levels[0].bonus.find((b) => b.statKey === statKey)!.totalAmount;
    expect(category(result, `${type}-lethality`)!.total).toBe(own(`${type}-lethality`, lethality));
    expect(category(result, `${type}-health`)!.total).toBe(own(`${type}-health`, health));
    expect(category(result, `${type}-lethality`)!.name).toBe(
      `${type[0].toUpperCase()}${type.slice(1)} Lethality`,
    );
    expect(category(result, 'troops-lethality')!.total).toBe(16);
    expect(category(result, 'troops-lethality')!.sources.map((s) => s.type)).toEqual(['vip']);
  });

  it('gives the Lethality and Health of each troop type from Alliance Tech', () => {
    const nodes = allianceTech()
      .get()
      .filter((n) => /^(infantry|lancer|marksman)-(lethality|health)$/.test(n.statKey ?? ''));
    expect(nodes.length).toBeGreaterThan(0);
    const result = calculateBuffs({
      allianceTech: Object.fromEntries(nodes.map((n) => [n.id, 1])),
    });
    for (const node of nodes) {
      expect(category(result, node.statKey!)!.sources[0].type).toBe('allianceTech');
    }
  });
});

const BUILDING_STAT_FIELDS: Record<string, number> = {
  'research-center': 1,
  'war-academy': 1,
  embassy: 3,
  'command-center': 2,
  infirmary: 1,
  storehouse: 1,
  'infantry-camp': 2,
  'lancer-camp': 2,
  'marksman-camp': 2,
};

describe('calculateBuffs VIP, buildings, and castle', () => {
  it('gives every bonus of the VIP level', () => {
    const result = calculateBuffs({ vipLevel: 12 });
    const bonuses = vip().find('vip-12')!.bonuses;
    expect(result.categories).toHaveLength(
      new Set(bonuses.map((b) => `${b.statKey}|${b.unit}`)).size,
    );
    for (const bonus of bonuses) {
      expect(category(result, bonus.statKey, bonus.unit)!.total).toBe(bonus.amount);
    }
    expect(result.categories[0].sources[0]).toMatchObject({ type: 'vip', label: 'VIP 12' });
  });

  it('adds nothing at VIP 0', () => {
    expect(calculateBuffs({ vipLevel: 0 }).categories).toEqual([]);
  });

  it('adds the research speed of the Research Center and the War Academy to the general Research Speed', () => {
    const result = calculateBuffs({
      buildingLevels: { 'research-center': '30', 'war-academy': 'FC 10' },
    });
    expect(category(result, 'research-speed')).toMatchObject({
      total: 18,
      sources: [
        {
          type: 'building',
          id: 'research-center',
          label: 'Building: Research Center Lv 30',
          amount: 3,
        },
        {
          type: 'building',
          id: 'war-academy',
          label: 'Building: War Academy Lv FC 10',
          amount: 15,
        },
      ],
    });
    expect(result.categories.map((c) => c.statKey)).toEqual(['research-speed']);
  });

  it('adds the training speed of every camp to the general Training Speed', () => {
    const result = calculateBuffs({
      buildingLevels: { 'infantry-camp': 'FC 10', 'lancer-camp': '1', 'marksman-camp': 'FC 9' },
    });
    const speed = category(result, 'training-speed')!;
    expect(speed.total).toBeCloseTo(11 + 0.3 + 10.6, 6);
    expect(speed.sources.map((s) => [s.id, s.amount])).toEqual([
      ['infantry-camp', 11],
      ['lancer-camp', 0.3],
      ['marksman-camp', 10.6],
    ]);
    expect(result.categories.some((c) => c.statKey.endsWith('-training-speed'))).toBe(false);
  });

  it('adds the training speed of the camps to research, heroes and the other sources', () => {
    const result = calculateBuffs({
      buildingLevels: { 'infantry-camp': '30' },
      researchLevels: { 'trainer-tools-i': 1 },
    });
    const speed = category(result, 'training-speed')!;
    expect(speed.sources.map((s) => s.type)).toEqual(['research', 'building']);
    expect(speed.total).toBeCloseTo(speed.sources[0].amount + 8, 6);
  });

  it('gives the Embassy ally assists, ally help time in seconds, and reinforce capacity', () => {
    const level = buildings()
      .find('embassy')!
      .levels.find((l) => l.label === '30')!;
    const result = calculateBuffs({ buildingLevels: { embassy: '30' } });
    expect(category(result, 'ally-assists', 'flat')).toMatchObject({
      name: 'Ally Assists',
      total: level.allyAssists,
      sources: [{ type: 'building', id: 'embassy', label: 'Building: Embassy Lv 30' }],
    });
    expect(category(result, 'ally-help-time', 'seconds')!.total).toBe(level.allyHelpTimeSeconds);
    expect(category(result, 'reinforce-capacity', 'flat')!.total).toBe(level.reinforceCapacity);
    expect(level.reinforceCapacity).toBeGreaterThan(0);
  });

  it('gives the Command Center rally capacity and troops deployment capacity', () => {
    const level = buildings()
      .find('command-center')!
      .levels.find((l) => l.label === '30')!;
    const result = calculateBuffs({ buildingLevels: { 'command-center': '30' } });
    expect(category(result, 'rally-capacity', 'flat')!.total).toBe(840000);
    expect(category(result, 'troops-deployment-capacity', 'flat')).toMatchObject({
      total: 67000,
      group: 'military',
      sources: [{ label: 'Building: Command Center Lv 30', amount: level.marchCapacity }],
    });
  });

  it('adds the Command Center to the deployment capacity of research and other sources', () => {
    const result = calculateBuffs({
      buildingLevels: { 'command-center': '30' },
      researchLevels: { 'regimental-expansion-i': 1 },
    });
    const deployment = category(result, 'troops-deployment-capacity', 'flat')!;
    expect(deployment.sources.map((s) => s.type)).toEqual(['research', 'building']);
    expect(deployment.total).toBe(67000 + deployment.sources[0].amount);
  });

  it('gives the Infirmary and the Storehouse their capacity', () => {
    const result = calculateBuffs({ buildingLevels: { infirmary: 'FC 10', storehouse: '30' } });
    expect(category(result, 'infirmary-capacity', 'flat')!.total).toBe(121500);
    expect(category(result, 'storehouse-capacity', 'flat')!.total).toBe(120000000);
  });

  it('adds the training capacity of every camp to the general Training Capacity', () => {
    const marksman = buildings()
      .find('marksman-camp')!
      .levels.find((l) => l.label === '30-1')!.trainingCapacity!;
    const result = calculateBuffs({
      buildingLevels: { 'infantry-camp': 'FC 10', 'lancer-camp': '1', 'marksman-camp': '30-1' },
    });
    const capacity = category(result, 'training-capacity', 'flat')!;
    expect(capacity.total).toBe(459 + 17 + marksman);
    expect(capacity.sources.map((s) => [s.id, s.amount])).toEqual([
      ['infantry-camp', 459],
      ['lancer-camp', 17],
      ['marksman-camp', marksman],
    ]);
    expect(result.categories.some((c) => c.statKey.endsWith('-training-capacity'))).toBe(false);
    expect(category(result, 'training-speed')!.total).toBeCloseTo(11 + 0.3 + 8, 6);
  });

  it('adds the training capacity of the camps to the Camp Expansion research', () => {
    const result = calculateBuffs({
      buildingLevels: { 'infantry-camp': '30' },
      researchLevels: { 'camp-expansion-i': 1 },
    });
    const capacity = category(result, 'training-capacity', 'flat')!;
    expect(capacity.sources.map((s) => s.type)).toEqual(['research', 'building']);
    expect(capacity.total).toBe(capacity.sources[0].amount + capacity.sources[1].amount);
  });

  it('gives the Command Center march capacity of every Fire Crystal level as deployment capacity', () => {
    const march = [70500, 74000, 77500, 81000, 84500, 88000, 91500, 95000, 98500, 102000];
    march.forEach((amount, i) => {
      const result = calculateBuffs({ buildingLevels: { 'command-center': `FC ${i + 1}` } });
      expect(category(result, 'troops-deployment-capacity', 'flat')).toMatchObject({
        total: amount,
        sources: [{ label: `Building: Command Center Lv FC ${i + 1}`, amount }],
      });
    });
  });

  it.each([
    ['command-center', '30-3', 'troops-deployment-capacity'],
    ['command-center', 'FC 3-2', 'troops-deployment-capacity'],
    ['infantry-camp', 'FC 3-2', 'training-speed'],
    ['infirmary', '30-4', 'infirmary-capacity'],
  ])('gives a sub-level the stats of the full level before it: %s %s %s', (id, label, statKey) => {
    const levels = buildings().find(id)!.levels;
    const sub = levels.find((l) => l.label === label)!;
    const full = [...levels]
      .reverse()
      .find((l) => l.order < sub.order && l.fcSubLevel === undefined)!;
    const field = {
      'troops-deployment-capacity': 'marchCapacity',
      'training-speed': 'trainingSpeedBonusPercent',
      'infirmary-capacity': 'infirmaryCapacity',
    }[statKey] as 'marchCapacity';
    const expected = (full as unknown as Record<string, number>)[field];
    const result = calculateBuffs({ buildingLevels: { [id]: label } });
    expect(
      category(result, statKey, statKey === 'training-speed' ? 'percent' : 'flat'),
    ).toMatchObject({
      total: expected,
      sources: [{ label: `Building: ${buildings().find(id)!.name} Lv ${label}`, amount: expected }],
    });
    expect(expected).toBeGreaterThan(0);
  });

  it('adds nothing for a building that gives no stat', () => {
    expect(calculateBuffs({ buildingLevels: { furnace: '30' } }).categories).toEqual([]);
  });

  it('gives the Command Center rally capacity of every Fire Crystal level', () => {
    const rally = [865, 890, 915, 940, 965, 990, 1015, 1040, 1065, 1090].map((k) => k * 1000);
    rally.forEach((amount, i) => {
      const result = calculateBuffs({ buildingLevels: { 'command-center': `FC ${i + 1}` } });
      expect(category(result, 'rally-capacity', 'flat')!.total).toBe(amount);
    });
  });

  it('adds the Rally Capacity of Flame Legion research to the Command Center', () => {
    const result = calculateBuffs({
      researchLevels: { 'flame-legion': 12 },
      buildingLevels: { 'command-center': '30' },
    });
    const rally = category(result, 'rally-capacity', 'flat')!;
    expect(rally.total).toBe(33500 + 840000);
    expect(rally.sources.map((s) => s.type)).toEqual(['research', 'building']);
    expect(category(result, 'troops-deployment-capacity', 'flat')!.total).toBe(67000);
  });

  it('gives each entertainment building 100 troops deployment capacity', () => {
    const result = calculateBuffs({
      buildingLevels: Object.fromEntries(BUFF_ENTERTAINMENT_BUILDINGS.map((id) => [id, '1'])),
    });
    const deployment = category(result, 'troops-deployment-capacity', 'flat')!;
    expect(deployment.total).toBe(900);
    expect(deployment.sources).toHaveLength(9);
    expect(deployment.sources[0]).toMatchObject({
      type: 'building',
      id: 'the-bakery',
      label: 'Building: The Bakery Lv 1',
      amount: 100,
    });
  });

  it('maps every building that has a troop deployment capacity', () => {
    const withValue = buildings()
      .get()
      .filter((b) => b.levels.some((l) => l.troopDeploymentCapacity !== undefined))
      .map((b) => b.id);
    expect(withValue.sort()).toEqual([...BUFF_ENTERTAINMENT_BUILDINGS].sort());
  });

  it('adds the entertainment buildings to the deployment capacity of the Command Center', () => {
    const result = calculateBuffs({
      buildingLevels: { 'command-center': 'FC 5', cafe: '1', cinema: '1' },
    });
    const deployment = category(result, 'troops-deployment-capacity', 'flat')!;
    expect(deployment.total).toBe(84500 + 200);
    expect(deployment.sources.map((s) => s.id)).toEqual(['command-center', 'cafe', 'cinema']);
  });

  it('gives every mapped stat of a building at every level it has', () => {
    for (const id of Object.keys(BUILDING_STAT_FIELDS)) {
      for (const level of buildings().find(id)!.levels) {
        const result = calculateBuffs({ buildingLevels: { [id]: level.label } });
        expect(result.categories.length).toBeGreaterThanOrEqual(BUILDING_STAT_FIELDS[id]);
        result.categories.forEach((c) => expect(Number.isFinite(c.total)).toBe(true));
      }
    }
  });

  it('gives every bonus of a castle position', () => {
    const result = calculateBuffs({ castleAppointment: 'supreme-president' });
    const bonuses = castleAppointments().find('supreme-president')!.bonuses;
    expect(result.categories).toHaveLength(bonuses.length);
    for (const bonus of bonuses) {
      expect(category(result, bonus.statKey)).toMatchObject({
        total: bonus.amount,
        sources: [{ type: 'castleAppointment', label: 'Castle: Supreme President' }],
      });
    }
  });
});

describe('calculateBuffs the island', () => {
  it('gives the buff of the Tree of Life level', () => {
    const result = calculateBuffs({ treeOfLifeLevel: 1 });
    expect(category(result, 'healing-speed')).toMatchObject({
      total: 30,
      sources: [{ type: 'treeOfLife', label: 'Tree of Life Lv 1' }],
    });
  });

  it('gives a buff of the Tree of Life that is not a speed', () => {
    for (let level = 1; level <= BUFF_TREE_OF_LIFE_MAX_LEVEL; level++) {
      expect(calculateBuffs({ treeOfLifeLevel: level }).categories.length).toBeGreaterThan(0);
    }
  });

  it('adds the buff of every level up to the Tree of Life level, so Healing Speed adds up', () => {
    const at4 = calculateBuffs({ treeOfLifeLevel: 4 });
    expect(category(at4, 'healing-speed')).toMatchObject({
      total: 60,
      sources: [
        { type: 'treeOfLife', label: 'Tree of Life Lv 1', amount: 30 },
        { type: 'treeOfLife', label: 'Tree of Life Lv 3', amount: 30 },
      ],
    });
    expect(category(at4, 'troops-defense')!.total).toBe(5);
    expect(category(at4, 'troops-deployment-capacity', 'flat')!.total).toBe(1000);
    expect(category(at4, 'troops-attack')).toBeUndefined();
  });

  it('gives every buff of the Tree of Life at level 10', () => {
    const result = calculateBuffs({ treeOfLifeLevel: 10 });
    expect(category(result, 'healing-speed')!.total).toBe(120);
    expect(category(result, 'healing-speed')!.sources).toHaveLength(4);
    expect(category(result, 'troops-deployment-capacity', 'flat')!.total).toBe(4000);
    for (const statKey of [
      'troops-attack',
      'troops-defense',
      'troops-health',
      'troops-lethality',
    ]) {
      expect(category(result, statKey)!.total).toBe(5);
    }
    expect(result.categories).toHaveLength(6);
  });

  it('adds up the buffs of the levels of the tree from the data', () => {
    const rows = treeOfLife().get();
    for (let level = 1; level <= BUFF_TREE_OF_LIFE_MAX_LEVEL; level++) {
      const result = calculateBuffs({ treeOfLifeLevel: level });
      const sources = result.categories.flatMap((c) => c.sources);
      const expected = rows
        .filter((r) => r.level <= level)
        .map((r) => `Tree of Life Lv ${r.level}`);
      expect(sources).toHaveLength(expected.length);
      expect(new Set(sources.map((x) => x.label))).toEqual(new Set(expected));
      const healing = rows
        .filter((r) => r.level <= level && r.buff.stat === 'Healing Speed')
        .reduce((sum, r) => sum + r.buff.amount, 0);
      expect(category(result, 'healing-speed')?.total ?? 0).toBe(healing);
    }
  });

  it('adds nothing at Tree of Life level 0', () => {
    expect(calculateBuffs({ treeOfLifeLevel: 0 }).categories).toEqual([]);
  });

  it('gives the buff of a decoration at its level, and adds the copies', () => {
    const one = calculateBuffs({ decorations: [{ id: 'clock-hut', level: 2 }] });
    expect(category(one, 'marksman-attack')).toMatchObject({
      total: 1,
      sources: [{ type: 'decoration', label: 'Decoration: Clock Hut Lv 2', amount: 1 }],
    });
    const two = calculateBuffs({
      decorations: [
        { id: 'clock-hut', level: 2 },
        { id: 'clock-hut', level: 2 },
      ],
    });
    expect(category(two, 'marksman-attack')!.total).toBe(2);
    expect(category(two, 'marksman-attack')!.sources).toHaveLength(2);
  });

  it('gives each stat of a buff that names four stats the same amount', () => {
    const level = decoration().find('serpent-sanctuary')!.levels![0];
    const result = calculateBuffs({ decorations: [{ id: 'serpent-sanctuary', level: 1 }] });
    expect(result.categories.map((c) => c.statKey)).toEqual([
      'troops-attack',
      'troops-defense',
      'troops-health',
      'troops-lethality',
    ]);
    expect(result.categories.every((c) => c.total === level.buff.amount)).toBe(true);
  });

  it('adds nothing for a level 0, a blank buff, or a decoration without levels', () => {
    expect(calculateBuffs({ decorations: [{ id: 'clock-hut', level: 0 }] }).categories).toEqual([]);
    expect(
      calculateBuffs({ decorations: [{ id: 'abundant-feast', level: 1 }] }).categories,
    ).toEqual([]);
    expect(calculateBuffs({ decorations: [{ id: 'city-walkway', level: 0 }] }).categories).toEqual(
      [],
    );
  });

  it('knows the stat of every buff of every decoration and of the Tree of Life', () => {
    const decorations = decoration()
      .get()
      .filter((d) => d.levels)
      .map((d) => ({ id: d.id, level: d.levels!.length }));
    const result = calculateBuffs({ decorations, treeOfLifeLevel: BUFF_TREE_OF_LIFE_MAX_LEVEL });
    const blank = decoration()
      .get()
      .flatMap((d) => (d.levels ?? []).filter((l) => l.level === d.levels!.length))
      .filter((l) => l.buff.stat === '').length;
    expect(blank).toBeGreaterThanOrEqual(0);
    expect(result.categories.length).toBeGreaterThan(10);
  });
});

describe('calculateBuffs Chief Gear and Chief Charms', () => {
  const tierLevel = (tierId: string) =>
    chiefGear()
      .get()
      .find((l) => l.tierId === tierId)!;
  const mythic = tierLevel('mythic-t1');
  const setPercent = (tierId: string) => chiefGearSetBonuses().find(tierId)!.percent;

  it('gives the Attack and Defense of a piece to the troop type of its slot', () => {
    const result = calculateBuffs({ chiefGear: { cap: mythic.id } });
    expect(result.categories.map((c) => c.statKey)).toEqual(['lancer-attack', 'lancer-defense']);
    expect(category(result, 'lancer-attack')).toMatchObject({
      total: mythic.statTotalPercent,
      sources: [
        {
          type: 'chiefGear',
          id: 'cap',
          label: `Chief Gear: Cap ${mythic.name}`,
          amount: mythic.statTotalPercent,
        },
      ],
    });
  });

  it.each([
    ['cap', 'lancer'],
    ['watch', 'lancer'],
    ['coat', 'infantry'],
    ['pants', 'infantry'],
    ['ring', 'marksman'],
    ['weapon', 'marksman'],
  ])('gives the %s piece to %s troops', (slot, type) => {
    const result = calculateBuffs({ chiefGear: { [slot]: mythic.id } });
    expect(result.categories.map((c) => c.statKey)).toEqual([`${type}-attack`, `${type}-defense`]);
  });

  it('adds the pieces of one troop type', () => {
    const result = calculateBuffs({ chiefGear: { coat: mythic.id, pants: mythic.id } });
    expect(category(result, 'infantry-attack')!.total).toBe(
      Math.round(mythic.statTotalPercent * 2 * 10000) / 10000,
    );
    expect(category(result, 'infantry-attack')!.sources).toHaveLength(2);
  });

  it('adds the 3 piece Defense bonus for three pieces of one tier, for all three troop types', () => {
    const result = calculateBuffs({
      chiefGear: { cap: mythic.id, coat: mythic.id, ring: mythic.id },
    });
    for (const type of ['infantry', 'lancer', 'marksman']) {
      const defense = category(result, `${type}-defense`)!;
      expect(defense.sources.map((s) => s.type)).toEqual(['chiefGear', 'chiefGearSet']);
      expect(defense.sources[1]).toMatchObject({
        id: 'mythic-t1',
        label: 'Chief Gear Set: 3 pieces Mythic T1',
        amount: setPercent('mythic-t1'),
      });
      expect(category(result, `${type}-attack`)!.sources.map((s) => s.type)).toEqual(['chiefGear']);
    }
  });

  it('adds the 6 piece Attack bonus too for six pieces of one tier', () => {
    const slots = ['cap', 'watch', 'coat', 'pants', 'ring', 'weapon'];
    const result = calculateBuffs({
      chiefGear: Object.fromEntries(slots.map((slot) => [slot, mythic.id])),
    });
    const attack = category(result, 'lancer-attack')!;
    expect(attack.sources.map((s) => s.type)).toEqual(['chiefGear', 'chiefGear', 'chiefGearSet']);
    expect(attack.sources[2].label).toBe('Chief Gear Set: 6 pieces Mythic T1');
    expect(attack.total).toBeCloseTo(2 * mythic.statTotalPercent + setPercent('mythic-t1'), 6);
  });

  it('adds no set bonus for two pieces or for pieces of different tiers', () => {
    const rare = tierLevel('rare');
    const two = calculateBuffs({ chiefGear: { cap: mythic.id, coat: mythic.id } });
    expect(two.categories.flatMap((c) => c.sources).some((s) => s.type === 'chiefGearSet')).toBe(
      false,
    );
    const mixed = calculateBuffs({
      chiefGear: { cap: mythic.id, coat: rare.id, ring: tierLevel('epic').id },
    });
    expect(mixed.categories.flatMap((c) => c.sources).some((s) => s.type === 'chiefGearSet')).toBe(
      false,
    );
  });

  it('gives the Lethality and Health of a charm to the troop type of its gear slot', () => {
    const level = chiefCharm().find('level-11-stage-1')!;
    const result = calculateBuffs({ chiefCharms: { cap: [level.id] } });
    expect(result.categories.map((c) => c.statKey)).toEqual(['lancer-health', 'lancer-lethality']);
    expect(category(result, 'lancer-lethality')).toMatchObject({
      total: level.statTotalPercent,
      sources: [
        {
          type: 'chiefCharm',
          id: 'cap',
          label: `Chief Charm: Cap ${level.name}`,
          amount: level.statTotalPercent,
        },
      ],
    });
  });

  it('adds the three charms of a gear slot', () => {
    const ids = ['level-1', 'level-11-stage-1', 'level-18-stage-0'];
    const levels = ids.map((id) => chiefCharm().find(id)!);
    const result = calculateBuffs({ chiefCharms: { coat: ids } });
    const sum = levels.reduce((total, l) => total + l.statTotalPercent, 0);
    expect(category(result, 'infantry-lethality')!.total).toBeCloseTo(sum, 6);
    expect(category(result, 'infantry-health')!.total).toBeCloseTo(sum, 6);
    expect(category(result, 'infantry-lethality')!.sources).toHaveLength(3);
    expect(category(result, 'infantry-lethality')!.sources.map((s) => s.amount)).toEqual(
      levels.map((l) => l.statTotalPercent),
    );
  });

  it('adds the charms of the two gear slots of one troop type', () => {
    const level = chiefCharm().find('level-1')!;
    const result = calculateBuffs({
      chiefCharms: { ring: [level.id, level.id], weapon: [level.id] },
    });
    const lethality = category(result, 'marksman-lethality')!;
    expect(lethality.sources.map((s) => s.id)).toEqual(['ring', 'ring', 'weapon']);
    expect(lethality.total).toBeCloseTo(3 * level.statTotalPercent, 6);
  });

  it.each([
    ['cap', 'lancer'],
    ['watch', 'lancer'],
    ['coat', 'infantry'],
    ['pants', 'infantry'],
    ['ring', 'marksman'],
    ['weapon', 'marksman'],
  ])('gives the charms of the %s slot to %s troops', (slot, type) => {
    const result = calculateBuffs({ chiefCharms: { [slot]: ['level-1'] } });
    expect(result.categories.map((c) => c.statKey)).toEqual([
      `${type}-health`,
      `${type}-lethality`,
    ]);
  });

  it('adds nothing for a slot with no charms', () => {
    expect(calculateBuffs({ chiefCharms: { cap: [] } }).categories).toEqual([]);
  });

  it('exports the number of charms of a gear slot', () => {
    expect(BUFF_CHARMS_PER_GEAR_SLOT).toBe(3);
  });

  it('keeps the gear and charm of a troop type in separate categories', () => {
    const result = calculateBuffs({
      chiefGear: { coat: mythic.id },
      chiefCharms: { coat: ['level-1'] },
    });
    expect(category(result, 'infantry-attack')).toBeDefined();
    expect(category(result, 'infantry-lethality')).toBeDefined();
    expect(category(result, 'infantry-lethality')!.sources.map((s) => s.type)).toEqual([
      'chiefCharm',
    ]);
  });
});

describe('calculateBuffs pets, skins, orders, and President skills', () => {
  it('gives the troop attack and defense of a pet level', () => {
    const row = pets().find('cave-hyena')!.levels[49];
    const result = calculateBuffs({ pets: [{ id: 'cave-hyena', level: 50 }] });
    expect(category(result, 'troops-attack')).toMatchObject({
      total: row.troopAttack.value,
      sources: [{ type: 'pet', label: 'Pet: Cave Hyena Lv 50' }],
    });
    expect(category(result, 'troops-defense')!.total).toBe(row.troopDefense.value);
  });

  it('uses the refined value only when the level has one', () => {
    const levels = pets().find('cave-hyena')!.levels;
    const refined = calculateBuffs({ pets: [{ id: 'cave-hyena', level: 50, refined: true }] });
    expect(category(refined, 'troops-attack')!.total).toBe(levels[49].troopAttack.refinedValue);
    const plain = calculateBuffs({ pets: [{ id: 'cave-hyena', level: 45, refined: true }] });
    expect(category(plain, 'troops-attack')!.total).toBe(levels[44].troopAttack.value);
    expect(levels[44].troopAttack.refinedValue).toBeUndefined();
  });

  it('gives the refinement of a pet for each stat, from 0 to the maximum of the pet', () => {
    const pet = pets().find('cave-hyena')!;
    const result = calculateBuffs({
      pets: [
        {
          id: 'cave-hyena',
          level: 50,
          refinement: { 'infantry-lethality': pet.maxRefinementPercent, 'lancer-health': 3 },
        },
      ],
    });
    expect(category(result, 'infantry-lethality')).toMatchObject({
      total: 6.7,
      sources: [
        {
          type: 'pet',
          id: 'cave-hyena',
          label: 'Pet: Cave Hyena Refinement Infantry Lethality',
          amount: 6.7,
        },
      ],
    });
    expect(category(result, 'lancer-health')!.total).toBe(3);
    expect(result.categories.map((c) => c.statKey)).toEqual([
      'infantry-lethality',
      'lancer-health',
      'troops-attack',
      'troops-defense',
    ]);
  });

  it('lists the refinement stats of a pet in the order of PET_REFINEMENT_STATS', () => {
    const result = calculateBuffs({
      pets: [
        {
          id: 'cave-hyena',
          level: 1,
          refinement: { 'marksman-health': 1, 'infantry-health': 2, 'lancer-lethality': 3 },
        },
      ],
    });
    const labels = result.categories
      .flatMap((c) => c.sources)
      .map((s) => s.label)
      .filter((l) => l.includes('Refinement'));
    expect(labels).toEqual([
      'Pet: Cave Hyena Refinement Infantry Health',
      'Pet: Cave Hyena Refinement Lancer Lethality',
      'Pet: Cave Hyena Refinement Marksman Health',
    ]);
  });

  it('takes the maximum refinement of every pet, and adds it to the other sources of a stat', () => {
    for (const pet of pets().get()) {
      const refinement = Object.fromEntries(
        PET_REFINEMENT_STATS.map((s) => [s.statKey, pet.maxRefinementPercent]),
      );
      const result = calculateBuffs({ pets: [{ id: pet.id, level: 1, refinement }] });
      for (const { statKey } of PET_REFINEMENT_STATS) {
        expect(category(result, statKey)!.total).toBe(pet.maxRefinementPercent);
      }
    }
    const lethality = research()
      .get()
      .find((n) => n.levels[0].bonus.some((b) => b.statKey === 'infantry-lethality'))!;
    const both = calculateBuffs({
      researchLevels: { [lethality.id]: 1 },
      pets: [{ id: 'cave-hyena', level: 1, refinement: { 'infantry-lethality': 2 } }],
    });
    expect(category(both, 'infantry-lethality')!.sources.map((s) => s.type)).toEqual([
      'research',
      'pet',
    ]);
  });

  it('adds nothing for a refinement of 0, or for the refinement of a pet at level 0', () => {
    const zero = calculateBuffs({
      pets: [{ id: 'cave-hyena', level: 1, refinement: { 'lancer-health': 0 } }],
    });
    expect(category(zero, 'lancer-health')).toBeUndefined();
    const notOwned = calculateBuffs({
      pets: [{ id: 'cave-hyena', level: 0, refinement: { 'lancer-health': 99 } }],
    });
    expect(notOwned.categories).toEqual([]);
  });

  it('throws for a refinement above the maximum of the pet, below 0, or not a number', () => {
    const attempt = (value: number) => () =>
      calculateBuffs({
        pets: [{ id: 'cave-hyena', level: 1, refinement: { 'infantry-health': value } }],
      });
    const message = 'The infantry-health refinement of cave-hyena must be a number from 0 to 6.7';
    expect(attempt(6.71)).toThrow(new RangeError(message));
    expect(attempt(-1)).toThrow(new RangeError(message));
    expect(attempt(Number.NaN)).toThrow(new RangeError(message));
    expect(attempt(6.7)).not.toThrow();
  });

  it('throws for a refinement stat that a pet cannot roll', () => {
    expect(() =>
      calculateBuffs({
        pets: [
          {
            id: 'cave-hyena',
            level: 1,
            refinement: { 'troops-attack': 1 } as unknown as BuffPet['refinement'],
          },
        ],
      }),
    ).toThrow(new Error('Unknown pet refinement stat: troops-attack'));
  });

  it('adds nothing for a pet at level 0', () => {
    expect(calculateBuffs({ pets: [{ id: 'cave-hyena', level: 0 }] }).categories).toEqual([]);
  });

  it('gives the bonus of an owned skin and nothing for a skin without one', () => {
    const skin = skins().find('abundance-scent')!;
    const result = calculateBuffs({ skins: ['abundance-scent', 'birthday-avatar-frame'] });
    expect(result.categories).toHaveLength(1);
    expect(category(result, skin.bonus!.statKey)).toMatchObject({
      total: skin.bonus!.amount,
      sources: [{ type: 'skin', label: 'Skin: Abundance Scent' }],
    });
  });

  it('gives the bonus of an active Chief Order and nothing for an order without one', () => {
    const result = calculateBuffs({ chiefOrders: ['double-time', 'rush-job'] });
    expect(result.categories).toHaveLength(1);
    expect(category(result, 'construction-time-reduction')).toMatchObject({
      total: 20,
      sources: [{ type: 'chiefOrder', label: 'Chief Order: Double Time' }],
    });
  });

  it('gives the bonus of an active President skill and nothing for a skill without one', () => {
    const result = calculateBuffs({ presidentSkills: ['medical-advancement', 'ceasefire'] });
    expect(result.categories).toHaveLength(1);
    expect(category(result, 'healing-speed')).toMatchObject({
      total: 50,
      sources: [{ type: 'presidentSkill', label: 'President Skill: Medical Advancement' }],
    });
  });
});

describe('calculateBuffs summing', () => {
  const profile = {
    heroSkills: [{ heroId: 'ling-xue', skills: { 'Total Control': 4 } }],
    researchLevels: { 'trainer-tools-i': 3 },
    allianceTech: { 'advanced-training-i': 2 },
  };

  it('adds the sources of one category and lists them in the order of the source types', () => {
    const training = category(calculateBuffs(profile), 'training-speed')!;
    expect(training.sources.map((s) => s.type)).toEqual(['hero', 'research', 'allianceTech']);
    expect(training.total).toBe(16 + 7.4 + 2);
    expect(training.total).toBe(training.sources.reduce((sum, s) => sum + s.amount, 0));
  });

  it('orders the categories by name', () => {
    const result = calculateBuffs({
      researchLevels: { 'camp-expansion-i': 1, 'trainer-tools-ii': 1 },
      vipLevel: 12,
    });
    const names = result.categories.map((c) => c.name);
    expect(names.length).toBeGreaterThan(3);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe('calculateBuffs errors', () => {
  it.each([
    [{ heroSkills: [{ heroId: 'nobody', skills: {} }] }, 'Unknown hero: nobody'],
    [
      { heroSkills: [{ heroId: 'gina', skills: { Nothing: 1 } }] },
      'Unknown skill of gina: Nothing',
    ],
    [{ researchLevels: { nothing: 1 } }, 'Unknown research node: nothing'],
    [{ allianceTech: { nothing: 1 } }, 'Unknown Alliance Tech node: nothing'],
    [{ buildingLevels: { nothing: '1' } }, 'Unknown building: nothing'],
    [{ buildingLevels: { furnace: 'zz' } }, 'Unknown level of furnace: zz'],
    [{ skins: ['nothing'] }, 'Unknown skin: nothing'],
    [{ tundraAlbums: ['nothing'] }, 'Unknown Tundra Album: nothing'],
    [{ decorations: [{ id: 'nothing', level: 1 }] }, 'Unknown decoration: nothing'],
    [{ castleAppointment: 'nothing' }, 'Unknown castle appointment: nothing'],
    [{ chiefOrders: ['nothing'] }, 'Unknown Chief Order: nothing'],
    [{ presidentSkills: ['nothing'] }, 'Unknown President skill: nothing'],
    [{ pets: [{ id: 'nothing', level: 1 }] }, 'Unknown pet: nothing'],
    [{ experts: [{ expertId: 'nobody', skills: {} }] }, 'Unknown expert: nobody'],
    [
      { experts: [{ expertId: 'gareth', skills: { Nothing: 1 } }] },
      'Unknown skill of gareth: Nothing',
    ],
    [{ chiefGear: { nothing: 'common-star-0' } }, 'Unknown Chief Gear slot: nothing'],
    [{ chiefGear: { cap: 'nothing' } }, 'Unknown Chief Gear level: nothing'],
    [{ chiefCharms: { nothing: ['level-1'] } }, 'Unknown Chief Gear slot: nothing'],
    [{ chiefCharms: { cap: ['nothing'] } }, 'Unknown Chief Charm level: nothing'],
  ])('throws for an unknown id in %j', (profile, message) => {
    expect(() => calculateBuffs(profile)).toThrow(new Error(message));
  });

  it.each([
    [
      { heroSkills: [{ heroId: 'gina', skills: { 'Endurance Training': 6 } }] },
      'The level of Endurance Training of gina must be a whole number from 0 to 5',
    ],
    [
      { researchLevels: { 'trainer-tools-i': -1 } },
      `The research level of trainer-tools-i must be a whole number from 0 to ${research().find('trainer-tools-i')!.levels.length}`,
    ],
    [
      { allianceTech: { 'advanced-training-i': 1.5 } },
      'The Alliance Tech level of advanced-training-i must be a whole number from 0 to 5',
    ],
    [
      { experts: [{ expertId: 'gareth', skills: { 'Rallying Cry': 12 } }] },
      'The level of Rallying Cry of gareth must be a whole number from 0 to 11',
    ],
    [{ vipLevel: 13 }, 'vipLevel must be a whole number from 0 to 12'],
    [{ treeOfLifeLevel: 11 }, 'treeOfLifeLevel must be a whole number from 0 to 10'],
    [
      { decorations: [{ id: 'city-walkway', level: 1 }] },
      'The level of city-walkway must be a whole number from 0 to 0',
    ],
    [
      { pets: [{ id: 'cave-hyena', level: 51 }] },
      'The level of cave-hyena must be a whole number from 0 to 50',
    ],
    [
      { chiefCharms: { cap: ['level-1', 'level-1', 'level-1', 'level-1'] } },
      'The cap slot can hold at most 3 Chief Charms',
    ],
  ])('throws a RangeError for a bad level or too many charms in %j', (profile, message) => {
    expect(() => calculateBuffs(profile)).toThrow(new RangeError(message));
  });
});
