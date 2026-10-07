import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-enhancement.json';
import { HeroGearEnhancementLevel } from '@/types';

const heroGearEnhancementData: HeroGearEnhancementLevel[] = data as HeroGearEnhancementLevel[];

export class HeroGearEnhancementQuery extends QueryBase<HeroGearEnhancementLevel> {
  constructor(data: HeroGearEnhancementLevel[] = heroGearEnhancementData) {
    super(data);
  }

  byLevel(level: number): HeroGearEnhancementQuery {
    return new HeroGearEnhancementQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a query over the shared Hero Gear enhancement table. Pass `source` to query a different array instead of the packaged data. */
export function heroGearEnhancement(
  source: HeroGearEnhancementLevel[] = heroGearEnhancementData,
): HeroGearEnhancementQuery {
  return new HeroGearEnhancementQuery(source);
}
