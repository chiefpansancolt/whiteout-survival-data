import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-stats.json';
import { HeroGearSlot, HeroGearStats, TroopType } from '@/types';

const heroGearStatsData: HeroGearStats[] = data as HeroGearStats[];

/** Query builder for HeroGearStats data. All filter methods return a new HeroGearStatsQuery for chaining. */
export class HeroGearStatsQuery extends QueryBase<HeroGearStats> {
  constructor(data: HeroGearStats[] = heroGearStatsData) {
    super(data);
  }

  /** Filter to the stats of the given gear slot. */
  bySlot(slot: HeroGearSlot): HeroGearStatsQuery {
    return new HeroGearStatsQuery(this.data.filter((s) => s.slot === slot));
  }

  /** Filter to the stats for the given troop type. */
  byTroopType(troopType: TroopType): HeroGearStatsQuery {
    return new HeroGearStatsQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

/** Returns a HeroGearStatsQuery for the per level stats of every hero gear slot and troop type. Pass `source` to wrap a pre-filtered array. */
export function heroGearStats(source: HeroGearStats[] = heroGearStatsData): HeroGearStatsQuery {
  return new HeroGearStatsQuery(source);
}
