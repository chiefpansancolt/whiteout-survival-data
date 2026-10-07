export type ChiefGearTroopType = 'Lancer' | 'Infantry' | 'Marksman';

export type ChiefGearRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';

export interface ChiefGearSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
  /** One icon per base rarity. A tier with a "T" suffix, such as "EpicT1", uses the icon of its base rarity. */
  images: Record<ChiefGearRarity, string>;
}

export interface ChiefGearMaterial {
  itemId: string;
  amount: number;
}

export interface ChiefGearLevel {
  id: string;
  name: string;
  /** Tier label as the source writes it, such as "Epic" or "LegendaryT3". Stars and stage restart in each tier. */
  tier: string;
  stars: number;
  stage: number;
  materials: ChiefGearMaterial[];
  /** Absent before Mythic T2 star 3 stage 1, because the source gives no value for earlier rows. */
  troopsDeploymentCapacity?: number;
  statTotalPercent: number;
  powerTotal: number;
  /** Gear score that the upgrade step to this row adds. A level score is split evenly over its steps. */
  score: number;
}
