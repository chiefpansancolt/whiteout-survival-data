import { QueryBase } from '@/common/query-base';
import data from '@/data/research.json';
import { ResearchCategory, ResearchNode } from '@/types';

const researchData: ResearchNode[] = data as ResearchNode[];

/** Query builder for ResearchNode data. All filter methods return a new ResearchQuery for chaining. */
export class ResearchQuery extends QueryBase<ResearchNode> {
  constructor(data: ResearchNode[] = researchData) {
    super(data);
  }

  /** Filter to nodes in the given category. */
  byCategory(category: ResearchCategory): ResearchQuery {
    return new ResearchQuery(this.data.filter((n) => n.category === category));
  }

  /** Filter to nodes in the given tier. */
  byTier(tier: number): ResearchQuery {
    return new ResearchQuery(this.data.filter((n) => n.tier === tier));
  }
}

/** Returns a ResearchQuery for all ResearchNode data. Pass `source` to wrap a pre-filtered array. */
export function research(source: ResearchNode[] = researchData): ResearchQuery {
  return new ResearchQuery(source);
}
