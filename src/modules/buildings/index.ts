import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/buildings.json';
import { Building } from '@/types';

const buildingData: Building[] = data as Building[];

/** Query builder for Building data. All filter methods return a new BuildingQuery for chaining. */
export class BuildingQuery extends QueryBase<Building> {
  constructor(data: Building[] = buildingData) {
    super(data);
  }
}

/** Returns a BuildingQuery for all Building data. Pass `source` to wrap a pre-filtered array. */
export function buildings(source: Building[] = buildingData): BuildingQuery {
  return new BuildingQuery(source);
}
