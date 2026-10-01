import { ChiefGearTroopType } from './chief-gear';

export interface ChiefCharmSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
  /** One icon per level, 1-18. `images[level - 1]` is that level's icon. */
  images: string[];
}

export interface ChiefCharmMaterial {
  itemId: string;
  amount: number;
}

export interface ChiefCharmLevel {
  id: string;
  name: string;
  level: number;
  stage: number;
  materials: ChiefCharmMaterial[];
  statTotalPercent: number;
  powerTotal: number;
}
