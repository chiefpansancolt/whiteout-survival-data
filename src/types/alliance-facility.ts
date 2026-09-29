export interface AllianceFacilityLevel {
  level: number;
  boosterPercent: number;
  heavilyInjuredPercent: number;
  lossesPercent: number;
}

export interface AllianceFacility {
  id: string;
  name: string;
  bonusStat: string;
  levels: AllianceFacilityLevel[];
}
