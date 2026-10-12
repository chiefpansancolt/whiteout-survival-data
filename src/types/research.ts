import { BonusUnit } from './common';

export type ResearchCategory =
  | 'Battle'
  | 'Growth'
  | 'Economy'
  | 'T11 Infantry'
  | 'T11 Marksman'
  | 'T11 Lancer'
  | 'T12 Infantry'
  | 'T12 Marksman'
  | 'T12 Lancer';

/** An `unreleased` id does not resolve against `research()`. */
export type ResearchRequirementType = 'building' | 'research' | 'unreleased';

export interface ResearchRequirement {
  type: ResearchRequirementType;
  id: string;
  /** For a `building` requirement, the same text as `BuildingLevel.label`. */
  level: number | string;
}

export interface ResearchCost {
  itemId: string;
  amount: number;
}

export interface ResearchBonus {
  stat: string;
  /** Not set for the "Other" stat, which holds unlock text. */
  statKey?: string;
  value: string;
  /** Not set for unlock text. */
  amount?: number;
  unit?: BonusUnit;
  /** The sum of the `amount` of this stat over the levels of the node up to this level. */
  totalAmount?: number;
}

export interface ResearchLevel {
  level: number;
  prerequisites: ResearchRequirement[];
  cost: ResearchCost[];
  researchTimeSeconds?: number;
  bonus: ResearchBonus[];
  power: number;
}

export type ResearchQueue = 'main' | 'warAcademy';

export interface ResearchNode {
  id: string;
  name: string;
  /** Empty for nodes that have no icon. */
  img: string;
  category: ResearchCategory;
  queue: ResearchQueue;
  tier: number;
  levels: ResearchLevel[];
}
