import { QueryBase } from '@/common/query-base';
import data from '@/data/facilities.json';
import { Facility } from '@/types';

const facilityData: Facility[] = data as Facility[];

/** Query builder for Facility data. All filter methods return a new FacilityQuery for chaining. */
export class FacilityQuery extends QueryBase<Facility> {
  constructor(data: Facility[] = facilityData) {
    super(data);
  }
}

/** Returns a FacilityQuery for all Facility data. Pass `source` to wrap a pre-filtered array. */
export function facilities(source: Facility[] = facilityData): FacilityQuery {
  return new FacilityQuery(source);
}
