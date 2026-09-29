import { QueryBase } from '@/common/query-base';
import decorationData from '@/data/daybreak-island/decoration.json';
import lumberCampData from '@/data/daybreak-island/lumber-camp.json';
import treeOfLifeData from '@/data/daybreak-island/tree-of-life.json';
import { Decoration, DecorationCategory, LumberCampLevel, TreeOfLifeLevel } from '@/types';

const lumberCampLevelData: LumberCampLevel[] = lumberCampData as LumberCampLevel[];
const treeOfLifeLevelData: TreeOfLifeLevel[] = treeOfLifeData as TreeOfLifeLevel[];
const decorationTypeData: Decoration[] = decorationData as Decoration[];

/** Query builder for LumberCampLevel data. All filter methods return a new LumberCampQuery for chaining. */
export class LumberCampQuery extends QueryBase<LumberCampLevel> {
  constructor(data: LumberCampLevel[] = lumberCampLevelData) {
    super(data);
  }
}

/** Returns a LumberCampQuery for the shared Lumber Camp upgrade table. Pass `source` to wrap a pre-filtered array. */
export function lumberCamp(source: LumberCampLevel[] = lumberCampLevelData): LumberCampQuery {
  return new LumberCampQuery(source);
}

/** Query builder for TreeOfLifeLevel data. All filter methods return a new TreeOfLifeQuery for chaining. */
export class TreeOfLifeQuery extends QueryBase<TreeOfLifeLevel> {
  constructor(data: TreeOfLifeLevel[] = treeOfLifeLevelData) {
    super(data);
  }
}

/** Returns a TreeOfLifeQuery for the Tree of Life upgrade table. Pass `source` to wrap a pre-filtered array. */
export function treeOfLife(source: TreeOfLifeLevel[] = treeOfLifeLevelData): TreeOfLifeQuery {
  return new TreeOfLifeQuery(source);
}

/** Query builder for Decoration data. All filter methods return a new DecorationQuery for chaining. */
export class DecorationQuery extends QueryBase<Decoration> {
  constructor(data: Decoration[] = decorationTypeData) {
    super(data);
  }

  /** Filter to decorations in the given category. */
  byCategory(category: DecorationCategory): DecorationQuery {
    return new DecorationQuery(this.data.filter((d) => d.category === category));
  }
}

/** Returns a DecorationQuery for all Daybreak Island decorations. Pass `source` to wrap a pre-filtered array. */
export function decoration(source: Decoration[] = decorationTypeData): DecorationQuery {
  return new DecorationQuery(source);
}
