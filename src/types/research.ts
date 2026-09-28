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

export type ResearchRequirementType = 'building' | 'research' | 'unreleased';

export interface ResearchRequirement {
  type: ResearchRequirementType;
  id: string;
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
  researchTimeSeconds?: number;
  bonus: ResearchBonus[];
  power: number;
}

export interface ResearchNode {
  id: string;
  name: string;
  img: string;
  category: ResearchCategory;
  tier: number;
  levels: ResearchLevel[];
}
