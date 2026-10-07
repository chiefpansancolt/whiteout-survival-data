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
  value: string;
}

export interface ResearchLevel {
  level: number;
  prerequisites: ResearchRequirement[];
  cost: ResearchCost[];
  /** Omitted when the source page has no time value. */
  researchTimeSeconds?: number;
  bonus: ResearchBonus[];
  power: number;
}

export interface ResearchNode {
  id: string;
  name: string;
  /** Empty for nodes that have no icon. */
  img: string;
  category: ResearchCategory;
  tier: number;
  levels: ResearchLevel[];
}
