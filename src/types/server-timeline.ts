import { GameEvent } from './event';
import { Expert } from './expert';
import { Hero } from './hero';
import { Item } from './item';
import { Pet } from './pet';

export interface FireCrystalLevel {
  id: string;
  name: string;
  level: number;
  img: string;
}

export interface ServerTimelineUnlock {
  name: string;
  itemId?: string;
}

export interface ResolvedServerTimelineUnlock {
  name: string;
  item?: Item;
}

export interface ServerTimelineMilestone {
  id: string;
  name: string;
  day: number;
  heroIds: string[];
  heroShardEventIds: Record<string, string[]>;
  expertIds: string[];
  petIds: string[];
  eventIds: string[];
  fireCrystalLevelIds: string[];
  unlocks: ServerTimelineUnlock[];
}

export interface ResolvedServerTimelineMilestone extends Omit<
  ServerTimelineMilestone,
  | 'heroIds'
  | 'heroShardEventIds'
  | 'expertIds'
  | 'petIds'
  | 'eventIds'
  | 'fireCrystalLevelIds'
  | 'unlocks'
> {
  heroes: Hero[];
  heroShardEvents: Record<string, GameEvent[]>;
  experts: Expert[];
  pets: Pet[];
  events: GameEvent[];
  fireCrystalLevels: FireCrystalLevel[];
  unlocks: ResolvedServerTimelineUnlock[];
}

export interface ServerTimelineStatusMilestone extends ResolvedServerTimelineMilestone {
  date: string;
}

export interface ServerTimelineStatus {
  age: number;
  startDate: string;
  unlocked: ServerTimelineStatusMilestone[];
  locked: ServerTimelineStatusMilestone[];
  next?: ServerTimelineStatusMilestone;
}
