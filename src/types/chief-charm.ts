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
  /**
   * Charm score that the upgrade step to this entry adds. A level score is split evenly over its
   * steps, and the remainder goes to the first steps.
   */
  score: number;
}
