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

export function chiefCharmSlots(
  source: ChiefCharmSlot[] = chiefCharmSlotData,
): ChiefCharmSlotQuery {
  return new ChiefCharmSlotQuery(source);
}

/** `level` counts from 1 to 18. */
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

export function chiefCharm(source: ChiefCharmLevel[] = chiefCharmLevelData): ChiefCharmLevelQuery {
  return new ChiefCharmLevelQuery(source);
}
