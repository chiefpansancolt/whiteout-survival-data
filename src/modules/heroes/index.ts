import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/heroes.json';
import { Hero, HeroClass, HeroRarity } from '@/types';

const heroData: Hero[] = data as Hero[];

/** Query builder for Hero data. All filter methods return a new HeroQuery for chaining. */
export class HeroQuery extends QueryBase<Hero> {
  constructor(data: Hero[] = heroData) {
    super(data);
  }

  /** Filter to heroes of the given rarity. */
  byRarity(rarity: HeroRarity): HeroQuery {
    return new HeroQuery(this.data.filter((h) => h.rarity === rarity));
  }

  /** Filter to heroes of the given class. */
  byClass(heroClass: HeroClass): HeroQuery {
    return new HeroQuery(this.data.filter((h) => h.class === heroClass));
  }
}

/** Returns a HeroQuery for all Hero data. Pass `source` to wrap a pre-filtered array. */
export function heroes(source: Hero[] = heroData): HeroQuery {
  return new HeroQuery(source);
}

export * from './stat-estimate';
