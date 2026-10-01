export type ChiefGearTroopType = 'Lancer' | 'Infantry' | 'Marksman';

export type ChiefGearRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';

export interface ChiefGearSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
  /**
   * One icon per rarity. `ChiefGearLevel.tier` values with a "T" sub-tier suffix (e.g. "EpicT1",
   * "LegendaryT3") share their base rarity's icon -- the piece's appearance stops changing once it
   * reaches that rarity.
   */
  images: Record<ChiefGearRarity, string>;
}

export interface ChiefGearMaterial {
  itemId: string;
  amount: number;
}

export interface ChiefGearLevel {
  id: string;
  name: string;
  tier: string;
  stars: number;
  stage: number;
  materials: ChiefGearMaterial[];
  troopsDeploymentCapacity?: number;
  statTotalPercent: number;
  powerTotal: number;
}
