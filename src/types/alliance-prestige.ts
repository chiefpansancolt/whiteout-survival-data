import { BonusUnit } from './common';

export interface AlliancePrestigeBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

/** A tier of a prestige building, such as `Silver`. */
export interface AlliancePrestigeLevel {
  name: string;
  bonuses: AlliancePrestigeBonus[];
}

export interface AlliancePrestigeSource {
  event: string;
  /** The id of the event in `events()`. Left out when the package has no data for the event. */
  eventId?: string;
  /** What the alliance must reach in the event to build the building. */
  requirement?: string;
}

export interface AlliancePrestigeBuilding {
  id: string;
  name: string;
  source: AlliancePrestigeSource;
  levels: AlliancePrestigeLevel[];
}
