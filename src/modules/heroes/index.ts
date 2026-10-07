import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/heroes.json';
import { Hero, HeroClass, HeroRarity } from '@/types';

const heroData: Hero[] = data as Hero[];

export class HeroQuery extends QueryBase<Hero> {
  constructor(data: Hero[] = heroData) {
    super(data);
  }

  byRarity(rarity: HeroRarity): HeroQuery {
    return new HeroQuery(this.data.filter((h) => h.rarity === rarity));
  }

  byClass(heroClass: HeroClass): HeroQuery {
    return new HeroQuery(this.data.filter((h) => h.class === heroClass));
  }
}

/** Returns a query over all heroes. Pass `source` to query a different array instead of the packaged data. */
export function heroes(source: Hero[] = heroData): HeroQuery {
  return new HeroQuery(source);
}

export * from './stat-estimate';
