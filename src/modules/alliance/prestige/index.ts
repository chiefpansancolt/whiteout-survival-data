import { QueryBase } from '@/common/query-base';
import prestigeData from '@/data/alliance/alliance-prestige.json';
import { AlliancePrestigeBuilding } from '@/types';

const alliancePrestigeData: AlliancePrestigeBuilding[] = prestigeData as AlliancePrestigeBuilding[];

export class AlliancePrestigeQuery extends QueryBase<AlliancePrestigeBuilding> {
  constructor(data: AlliancePrestigeBuilding[] = alliancePrestigeData) {
    super(data);
  }
}

export function alliancePrestige(
  source: AlliancePrestigeBuilding[] = alliancePrestigeData,
): AlliancePrestigeQuery {
  return new AlliancePrestigeQuery(source);
}
