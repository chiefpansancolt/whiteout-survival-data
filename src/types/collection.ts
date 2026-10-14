import { BonusUnit } from './common';

export interface CollectionReward {
  itemId: string;
  amount: number;
}

export interface CollectionMedallionBuff {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface CollectionMedallion {
  id: string;
  name: string;
  img?: string;
  unlockLevel: number;
  buffs: CollectionMedallionBuff[];
}

export interface CollectionRewardLevel {
  level: number;
  medallionId: string;
  rewards: CollectionReward[];
}
