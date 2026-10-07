export interface TroopMaterial {
  itemId: string;
  amount: number;
}

export interface TroopTier {
  tier: number;
  cost: TroopMaterial[];
  /** Seconds to train one troop with no training speed bonus. */
  trainingTimeSeconds: number;
  /**
   * Resources to promote one troop from the tier below to this tier. This is not the difference of
   * the two training costs. Set on tier 12 only.
   */
  promotionCost?: TroopMaterial[];
}

export interface TroopData {
  id: 'infantry' | 'lancer' | 'marksman';
  name: string;
  /** Tiers 1 to 12. */
  tiers: TroopTier[];
}
