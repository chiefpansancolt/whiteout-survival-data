export type ItemCategory =
  | 'Hero Items'
  | 'Pet'
  | 'Gear Materials'
  | 'Chest'
  | 'Buff'
  | 'Fire Crystal'
  | 'Experts'
  | 'Teleporter'
  | 'Speedups'
  | 'Others'
  | 'Event';

export interface ItemRewardRate {
  reward: string;
  amount: number;
  probabilityPercent: number;
}

export type SpeedupType =
  'general' | 'construction' | 'troop' | 'research' | 'learning' | 'healing';

export interface ItemSpeedup {
  type: SpeedupType;
  minutes: number;
}

export interface Item {
  id: string;
  name: string;
  img: string;
  category: ItemCategory;
  speedup?: ItemSpeedup;
  description?: string;
  sources: string[];
  rewardRates?: ItemRewardRate[];
}
