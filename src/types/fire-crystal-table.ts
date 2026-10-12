import { Item } from './item';

export interface FireCrystalLevel {
  id: string;
  name: string;
  level: number;
  img: string;
}

export interface FireCrystalLevelRange {
  from: number;
  to: number;
}

export type FireCrystalResource = 'fireCrystals' | 'refinedFireCrystals';

export interface FireCrystalTableColumn {
  level: FireCrystalLevel;
  resource: FireCrystalResource;
  item: Item;
}

export interface FireCrystalTableRow {
  buildingId: string;
  name: string;
  img?: string;
  cells: (number | null)[];
}

export interface FireCrystalTable {
  columns: FireCrystalTableColumn[];
  rows: FireCrystalTableRow[];
  totals: number[];
}
