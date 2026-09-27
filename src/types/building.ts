import { Resource } from './common';

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
}

export interface Building {
  id: string;
  name: string;
  img: string;
  fireCrystalImg?: string;
  description?: string;
  maxLevelLabel: string;
  levels: BuildingLevel[];
}
