import { QueryBase } from '@/common/query-base';
import decorationData from '@/data/daybreak-island/decoration.json';
import lumberCampData from '@/data/daybreak-island/lumber-camp.json';
import treeOfLifeData from '@/data/daybreak-island/tree-of-life.json';
import { Decoration, DecorationCategory, LumberCampLevel, TreeOfLifeLevel } from '@/types';

export const DAYBREAK_ISLAND_UNLOCK_FURNACE_LEVEL = 19;

export const DAYBREAK_ISLAND_TIMBERMILL = {
  lifeEssencePerHourPerWorker: 40,
  capacity: 2000,
} as const;

const lumberCampLevelData: LumberCampLevel[] = lumberCampData as LumberCampLevel[];
const treeOfLifeLevelData: TreeOfLifeLevel[] = treeOfLifeData as TreeOfLifeLevel[];
const decorationTypeData: Decoration[] = decorationData as Decoration[];

export class LumberCampQuery extends QueryBase<LumberCampLevel> {
  constructor(data: LumberCampLevel[] = lumberCampLevelData) {
    super(data);
  }
}

export function lumberCamp(source: LumberCampLevel[] = lumberCampLevelData): LumberCampQuery {
  return new LumberCampQuery(source);
}

export class TreeOfLifeQuery extends QueryBase<TreeOfLifeLevel> {
  constructor(data: TreeOfLifeLevel[] = treeOfLifeLevelData) {
    super(data);
  }
}

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

export function decoration(source: Decoration[] = decorationTypeData): DecorationQuery {
  return new DecorationQuery(source);
}
