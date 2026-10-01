import { QueryBase } from '@/common/query-base';
import levelData from '@/data/chief/charm-levels.json';
import slotData from '@/data/chief/charm-slots.json';
import { ChiefCharmLevel, ChiefCharmSlot, ChiefGearTroopType } from '@/types';

const chiefCharmLevelData: ChiefCharmLevel[] = levelData as ChiefCharmLevel[];
const chiefCharmSlotData: ChiefCharmSlot[] = slotData as ChiefCharmSlot[];

/** Query builder for ChiefCharmSlot data. All filter methods return a new ChiefCharmSlotQuery for chaining. */
export class ChiefCharmSlotQuery extends QueryBase<ChiefCharmSlot> {
  constructor(data: ChiefCharmSlot[] = chiefCharmSlotData) {
    super(data);
  }

  /** Filter to slots that buff the given troop type. */
  byTroopType(troopType: ChiefGearTroopType): ChiefCharmSlotQuery {
    return new ChiefCharmSlotQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

/** Returns a ChiefCharmSlotQuery for all Chief Charm troop-type slots. Pass `source` to wrap a pre-filtered array. */
export function chiefCharmSlots(
  source: ChiefCharmSlot[] = chiefCharmSlotData,
): ChiefCharmSlotQuery {
  return new ChiefCharmSlotQuery(source);
}

/** Returns a slot's icon for a given charm level (1-18). */
export function chiefCharmImage(slot: ChiefCharmSlot, level: number): string {
  return slot.images[level - 1];
}

/** Query builder for ChiefCharmLevel data. All filter methods return a new ChiefCharmLevelQuery for chaining. */
export class ChiefCharmLevelQuery extends QueryBase<ChiefCharmLevel> {
  constructor(data: ChiefCharmLevel[] = chiefCharmLevelData) {
    super(data);
  }

  /** Filter to levels at the given charm level. */
  byLevel(level: number): ChiefCharmLevelQuery {
    return new ChiefCharmLevelQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a ChiefCharmLevelQuery for the shared Chief Charm upgrade table. Pass `source` to wrap a pre-filtered array. */
export function chiefCharm(source: ChiefCharmLevel[] = chiefCharmLevelData): ChiefCharmLevelQuery {
  return new ChiefCharmLevelQuery(source);
}
