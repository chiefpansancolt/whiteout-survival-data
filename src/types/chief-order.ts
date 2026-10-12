import { BonusUnit } from './common';

export interface ChiefOrderBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
  windowSeconds: number;
}

export interface ChiefOrderReward {
  itemId: string;
  quantity: number;
  chance: number;
}

export interface ChiefOrder {
  id: string;
  name: string;
  img?: string;
  effect: string;
  contentmentCost: number;
  cooldownSeconds: number;
  bonus?: ChiefOrderBonus;
  rewards?: ChiefOrderReward[];
  replaces?: string;
  unlockFireCrystalLevel?: number;
  note?: string;
}
