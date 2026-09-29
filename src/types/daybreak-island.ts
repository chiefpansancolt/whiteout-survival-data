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
  category: DecorationCategory;
  cost?: DecorationCost[];
  lifeEssenceCost?: number;
  limit?: number;
  /** Common/Uncommon only — a single fixed value, since these can't be leveled at all. */
  prosperityAtMaxLevel?: number;
  /** Rare/Epic/Mythic/Unique only. A still-incomplete level carries a blank buff rather than being omitted. */
  levels?: DecorationLevel[];
  /** True for decorations obtained through a time-limited source (shop rotation, event pack, etc.) rather than standard Rare/Epic/Mythic progression. Omitted, not false, for every other decoration. */
  limited?: boolean;
}
