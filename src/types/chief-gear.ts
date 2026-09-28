export type ChiefGearTroopType = 'Lancer' | 'Infantry' | 'Marksman';

export interface ChiefGearSlot {
  id: string;
  name: string;
  troopType: ChiefGearTroopType;
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
