export interface LumberCampLevel {
  id: string;
  name: string;
  level: number;
  workers: number;
  ratePerSecond: number;
  treeOfLifeLevelRequired: number;
  lifeEssenceRequired: number;
}

export type TreeOfLifeBuffUnit = 'percent' | 'flat';

export interface TreeOfLifeBuff {
  stat: string;
  value: string;
  amount: number;
  unit: TreeOfLifeBuffUnit;
}

export interface TreeOfLifeLevel {
  id: string;
  name: string;
  level: number;
  prosperityRequired: number;
  lifeEssenceRequired: number;
  lifeEssencePerHour: number;
  buff: TreeOfLifeBuff;
}

export type DecorationCategory =
  'Basic' | 'Vegetation' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Mythic' | 'Unique';

export interface DecorationCost {
  itemId: string;
  amount: number;
}

export type DecorationBuffUnit = 'percent' | 'flat';

export interface DecorationBuff {
  stat: string;
  value: string;
  amount: number;
  unit: DecorationBuffUnit;
}

export interface DecorationLevel {
  level: number;
  cost: number;
  prosperity: number;
  buff: DecorationBuff;
}

export interface Decoration {
  id: string;
  name: string;
  /** Icon path. Present only for decorations that have an image. */
  img?: string;
  category: DecorationCategory;
  cost?: DecorationCost[];
  lifeEssenceCost?: number;
  limit?: number;
  /** Common and Uncommon only. These decorations cannot be upgraded, so the value is fixed. */
  prosperityAtMaxLevel?: number;
  /** Rare, Epic, Mythic, and Unique only. A level without known buff data has a blank buff. */
  levels?: DecorationLevel[];
  /** True for decorations from a time-limited source, such as a shop rotation or event pack. Omitted otherwise. */
  limited?: boolean;
}
