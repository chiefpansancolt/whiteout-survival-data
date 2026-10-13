import { QueryBase } from '@/common/query-base';
import data from '@/data/server-timeline.json';
import { events } from '@/modules/events';
import { experts, unreleasedExperts } from '@/modules/experts';
import { fireCrystalLevels } from '@/modules/fire-crystal-table';
import { heroes } from '@/modules/heroes';
import { items } from '@/modules/items';
import { pets } from '@/modules/pets';
import {
  ResolvedServerTimelineMilestone,
  ResolvedServerTimelineUnlock,
  ServerTimelineMilestone,
  ServerTimelineStatus,
  ServerTimelineStatusMilestone,
  ServerTimelineUnlock,
} from '@/types';

const serverTimelineData: ServerTimelineMilestone[] = data as unknown as ServerTimelineMilestone[];

const MS_PER_DAY = 86_400_000;

function findEntries<T extends { id: string }>(
  ids: string[],
  find: (id: string) => T | undefined,
  kind: string,
): T[] {
  return ids.map((id) => {
    const entry = find(id);
    if (!entry) throw new Error(`Unknown ${kind} id: ${id}`);
    return entry;
  });
}

function resolveUnlock({ itemId, ...unlock }: ServerTimelineUnlock): ResolvedServerTimelineUnlock {
  if (itemId === undefined) return unlock;
  return { ...unlock, item: findEntries([itemId], (id) => items().find(id), 'item')[0] };
}

function resolveMilestone(milestone: ServerTimelineMilestone): ResolvedServerTimelineMilestone {
  const {
    heroIds,
    heroShardEventIds,
    expertIds,
    petIds,
    eventIds,
    fireCrystalLevelIds,
    unlocks,
    ...rest
  } = milestone;
  return {
    ...rest,
    unlocks: unlocks.map(resolveUnlock),
    heroes: findEntries(heroIds, (id) => heroes().find(id), 'hero'),
    heroShardEvents: Object.fromEntries(
      heroIds.map((id) => [
        id,
        findEntries(heroShardEventIds[id] ?? [], (eventId) => events().find(eventId), 'event'),
      ]),
    ),
    experts: findEntries(
      expertIds,
      (id) => experts().find(id) ?? unreleasedExperts().find(id),
      'expert',
    ),
    pets: findEntries(petIds, (id) => pets().find(id), 'pet'),
    events: findEntries(eventIds, (id) => events().find(id), 'event'),
    fireCrystalLevels: findEntries(
      fireCrystalLevelIds,
      (id) => fireCrystalLevels().find(id),
      'Fire Crystal level',
    ),
  };
}

export class ServerTimelineQuery extends QueryBase<ServerTimelineMilestone> {
  constructor(data: ServerTimelineMilestone[] = serverTimelineData) {
    super(data);
  }

  /** Includes the milestones on day `age`. */
  unlockedAt(age: number): ServerTimelineQuery {
    return new ServerTimelineQuery(this.data.filter((m) => m.day <= age));
  }

  lockedAt(age: number): ServerTimelineQuery {
    return new ServerTimelineQuery(this.data.filter((m) => m.day > age));
  }

  /** Replaces every id with its entry. Throws `Error` when an id matches no entry. */
  resolve(): ResolvedServerTimelineMilestone[] {
    return this.data.map(resolveMilestone);
  }
}

export function serverTimeline(
  source: ServerTimelineMilestone[] = serverTimelineData,
): ServerTimelineQuery {
  return new ServerTimelineQuery(source);
}

function utcDayStart(date: Date | string, label: string): number {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) throw new RangeError(`Invalid ${label}: ${String(date)}`);
  return Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
}

/**
 * Returns the whole days from the server start date to `asOf`. Day 0 is the start date. Dates count
 * in UTC. Throws `RangeError` when a date is invalid or `asOf` is before the start date.
 */
export function serverAge(startDate: Date | string, asOf: Date | string = new Date()): number {
  const start = utcDayStart(startDate, 'server start date');
  const end = utcDayStart(asOf, 'as-of date');
  if (end < start) throw new RangeError('The as-of date is before the server start date');
  return (end - start) / MS_PER_DAY;
}

/** Returns the resolved milestones that are unlocked and locked at `asOf`. Throws the same errors as `serverAge()`. */
export function serverTimelineStatus(
  startDate: Date | string,
  asOf: Date | string = new Date(),
): ServerTimelineStatus {
  const age = serverAge(startDate, asOf);
  const start = utcDayStart(startDate, 'server start date');
  const withDate = (m: ResolvedServerTimelineMilestone): ServerTimelineStatusMilestone => ({
    ...m,
    date: new Date(start + m.day * MS_PER_DAY).toISOString().slice(0, 10),
  });
  const unlocked = serverTimeline().unlockedAt(age).resolve().map(withDate);
  const locked = serverTimeline().lockedAt(age).resolve().map(withDate);
  return {
    age,
    startDate: new Date(start).toISOString().slice(0, 10),
    unlocked,
    locked,
    next: locked[0],
  };
}

/**
 * Returns the highest hero generation unlocked at a server age in days. The result is 1 on day 0 and
 * 17 from day 1240, because the timeline has no later generation. Throws `RangeError` when the age
 * is negative or not a number.
 */
export function heroGenerationAt(serverAge: number): number {
  if (!(serverAge >= 0)) throw new RangeError(`Invalid server age: ${serverAge}`);
  const generations = serverTimeline()
    .unlockedAt(serverAge)
    .get()
    .flatMap((milestone) => milestone.heroIds)
    .map((id) => heroes().find(id)!.generation);
  return Math.max(...generations);
}
