import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-gear-stats.json';
import { HeroGearSlot, HeroGearStats, TroopType } from '@/types';

const heroGearStatsData: HeroGearStats[] = data as HeroGearStats[];

export class HeroGearStatsQuery extends QueryBase<HeroGearStats> {
  constructor(data: HeroGearStats[] = heroGearStatsData) {
    super(data);
  }

  bySlot(slot: HeroGearSlot): HeroGearStatsQuery {
    return new HeroGearStatsQuery(this.data.filter((s) => s.slot === slot));
  }

  byTroopType(troopType: TroopType): HeroGearStatsQuery {
    return new HeroGearStatsQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

/** Returns a query over the per level stats of every hero gear slot and troop type. Pass `source` to query a different array instead of the packaged data. */
export function heroGearStats(source: HeroGearStats[] = heroGearStatsData): HeroGearStatsQuery {
  return new HeroGearStatsQuery(source);
}
