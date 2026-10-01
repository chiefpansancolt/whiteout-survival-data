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
  /** XP needed to go from the previous level to this one, not a running total. */
  xpRequired: number;
  bonuses: VipBonus[];
}
