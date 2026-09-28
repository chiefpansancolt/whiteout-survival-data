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
