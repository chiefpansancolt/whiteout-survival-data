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
  xpRequired: number;
  bonuses: VipBonus[];
}
