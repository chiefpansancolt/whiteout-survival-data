import { BonusUnit } from './common';

export type SkinType =
  | 'Avatar Frame'
  | 'Nameplate'
  | 'March Skin'
  | 'City Skin'
  | 'Teleport Skin'
  | 'Name Card'
  | 'Chief Profile';

export interface SkinBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface Skin {
  id: string;
  name: string;
  img: string;
  skinType: SkinType;
  description: string;
  bonus?: SkinBonus;
  sources: string[];
}
