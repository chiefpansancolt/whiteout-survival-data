import { BonusUnit } from './common';

export interface CollectionReward {
  /** The id of the item in `items()`. */
  itemId: string;
  amount: number;
}

/** A buff of a medallion. The amount is the total that you have when you hold the medallion. */
export interface CollectionMedallionBuff {
  /** The stat as the game words it, such as `Troops' Attack`. */
  stat: string;
  statKey: string;
  /** The value as the game shows it, such as `+2.0%`. */
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface CollectionMedallion {
  id: string;
  name: string;
  /** The picture of the medallion. */
  img?: string;
  /** The first collection level that gives the medallion. */
  unlockLevel: number;
  /** All the buffs that you have at this medallion, not only the ones that are new. */
  buffs: CollectionMedallionBuff[];
}

/** One level of the collection. */
export interface CollectionRewardLevel {
  level: number;
  /** The id of the medallion that you hold at this level. */
  medallionId: string;
  /** What the level gives when you reach it. It is empty at the first level of a medallion. */
  rewards: CollectionReward[];
}
