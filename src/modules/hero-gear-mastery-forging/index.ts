import { QueryBase } from '@/common/query-base';
import data from '@/data/hero-gear-mastery-forging.json';
import { HeroGearMasteryForgingLevel } from '@/types';

const heroGearMasteryForgingData: HeroGearMasteryForgingLevel[] =
  data as HeroGearMasteryForgingLevel[];

/** Query builder for HeroGearMasteryForgingLevel data. All filter methods return a new HeroGearMasteryForgingQuery for chaining. */
export class HeroGearMasteryForgingQuery extends QueryBase<HeroGearMasteryForgingLevel> {
  constructor(data: HeroGearMasteryForgingLevel[] = heroGearMasteryForgingData) {
    super(data);
  }

  /** Filter to rows at the given level. */
  byLevel(level: number): HeroGearMasteryForgingQuery {
    return new HeroGearMasteryForgingQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a HeroGearMasteryForgingQuery for the shared Hero Master Forging table. Pass `source` to wrap a pre-filtered array. */
export function heroGearMasteryForging(
  source: HeroGearMasteryForgingLevel[] = heroGearMasteryForgingData,
): HeroGearMasteryForgingQuery {
  return new HeroGearMasteryForgingQuery(source);
}
