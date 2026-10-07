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

export interface HeroGearStatLevel {
  /** The enhancement level from 1 to 200. Levels 101 to 200 are empowerment levels 1 to 100. */
  level: number;
  /** The flat Attack or Defense of the piece. */
  combatStat: number;
  /** The flat HP of the piece. */
  health: number;
  /** The percent Lethality or Health of the piece. */
  percentStat: number;
}

export interface HeroGearMilestone {
  /** The empowerment level that unlocks the bonus. */
  empowermentLevel: number;
  event: 'Expedition' | 'Exploration';
  stat: string;
}

/** The stats of one hero gear slot for one troop type, by enhancement level. The values are for one piece. */
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
