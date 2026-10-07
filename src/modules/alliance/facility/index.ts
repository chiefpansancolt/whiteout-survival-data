import { QueryBase } from '@/common/query-base';
import facilityData from '@/data/alliance/alliance-facility.json';
import { AllianceFacility } from '@/types';

const allianceFacilityData: AllianceFacility[] = facilityData as AllianceFacility[];

export class AllianceFacilityQuery extends QueryBase<AllianceFacility> {
  constructor(data: AllianceFacility[] = allianceFacilityData) {
    super(data);
  }
}

/** Returns a query over all Alliance Facility types. Pass `source` to query a different array instead of the packaged data. */
export function allianceFacility(
  source: AllianceFacility[] = allianceFacilityData,
): AllianceFacilityQuery {
  return new AllianceFacilityQuery(source);
}
