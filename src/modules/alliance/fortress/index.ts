import { QueryBase } from '@/common/query-base';
import fortressData from '@/data/alliance/alliance-fortress.json';
import { AllianceFortress, AllianceFortressKind } from '@/types';

const allianceFortressData: AllianceFortress[] = fortressData as AllianceFortress[];

/** Query builder for AllianceFortress data. All filter methods return a new AllianceFortressQuery for chaining. */
export class AllianceFortressQuery extends QueryBase<AllianceFortress> {
  constructor(data: AllianceFortress[] = allianceFortressData) {
    super(data);
  }

  /** Filter to one kind of structure: the castle, the 4 strongholds, or the 12 fortresses. */
  ofKind(kind: AllianceFortressKind): AllianceFortressQuery {
    return new AllianceFortressQuery(this.data.filter((f) => f.kind === kind));
  }
}

/** Returns an AllianceFortressQuery for the castle, 4 strongholds, and 12 fortresses. Pass `source` to wrap a pre-filtered array. */
export function allianceFortress(
  source: AllianceFortress[] = allianceFortressData,
): AllianceFortressQuery {
  return new AllianceFortressQuery(source);
}
