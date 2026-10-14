import { ChiefGearTroopType } from './chief-gear';

export interface ChiefCharmSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
  /** Index is `level - 1`. */
  images: string[];
}

export interface ChiefCharmMaterial {
  itemId: string;
  amount: number;
}

export interface ChiefCharmLevel {
  id: string;
  order: number;
  name: string;
  level: number;
  stage: number;
  materials: ChiefCharmMaterial[];
  statTotalPercent: number;
  powerTotal: number;
  score: number;
}
