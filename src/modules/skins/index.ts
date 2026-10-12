import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/skins.json';
import { Skin, SkinType } from '@/types';

const skinData: Skin[] = data as Skin[];

export class SkinQuery extends QueryBase<Skin> {
  constructor(data: Skin[] = skinData) {
    super(data);
  }

  bySkinType(skinType: SkinType): SkinQuery {
    return new SkinQuery(this.data.filter((s) => s.skinType === skinType));
  }
}

export function skins(source: Skin[] = skinData): SkinQuery {
  return new SkinQuery(source);
}
