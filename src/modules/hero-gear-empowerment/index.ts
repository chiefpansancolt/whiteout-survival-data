import { QueryBase } from '@/common/query-base';
import data from '@/data/hero-gear-empowerment.json';
import { HeroGearEmpowermentLevel } from '@/types';

const heroGearEmpowermentData: HeroGearEmpowermentLevel[] = data as HeroGearEmpowermentLevel[];

/** Query builder for HeroGearEmpowermentLevel data. All filter methods return a new HeroGearEmpowermentQuery for chaining. */
export class HeroGearEmpowermentQuery extends QueryBase<HeroGearEmpowermentLevel> {
  constructor(data: HeroGearEmpowermentLevel[] = heroGearEmpowermentData) {
    super(data);
  }

  /** Filter to the row at the given level. */
  byLevel(level: number): HeroGearEmpowermentQuery {
    return new HeroGearEmpowermentQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a HeroGearEmpowermentQuery for the shared Hero Gear empowerment table. Pass `source` to wrap a pre-filtered array. */
export function heroGearEmpowerment(
  source: HeroGearEmpowermentLevel[] = heroGearEmpowermentData,
): HeroGearEmpowermentQuery {
  return new HeroGearEmpowermentQuery(source);
}
