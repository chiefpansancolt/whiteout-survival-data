export type ChiefGearTroopType = 'Lancer' | 'Infantry' | 'Marksman';

export type ChiefGearRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';

export interface ChiefGearSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
  /** A tier with a "T" suffix, such as "EpicT1", uses the icon of its base rarity. */
  images: Record<ChiefGearRarity, string>;
}

export interface ChiefGearMaterial {
  itemId: string;
  amount: number;
}

export interface ChiefGearLevel {
  id: string;
  order: number;
  name: string;
  /** Stars and stage restart in each tier. */
  tier: string;
  tierId: string;
  stars: number;
  stage: number;
  materials: ChiefGearMaterial[];
  /** Absent before Mythic T2 star 3 stage 1, because the source gives no value for earlier rows. */
  troopsDeploymentCapacity?: number;
  statTotalPercent: number;
  powerTotal: number;
  /** A level score is split evenly over its steps. */
  score: number;
}

export interface ChiefGearSetBonusTier {
  id: string;
  name: string;
  percent: number;
}

export type ChiefGearSetBonusStat = 'Defense' | 'Attack';

export interface ChiefGearSetBonus {
  pieces: 3 | 6;
  stat: ChiefGearSetBonusStat;
  percent: number;
  tierId?: string;
}

export interface ChiefGearSetBonuses {
  threePiece: ChiefGearSetBonus;
  sixPiece: ChiefGearSetBonus;
}
