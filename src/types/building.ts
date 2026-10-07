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
  /** Fire Crystal stage, 0 for the `30-1` to `30-4` levels and 1 to 10 after. Fire Crystal levels only. */
  fcStage?: number;
  /** Sub-level (1 to 4) inside the Fire Crystal stage. Omitted on a stage base row. */
  fcSubLevel?: number;
  /** Levels that must be complete first. Derived for Fire Crystal levels, because the wikis list none. */
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
  /** Score this level adds toward the SvS Wish Station event. */
  developmentIndex: number;
}

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  /** Omitted for buildings that have no published portrait. */
  img?: string;
  fireCrystalImg?: string;
  description?: string;
  maxLevelLabel: string;
  levels: BuildingLevel[];
}
