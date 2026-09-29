import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/experts.json';
import { Expert } from '@/types';

const expertData: Expert[] = data as Expert[];

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
