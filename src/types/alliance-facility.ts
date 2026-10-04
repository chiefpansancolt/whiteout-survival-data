export interface AllianceFacilityLocation {
  x: number;
  y: number;
}

export interface AllianceFacilityLevel {
  level: number;
  boosterPercent: number;
  heavilyInjuredPercent: number;
  lossesPercent: number;
  /** Maximum number of facilities of this level one alliance can own. */
  ownLimit: number;
  /** Number of facilities of this level on the map. Equals `locations.length`. */
  available: number;
  locations: AllianceFacilityLocation[];
}

export interface AllianceFacility {
  id: string;
  name: string;
  bonusStat: string;
  levels: AllianceFacilityLevel[];
}
