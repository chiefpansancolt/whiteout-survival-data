import { BonusUnit } from './common';

export type VipBonusUnit = BonusUnit;

export interface VipBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: VipBonusUnit;
}

export interface VipLevel {
  id: string;
  name: string;
  level: number;
  /** XP needed to go from the previous level to this level. It is not a running total. */
  xpRequired: number;
  bonuses: VipBonus[];
}
