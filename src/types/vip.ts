export type VipBonusUnit = 'percent' | 'flat';

export interface VipBonus {
  stat: string;
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
