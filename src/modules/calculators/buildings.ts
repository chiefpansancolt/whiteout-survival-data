import { buildings } from '@/modules/buildings';
import {
  Building,
  BuildingCalculation,
  BuildingCalculatorOptions,
  BuildingEventPoints,
  BuildingGoal,
  BuildingLevel,
  BuildingRequirement,
  BuildingStep,
  UnmetBuildingPrerequisite,
  UpgradeMaterial,
} from '@/types';
import { hallOfChiefPowerPoints, scoringPoints } from './event-score';

const RESOURCE_ITEM_IDS: Record<string, string> = {
  Wood: 'wood',
  Coal: 'coal',
  Iron: 'iron',
  Meat: 'meat',
  'Fire Crystals': 'fire-crystal',
  'Refined Fire Crystals': 'refined-fire-crystal',
};

const normalizeName = (name: string): string => name.toLowerCase().replace(/'/g, '');

function findBuilding(name: string): Building | undefined {
  return buildings()
    .get()
    .find((b) => normalizeName(b.name) === normalizeName(name));
}

function levelOf(building: Building, label: string): BuildingLevel {
  const level = building.levels.find((l) => l.label === label);
  if (level === undefined) throw new RangeError(`Unknown level of ${building.id}: ${label}`);
  return level;
}

function orderOf(building: Building, label: string | null): number {
  return label === null ? 0 : levelOf(building, label).order;
}

function buildingById(id: string): Building {
  const building = buildings().find(id);
  if (building === undefined) throw new Error(`Unknown building: ${id}`);
  return building;
}

function stepCost(level: BuildingLevel): UpgradeMaterial[] {
  return level.cost.map((c) => {
    const itemId = RESOURCE_ITEM_IDS[c.name];
    if (itemId === undefined) {
      throw new Error(`The cost ${c.name} of ${level.id} is not a resource that can be calculated`);
    }
    return { itemId, amount: c.count };
  });
}

class Plan {
  readonly steps: BuildingStep[] = [];
  readonly unmet: UnmetBuildingPrerequisite[] = [];
  private readonly reached = new Map<string, number>();

  constructor(levels: Record<string, string | null>) {
    Object.entries(levels).forEach(([id, label]) => this.setStart(buildingById(id), label));
  }

  setStart(building: Building, label: string | null): void {
    this.reached.set(building.id, orderOf(building, label));
  }

  private reachedOrder(building: Building): number {
    return this.reached.get(building.id) ?? 0;
  }

  raise(building: Building, toOrder: number, prerequisite: boolean): void {
    let next = building.levels.find((l) => l.order > this.reachedOrder(building));
    while (next !== undefined && next.order <= toOrder) {
      (next.prerequisites ?? []).forEach((requirement) => this.require(requirement));
      const index = building.levels.indexOf(next);
      this.steps.push({
        buildingId: building.id,
        name: building.name,
        level: next.label,
        prerequisite,
        cost: stepCost(next),
        power: next.power - (building.levels[index - 1]?.power ?? 0),
        baseSeconds: next.buildTimeSeconds,
      });
      this.reached.set(building.id, next.order);
      next = building.levels.find((l) => l.order > this.reachedOrder(building));
    }
  }

  private require(requirement: BuildingRequirement): void {
    const building = findBuilding(requirement.building);
    if (building === undefined) {
      this.unmet.push({ building: requirement.building, level: String(requirement.level) });
      return;
    }
    const order = orderOf(building, String(requirement.level));
    if (order > this.reachedOrder(building)) this.raise(building, order, true);
  }
}

function addResources(steps: BuildingStep[]): UpgradeMaterial[] {
  const totals = new Map<string, number>();
  steps
    .flatMap((s) => s.cost)
    .forEach((c) => totals.set(c.itemId, (totals.get(c.itemId) ?? 0) + c.amount));
  return [...totals].map(([itemId, amount]) => ({ itemId, amount }));
}

function checkNumber(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a number from 0 up`);
  }
}

const speedupPoints = (eventId: string) =>
  scoringPoints(eventId, /^Use 1m (of )?Speedups for Construction/);

function eventPoints(resources: UpgradeMaterial[], power: number): BuildingEventPoints {
  const amount = (itemId: string) => resources.find((r) => r.itemId === itemId)?.amount ?? 0;
  const forEvent = (eventId: string) =>
    amount('fire-crystal') * scoringPoints(eventId, /^Use 1 Fire Crystal to upgrade/) +
    amount('refined-fire-crystal') *
      scoringPoints(eventId, /^Use 1 Refined Fire Crystal to upgrade/);
  return {
    svs: forEvent('svs-state-of-power'),
    kingOfIcefield: forEvent('king-of-icefield'),
    hallOfChief: hallOfChiefPowerPoints(/^Raise 1 Power through Construction/, power),
  };
}

/**
 * Calculates the resources, build time, power, and event points to upgrade buildings.
 *
 * Each goal adds the levels after `current` up to `goal`. When a level needs another building at a
 * higher level than the one in `buildingLevels`, the calculator adds the steps of that building first.
 * Those steps have `prerequisite` set to true. The speed bonus divides the build time. Speedups are not
 * an input. The result gives `speedupMinutesNeeded` and `speedupPointsPerMinute` instead. Only buildings
 * with resource costs can be calculated.
 *
 * @param goals One entry for each building.
 * @param options The buildings you already have and the construction speed.
 * @throws Error when a goal or `buildingLevels` names a building that does not exist, when two goals
 * name the same building, or when a building has a cost that is not a resource.
 * @throws RangeError when a level `label` does not exist for the building, when a goal is below its
 * current level, or when `constructionSpeedPercent` is negative or not finite.
 * @see docs/buildings.md
 */
export function calculateBuildings(
  goals: BuildingGoal[] = [],
  options: BuildingCalculatorOptions = {},
): BuildingCalculation {
  const constructionSpeedPercent = options.constructionSpeedPercent ?? 0;
  checkNumber('constructionSpeedPercent', constructionSpeedPercent);

  const plan = new Plan(options.buildingLevels ?? {});
  const resolved = goals.map((goal, index) => {
    if (goals.findIndex((other) => other.id === goal.id) !== index) {
      throw new Error(`More than one goal for the building ${goal.id}`);
    }
    const building = buildingById(goal.id);
    const goalOrder = orderOf(building, goal.goal);
    if (goalOrder < orderOf(building, goal.current)) {
      throw new RangeError(`The goal level of ${building.id} must not be below the current level`);
    }
    return { building, goal, goalOrder };
  });
  resolved.forEach(({ building, goal }) => plan.setStart(building, goal.current));
  resolved.forEach(({ building, goalOrder }) => plan.raise(building, goalOrder, false));

  const resources = addResources(plan.steps);
  const power = plan.steps.reduce((sum, s) => sum + s.power, 0);
  const baseSeconds = plan.steps.reduce((sum, s) => sum + s.baseSeconds, 0);
  const seconds = Math.floor(baseSeconds / (1 + constructionSpeedPercent / 100));
  const speedupMinutesNeeded = Math.ceil(seconds / 60);

  return {
    steps: plan.steps,
    resources,
    power,
    baseSeconds,
    constructionSpeedPercent,
    seconds,
    speedupMinutesNeeded,
    speedupPointsPerMinute: {
      svs: speedupPoints('svs-state-of-power'),
      kingOfIcefield: speedupPoints('king-of-icefield'),
    },
    eventPoints: eventPoints(resources, power),
    unmetPrerequisites: plan.unmet,
  };
}
