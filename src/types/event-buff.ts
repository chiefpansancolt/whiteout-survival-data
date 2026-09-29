export type BuffApplicability = 'yes' | 'no' | 'partial';

export interface EventBuff {
  id: string;
  name: string;
  cityBonusWarsBuffs: BuffApplicability;
  deploymentCapacity: BuffApplicability;
  petSkills: BuffApplicability;
  daybreakIsland: BuffApplicability;
  presidentSkills: BuffApplicability;
  ministerBuff: BuffApplicability;
  territoryBonuses: BuffApplicability;
  facilityBuff: BuffApplicability;
  marchAccelerator: BuffApplicability;
  frostdragonTyrantTitles: BuffApplicability;
  frostSphereDomainBonus: BuffApplicability;
  notes?: string;
}
