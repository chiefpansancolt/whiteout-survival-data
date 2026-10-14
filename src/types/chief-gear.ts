export type ChiefGearTroopType = 'Lancer' | 'Infantry' | 'Marksman';

export type ChiefGearRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';

export interface ChiefGearSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
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
  tier: string;
  tierId: string;
  stars: number;
  stage: number;
  materials: ChiefGearMaterial[];
  troopsDeploymentCapacity?: number;
  statTotalPercent: number;
  powerTotal: number;
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
