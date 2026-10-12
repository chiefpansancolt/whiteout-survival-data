import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/facilities.json';
import { Facility } from '@/types';

const facilityData: Facility[] = data as Facility[];

export class FacilityQuery extends QueryBase<Facility> {
  constructor(data: Facility[] = facilityData) {
    super(data);
  }
}

export function facilities(source: Facility[] = facilityData): FacilityQuery {
  return new FacilityQuery(source);
}
