import { chiefCharmSlots } from '@/modules/chief-charm';
import { chiefGearSlots } from '@/modules/chief-gear';
import { events } from '@/modules/events';
import { experts, unreleasedExperts } from '@/modules/experts';
import { heroes } from '@/modules/heroes';
import { items } from '@/modules/items';
import { pets } from '@/modules/pets';
import {
  heroGenerationAt,
  serverAge,
  serverTimeline,
  ServerTimelineQuery,
  serverTimelineStatus,
} from '@/modules/server-timeline';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('serverTimeline', () => serverTimeline());

describe('ServerTimelineQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = serverTimeline().get().slice(0, 1);
    expect(new ServerTimelineQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ServerTimelineQuery().count()).toBeGreaterThan(0);
  });

  it('lists the milestones from day 0 in ascending day order', () => {
    const days = serverTimeline()
      .get()
      .map((m) => m.day);
    expect(days[0]).toBe(0);
    expect(days).toEqual([...days].sort((a, b) => a - b));
  });

  it('unlockedAt() keeps milestones at or before the age', () => {
    expect(
      serverTimeline()
        .unlockedAt(54)
        .get()
        .map((m) => m.day),
    ).toEqual([0, 40, 53, 54]);
  });

  it('lockedAt() keeps milestones after the age', () => {
    const locked = serverTimeline().lockedAt(1000).get();
    expect(locked.map((m) => m.day)).toEqual([1080, 1160, 1240]);
  });

  it('resolve() replaces ids with hero, expert, and pet entries', () => {
    const day54 = serverTimeline().find('day-54')!;
    const [resolved] = new ServerTimelineQuery([day54]).resolve();
    expect(resolved.pets.map((p) => p.id)).toEqual([
      'cave-hyena',
      'arctic-wolf',
      'musk-ox',
      'titan-roc',
      'giant-tapir',
    ]);
    expect(resolved.pets[0]).toBe(pets().find('cave-hyena'));
    expect(resolved.heroes).toEqual([]);
    expect('petIds' in resolved).toBe(false);
  });

  it('resolve() throws on an unknown id', () => {
    const base = {
      id: 'x',
      name: 'X',
      day: 1,
      heroIds: [],
      heroShardEventIds: {},
      expertIds: [],
      petIds: [],
      eventIds: [],
      fireCrystalLevelIds: [],
      unlocks: [],
    };
    expect(() => new ServerTimelineQuery([{ ...base, heroIds: ['nobody'] }]).resolve()).toThrow(
      'Unknown hero id: nobody',
    );
    expect(() => new ServerTimelineQuery([{ ...base, expertIds: ['nobody'] }]).resolve()).toThrow(
      'Unknown expert id: nobody',
    );
    expect(() => new ServerTimelineQuery([{ ...base, petIds: ['nobody'] }]).resolve()).toThrow(
      'Unknown pet id: nobody',
    );
    expect(() => new ServerTimelineQuery([{ ...base, eventIds: ['nobody'] }]).resolve()).toThrow(
      'Unknown event id: nobody',
    );
    expect(() =>
      new ServerTimelineQuery([{ ...base, fireCrystalLevelIds: ['nobody'] }]).resolve(),
    ).toThrow('Unknown Fire Crystal level id: nobody');
  });

  it('resolve() replaces event ids with entries from events()', () => {
    const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-53')!]).resolve();
    expect(resolved.events).toEqual([events().find('sunfire-castle')]);
    expect('eventIds' in resolved).toBe(false);
  });

  it('resolve() replaces the shard event ids of each hero with entries from events()', () => {
    const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-0')!]).resolve();
    expect(resolved.heroShardEvents.molly).toEqual([events().find('hall-of-heroes')]);
    expect(resolved.heroShardEvents.zinman).toEqual([events().find('lucky-wheel')]);
    expect(resolved.heroShardEvents.jeronimo).toEqual([]);
    expect('heroShardEventIds' in resolved).toBe(false);
  });

  it('resolve() throws on an unknown hero shard event id', () => {
    const milestone = {
      id: 'x',
      name: 'X',
      day: 1,
      heroIds: ['molly'],
      heroShardEventIds: { molly: ['nobody'] },
      expertIds: [],
      petIds: [],
      eventIds: [],
      fireCrystalLevelIds: [],
      unlocks: [],
    };
    expect(() => new ServerTimelineQuery([milestone]).resolve()).toThrow(
      'Unknown event id: nobody',
    );
  });

  it('resolve() replaces Fire Crystal level ids with badges', () => {
    const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-150')!]).resolve();
    expect(resolved.fireCrystalLevels.map((l) => l.id)).toEqual(['fc-4', 'fc-5']);
    expect(resolved.fireCrystalLevels[1]).toEqual({
      id: 'fc-5',
      name: 'FC 5',
      level: 5,
      img: '/images/fire-crystal/fc-5.png',
    });
    expect('fireCrystalLevelIds' in resolved).toBe(false);
  });

  it('resolve() attaches the item of an unlock', () => {
    const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-60')!]).resolve();
    expect(resolved.unlocks[0]).toEqual({
      name: 'Fire Crystal Age Unlocks',
      item: items().find('fire-crystal'),
    });
    expect(resolved.unlocks[1]).toEqual({ name: '"Road to Recovery" Monument mission' });
    expect(resolved.fireCrystalLevels.map((l) => l.id)).toEqual(['fc-1', 'fc-2', 'fc-3']);
  });

  it('resolve() throws on an unknown unlock item id', () => {
    const milestone = {
      id: 'x',
      name: 'X',
      day: 1,
      heroIds: [],
      heroShardEventIds: {},
      expertIds: [],
      petIds: [],
      eventIds: [],
      fireCrystalLevelIds: [],
      unlocks: [{ name: 'Thing', itemId: 'nobody' }],
    };
    expect(() => new ServerTimelineQuery([milestone]).resolve()).toThrow('Unknown item id: nobody');
  });

  it('resolve() resolves expert ids', () => {
    const base = {
      id: 'x',
      name: 'X',
      day: 1,
      heroIds: [],
      heroShardEventIds: {},
      expertIds: ['cyrille'],
      petIds: [],
      eventIds: [],
      fireCrystalLevelIds: [],
      unlocks: [],
    };
    expect(new ServerTimelineQuery([base]).resolve()[0].experts[0].id).toBe('cyrille');
  });
});

