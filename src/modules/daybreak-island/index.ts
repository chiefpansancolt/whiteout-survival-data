import { QueryBase } from '@/common/query-base';
import decorationData from '@/data/daybreak-island/decoration.json';
import lumberCampData from '@/data/daybreak-island/lumber-camp.json';
import treeOfLifeData from '@/data/daybreak-island/tree-of-life.json';
import { Decoration, DecorationCategory, LumberCampLevel, TreeOfLifeLevel } from '@/types';

const lumberCampLevelData: LumberCampLevel[] = lumberCampData as LumberCampLevel[];
const treeOfLifeLevelData: TreeOfLifeLevel[] = treeOfLifeData as TreeOfLifeLevel[];
const decorationTypeData: Decoration[] = decorationData as Decoration[];

export class LumberCampQuery extends QueryBase<LumberCampLevel> {
  constructor(data: LumberCampLevel[] = lumberCampLevelData) {
    super(data);
  }
}

/** Returns a query over the Lumber Camp upgrade table. Pass `source` to query a different array instead of the packaged data. */
export function lumberCamp(source: LumberCampLevel[] = lumberCampLevelData): LumberCampQuery {
  return new LumberCampQuery(source);
}

export class TreeOfLifeQuery extends QueryBase<TreeOfLifeLevel> {
  constructor(data: TreeOfLifeLevel[] = treeOfLifeLevelData) {
    super(data);
  }
}

/** Returns a query over the Tree of Life upgrade table. Pass `source` to query a different array instead of the packaged data. */
export function treeOfLife(source: TreeOfLifeLevel[] = treeOfLifeLevelData): TreeOfLifeQuery {
  return new TreeOfLifeQuery(source);
}

export class DecorationQuery extends QueryBase<Decoration> {
  constructor(data: Decoration[] = decorationTypeData) {
    super(data);
  }

  byCategory(category: DecorationCategory): DecorationQuery {
    return new DecorationQuery(this.data.filter((d) => d.category === category));
  }
}

/** Returns a query over all decorations. Pass `source` to query a different array instead of the packaged data. */
export function decoration(source: Decoration[] = decorationTypeData): DecorationQuery {
  return new DecorationQuery(source);
}
