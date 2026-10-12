import { QueryBase } from '@/common/query-base';
import fireCrystalLevels from '@/data/fire-crystal-levels.json';
import data from '@/data/server-timeline.json';
import { events } from '@/modules/events';
import { experts } from '@/modules/experts';
import { heroes } from '@/modules/heroes';
import { items } from '@/modules/items';
import { pets } from '@/modules/pets';
import {
  FireCrystalLevel,
  ResolvedServerTimelineMilestone,
  ResolvedServerTimelineUnlock,
  ServerTimelineMilestone,
  ServerTimelineStatus,
  ServerTimelineStatusMilestone,
  ServerTimelineUnlock,
} from '@/types';

const serverTimelineData: ServerTimelineMilestone[] = data as unknown as ServerTimelineMilestone[];

const fireCrystalLevelData: FireCrystalLevel[] = fireCrystalLevels as FireCrystalLevel[];

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

function resolveUnlock({ name, itemId }: ServerTimelineUnlock): ResolvedServerTimelineUnlock {
  if (itemId === undefined) return { name };
  return { name, item: findEntries([itemId], (id) => items().find(id), 'item')[0] };
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
    experts: findEntries(expertIds, (id) => experts().find(id), 'expert'),
    pets: findEntries(petIds, (id) => pets().find(id), 'pet'),
    events: findEntries(eventIds, (id) => events().find(id), 'event'),
    fireCrystalLevels: findEntries(
      fireCrystalLevelIds,
      (id) => fireCrystalLevelData.find((level) => level.id === id),
      'Fire Crystal level',
    ),
  };
}

export class ServerTimelineQuery extends QueryBase<ServerTimelineMilestone> {
  constructor(data: ServerTimelineMilestone[] = serverTimelineData) {
    super(data);
  }

  /** Keeps the milestones at or before this server age in days. */
  unlockedAt(age: number): ServerTimelineQuery {
    return new ServerTimelineQuery(this.data.filter((m) => m.day <= age));
  }

  /** Keeps the milestones after this server age in days. */
  lockedAt(age: number): ServerTimelineQuery {
    return new ServerTimelineQuery(this.data.filter((m) => m.day > age));
  }

  /**
   * Returns the milestones with every id replaced by its entry: heroes, experts, pets, and events
   * from their modules, Fire Crystal level badges, and the item of each unlock. Throws `Error`
   * when an id matches no entry.
   */
  resolve(): ResolvedServerTimelineMilestone[] {
    return this.data.map(resolveMilestone);
  }
}

/** Returns a query over all server timeline milestones. Pass `source` to query a different array instead of the packaged data. */
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
 * in UTC. A string must be a date such as `2026-01-15`. Throws `RangeError` when a date is invalid
 * or `asOf` is before the start date.
 */
export function serverAge(startDate: Date | string, asOf: Date | string = new Date()): number {
  const start = utcDayStart(startDate, 'server start date');
  const end = utcDayStart(asOf, 'as-of date');
  if (end < start) throw new RangeError('The as-of date is before the server start date');
  return (end - start) / MS_PER_DAY;
}

/**
 * Returns the server age and the milestones that are unlocked and locked at `asOf`, with the
 * heroes, experts, pets, and events of each milestone resolved. Throws the same errors as `serverAge()`.
 */
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
