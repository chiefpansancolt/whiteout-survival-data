import { ChiefGearTroopType } from './chief-gear';
import { Item } from './item';

export type FireCrystalShardTier = 'T11' | 'T12';

export type FireCrystalShardResource = 'fireCrystalShards' | 'refinedFireCrystals';

export type FireCrystalShardRowKind = 'unlock' | 'extras' | 'extrasTotal' | 'total';

export interface FireCrystalShardTableColumn {
  troopType: ChiefGearTroopType;
  tier: FireCrystalShardTier;
  category: string;
  resource: FireCrystalShardResource;
  item: Item;
}

export interface FireCrystalShardTableRow {
  id: string;
  name: string;
  kind: FireCrystalShardRowKind;
  cells: (number | null)[];
}

export interface FireCrystalShardTable {
  columns: FireCrystalShardTableColumn[];
  rows: FireCrystalShardTableRow[];
}
