import { QueryBase } from '@/common/query-base';
import data from '@/data/alliance/alliance-territory.json';
import { AllianceBannerLevel } from '@/types';

const allianceBannerData: AllianceBannerLevel[] = data as AllianceBannerLevel[];

export class AllianceBannerQuery extends QueryBase<AllianceBannerLevel> {
  constructor(data: AllianceBannerLevel[] = allianceBannerData) {
    super(data);
  }

  /** Keeps the level range that contains `level`. The result is empty when no range contains it. */
  atLevel(level: number): AllianceBannerQuery {
    return new AllianceBannerQuery(
      this.data.filter((l) => level >= l.minLevel && level <= l.maxLevel),
    );
  }
}

/** Returns a query over the banner build-cost table. Pass `source` to query a different array instead of the packaged data. */
export function allianceBanner(
  source: AllianceBannerLevel[] = allianceBannerData,
): AllianceBannerQuery {
  return new AllianceBannerQuery(source);
}
