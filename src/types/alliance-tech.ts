export type AllianceTechCategory = 'Growth' | 'Territory' | 'Battle';

export interface AllianceTechRequirement {
  id: string;
  level: number;
}

export interface AllianceTechCost {
  itemId: string;
  amount: number;
}

export interface AllianceTechLevel {
  level: number;
  prerequisites: AllianceTechRequirement[];
  cost: AllianceTechCost[];
  timeSeconds: number;
  bonus?: string;
}

export interface AllianceTechNode {
  id: string;
  name: string;
  img: string;
  category: AllianceTechCategory;
  tier: number;
  description: string;
  levels: AllianceTechLevel[];
}
