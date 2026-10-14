import { Resource } from './common';

export type BuildingCategory = 'Military' | 'Inner City' | 'Entertainment';

export interface BuildingRequirement {
  building: string;
  level: number | string;
}

export interface BuildingLevel {
  id: string;
  label: string;
  order: number;
  tier: 'standard' | 'fireCrystal';
  fcStage?: number;
  fcSubLevel?: number;
  prerequisites?: BuildingRequirement[];
  cost: Resource[];
  buildTimeSeconds: number;
  power: number;
  rallyCapacity?: number;
  marchCapacity?: number;
  trainingCapacity?: number;
  trainingSpeedBonusPercent?: number;
  researchSpeedBonusPercent?: number;
  infirmaryCapacity?: number;
  allyAssists?: number;
  allyHelpTimeSeconds?: number;
  reinforceCapacity?: number;
  storehouseCapacity?: number;
  barricadeDurability?: number;
  troopDeploymentCapacity?: number;
  developmentIndex: number;
}

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  img?: string;
  fireCrystalImg?: string;
  description?: string;
  maxLevelLabel: string;
  levels: BuildingLevel[];
}
