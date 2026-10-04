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

export interface Item {
  id: string;
  name: string;
  img: string;
  category: ItemCategory;
  description?: string;
  sources: string[];
  rewardRates?: ItemRewardRate[];
}
