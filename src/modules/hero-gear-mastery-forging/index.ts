import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-mastery-forging.json';
import { HeroGearMasteryForgingLevel } from '@/types';

const heroGearMasteryForgingData: HeroGearMasteryForgingLevel[] =
  data as HeroGearMasteryForgingLevel[];

export class HeroGearMasteryForgingQuery extends QueryBase<HeroGearMasteryForgingLevel> {
  constructor(data: HeroGearMasteryForgingLevel[] = heroGearMasteryForgingData) {
    super(data);
  }

  byLevel(level: number): HeroGearMasteryForgingQuery {
    return new HeroGearMasteryForgingQuery(this.data.filter((l) => l.level === level));
  }
}

export function heroGearMasteryForging(
  source: HeroGearMasteryForgingLevel[] = heroGearMasteryForgingData,
): HeroGearMasteryForgingQuery {
  return new HeroGearMasteryForgingQuery(source);
}