describe('timeline data', () => {
  const shardEventIds = [
    'lucky-wheel',
    'hall-of-heroes',
    'hall-of-chief',
    'king-of-icefield',
    'svs-state-of-power',
  ];

  it('lists shard events only for heroes of the milestone, from the five shard events', () => {
    for (const m of serverTimeline().get()) {
      for (const [heroId, eventIds] of Object.entries(m.heroShardEventIds)) {
        expect(m.heroIds).toContain(heroId);
        for (const eventId of eventIds) expect(shardEventIds).toContain(eventId);
      }
    }
  });

  it('lists Hall of Chief only for heroes of Generation 2 or earlier', () => {
    for (const m of serverTimeline().get()) {
      for (const [heroId, eventIds] of Object.entries(m.heroShardEventIds)) {
        if (eventIds.includes('hall-of-chief')) {
          expect(heroes().find(heroId)!.generation).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  it('has a bundled image for every Fire Crystal level badge', () => {
    const levels = serverTimeline()
      .resolve()
      .flatMap((m) => m.fireCrystalLevels);
    expect(levels.length).toBeGreaterThan(0);
    for (const level of levels) {
      expect(existsSync(join(__dirname, '../..', level.img))).toBe(true);
    }
  });

  it('matches the generation of each hero to the milestone order', () => {
    const milestones = serverTimeline()
      .get()
      .filter((m) => m.heroIds.length > 0);
    milestones.forEach((m, index) => {
      m.heroIds.forEach((id) => expect(heroes().find(id)!.generation).toBe(index + 1));
    });
  });

  it('lists every pet once', () => {
    const listed = serverTimeline()
      .get()
      .flatMap((m) => m.petIds);
    expect([...listed].sort()).toEqual(
      pets()
        .get()
        .map((p) => p.id)
        .sort(),
    );
  });

  it('matches the unlock day of each pet to its milestone day', () => {
    for (const m of serverTimeline().get()) {
      for (const id of m.petIds) {
        expect(pets().find(id)!.unlockRequirement.daysRequired).toBe(m.day);
      }
    }
  });

  it('matches the unlock day of each released expert to its milestone day', () => {
    for (const m of serverTimeline().get()) {
      for (const id of m.expertIds.filter((expertId) => experts().find(expertId))) {
        expect(experts().find(id)!.unlockRequirement).toEqual({ daysRequired: m.day });
      }
    }
  });

  it('puts each unreleased expert on the milestone of the day that it needs', () => {
    for (const m of serverTimeline().get()) {
      for (const id of m.expertIds.filter((expertId) => unreleasedExperts().find(expertId))) {
        expect(unreleasedExperts().find(id)!.unlockRequirement).toEqual({ daysRequired: m.day });
      }
    }
  });

  it('resolves every milestone', () => {
    expect(serverTimeline().resolve()).toHaveLength(serverTimeline().count());
  });
});

describe('serverAge', () => {
  it('is 0 on the start date', () => {
    expect(serverAge('2026-01-15', '2026-01-15')).toBe(0);
  });

  it('counts whole days between dates', () => {
    expect(serverAge('2026-01-01', '2026-03-02')).toBe(60);
  });

  it('accepts Date objects and ignores the time of day', () => {
    expect(serverAge(new Date('2026-01-01T23:00:00Z'), new Date('2026-01-03T01:00:00Z'))).toBe(2);
  });

  it('defaults asOf to now', () => {
    expect(serverAge(new Date(Date.now() - 3 * 86_400_000))).toBeGreaterThanOrEqual(2);
  });

  it('throws RangeError on an invalid date', () => {
    expect(() => serverAge('not a date')).toThrow(RangeError);
    expect(() => serverAge('2026-01-01', 'not a date')).toThrow(RangeError);
  });

  it('throws RangeError when asOf is before the start date', () => {
    expect(() => serverAge('2026-01-02', '2026-01-01')).toThrow(RangeError);
  });
});

describe('serverTimelineStatus', () => {
  it('splits milestones at the server age', () => {
    const status = serverTimelineStatus('2026-01-01', '2026-02-20');
    expect(status.age).toBe(50);
    expect(status.startDate).toBe('2026-01-01');
    expect(status.unlocked.map((m) => m.day)).toEqual([0, 40]);
    expect(status.locked[0].day).toBe(53);
    expect(status.next).toBe(status.locked[0]);
  });

  it('treats a milestone on the server age as unlocked', () => {
    const status = serverTimelineStatus('2026-01-01', '2026-02-23');
    expect(status.unlocked.map((m) => m.day)).toEqual([0, 40, 53]);
  });

  it('adds the unlock date of each milestone', () => {
    const status = serverTimelineStatus('2026-01-01', '2026-01-01');
    expect(status.unlocked[0].date).toBe('2026-01-01');
    expect(status.next?.day).toBe(40);
    expect(status.next?.date).toBe('2026-02-10');
  });

  it('resolves heroes in the milestones', () => {
    const status = serverTimelineStatus('2026-01-01', '2026-01-01');
    expect(status.unlocked[0].heroes.map((h) => h.id).sort()).toEqual([
      'jeronimo',
      'molly',
      'natalia',
      'zinman',
    ]);
  });

  it('has no next milestone once everything is unlocked', () => {
    const status = serverTimelineStatus('2020-01-01', '2026-01-01');
    expect(status.locked).toEqual([]);
    expect(status.next).toBeUndefined();
  });

  it('defaults asOf to now', () => {
    expect(serverTimelineStatus('2020-01-01').age).toBeGreaterThan(2000);
  });

  it('throws RangeError when asOf is before the start date', () => {
    expect(() => serverTimelineStatus('2026-01-02', '2026-01-01')).toThrow(RangeError);
  });
});

describe('unlock keys', () => {
  const dayOfKey = (key: string) =>
    serverTimeline()
      .get()
      .find((m) => m.unlocks.some((u) => u.key === key))?.day;

  it('marks the War Academy unlock on day 220 and the T12 research unlock on day 680', () => {
    expect(dayOfKey('war-academy')).toBe(220);
    expect(dayOfKey('t12-research')).toBe(680);
  });

  it('unlocks Chief Gear by server age: Mythic on day 0, Legendary T4 on day 180, T5 and T6 on day 520', () => {
    expect(dayOfKey('chief-gear-mythic')).toBe(0);
    expect(dayOfKey('chief-gear-legendary-t4')).toBe(180);
    expect(dayOfKey('chief-gear-legendary-t5-t6')).toBe(520);
  });

  it('unlocks Chief Charm levels by server age: 1 to 11 on day 0, 12 to 16 on day 440, 17 and 18 on day 520', () => {
    expect(dayOfKey('chief-charm-levels-1-11')).toBe(0);
    expect(dayOfKey('chief-charm-levels-12-16')).toBe(440);
    expect(dayOfKey('chief-charm-levels-17-18')).toBe(520);
  });

  it('unlocks the Chief Gear converter on day 180 and the Chief Charm converter with the generation 7 heroes', () => {
    expect(dayOfKey('chief-gear-converter')).toBe(180);
    const generation7 = serverTimeline()
      .get()
      .find((m) => m.heroIds.includes('edith'))!;
    expect(dayOfKey('chief-charm-converter')).toBe(generation7.day);
    expect(generation7.day).toBe(440);
  });

  it('states what a piece must have for a converter to unlock', () => {
    const requirement = (key: string) =>
      serverTimeline()
        .get()
        .flatMap((m) => m.unlocks)
        .find((u) => u.key === key)?.requirement;
    expect(requirement('chief-gear-converter')).toBe('Own 1 Legendary Chief Gear');
    expect(requirement('chief-charm-converter')).toContain('level 11 Chief Charm');
  });

  it('keeps the requirement on the resolved unlock', () => {
    const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-180')!]).resolve();
    expect(resolved.unlocks[1]).toEqual({
      name: 'Chief Gear Converter Unlocks',
      key: 'chief-gear-converter',
      requirement: 'Own 1 Legendary Chief Gear',
    });
  });

  describe('icons of the highest gear and charms', () => {
    const imagesOfKey = (key: string) =>
      serverTimeline()
        .get()
        .flatMap((m) => m.unlocks)
        .find((u) => u.key === key)?.images;
    const gearImages = (quality: 'Mythic' | 'Legendary') =>
      chiefGearSlots()
        .get()
        .map((slot) => slot.images[quality]);
    const charmImages = (level: number) =>
      chiefCharmSlots()
        .get()
        .map((slot) => slot.images[level - 1]);

    it('shows the six gear pieces of the highest quality of the unlock', () => {
      expect(imagesOfKey('chief-gear-mythic')).toEqual(gearImages('Mythic'));
      expect(imagesOfKey('chief-gear-legendary-t4')).toEqual(gearImages('Legendary'));
      expect(imagesOfKey('chief-gear-legendary-t5-t6')).toEqual(gearImages('Legendary'));
      expect(imagesOfKey('chief-gear-mythic')).toHaveLength(6);
    });

    it('shows the charm of each troop type at the highest level of the unlock', () => {
      expect(imagesOfKey('chief-charm-levels-1-11')).toEqual(charmImages(11));
      expect(imagesOfKey('chief-charm-levels-12-16')).toEqual(charmImages(16));
      expect(imagesOfKey('chief-charm-levels-17-18')).toEqual(charmImages(18));
      expect(imagesOfKey('chief-charm-levels-17-18')).toHaveLength(3);
    });

    it('points at image files that exist, and has no images on the converters', () => {
      serverTimeline()
        .get()
        .flatMap((m) => m.unlocks)
        .forEach((u) => {
          (u.images ?? []).forEach((img) =>
            expect(existsSync(join(__dirname, '../..', img))).toBe(true),
          );
        });
      expect(imagesOfKey('chief-gear-converter')).toBeUndefined();
      expect(imagesOfKey('chief-charm-converter')).toBeUndefined();
    });

    it('keeps the images on the resolved unlock', () => {
      const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-0')!]).resolve();
      expect(resolved.unlocks[0].images).toEqual(gearImages('Mythic'));
    });
  });

  it('keeps the key on the resolved unlock', () => {
    const [resolved] = new ServerTimelineQuery([serverTimeline().find('day-220')!]).resolve();
    expect(resolved.unlocks[0]).toEqual({ name: 'War Academy Unlocks', key: 'war-academy' });
  });

  it('keeps the key next to the item of an unlock', () => {
    const milestone = {
      id: 'x',
      name: 'X',
      day: 1,
      heroIds: [],
      heroShardEventIds: {},
      expertIds: [],
      petIds: [],
      eventIds: [],
      fireCrystalLevelIds: [],
      unlocks: [{ name: 'Thing', key: 'thing', itemId: 'fire-crystal' }],
    };
    const [resolved] = new ServerTimelineQuery([milestone]).resolve();
    expect(resolved.unlocks[0]).toEqual({
      name: 'Thing',
      key: 'thing',
      item: items().find('fire-crystal'),
    });
  });

  it('gives each key to one unlock only', () => {
    const keys = serverTimeline()
      .get()
      .flatMap((m) => m.unlocks.map((u) => u.key))
      .filter((key) => key !== undefined);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('heroGenerationAt', () => {
  it('starts at generation 1 on day 0', () => {
    expect(heroGenerationAt(0)).toBe(1);
  });

  it('moves to the next generation on the day of its milestone', () => {
    expect(heroGenerationAt(39)).toBe(1);
    expect(heroGenerationAt(40)).toBe(2);
    expect(heroGenerationAt(119)).toBe(2);
    expect(heroGenerationAt(120)).toBe(3);
    expect(heroGenerationAt(1159)).toBe(15);
    expect(heroGenerationAt(1160)).toBe(16);
  });

  it('moves from generation 16 to generation 17 on day 1240', () => {
    expect(heroGenerationAt(1239)).toBe(16);
    expect(heroGenerationAt(1240)).toBe(17);
  });

  it('stays at 17 after the last milestone', () => {
    expect(heroGenerationAt(5000)).toBe(17);
  });

  it('keeps the generation of the last hero milestone between hero days', () => {
    expect(heroGenerationAt(54)).toBe(2);
    expect(heroGenerationAt(194)).toBe(3);
    expect(heroGenerationAt(195)).toBe(4);
  });

  it('matches the generation of the heroes that unlock on each hero milestone', () => {
    for (const m of serverTimeline()
      .get()
      .filter((milestone) => milestone.heroIds.length > 0)) {
      expect(heroGenerationAt(m.day)).toBe(heroes().find(m.heroIds[0])!.generation);
    }
  });

  it('throws RangeError for a negative or non-numeric age', () => {
    expect(() => heroGenerationAt(-1)).toThrow(RangeError);
    expect(() => heroGenerationAt(Number.NaN)).toThrow(RangeError);
  });
});

describe('expert unlock days', () => {
  const expertDays = () =>
    serverTimeline()
      .get()
      .filter((m) => m.expertIds.length > 0)
      .map((m) => [m.day, m.expertIds]);

  it('unlocks the experts on the days that the wiki timeline lists, Gareth on day 270, and Justus on day 360', () => {
    expect(expertDays()).toEqual([
      [120, ['holger', 'agnes', 'cyrille']],
      [160, ['romulus']],
      [200, ['valeria', 'baldur', 'fabian']],
      [230, ['kathy', 'ronne']],
      [270, ['gareth']],
      [360, ['justus']],
    ]);
  });

  it('lists each expert once, with Gareth on day 270', () => {
    const ids = serverTimeline()
      .get()
      .flatMap((m) => m.expertIds);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(11);
    expect(ids).toContain('gareth');
  });

  it('resolves the experts of a milestone', () => {
    const day230 = serverTimeline().find('day-230')!;
    const [resolved] = new ServerTimelineQuery([day230]).resolve();
    expect(resolved.experts.map((e) => e.name)).toEqual(['Kathy', 'Ronne']);
  });
});

describe('generation 17', () => {
  it('unlocks Aiden, Bertha, and Eleanor on day 1240, 80 days after generation 16', () => {
    const day1240 = serverTimeline().find('day-1240')!;
    expect(day1240.day).toBe(1240);
    expect(day1240.heroIds).toEqual(['aiden', 'bertha', 'eleanor']);
    expect(serverTimeline().find('day-1160')!.day + 80).toBe(day1240.day);
    for (const id of day1240.heroIds) expect(heroes().find(id)!.generation).toBe(17);
  });

  it('gives the shard events that the heroes list as sources', () => {
    expect(serverTimeline().find('day-1240')!.heroShardEventIds).toEqual({
      aiden: ['lucky-wheel'],
      bertha: ['king-of-icefield', 'svs-state-of-power'],
      eleanor: ['hall-of-heroes'],
    });
  });

  it('steps 80 days between the hero milestones from generation 6 on', () => {
    const days = serverTimeline()
      .get()
      .filter((m) => m.heroIds.length > 0)
      .map((m) => m.day);
    const generation6 = days.indexOf(360);
    days.slice(generation6 + 1).forEach((day, i) => expect(day - days[generation6 + i]).toBe(80));
  });
});
