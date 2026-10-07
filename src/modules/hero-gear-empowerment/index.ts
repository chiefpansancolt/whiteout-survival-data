import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-empowerment.json';
import { HeroGearEmpowermentLevel } from '@/types';

const heroGearEmpowermentData: HeroGearEmpowermentLevel[] = data as HeroGearEmpowermentLevel[];

export class HeroGearEmpowermentQuery extends QueryBase<HeroGearEmpowermentLevel> {
  constructor(data: HeroGearEmpowermentLevel[] = heroGearEmpowermentData) {
    super(data);
  }

  byLevel(level: number): HeroGearEmpowermentQuery {
    return new HeroGearEmpowermentQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a query over the shared Hero Gear empowerment table. Pass `source` to query a different array instead of the packaged data. */
export function heroGearEmpowerment(
  source: HeroGearEmpowermentLevel[] = heroGearEmpowermentData,
): HeroGearEmpowermentQuery {
  return new HeroGearEmpowermentQuery(source);
}
