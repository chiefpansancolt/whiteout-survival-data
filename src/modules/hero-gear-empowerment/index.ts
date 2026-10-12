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

export function heroGearEmpowerment(
  source: HeroGearEmpowermentLevel[] = heroGearEmpowermentData,
): HeroGearEmpowermentQuery {
  return new HeroGearEmpowermentQuery(source);
}
