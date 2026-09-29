import { QueryBase } from '@/common/query-base';
import data from '@/data/alliance/alliance-territory.json';
import { AllianceBannerLevel } from '@/types';

const allianceBannerData: AllianceBannerLevel[] = data as AllianceBannerLevel[];

/** Query builder for AllianceBannerLevel data. All filter methods return a new AllianceBannerQuery for chaining. */
export class AllianceBannerQuery extends QueryBase<AllianceBannerLevel> {
  constructor(data: AllianceBannerLevel[] = allianceBannerData) {
    super(data);
  }

  /** Filter to the level range that contains the given banner level. */
  atLevel(level: number): AllianceBannerQuery {
    return new AllianceBannerQuery(
      this.data.filter((l) => level >= l.minLevel && level <= l.maxLevel),
    );
  }
}

/** Returns an AllianceBannerQuery for the shared Alliance Territory banner build-cost table. Pass `source` to wrap a pre-filtered array. */
export function allianceBanner(
  source: AllianceBannerLevel[] = allianceBannerData,
): AllianceBannerQuery {
  return new AllianceBannerQuery(source);
}
