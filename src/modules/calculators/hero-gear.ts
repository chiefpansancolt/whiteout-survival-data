import { events } from '@/modules/events';
import { heroGearEmpowerment } from '@/modules/hero-gear-empowerment';
import { heroGearEnhancement } from '@/modules/hero-gear-enhancement';
import { heroGearMasteryForging } from '@/modules/hero-gear-mastery-forging';
import { heroGearStats } from '@/modules/hero-gear-stats';
import {
  HeroGearCalculation,
  HeroGearEmpowermentLevel,
  HeroGearEnhancementLevel,
  HeroGearEventPoints,
  HeroGearGoal,
  HeroGearLevelRange,
  HeroGearLevelResult,
  HeroGearMasteryForgingRange,
  HeroGearMasteryForgingResult,
  HeroGearPiece,
  HeroGearQuality,
  HeroGearRequirement,
  HeroGearStatsResult,
  HeroGearStatValues,
  UpgradeMaterial,
} from '@/types';

export const HERO_GEAR_MAX_ENHANCEMENT_LEVEL = heroGearEnhancement().get().length;

export const HERO_GEAR_BASE_POWER_BY_QUALITY: Record<HeroGearQuality, number> = {
  common: 1000,
  uncommon: 1375,
  rare: 1750,
  epic: 2000,
  mythic: 2500,
};

export const HERO_GEAR_BASE_POWER = HERO_GEAR_BASE_POWER_BY_QUALITY.mythic;

export const HERO_GEAR_MAX_EMPOWERMENT_LEVEL = heroGearEmpowerment().get().length;

export const HERO_GEAR_ENHANCEMENT_REQUIREMENT = {
  afterRowId: 'level-10-stage-0',
  enhancementLevel: HERO_GEAR_MAX_ENHANCEMENT_LEVEL,
} as const;

export const HERO_GEAR_EMPOWERMENT_REQUIREMENT = {
  enhancementLevel: HERO_GEAR_MAX_ENHANCEMENT_LEVEL,
  masteryForgingRowId: 'level-10-stage-0',
} as const;

const EVENT_IDS: Record<keyof HeroGearEventPoints, string> = {
  svs: 'svs-state-of-power',
  allianceShowdown: 'alliance-showdown',
  kingOfIcefield: 'king-of-icefield',
};

function addResources(lists: { itemId: string; amount: number }[][]): UpgradeMaterial[] {
  const totals = new Map<string, number>();
  lists.flat().forEach((m) => totals.set(m.itemId, (totals.get(m.itemId) ?? 0) + m.amount));
  return [...totals].map(([itemId, amount]) => ({ itemId, amount }));
}

function masteryForgingRowIndex(id: string): number {
  const index = heroGearMasteryForging()
    .get()
    .findIndex((row) => row.id === id);
  if (index === -1) throw new Error(`Unknown mastery forging row: ${id}`);
  return index;
}

function masteryForgingResult(range?: HeroGearMasteryForgingRange): HeroGearMasteryForgingResult {
  if (range === undefined) return { steps: 0, resources: [], statsUpPercent: 0 };
  const rows = heroGearMasteryForging().get();
  const from = range.current === null ? -1 : masteryForgingRowIndex(range.current);
  const to = masteryForgingRowIndex(range.goal);
  if (to < from) {
    throw new RangeError('The goal mastery forging row must not be below the current row');
  }
  const steps = rows.slice(from + 1, to + 1);
  return {
    steps: steps.length,
    resources: addResources(steps.map((row) => row.cost)),
    statsUpPercent: rows[to].statsUpPercent - (from === -1 ? 0 : rows[from].statsUpPercent),
  };
}

function levelResult(
  trackName: 'enhancement' | 'empowerment',
  levels: (HeroGearEnhancementLevel | HeroGearEmpowermentLevel)[],
  powerAtLevelZero: number,
  range?: HeroGearLevelRange,
): HeroGearLevelResult {
  if (range === undefined) return { steps: 0, resources: [], power: 0 };
  [
    ['current', range.current],
    ['goal', range.goal],
  ].forEach(([name, level]) => {
    if (!Number.isInteger(level) || (level as number) < 0 || (level as number) > levels.length) {
      throw new RangeError(
        `The ${name} ${trackName} level must be a whole number from 0 to ${levels.length}`,
      );
    }
  });
  if (range.goal < range.current) {
    throw new RangeError(`The goal ${trackName} level must not be below the current level`);
  }
  const powerAt = (level: number) => (level === 0 ? powerAtLevelZero : levels[level - 1].power);
  const steps = levels.slice(range.current, range.goal);
  return {
    steps: steps.length,
    resources: addResources(steps.map((level) => level.cost)),
    power: powerAt(range.goal) - powerAt(range.current),
  };
}

