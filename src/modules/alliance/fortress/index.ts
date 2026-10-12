import { QueryBase } from '@/common/query-base';
import fortressData from '@/data/alliance/alliance-fortress.json';
import { AllianceFortress, AllianceFortressKind } from '@/types';

const allianceFortressData: AllianceFortress[] = fortressData as AllianceFortress[];

export class AllianceFortressQuery extends QueryBase<AllianceFortress> {
  constructor(data: AllianceFortress[] = allianceFortressData) {
    super(data);
  }

  ofKind(kind: AllianceFortressKind): AllianceFortressQuery {
    return new AllianceFortressQuery(this.data.filter((f) => f.kind === kind));
  }
}

export function allianceFortress(
  source: AllianceFortress[] = allianceFortressData,
): AllianceFortressQuery {
  return new AllianceFortressQuery(source);
}
