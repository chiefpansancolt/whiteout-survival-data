import { QueryBase } from '@/common/query-base';
import data from '@/data/chief-charm-levels.json';
import { ChiefCharmLevel } from '@/types';

const chiefCharmLevelData: ChiefCharmLevel[] = data as ChiefCharmLevel[];

/** Query builder for ChiefCharmLevel data. All filter methods return a new ChiefCharmLevelQuery for chaining. */
export class ChiefCharmLevelQuery extends QueryBase<ChiefCharmLevel> {
  constructor(data: ChiefCharmLevel[] = chiefCharmLevelData) {
    super(data);
  }

  /** Filter to levels at the given charm level. */
  byLevel(level: number): ChiefCharmLevelQuery {
    return new ChiefCharmLevelQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a ChiefCharmLevelQuery for the shared Chief Charm upgrade table. Pass `source` to wrap a pre-filtered array. */
export function chiefCharm(source: ChiefCharmLevel[] = chiefCharmLevelData): ChiefCharmLevelQuery {
  return new ChiefCharmLevelQuery(source);
}
