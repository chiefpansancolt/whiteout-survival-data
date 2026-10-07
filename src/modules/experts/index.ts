import { QueryBase } from '@/common/query-base';
import relationshipData from '@/data/chief/expert-relationships.json';
import data from '@/data/chief/experts.json';
import { Expert, ExpertRelationship } from '@/types';

const expertData: Expert[] = data as Expert[];
const expertRelationshipData: ExpertRelationship[] = relationshipData as ExpertRelationship[];

export class ExpertQuery extends QueryBase<Expert> {
  constructor(data: Expert[] = expertData) {
    super(data);
  }

  byGeneration(generation: number): ExpertQuery {
    return new ExpertQuery(this.data.filter((e) => e.generation === generation));
  }
}

/** Returns a query over all experts. Pass `source` to query a different array instead of the packaged data. */
export function experts(source: Expert[] = expertData): ExpertQuery {
  return new ExpertQuery(source);
}

export class ExpertRelationshipQuery extends QueryBase<ExpertRelationship> {
  constructor(data: ExpertRelationship[] = expertRelationshipData) {
    super(data);
  }

  /** Returns the status that applies at the given affinity level (1 to 100). Returns `undefined` below level 1. */
  atAffinityLevel(level: number): ExpertRelationship | undefined {
    return this.data.filter((r) => r.level <= level).pop();
  }
}

/** Returns a query over the 11 relationship statuses. Pass `source` to query a different array instead of the packaged data. */
export function expertRelationships(
  source: ExpertRelationship[] = expertRelationshipData,
): ExpertRelationshipQuery {
  return new ExpertRelationshipQuery(source);
}
