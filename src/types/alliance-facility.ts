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
  /** Equals `locations.length`. */
  available: number;
  locations: AllianceFacilityLocation[];
}

export interface AllianceFacility {
  id: string;
  name: string;
  bonusStat: string;
  levels: AllianceFacilityLevel[];
}
