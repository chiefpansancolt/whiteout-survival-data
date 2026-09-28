import { QueryBase } from '@/common/query-base';
import data from '@/data/skins.json';
import { Skin, SkinType } from '@/types';

const skinData: Skin[] = data as Skin[];

/** Query builder for Skin data. All filter methods return a new SkinQuery for chaining. */
export class SkinQuery extends QueryBase<Skin> {
  constructor(data: Skin[] = skinData) {
    super(data);
  }

  /** Filter to skins of the given type. */
  bySkinType(skinType: SkinType): SkinQuery {
    return new SkinQuery(this.data.filter((s) => s.skinType === skinType));
  }
}

/** Returns a SkinQuery for all Skin data. Pass `source` to wrap a pre-filtered array. */
export function skins(source: Skin[] = skinData): SkinQuery {
  return new SkinQuery(source);
}
