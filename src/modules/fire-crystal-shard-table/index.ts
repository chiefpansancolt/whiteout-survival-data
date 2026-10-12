import { items } from '@/modules/items';
import { research } from '@/modules/research';
import {
  ChiefGearTroopType,
  FireCrystalShardResource,
  FireCrystalShardTable,
  FireCrystalShardTableColumn,
  FireCrystalShardTableRow,
  FireCrystalShardTier,
  ResearchNode,
} from '@/types';

const RESOURCE_ITEM_IDS: Record<FireCrystalShardResource, string> = {
  fireCrystalShards: 'fire-crystal-shard',
  refinedFireCrystals: 'refined-fire-crystal',
};

const TROOP_TYPES: ChiefGearTroopType[] = ['Infantry', 'Lancer', 'Marksman'];
const TIERS: FireCrystalShardTier[] = ['T11', 'T12'];

const LAST_UNLOCK_TIER: Record<FireCrystalShardTier, number> = { T11: 5, T12: 1 };

function resourceCost(node: ResearchNode, resource: FireCrystalShardResource): number {
  return node.levels
    .flatMap((level) => level.cost)
    .filter((cost) => cost.itemId === RESOURCE_ITEM_IDS[resource])
    .reduce((sum, cost) => sum + cost.amount, 0);
}

function sum(values: (number | null)[]): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

/**
 * Returns the Fire Crystal Shards and Refined Fire Crystals that the T11 and T12 troop research of
 * each troop type costs. Each column is one troop type, tier, and resource. A Refined Fire Crystals
 * column exists only for a troop type and tier whose research costs any. The Unlock row sums the
 * research that unlocks the troop: tiers 1 to 5 for T11 and tier 1 for T12. The extras are the
 * research after that, one row for each research tier, followed by the sum of the extras and the
 * total.
 *
 * A cell is `null` when the column has no cost for the row. Pass `tiers` to keep only some tiers,
 * such as `['T11']`. The extras rows then hold only the research tiers of those columns. Pass
 * `source` to build the table from a different array of research nodes. Throws `RangeError` when
 * `tiers` has no tier.
 */
export function fireCrystalShardTable(
  source: ResearchNode[] = research().get(),
  tiers: FireCrystalShardTier[] = TIERS,
): FireCrystalShardTable {
  const shownTiers = TIERS.filter((tier) => tiers.includes(tier));
  if (shownTiers.length === 0) throw new RangeError('Pick at least one tier');

  const itemFor = (resource: FireCrystalShardResource) =>
    items().find(RESOURCE_ITEM_IDS[resource])!;
  const nodesOfCategory = (category: string) => source.filter((node) => node.category === category);

  const columns: FireCrystalShardTableColumn[] = TROOP_TYPES.flatMap((troopType) =>
    shownTiers.flatMap((tier) => {
      const category = `${tier} ${troopType}`;
      const resources: FireCrystalShardResource[] = ['fireCrystalShards'];
      const hasRefinedCost = nodesOfCategory(category).some(
        (node) => resourceCost(node, 'refinedFireCrystals') > 0,
      );
      if (hasRefinedCost) resources.push('refinedFireCrystals');
      return resources.map((resource) => ({
        troopType,
        tier,
        category,
        resource,
        item: itemFor(resource),
      }));
    }),
  );

  const unlockNodesOf = (column: FireCrystalShardTableColumn) =>
    nodesOfCategory(column.category).filter((node) => node.tier <= LAST_UNLOCK_TIER[column.tier]);
  const extrasOf = (column: FireCrystalShardTableColumn) =>
    nodesOfCategory(column.category).filter((node) => node.tier > LAST_UNLOCK_TIER[column.tier]);

  const unlockCells = columns.map((column) => {
    const cost = sum(unlockNodesOf(column).map((node) => resourceCost(node, column.resource)));
    return cost > 0 ? cost : null;
  });

  const extrasTiers = [
    ...new Set(columns.flatMap((c) => extrasOf(c).map((node) => node.tier))),
  ].sort((a, b) => a - b);
  const extrasCells = (tier: number) =>
    columns.map((column) => {
      const nodes = extrasOf(column).filter((node) => node.tier === tier);
      return nodes.length > 0
        ? sum(nodes.map((node) => resourceCost(node, column.resource)))
        : null;
    });

  const extrasRows: FireCrystalShardTableRow[] = extrasTiers.map((tier) => ({
    id: `tier-${tier}`,
    name: `Tier ${tier}`,
    kind: 'extras',
    cells: extrasCells(tier),
  }));
  const extrasTotals = columns.map((_, index) => sum(extrasRows.map((row) => row.cells[index])));

  return {
    columns,
    rows: [
      { id: 'unlock', name: 'Unlock', kind: 'unlock', cells: unlockCells },
      ...extrasRows,
      { id: 'extras', name: 'Extras', kind: 'extrasTotal', cells: extrasTotals },
      {
        id: 'total',
        name: 'Total',
        kind: 'total',
        cells: extrasTotals.map((total, index) => total + (unlockCells[index] ?? 0)),
      },
    ],
  };
}