function unmetRequirements(goal: HeroGearGoal): HeroGearRequirement[] {
  const unmet: HeroGearRequirement[] = [];
  const empowering = goal.empowerment !== undefined && goal.empowerment.goal > 0;
  if (goal.quality !== undefined && goal.quality !== 'mythic') {
    if (goal.masteryForging !== undefined)
      unmet.push({ track: 'masteryForging', quality: 'mythic' });
    if (empowering) unmet.push({ track: 'empowerment', quality: 'mythic' });
  }
  const { enhancementLevel, afterRowId } = HERO_GEAR_ENHANCEMENT_REQUIREMENT;
  if (goal.enhancement !== undefined && goal.enhancement.goal < enhancementLevel) {
    if (
      goal.masteryForging !== undefined &&
      masteryForgingRowIndex(goal.masteryForging.goal) > masteryForgingRowIndex(afterRowId)
    ) {
      unmet.push({ track: 'masteryForging', enhancementLevel });
    }
    if (empowering) unmet.push({ track: 'empowerment', enhancementLevel });
  }
  const { masteryForgingRowId } = HERO_GEAR_EMPOWERMENT_REQUIREMENT;
  if (
    empowering &&
    goal.masteryForging !== undefined &&
    masteryForgingRowIndex(goal.masteryForging.goal) < masteryForgingRowIndex(masteryForgingRowId)
  ) {
    unmet.push({ track: 'empowerment', masteryForgingRowId });
  }
  return unmet;
}

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

function stateLevel(enhancement: number, empowerment: number): number {
  return empowerment > 0 ? HERO_GEAR_MAX_ENHANCEMENT_LEVEL + empowerment : enhancement;
}

function masteryPercent(id: string | null | undefined): number {
  if (id == null) return 0;
  return heroGearMasteryForging().get()[masteryForgingRowIndex(id)].statsUpPercent;
}

function masteryPercents(goal: HeroGearGoal): { current: number; goal: number } {
  const current = masteryPercent(goal.masteryForging?.current);
  return {
    current,
    goal: goal.masteryForging === undefined ? current : masteryPercent(goal.masteryForging.goal),
  };
}

function pieceStats(piece: HeroGearPiece, goal: HeroGearGoal): HeroGearStatsResult {
  const stats = heroGearStats().find(`${piece.slot}-${piece.troopType}`)!;
  const currentLevel = stateLevel(goal.enhancement?.current ?? 0, goal.empowerment?.current ?? 0);
  const goalLevel = stateLevel(goal.enhancement?.goal ?? 0, goal.empowerment?.goal ?? 0);
  const percents = masteryPercents(goal);
  const currentMultiplier = 1 + percents.current / 100;
  const goalMultiplier = 1 + percents.goal / 100;
  const valueAt = (level: number, mastery: number): HeroGearStatValues => {
    if (level === 0) return { combatStat: 0, health: 0, percentStat: 0 };
    const row = stats.levels[level - 1];
    return {
      combatStat: Math.floor(row.combatStat * mastery),
      health: Math.floor(row.health * mastery),
      percentStat: roundTo(row.percentStat * mastery, 2),
    };
  };
  const current = valueAt(currentLevel, currentMultiplier);
  const target = valueAt(goalLevel, goalMultiplier);
  return {
    combatStatName: stats.combatStat,
    percentStatName: stats.percentStat,
    current,
    goal: target,
    gain: {
      combatStat: target.combatStat - current.combatStat,
      health: target.health - current.health,
      percentStat: roundTo(target.percentStat - current.percentStat, 2),
    },
    milestones: stats.milestones.filter((m) => {
      const level = HERO_GEAR_MAX_ENHANCEMENT_LEVEL + m.empowermentLevel;
      return level > currentLevel && level <= goalLevel;
    }),
  };
}

function eventPoints(resources: UpgradeMaterial[]): HeroGearEventPoints {
  const amount = (itemId: string) => resources.find((r) => r.itemId === itemId)?.amount ?? 0;
  const pointsFor = (eventId: string, pattern: RegExp) =>
    events()
      .find(eventId)!
      .days!.flatMap((day) => day.scoring)
      .find((row) => pattern.test(row.action))!.points;
  const result = {} as HeroGearEventPoints;
  (Object.keys(EVENT_IDS) as (keyof HeroGearEventPoints)[]).forEach((key) => {
    result[key] =
      amount('essence-stones') * pointsFor(EVENT_IDS[key], /^Use 1 Hero Gear Essence Stone/) +
      amount('mithril') * pointsFor(EVENT_IDS[key], /^Use 1 Mithril/);
  });
  return result;
}

