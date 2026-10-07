import { buildings } from '@/modules/buildings';
import { research } from '@/modules/research';
import {
  ResearchCalculation,
  ResearchCalculatorOptions,
  ResearchGoal,
  ResearchItemResult,
  ResearchLevel,
  UnmetResearchPrerequisite,
  UpgradeMaterial,
} from '@/types';

/** The research speed buffs that `calculateResearch()` adds, in percent. */
export const RESEARCH_CALCULATOR = {
  stateBuffSpeedPercent: 10,
  vicePresidentSpeedPercent: { regular: 10, supreme: 15 },
} as const;

function researchSpeed(options: ResearchCalculatorOptions): number {
  const base = options.researchSpeedPercent ?? 0;
  if (!Number.isFinite(base) || base < 0) {
    throw new RangeError('researchSpeedPercent must be a number from 0 up');
  }
  return (
    base +
    (options.stateBuff ? RESEARCH_CALCULATOR.stateBuffSpeedPercent : 0) +
    (options.vicePresident === undefined
      ? 0
      : RESEARCH_CALCULATOR.vicePresidentSpeedPercent[options.vicePresident])
  );
}

function addResources(levels: ResearchLevel[]): UpgradeMaterial[] {
  const totals = new Map<string, number>();
  levels
    .flatMap((l) => l.cost)
    .forEach((c) => totals.set(c.itemId, (totals.get(c.itemId) ?? 0) + c.amount));
  return [...totals].map(([itemId, amount]) => ({ itemId, amount }));
}

function checkGoal(goal: ResearchGoal, levelCount: number): void {
  [
    ['current', goal.current],
    ['goal', goal.goal],
  ].forEach(([name, level]) => {
    if (!Number.isInteger(level) || (level as number) < 0 || (level as number) > levelCount) {
      throw new RangeError(
        `The ${name} level of ${goal.id} must be a whole number from 0 to ${levelCount}`,
      );
    }
  });
  if (goal.goal < goal.current) {
    throw new RangeError(`The goal level of ${goal.id} must not be below the current level`);
  }
}

function buildingLevelIndex(buildingId: string, label: string): number {
  return buildings()
    .find(buildingId)!
    .levels.findIndex((l) => l.label === label);
}

/**
 * Calculates the resources, time, and power for upgrading research lines from a current level to a
 * goal level.
 *
 * Only the levels after the current level up to the goal count, so a goal that equals the current
 * level costs nothing. The time is the research time of all levels added together divided by 1 plus
 * the research speed, rounded down. The result also lists the research levels whose prerequisite line
 * is not at the needed level, and the highest building level that the steps need.
 *
 * @param goals One entry for each research line to upgrade. A line that is left out counts as level 0.
 * @param options The research speed and the buffs that add to it.
 * @throws Error when a goal names a research line that does not exist.
 * @throws RangeError when a level is not a whole number from 0 to the number of levels of the line,
 * when a goal is below its current level, or when the research speed is negative.
 */
export function calculateResearch(
  goals: ResearchGoal[] = [],
  options: ResearchCalculatorOptions = {},
): ResearchCalculation {
  const speed = researchSpeed(options);
  const planned = new Map<string, number>();
  const steps: { goal: ResearchGoal; levels: ResearchLevel[] }[] = goals.map((goal) => {
    const node = research().find(goal.id);
    if (node === undefined) throw new Error(`Unknown research line: ${goal.id}`);
    checkGoal(goal, node.levels.length);
    planned.set(goal.id, Math.max(planned.get(goal.id) ?? 0, goal.current, goal.goal));
    return { goal, levels: node.levels.slice(goal.current, goal.goal) };
  });

  const unmet: UnmetResearchPrerequisite[] = [];
  const buildingNeeds = new Map<string, { index: number; label: string }>();
  steps.forEach(({ goal, levels }) =>
    levels.forEach((level) => {
      level.prerequisites
        .filter((req) => req.type === 'research')
        .forEach((req) => {
          const have = planned.get(req.id) ?? 0;
          if (have < (req.level as number)) {
            unmet.push({
              id: goal.id,
              level: level.level,
              requires: { id: req.id, level: req.level as number },
              planned: have,
            });
          }
        });
      level.prerequisites
        .filter((req) => req.type === 'building')
        .forEach((req) => {
          const label = String(req.level);
          const index = buildingLevelIndex(req.id, label);
          if (index > (buildingNeeds.get(req.id)?.index ?? -1)) {
            buildingNeeds.set(req.id, { index, label });
          }
        });
    }),
  );

  const items: ResearchItemResult[] = steps.map(({ goal, levels }) => {
    const node = research().find(goal.id)!;
    return {
      id: node.id,
      name: node.name,
      category: node.category,
      steps: levels.length,
      resources: addResources(levels),
      power: levels.reduce((sum, l) => sum + l.power, 0),
      baseSeconds: levels.reduce((sum, l) => sum + (l.researchTimeSeconds ?? 0), 0),
    };
  });
  const allLevels = steps.flatMap((s) => s.levels);
  const baseSeconds = items.reduce((sum, i) => sum + i.baseSeconds, 0);
  return {
    items,
    steps: allLevels.length,
    resources: addResources(allLevels),
    power: items.reduce((sum, i) => sum + i.power, 0),
    baseSeconds,
    researchSpeedPercent: speed,
    seconds: Math.floor(baseSeconds / (1 + speed / 100)),
    stepsWithoutTime: allLevels.filter((l) => l.researchTimeSeconds === undefined).length,
    unmetPrerequisites: unmet,
    buildingRequirements: [...buildingNeeds].map(([id, need]) => ({ id, level: need.label })),
  };
}
