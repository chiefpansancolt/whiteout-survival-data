import { QueryBase } from '@/common/query-base';
import data from '@/data/hero-gear-enhancement.json';
import { HeroGearEnhancementLevel } from '@/types';

const heroGearEnhancementData: HeroGearEnhancementLevel[] = data as HeroGearEnhancementLevel[];

/** Query builder for HeroGearEnhancementLevel data. All filter methods return a new HeroGearEnhancementQuery for chaining. */
export class HeroGearEnhancementQuery extends QueryBase<HeroGearEnhancementLevel> {
  constructor(data: HeroGearEnhancementLevel[] = heroGearEnhancementData) {
    super(data);
  }

  /** Filter to the row at the given level. */
  byLevel(level: number): HeroGearEnhancementQuery {
    return new HeroGearEnhancementQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a HeroGearEnhancementQuery for the shared Hero Gear enhancement table. Pass `source` to wrap a pre-filtered array. */
export function heroGearEnhancement(
  source: HeroGearEnhancementLevel[] = heroGearEnhancementData,
): HeroGearEnhancementQuery {
  return new HeroGearEnhancementQuery(source);
}
