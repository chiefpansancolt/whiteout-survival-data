import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-slots.json';
import { HeroGearSlotEntry } from '@/types';

const heroGearSlotData: HeroGearSlotEntry[] = data as HeroGearSlotEntry[];

export class HeroGearSlotQuery extends QueryBase<HeroGearSlotEntry> {
  constructor(data: HeroGearSlotEntry[] = heroGearSlotData) {
    super(data);
  }
}

export function heroGearSlots(source: HeroGearSlotEntry[] = heroGearSlotData): HeroGearSlotQuery {
  return new HeroGearSlotQuery(source);
}
