import { QueryBase } from '@/common/query-base';
import levelData from '@/data/chief/gear-levels.json';
import slotData from '@/data/chief/gear-slots.json';
import { ChiefGearLevel, ChiefGearSlot, ChiefGearTroopType } from '@/types';

const chiefGearSlotData: ChiefGearSlot[] = slotData as ChiefGearSlot[];
const chiefGearLevelData: ChiefGearLevel[] = levelData as ChiefGearLevel[];

/** Query builder for ChiefGearSlot data. All filter methods return a new ChiefGearSlotQuery for chaining. */
export class ChiefGearSlotQuery extends QueryBase<ChiefGearSlot> {
  constructor(data: ChiefGearSlot[] = chiefGearSlotData) {
    super(data);
  }

  /** Filter to slots that buff the given troop type. */
  byTroopType(troopType: ChiefGearTroopType): ChiefGearSlotQuery {
    return new ChiefGearSlotQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

/** Returns a ChiefGearSlotQuery for all Chief Gear equip slots. Pass `source` to wrap a pre-filtered array. */
export function chiefGearSlots(source: ChiefGearSlot[] = chiefGearSlotData): ChiefGearSlotQuery {
  return new ChiefGearSlotQuery(source);
}

/** Query builder for ChiefGearLevel data. All filter methods return a new ChiefGearLevelQuery for chaining. */
export class ChiefGearLevelQuery extends QueryBase<ChiefGearLevel> {
  constructor(data: ChiefGearLevel[] = chiefGearLevelData) {
    super(data);
  }

  /** Filter to levels in the given tier. */
  byTier(tier: string): ChiefGearLevelQuery {
    return new ChiefGearLevelQuery(this.data.filter((l) => l.tier === tier));
  }
}

/** Returns a ChiefGearLevelQuery for the shared Chief Gear upgrade table. Pass `source` to wrap a pre-filtered array. */
export function chiefGear(source: ChiefGearLevel[] = chiefGearLevelData): ChiefGearLevelQuery {
  return new ChiefGearLevelQuery(source);
}
