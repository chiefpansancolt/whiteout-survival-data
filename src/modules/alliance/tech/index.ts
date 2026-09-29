import { QueryBase } from '@/common/query-base';
import data from '@/data/alliance/alliance-tech.json';
import { AllianceTechCategory, AllianceTechNode } from '@/types';

const allianceTechData: AllianceTechNode[] = data as AllianceTechNode[];

/** Query builder for AllianceTechNode data. All filter methods return a new AllianceTechQuery for chaining. */
export class AllianceTechQuery extends QueryBase<AllianceTechNode> {
  constructor(data: AllianceTechNode[] = allianceTechData) {
    super(data);
  }

  /** Filter to nodes in the given category. */
  byCategory(category: AllianceTechCategory): AllianceTechQuery {
    return new AllianceTechQuery(this.data.filter((n) => n.category === category));
  }

  /** Filter to nodes in the given tier. */
  byTier(tier: number): AllianceTechQuery {
    return new AllianceTechQuery(this.data.filter((n) => n.tier === tier));
  }
}

/** Returns an AllianceTechQuery for all AllianceTechNode data. Pass `source` to wrap a pre-filtered array. */
export function allianceTech(source: AllianceTechNode[] = allianceTechData): AllianceTechQuery {
  return new AllianceTechQuery(source);
}
