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
  /** Levels 1 to 100 are enhancement levels. Levels 101 to 200 are empowerment levels 1 to 100. */
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
  /** Goggles and Boots give Attack. Gloves and Belt give Defense. */
  combatStat: 'Attack' | 'Defense';
  /** Goggles and Boots give Lethality. Gloves and Belt give Health. */
  percentStat: 'Lethality' | 'Health';
  milestones: HeroGearMilestone[];
  levels: HeroGearStatLevel[];
}
