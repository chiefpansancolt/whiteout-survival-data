import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/research.json';
import { ResearchCategory, ResearchNode } from '@/types';

const researchData: ResearchNode[] = data as ResearchNode[];

export class ResearchQuery extends QueryBase<ResearchNode> {
  constructor(data: ResearchNode[] = researchData) {
    super(data);
  }

  byCategory(category: ResearchCategory): ResearchQuery {
    return new ResearchQuery(this.data.filter((n) => n.category === category));
  }

  byTier(tier: number): ResearchQuery {
    return new ResearchQuery(this.data.filter((n) => n.tier === tier));
  }
}

export function research(source: ResearchNode[] = researchData): ResearchQuery {
  return new ResearchQuery(source);
}
