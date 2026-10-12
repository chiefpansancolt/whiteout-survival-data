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
  /** 0 for the `30-1` to `30-4` levels. Fire Crystal levels only. */
  fcStage?: number;
  /** Omitted on a stage base row. */
  fcSubLevel?: number;
  /** Derived for Fire Crystal levels, because the wikis list none. */
  prerequisites?: BuildingRequirement[];
  cost: Resource[];
  buildTimeSeconds: number;
  power: number;
  rallyCapacity?: number;
  marchCapacity?: number;
  trainingCapacity?: number;
  /** Set on every standard level, then only on Fire Crystal stage base rows. */
  trainingSpeedBonusPercent?: number;
  researchSpeedBonusPercent?: number;
  /** Set on every standard level, then only on Fire Crystal stage base rows. */
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
