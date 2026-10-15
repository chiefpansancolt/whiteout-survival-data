import { TroopType } from './calculator';

export interface HeroGearCost {
  itemId: string;
  amount: number;
}

export interface HeroGearEnhancementLevel {
  id: string;
  name: string;
  level: number;
  cost: HeroGearCost[];
  power: number;
}

export interface HeroGearEmpowermentLevel {
  id: string;
  name: string;
  level: number;
  cost: HeroGearCost[];
  power: number;
  milestonePower?: number;
}

export interface HeroGearMasteryForgingLevel {
  id: string;
  name: string;
  level: number;
  stage: number;
  cost: HeroGearCost[];
  statsUpPercent: number;
}

export type HeroGearSlot = 'goggles' | 'gloves' | 'belt' | 'boots';

export interface HeroGearSlotEntry {
  id: HeroGearSlot;
  name: string;
  images: Record<TroopType, string>;
}

export interface HeroGearStatLevel {
  level: number;
  combatStat: number;
  health: number;
  percentStat: number;
}

export interface HeroGearMilestone {
  empowermentLevel: number;
  event: 'Expedition' | 'Exploration';
  stat: string;
}

export interface HeroGearStats {
  id: string;
  name: string;
  slot: HeroGearSlot;
  troopType: TroopType;
  combatStat: 'Attack' | 'Defense';
  percentStat: 'Lethality' | 'Health';
  milestones: HeroGearMilestone[];
  levels: HeroGearStatLevel[];
}
