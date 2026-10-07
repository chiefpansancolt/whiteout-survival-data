import { QueryBase } from '@/common/query-base';
import data from '@/data/alliance/alliance-tech.json';
import { AllianceTechCategory, AllianceTechNode } from '@/types';

const allianceTechData: AllianceTechNode[] = data as AllianceTechNode[];

export class AllianceTechQuery extends QueryBase<AllianceTechNode> {
  constructor(data: AllianceTechNode[] = allianceTechData) {
    super(data);
  }

  byCategory(category: AllianceTechCategory): AllianceTechQuery {
    return new AllianceTechQuery(this.data.filter((n) => n.category === category));
  }

  byTier(tier: number): AllianceTechQuery {
    return new AllianceTechQuery(this.data.filter((n) => n.tier === tier));
  }
}

/** Returns a query over all Alliance Tech nodes. Pass `source` to query a different array instead of the packaged data. */
export function allianceTech(source: AllianceTechNode[] = allianceTechData): AllianceTechQuery {
  return new AllianceTechQuery(source);
}
