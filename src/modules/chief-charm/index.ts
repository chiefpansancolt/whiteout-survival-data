import { QueryBase } from '@/common/query-base';
import levelData from '@/data/chief/charm-levels.json';
import slotData from '@/data/chief/charm-slots.json';
import { ChiefCharmLevel, ChiefCharmSlot, ChiefGearTroopType } from '@/types';

const chiefCharmLevelData: ChiefCharmLevel[] = levelData as ChiefCharmLevel[];
const chiefCharmSlotData: ChiefCharmSlot[] = slotData as ChiefCharmSlot[];

export class ChiefCharmSlotQuery extends QueryBase<ChiefCharmSlot> {
  constructor(data: ChiefCharmSlot[] = chiefCharmSlotData) {
    super(data);
  }

  byTroopType(troopType: ChiefGearTroopType): ChiefCharmSlotQuery {
    return new ChiefCharmSlotQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

/** Returns a query over all Chief Charm slots. Pass `source` to query a different array instead of the packaged data. */
export function chiefCharmSlots(
  source: ChiefCharmSlot[] = chiefCharmSlotData,
): ChiefCharmSlotQuery {
  return new ChiefCharmSlotQuery(source);
}

/** Returns the icon of a slot for a charm level from 1 to 18. */
export function chiefCharmImage(slot: ChiefCharmSlot, level: number): string {
  return slot.images[level - 1];
}

export class ChiefCharmLevelQuery extends QueryBase<ChiefCharmLevel> {
  constructor(data: ChiefCharmLevel[] = chiefCharmLevelData) {
    super(data);
  }

  byLevel(level: number): ChiefCharmLevelQuery {
    return new ChiefCharmLevelQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a query over the Chief Charm upgrade table. Pass `source` to query a different array instead of the packaged data. */
export function chiefCharm(source: ChiefCharmLevel[] = chiefCharmLevelData): ChiefCharmLevelQuery {
  return new ChiefCharmLevelQuery(source);
}
