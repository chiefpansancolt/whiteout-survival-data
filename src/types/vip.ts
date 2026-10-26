import { BonusUnit } from './common';

export type VipBonusUnit = BonusUnit;

export interface VipBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: VipBonusUnit;
}

export interface VipSignInReward {
  streakDay: number;
  /** The VIP points that the daily sign-in gives on this day of the streak. */
  points: number;
  /** Set on the last row, which also applies to every later day of the streak. */
  orMore?: true;
}

export interface VipLevel {
  id: string;
  name: string;
  level: number;
  xpRequired: number;
  bonuses: VipBonus[];
}
