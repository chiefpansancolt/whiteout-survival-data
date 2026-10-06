import { QueryBase } from '@/common/query-base';
import relationshipData from '@/data/chief/expert-relationships.json';
import data from '@/data/chief/experts.json';
import { Expert, ExpertRelationship } from '@/types';

const expertData: Expert[] = data as Expert[];
const expertRelationshipData: ExpertRelationship[] = relationshipData as ExpertRelationship[];

/** Query builder for Expert data. All filter methods return a new ExpertQuery for chaining. */
export class ExpertQuery extends QueryBase<Expert> {
  constructor(data: Expert[] = expertData) {
    super(data);
  }

  /** Filter to experts of the given generation. */
  byGeneration(generation: number): ExpertQuery {
    return new ExpertQuery(this.data.filter((e) => e.generation === generation));
  }
}

/** Returns an ExpertQuery for all Expert data. Pass `source` to wrap a pre-filtered array. */
export function experts(source: Expert[] = expertData): ExpertQuery {
  return new ExpertQuery(source);
}

/** Query builder for the relationship statuses of experts, from Stranger to Intimate. */
export class ExpertRelationshipQuery extends QueryBase<ExpertRelationship> {
  constructor(data: ExpertRelationship[] = expertRelationshipData) {
    super(data);
  }

  /** Returns the status that applies at the given affinity level (1 to 100), or undefined when the level is below the first status. */
  atAffinityLevel(level: number): ExpertRelationship | undefined {
    return this.data.filter((r) => r.level <= level).pop();
  }
}

/** Returns an ExpertRelationshipQuery for the 11 relationship statuses. Pass `source` to wrap a pre-filtered array. */
export function expertRelationships(
  source: ExpertRelationship[] = expertRelationshipData,
): ExpertRelationshipQuery {
  return new ExpertRelationshipQuery(source);
}
