import { QueryBase } from '@/common/query-base';
import levelData from '@/data/chief/gear-levels.json';
import slotData from '@/data/chief/gear-slots.json';
import { ChiefGearLevel, ChiefGearRarity, ChiefGearSlot, ChiefGearTroopType } from '@/types';

const chiefGearSlotData: ChiefGearSlot[] = slotData as ChiefGearSlot[];
const chiefGearLevelData: ChiefGearLevel[] = levelData as ChiefGearLevel[];

export function chiefGearRarity(tier: string): ChiefGearRarity {
  return tier.replace(/T\d+$/, '') as ChiefGearRarity;
}

export function chiefGearImage(slot: ChiefGearSlot, level: ChiefGearLevel): string {
  return slot.images[chiefGearRarity(level.tier)];
}

export class ChiefGearSlotQuery extends QueryBase<ChiefGearSlot> {
  constructor(data: ChiefGearSlot[] = chiefGearSlotData) {
    super(data);
  }

  byTroopType(troopType: ChiefGearTroopType): ChiefGearSlotQuery {
    return new ChiefGearSlotQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

export function chiefGearSlots(source: ChiefGearSlot[] = chiefGearSlotData): ChiefGearSlotQuery {
  return new ChiefGearSlotQuery(source);
}

export class ChiefGearLevelQuery extends QueryBase<ChiefGearLevel> {
  constructor(data: ChiefGearLevel[] = chiefGearLevelData) {
    super(data);
  }

  /** Matches the tier label exactly. "Epic" does not match "EpicT1". */
  byTier(tier: string): ChiefGearLevelQuery {
    return new ChiefGearLevelQuery(this.data.filter((l) => l.tier === tier));
  }
}

export function chiefGear(source: ChiefGearLevel[] = chiefGearLevelData): ChiefGearLevelQuery {
  return new ChiefGearLevelQuery(source);
}
