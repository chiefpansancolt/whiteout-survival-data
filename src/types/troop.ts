export interface TroopMaterial {
  itemId: string;
  amount: number;
}

/** What it takes to train one troop of a tier. */
export interface TroopTier {
  tier: number;
  /** Resources for one troop. */
  cost: TroopMaterial[];
  /** Seconds to train one troop with no training speed bonus. */
  trainingTimeSeconds: number;
  /**
   * Resources to promote one troop from the tier below to this tier, when that is not the difference
   * of the two training costs. Set on tier 12 only.
   */
  promotionCost?: TroopMaterial[];
}

export interface TroopData {
  id: 'infantry' | 'lancer' | 'marksman';
  name: string;
  /** Tiers 1 to 12. */
  tiers: TroopTier[];
}
