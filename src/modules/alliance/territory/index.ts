import { QueryBase } from '@/common/query-base';
import data from '@/data/alliance/alliance-territory.json';
import { AllianceBannerLevel } from '@/types';

const allianceBannerData: AllianceBannerLevel[] = data as AllianceBannerLevel[];

export class AllianceBannerQuery extends QueryBase<AllianceBannerLevel> {
  constructor(data: AllianceBannerLevel[] = allianceBannerData) {
    super(data);
  }

  /** Matches the row whose level range contains `level`. */
  atLevel(level: number): AllianceBannerQuery {
    return new AllianceBannerQuery(
      this.data.filter((l) => level >= l.minLevel && level <= l.maxLevel),
    );
  }
}

export function allianceBanner(
  source: AllianceBannerLevel[] = allianceBannerData,
): AllianceBannerQuery {
  return new AllianceBannerQuery(source);
}
