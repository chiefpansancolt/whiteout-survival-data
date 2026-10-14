import { ResearchRequirement } from './research';

export interface TroopMaterial {
  itemId: string;
  amount: number;
}

export interface TroopFireCrystalPower {
  level: number;
  power: number;
}

export interface TroopTier {
  tier: number;
  power?: number;
  fireCrystalPower?: TroopFireCrystalPower[];
  unlockCampLevel?: number;
  unlockRequirements?: ResearchRequirement[];
  cost: TroopMaterial[];
  trainingTimeSeconds: number;
  promotionCost?: TroopMaterial[];
}

export interface TroopData {
  id: 'infantry' | 'lancer' | 'marksman';
  name: string;
  tiers: TroopTier[];
}
