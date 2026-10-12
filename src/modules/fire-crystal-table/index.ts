import { QueryBase } from '@/common/query-base';
import data from '@/data/fire-crystal-levels.json';
import { buildings } from '@/modules/buildings';
import { items } from '@/modules/items';
import {
  Building,
  BuildingLevel,
  FireCrystalLevel,
  FireCrystalLevelRange,
  FireCrystalResource,
  FireCrystalTable,
  FireCrystalTableColumn,
  FireCrystalTableRow,
} from '@/types';

const fireCrystalLevelData: FireCrystalLevel[] = data as FireCrystalLevel[];

const RESOURCES: Record<FireCrystalResource, { costName: string; itemId: string }> = {
  fireCrystals: { costName: 'Fire Crystals', itemId: 'fire-crystal' },
  refinedFireCrystals: { costName: 'Refined Fire Crystals', itemId: 'refined-fire-crystal' },
};

export class FireCrystalLevelQuery extends QueryBase<FireCrystalLevel> {
  constructor(data: FireCrystalLevel[] = fireCrystalLevelData) {
    super(data);
  }
}

/** Returns a query over the Fire Crystal level badges FC 1 to FC 10. Pass `source` to query a different array instead of the packaged data. */
export function fireCrystalLevels(
  source: FireCrystalLevel[] = fireCrystalLevelData,
): FireCrystalLevelQuery {
  return new FireCrystalLevelQuery(source);
}

function isUpgradeToStage(level: BuildingLevel, stage: number): boolean {
  const isStageBase = level.fcStage === stage && level.fcSubLevel === undefined;
  const isPreviousStageSubLevel = level.fcStage === stage - 1 && level.fcSubLevel !== undefined;
  return isStageBase || isPreviousStageSubLevel;
}

function stageCost(building: Building, stage: number, resource: FireCrystalResource): number {
  return building.levels
    .filter((level) => isUpgradeToStage(level, stage))
    .flatMap((level) => level.cost)
    .filter((cost) => cost.name === RESOURCES[resource].costName)
    .reduce((sum, cost) => sum + cost.count, 0);
}

function buildingNeedsFireCrystals(building: Building, stages: number[]): boolean {
  return stages.some((stage) => stageCost(building, stage, 'fireCrystals') > 0);
}

function levelsInRange(range: FireCrystalLevelRange | undefined): FireCrystalLevel[] {
  const levels = fireCrystalLevels().get();
  if (range === undefined) return levels;
  const knownLevel = (level: number) => levels.some((l) => l.level === level);
  if (!knownLevel(range.from) || !knownLevel(range.to) || range.from > range.to) {
    throw new RangeError(`Invalid Fire Crystal level range: ${range.from} to ${range.to}`);
  }
  return levels.filter((l) => l.level >= range.from && l.level <= range.to);
}

/**
 * Returns the table of Fire Crystals and Refined Fire Crystals that each building needs to reach
 * each Fire Crystal level. The cost of a level is the sum of the five upgrades that end at its base
 * row. For example, FC 6 adds up `FC 5-1` to `FC 5-4` and `FC 6`. FC 1 adds up `30-1` to `30-4` and
 * `FC 1`.
 *
 * `columns` holds a Fire Crystals column for every level and a Refined Fire Crystals column for the
 * levels that cost any. A cell is `null` when the building has no cost for that level. Pass `range`
 * to keep only the levels from `range.from` to `range.to`. Every range has the same rows, so
 * segments of one table line up. Pass `source` to build the table from a different array of
 * buildings. Only buildings with a Fire Crystal cost get a row. Throws `RangeError` when a level of
 * `range` is not a Fire Crystal level or `range.from` is above `range.to`.
 */
export function fireCrystalTable(
  source: Building[] = buildings().get(),
  range?: FireCrystalLevelRange,
): FireCrystalTable {
  const stages = fireCrystalLevels()
    .get()
    .map((level) => level.level);
  const levels = levelsInRange(range);
  const itemFor = (resource: FireCrystalResource) => items().find(RESOURCES[resource].itemId)!;
  const tableBuildings = source.filter((building) => buildingNeedsFireCrystals(building, stages));

  const columns: FireCrystalTableColumn[] = levels.flatMap((level) => {
    const resources: FireCrystalResource[] = ['fireCrystals'];
    const hasRefinedCost = tableBuildings.some(
      (building) => stageCost(building, level.level, 'refinedFireCrystals') > 0,
    );
    if (hasRefinedCost) resources.push('refinedFireCrystals');
    return resources.map((resource) => ({ level, resource, item: itemFor(resource) }));
  });

  const rows: FireCrystalTableRow[] = tableBuildings.map((building) => ({
    buildingId: building.id,
    name: building.name,
    img: building.img,
    cells: columns.map((column) => {
      const hasCost = stageCost(building, column.level.level, 'fireCrystals') > 0;
      return hasCost ? stageCost(building, column.level.level, column.resource) : null;
    }),
  }));

  const totals = columns.map((_, index) =>
    rows.reduce((sum, row) => sum + (row.cells[index] ?? 0), 0),
  );

  return { columns, rows, totals };
}