/**
 * Calculates the resources, power, stats, and event points to level one hero gear piece.
 *
 * A piece has three tracks: mastery forging, enhancement, and empowerment. The steps of a track are the
 * rows after the current one up to and including the goal. A track that is not in the goal adds nothing.
 * Mastery forging past `HERO_GEAR_ENHANCEMENT_REQUIREMENT.afterRowId` and empowerment need enhancement
 * level 100. Empowerment also needs mastery forging at `HERO_GEAR_EMPOWERMENT_REQUIREMENT.masteryForgingRowId`.
 * The calculator does not throw for these rules. It lists the affected tracks in `unmetRequirements`
 * when the goal has an `enhancement` range that ends below 100, or a `masteryForging` range that ends
 * below that row. When the goal names a
 * `piece`, the result has the `stats` of the piece. Widgets are not included.
 *
 * Mastery forging and empowerment are for Mythic gear. A goal with another `quality` lists them in
 * `unmetRequirements` with `quality: 'mythic'`. The unforged power of a level is the base power of the
 * quality plus the gain of the Mythic table. The gain is not confirmed for the other qualities.
 *
 * The `power` of an enhancement or empowerment track is the unforged gain. `currentPower`,
 * `goalPower`, and `power` use the mastery forging of the piece: the unforged power of the level times
 * 1 plus the `statsUpPercent` of the row, rounded down, plus the `milestonePower` of the empowerment
 * levels reached. A piece at level 0 has `HERO_GEAR_BASE_POWER`.
 *
 * @param goal The mastery forging, enhancement, and empowerment ranges of one piece.
 * @throws Error when the mastery forging range names a row that does not exist.
 * @throws RangeError when an enhancement or empowerment level is not a whole number from 0 to 100,
 * or when a goal is below its current state.
 * @see docs/hero-gear.md
 */
export function calculateHeroGear(goal: HeroGearGoal = {}): HeroGearCalculation {
  const masteryForging = masteryForgingResult(goal.masteryForging);
  const enhancementLevels = heroGearEnhancement().get();
  const empowermentLevels = heroGearEmpowerment().get();
  const enhancement = levelResult(
    'enhancement',
    enhancementLevels,
    HERO_GEAR_BASE_POWER,
    goal.enhancement,
  );
  const empowerment = levelResult(
    'empowerment',
    empowermentLevels,
    enhancementLevels[HERO_GEAR_MAX_ENHANCEMENT_LEVEL - 1].power,
    goal.empowerment,
  );
  const resources = addResources([
    masteryForging.resources,
    enhancement.resources,
    empowerment.resources,
  ]);
  const qualityOffset =
    HERO_GEAR_BASE_POWER_BY_QUALITY[goal.quality ?? 'mythic'] - HERO_GEAR_BASE_POWER;
  const unforgedPowerAt = (range: { enhancement?: number; empowerment?: number }) => {
    if (range.empowerment) return empowermentLevels[range.empowerment - 1].power + qualityOffset;
    return (
      (range.enhancement ? enhancementLevels[range.enhancement - 1].power : HERO_GEAR_BASE_POWER) +
      qualityOffset
    );
  };
  const percents = masteryPercents(goal);
  const milestonePowerAt = (empowerment = 0) =>
    empowermentLevels
      .slice(0, empowerment)
      .reduce((sum, level) => sum + (level.milestonePower ?? 0), 0);
  const pieceStatePower = (
    range: { enhancement?: number; empowerment?: number },
    percent: number,
  ) =>
    Math.floor((unforgedPowerAt(range) * (100 + percent)) / 100) +
    milestonePowerAt(range.empowerment);
  const currentPower = pieceStatePower(
    { enhancement: goal.enhancement?.current, empowerment: goal.empowerment?.current },
    percents.current,
  );
  const goalPower = pieceStatePower(
    { enhancement: goal.enhancement?.goal, empowerment: goal.empowerment?.goal },
    percents.goal,
  );
  return {
    masteryForging,
    enhancement,
    empowerment,
    resources,
    power: goalPower - currentPower,
    currentPower,
    goalPower,
    eventPoints: eventPoints(resources),
    unmetRequirements: unmetRequirements(goal),
    stats: goal.piece === undefined ? null : pieceStats(goal.piece, goal),
  };
}
