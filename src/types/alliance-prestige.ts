import { BonusUnit } from './common';

export interface AlliancePrestigeBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface AlliancePrestigeLevel {
  name: string;
  bonuses: AlliancePrestigeBonus[];
}

export interface AlliancePrestigeSource {
  event: string;
  eventId?: string;
  requirement?: string;
}

export interface AlliancePrestigeBuilding {
  id: string;
  name: string;
  source: AlliancePrestigeSource;
  levels: AlliancePrestigeLevel[];
}
