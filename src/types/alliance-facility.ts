export interface AllianceFacilityLocation {
  x: number;
  y: number;
}

export interface AllianceFacilityLevel {
  level: number;
  boosterPercent: number;
  heavilyInjuredPercent: number;
  lossesPercent: number;
  ownLimit: number;
  available: number;
  locations: AllianceFacilityLocation[];
}

export interface AllianceFacility {
  id: string;
  name: string;
  bonusStat: string;
  levels: AllianceFacilityLevel[];
}
