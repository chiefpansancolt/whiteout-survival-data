import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/buildings.json';
import { Building, BuildingCategory } from '@/types';

const buildingData: Building[] = data as Building[];

export class BuildingQuery extends QueryBase<Building> {
  constructor(data: Building[] = buildingData) {
    super(data);
  }

  byCategory(category: BuildingCategory): BuildingQuery {
    return new BuildingQuery(this.data.filter((b) => b.category === category));
  }
}

/** Returns a query over all buildings. Pass `source` to query a different array instead of the packaged data. */
export function buildings(source: Building[] = buildingData): BuildingQuery {
  return new BuildingQuery(source);
}
