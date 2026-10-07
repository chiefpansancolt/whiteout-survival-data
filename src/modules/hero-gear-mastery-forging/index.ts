import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-mastery-forging.json';
import { HeroGearMasteryForgingLevel } from '@/types';

const heroGearMasteryForgingData: HeroGearMasteryForgingLevel[] =
  data as HeroGearMasteryForgingLevel[];

export class HeroGearMasteryForgingQuery extends QueryBase<HeroGearMasteryForgingLevel> {
  constructor(data: HeroGearMasteryForgingLevel[] = heroGearMasteryForgingData) {
    super(data);
  }

  /** Returns every stage row of the given level. Levels 4 to 19 have 5 stages. */
  byLevel(level: number): HeroGearMasteryForgingQuery {
    return new HeroGearMasteryForgingQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a query over the shared Hero Gear mastery forging table. Pass `source` to query a different array instead of the packaged data. */
export function heroGearMasteryForging(
  source: HeroGearMasteryForgingLevel[] = heroGearMasteryForgingData,
): HeroGearMasteryForgingQuery {
  return new HeroGearMasteryForgingQuery(source);
}
