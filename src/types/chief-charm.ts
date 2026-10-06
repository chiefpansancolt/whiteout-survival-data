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
  /**
   * Charm score the upgrade step to this entry adds. Events count it, such as the SvS row "Raise
   * Chief Charm max score by 1". It does not depend on power. The score of a whole level is split
   * evenly over the steps that lead to it, with the remainder on the first steps.
   */
  score: number;
}
