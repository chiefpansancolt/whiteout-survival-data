import { QueryBase } from '@/common/query-base';
import facilityData from '@/data/alliance/alliance-facility.json';
import { AllianceFacility } from '@/types';

const allianceFacilityData: AllianceFacility[] = facilityData as AllianceFacility[];

/** Query builder for AllianceFacility data. All filter methods return a new AllianceFacilityQuery for chaining. */
export class AllianceFacilityQuery extends QueryBase<AllianceFacility> {
  constructor(data: AllianceFacility[] = allianceFacilityData) {
    super(data);
  }
}

/** Returns an AllianceFacilityQuery for all 8 Alliance Facility types. Pass `source` to wrap a pre-filtered array. */
export function allianceFacility(
  source: AllianceFacility[] = allianceFacilityData,
): AllianceFacilityQuery {
  return new AllianceFacilityQuery(source);
}
