import {
  DAILY_MISSION_ACTIVENESS_ITEM_ID,
  dailyMissionActiveness,
  dailyMissionActivenessThrough,
  DailyMissionQuery,
  dailyMissionRewardLevels,
  dailyMissions,
} from '@/modules/daily-missions';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('dailyMissions', () => dailyMissions());

describe('DailyMissionQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = dailyMissions().get().slice(0, 2);
    expect(new DailyMissionQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new DailyMissionQuery().count()).toBeGreaterThan(0);
  });
});

const KNOWN_LEVELS: Record<string, number[]> = {
  'alliance-help': [1, 2, 3],
  'alliance-contribution': [1, 2, 3],
  'recruit-hero': [1, 2],
  'train-infantry': [1, 2],
  'train-lancers': [1, 2],
  'train-marksmen': [1, 2],
  'online-reward': [1, 2, 3],
  'defeat-polar-terror': [1, 2, 3],
  'intel-mission': [1, 2, 3],
  'pet-adventure': [1, 2],
  'gather-meat': [1, 2],
  'gather-wood': [1, 2],
  'gather-coal': [1, 2],
  'gather-iron': [1, 2],
  gather: [1, 2, 3],
  'arena-challenge': [1, 2],
};

describe('daily missions', () => {
  it('lists the 21 missions in the order of the game screens, as the game words level 1', () => {
    expect(
      dailyMissions()
        .get()
        .map((m) => m.name),
    ).toEqual([
      'Take part in Alliance Help 1 time(s)',
      'Make 5 Alliance Contribution(s)',
      'Recruit 1 Hero(es)',
      'Train 10 Infantry',
      'Train 10 Lancers',
      'Train 10 Marksmen',
      'Carry out 1 Intel Mission(s)',
      'Claim 1 Online Reward(s)',
      'Heal 10 injured soldiers',
      'Gather 50,000 Meat',
      'Gather 50,000 Wood',
      'Gather 10,000 Coal',
      'Gather 3,000 Iron',
      'Upgrade 1 building(s)',
      'Research 1 technology(ies)',
      'Gather 1 time(s)',
      'Defeat Polar Terror 1 time(s)',
      'Fight in 1 Arena Challenge(s)',
      'Complete 1 challenges in The Labyrinth',
      'Dispatch Pets to hunt for treasure 1 times in Pet Adventure',
      'Log in',
    ]);
  });

  it('gives every mission a unique kebab-case id, level 1, and the levels that are known', () => {
    const missions = dailyMissions().get();
    const ids = missions.map((m) => m.id);
    expect(new Set(ids).size).toBe(21);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const mission of missions) {
      const known = KNOWN_LEVELS[mission.id] ?? [1];
      expect(mission.levels.map((l) => l.level)).toEqual(known);
      expect(mission.levels[0].task).toBe(mission.name);
    }
  });

  it.each([
    ['alliance-help', 1, 5, [['meat', 4000]]],
    ['alliance-contribution', 5, 5, [['wood', 4000]]],
    [
      'recruit-hero',
      1,
      10,
      [
        ['coal', 800],
        ['iron', 200],
      ],
    ],
    [
      'train-infantry',
      10,
      10,
      [
        ['meat', 4000],
        ['wood', 4000],
      ],
    ],
    [
      'train-lancers',
      10,
      10,
      [
        ['meat', 4000],
        ['wood', 4000],
      ],
    ],
    [
      'train-marksmen',
      10,
      10,
      [
        ['meat', 4000],
        ['wood', 4000],
      ],
    ],
    [
      'intel-mission',
      1,
      10,
      [
        ['coal', 800],
        ['iron', 200],
      ],
    ],
    [
      'online-reward',
      1,
      5,
      [
        ['coal', 800],
        ['iron', 200],
      ],
    ],
    [
      'heal-injured-soldiers',
      10,
      10,
      [
        ['meat', 4000],
        ['iron', 200],
      ],
    ],
    ['gather-meat', 50000, 5, [['meat', 4000]]],
    ['gather-wood', 50000, 5, [['wood', 4000]]],
    ['gather-coal', 10000, 5, [['coal', 800]]],
    ['gather-iron', 3000, 5, [['iron', 200]]],
    [
      'upgrade-building',
      1,
      30,
      [
        ['coal', 800],
        ['iron', 200],
      ],
    ],
    [
      'research-technology',
      1,
      30,
      [
        ['coal', 800],
        ['iron', 200],
      ],
    ],
    [
      'gather',
      1,
      5,
      [
        ['meat', 4000],
        ['wood', 4000],
      ],
    ],
    ['defeat-polar-terror', 1, 10, [['coal', 800]]],
    [
      'arena-challenge',
      1,
      10,
      [
        ['wood', 4000],
        ['iron', 200],
      ],
    ],
    [
      'labyrinth-challenge',
      1,
      15,
      [
        ['coal', 800],
        ['iron', 200],
      ],
    ],
    [
      'pet-adventure',
      1,
      5,
      [
        ['meat', 4000],
        ['wood', 4000],
      ],
    ],
    [
      'log-in',
      1,
      10,
      [
        ['meat', 4000],
        ['coal', 800],
        ['iron', 200],
      ],
    ],
  ])('gives %s its target %d, %d activeness, and rewards', (id, target, activeness, rewards) => {
    const level = dailyMissions().find(id)!.levels[0];
    expect(level.target).toBe(target);
    expect(level.rewards).toEqual([
      { itemId: 'activeness', amount: activeness },
      ...(rewards as [string, number][]).map(([itemId, amount]) => ({ itemId, amount })),
    ]);
    expect(dailyMissionActiveness(level)).toBe(activeness);
  });

  it('links every reward to an item of items()', () => {
    for (const mission of dailyMissions().get()) {
      for (const level of mission.levels) {
        for (const reward of level.rewards) {
          expect(items().find(reward.itemId)).toBeDefined();
          expect(reward.amount).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives the activeness first in the rewards of every level, as the game shows it', () => {
    expect(DAILY_MISSION_ACTIVENESS_ITEM_ID).toBe('activeness');
    for (const mission of dailyMissions().get()) {
      for (const level of mission.levels) {
        expect(level.rewards[0].itemId).toBe('activeness');
        expect(level.rewards.filter((r) => r.itemId === 'activeness')).toHaveLength(1);
        expect('points' in level).toBe(false);
      }
    }
  });

  it('has levels 2 and 3 of Alliance Help: 10 and 20 times', () => {
    const levels = dailyMissions().find('alliance-help')!.levels;
    expect(levels).toHaveLength(3);
    expect(levels.slice(1)).toEqual([
      {
        level: 2,
        task: 'Take part in Alliance Help 10 time(s)',
        target: 10,
        rewards: [
          { itemId: 'activeness', amount: 10 },
          { itemId: 'meat', amount: 4000 },
        ],
      },
      {
        level: 3,
        task: 'Take part in Alliance Help 20 time(s)',
        target: 20,
        rewards: [
          { itemId: 'activeness', amount: 15 },
          { itemId: 'meat', amount: 4000 },
        ],
      },
    ]);
    expect(dailyMissionActiveness(levels[1])).toBe(10);
    expect(dailyMissionActiveness(levels[2])).toBe(15);
  });

  it('gives 210 activeness for the missions of level 1', () => {
    const activeness = dailyMissions()
      .get()
      .reduce((sum, m) => sum + dailyMissionActiveness(m.levels[0]), 0);
    expect(activeness).toBe(210);
  });

  it('adds up the activeness of a level, and gives 0 for a level without it', () => {
    expect(
      dailyMissionActiveness({
        level: 2,
        task: 'a',
        target: 1,
        rewards: [
          { itemId: 'activeness', amount: 7 },
          { itemId: 'meat', amount: 1000 },
          { itemId: 'activeness', amount: 3 },
        ],
      }),
    ).toBe(10);
    expect(
      dailyMissionActiveness({
        level: 1,
        task: 'a',
        target: 1,
        rewards: [{ itemId: 'meat', amount: 1000 }],
      }),
    ).toBe(0);
  });

  it('has level 2 of the four gathering missions of one resource', () => {
    const level2 = (id: string) => dailyMissions().find(id)!.levels[1];
    expect(
      ['gather-meat', 'gather-wood', 'gather-coal', 'gather-iron'].map((id) => {
        const level = level2(id);
        return [level.task, level.target, level.rewards.map((r) => [r.itemId, r.amount])];
      }),
    ).toEqual([
      [
        'Gather 250,000 Meat',
        250000,
        [
          ['activeness', 5],
          ['meat', 4000],
        ],
      ],
      [
        'Gather 250,000 Wood',
        250000,
        [
          ['activeness', 5],
          ['wood', 4000],
        ],
      ],
      [
        'Gather 50,000 Coal',
        50000,
        [
          ['activeness', 5],
          ['coal', 800],
        ],
      ],
      [
        'Gather 15,000 Iron',
        15000,
        [
          ['activeness', 5],
          ['iron', 200],
        ],
      ],
    ]);
  });

  it('has level 2 of Arena Challenge: 4 challenges', () => {
    const level = dailyMissions().find('arena-challenge')!.levels[1];
    expect(level).toEqual({
      level: 2,
      task: 'Fight in 4 Arena Challenge(s)',
      target: 4,
      rewards: [
        { itemId: 'activeness', amount: 25 },
        { itemId: 'wood', amount: 4000 },
        { itemId: 'iron', amount: 200 },
      ],
    });
  });

  it('has levels 2 and 3 of Gather: 2 and 4 times', () => {
    const levels = dailyMissions().find('gather')!.levels;
    expect(
      levels.slice(1).map((l) => [l.task, l.target, l.rewards.map((r) => [r.itemId, r.amount])]),
    ).toEqual([
      [
        'Gather 2 time(s)',
        2,
        [
          ['activeness', 5],
          ['meat', 4000],
          ['wood', 4000],
        ],
      ],
      [
        'Gather 4 time(s)',
        4,
        [
          ['activeness', 15],
          ['meat', 4000],
          ['wood', 4000],
        ],
      ],
    ]);
    expect(dailyMissionActivenessThrough(dailyMissions().find('gather')!, 3)).toBe(25);
  });

  it('has 43 levels in all: 21 of level 1, 16 of level 2, and 6 of level 3', () => {
    const levels = dailyMissions()
      .get()
      .flatMap((m) => m.levels);
    expect(levels).toHaveLength(43);
    expect([1, 2, 3].map((n) => levels.filter((l) => l.level === n).length)).toEqual([21, 16, 6]);
    const withMore = dailyMissions()
      .get()
      .filter((m) => m.levels.length > 1)
      .map((m) => m.id);
    expect(withMore.sort()).toEqual(Object.keys(KNOWN_LEVELS).sort());
  });

  it('has level 3 of Online Reward: 5 times for 10 activeness, 800 Coal, and 200 Iron', () => {
    const mission = dailyMissions().find('online-reward')!;
    expect(mission.levels[2]).toEqual({
      level: 3,
      task: 'Claim 5 Online Reward(s)',
      target: 5,
      rewards: [
        { itemId: 'activeness', amount: 10 },
        { itemId: 'coal', amount: 800 },
        { itemId: 'iron', amount: 200 },
      ],
    });
    expect(dailyMissionActivenessThrough(mission, 3)).toBe(20);
  });

  it('has levels 2 and 3 of Carry out Intel Mission: 5 and 10 times', () => {
    const mission = dailyMissions().find('intel-mission')!;
    expect(mission.levels.slice(1)).toEqual([
      {
        level: 2,
        task: 'Carry out 5 Intel Mission(s)',
        target: 5,
        rewards: [
          { itemId: 'activeness', amount: 15 },
          { itemId: 'coal', amount: 800 },
          { itemId: 'iron', amount: 200 },
        ],
      },
      {
        level: 3,
        task: 'Carry out 10 Intel Mission(s)',
        target: 10,
        rewards: [
          { itemId: 'activeness', amount: 30 },
          { itemId: 'coal', amount: 800 },
          { itemId: 'iron', amount: 200 },
        ],
      },
    ]);
    expect([1, 2, 3].map((level) => dailyMissionActivenessThrough(mission, level))).toEqual([
      10, 25, 55,
    ]);
  });

  it.each([
    [
      'alliance-contribution',
      'Make 20 Alliance Contribution(s)',
      20,
      [
        ['activeness', 10],
        ['wood', 4000],
      ],
      15,
    ],
    [
      'recruit-hero',
      'Recruit 3 Hero(es)',
      3,
      [
        ['activeness', 15],
        ['coal', 800],
        ['iron', 200],
      ],
      25,
    ],
    [
      'online-reward',
      'Claim 3 Online Reward(s)',
      3,
      [
        ['activeness', 5],
        ['coal', 800],
        ['iron', 200],
      ],
      10,
    ],
    [
      'pet-adventure',
      'Dispatch Pets to hunt for treasure 4 times in Pet Adventure',
      4,
      [
        ['activeness', 10],
        ['meat', 4000],
        ['wood', 4000],
      ],
      15,
    ],
    [
      'train-infantry',
      'Train 30 Infantry',
      30,
      [
        ['activeness', 10],
        ['meat', 4000],
        ['wood', 4000],
      ],
      20,
    ],
    [
      'train-lancers',
      'Train 30 Lancers',
      30,
      [
        ['activeness', 10],
        ['meat', 4000],
        ['wood', 4000],
      ],
      20,
    ],
    [
      'train-marksmen',
      'Train 30 Marksmen',
      30,
      [
        ['activeness', 10],
        ['meat', 4000],
        ['wood', 4000],
      ],
      20,
    ],
  ])('has level 2 of %s: %s', (id, task, target, rewards, through) => {
    const mission = dailyMissions().find(id)!;
    expect(mission.levels[1]).toEqual({
      level: 2,
      task,
      target,
      rewards: (rewards as [string, number][]).map(([itemId, amount]) => ({ itemId, amount })),
    });
    expect(dailyMissionActivenessThrough(mission, 2)).toBe(through);
  });

  it('has level 3 of Alliance Contribution: 40 times for 15 activeness and 4,000 Wood', () => {
    const mission = dailyMissions().find('alliance-contribution')!;
    expect(mission.levels).toHaveLength(3);
    expect(mission.levels[2]).toEqual({
      level: 3,
      task: 'Make 40 Alliance Contribution(s)',
      target: 40,
      rewards: [
        { itemId: 'activeness', amount: 15 },
        { itemId: 'wood', amount: 4000 },
      ],
    });
    expect([1, 2, 3].map((level) => dailyMissionActivenessThrough(mission, level))).toEqual([
      5, 15, 30,
    ]);
  });

  it('has levels 2 and 3 of Defeat Polar Terror: 2 and 3 times, with the rewards of level 1', () => {
    const levels = dailyMissions().find('defeat-polar-terror')!.levels;
    expect(levels.map((l) => [l.level, l.task, l.target])).toEqual([
      [1, 'Defeat Polar Terror 1 time(s)', 1],
      [2, 'Defeat Polar Terror 2 time(s)', 2],
      [3, 'Defeat Polar Terror 3 time(s)', 3],
    ]);
    for (const level of levels) {
      expect(level.rewards).toEqual([
        { itemId: 'activeness', amount: 10 },
        { itemId: 'coal', amount: 800 },
      ]);
    }
  });

  it('adds up the activeness of the levels up to the level that is done', () => {
    const polar = dailyMissions().find('defeat-polar-terror')!;
    expect([1, 2, 3].map((level) => dailyMissionActivenessThrough(polar, level))).toEqual([
      10, 20, 30,
    ]);

    const help = dailyMissions().find('alliance-help')!;
    expect(dailyMissionActivenessThrough(help, 0)).toBe(0);
    expect(dailyMissionActivenessThrough(help, 1)).toBe(5);
    expect(dailyMissionActivenessThrough(help, 2)).toBe(15);
    expect(dailyMissionActivenessThrough(help, 3)).toBe(30);
    expect(dailyMissionActivenessThrough(help, 4)).toBe(30);
    expect(dailyMissionActivenessThrough(dailyMissions().find('log-in')!, 1)).toBe(10);
  });

  it('finds a mission by id and by name', () => {
    expect(dailyMissions().find('log-in')?.name).toBe('Log in');
    expect(dailyMissions().findByName('train 10 lancers')?.id).toBe('train-lancers');
    expect(dailyMissions().search('gather').length).toBe(5);
  });
});

describe('daily mission reward levels', () => {
  it('lists the 7 levels of the activity bar by activeness', () => {
    const levels = dailyMissionRewardLevels();
    expect(levels.map((l) => l.activeness)).toEqual([40, 80, 120, 160, 215, 270, 325]);
    expect(levels.every((l) => l.rewards.length > 0)).toBe(true);
  });

  it.each([
    [
      40,
      [
        ['gems', 175],
        ['speedup-healing-5m', 2],
        ['alliance-xp', 10],
        ['authority', 10],
      ],
    ],
    [
      80,
      [
        ['speedup-construction-5m', 13],
        ['speedup-research-5m', 13],
        ['speedup-healing-5m', 2],
        ['alliance-xp', 20],
        ['authority', 10],
      ],
    ],
    [
      120,
      [
        ['meat-10k', 660],
        ['speedup-troop-5m', 13],
        ['speedup-healing-5m', 2],
        ['alliance-xp', 30],
        ['authority', 10],
      ],
    ],
    [
      160,
      [
        ['hero-xp', 15000],
        ['wood-10k', 660],
        ['speedup-healing-5m', 3],
        ['alliance-xp', 40],
        ['authority', 10],
      ],
    ],
    [
      215,
      [
        ['platinum-key', 1],
        ['coal-1k', 1320],
        ['speedup-healing-5m', 3],
        ['alliance-xp', 60],
        ['authority', 10],
      ],
    ],
    [
      270,
      [
        ['fire-crystal', 5],
        ['mythic-exploration-skill-manual', 3],
        ['iron-1k', 330],
        ['speedup-healing-5m', 5],
        ['alliance-xp', 80],
        ['authority', 10],
        ['activity-triumph-points', 100],
      ],
    ],
    [
      325,
      [
        ['mythic-general-scene-fragment-pack', 1],
        ['skin-token', 30],
        ['fire-crystal', 5],
        ['mystery-badge', 80],
        ['mythic-expedition-skill-manual', 3],
        ['speedup-healing-5m', 8],
        ['authority', 115],
        ['activity-triumph-points', 500],
        ['gold-key', 1],
      ],
    ],
  ])('gives the reward level of %d activeness its rewards', (activeness, rewards) => {
    const level = dailyMissionRewardLevels().find((l) => l.activeness === activeness)!;
    expect(level.rewards).toEqual(
      (rewards as [string, number][]).map(([itemId, amount]) => ({ itemId, amount })),
    );
  });

  it('links every reward of the reward levels to an item', () => {
    for (const level of dailyMissionRewardLevels()) {
      for (const reward of level.rewards) {
        expect(items().find(reward.itemId)).toBeDefined();
        expect(reward.amount).toBeGreaterThan(0);
      }
    }
  });

  it('gives Authority to every level, and the keys and badges to the top level', () => {
    const levels = dailyMissionRewardLevels();
    for (const level of levels) {
      expect(level.rewards.some((r) => r.itemId === 'authority')).toBe(true);
    }
    expect(levels[6].rewards.map((r) => r.itemId)).toEqual(
      expect.arrayContaining(['gold-key', 'mystery-badge', 'skin-token']),
    );
  });

  it('sorts the levels of a source from the lowest activeness', () => {
    const sorted = dailyMissionRewardLevels([
      { activeness: 90, rewards: [] },
      { activeness: 10, rewards: [] },
      { activeness: 50, rewards: [] },
    ]);
    expect(sorted.map((l) => l.activeness)).toEqual([10, 50, 90]);
  });
});
