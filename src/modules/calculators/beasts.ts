import { events } from '@/modules/events';
import { heroes } from '@/modules/heroes';
import {
  BeastCalculation,
  BeastCalculatorInput,
  BeastHunts,
  GameEventScoringAction,
} from '@/types';

export const BEAST_CALCULATOR = {
  beastStamina: 10,
  polarTerrorStamina: 25,
  staminaPerCan: 10,
  maxBeastLevel: 30,
} as const;

const BEAST_EVENT_IDS = ['svs-state-of-power', 'defeat-nearby-beasts', 'tundra-games'];

const LEVEL_RANGE = /(?:Lv\.?|level)\s*(\d+)\s*(?:to|-)\s*(\d+)/i;

function enduranceTrainingPercents(): number[] {
  const skill = heroes()
    .find('gina')!
    .skills.expedition.find((s) => s.name === 'Endurance Training')!;
  return skill.levels.map(
    (level) => level.effects.find((effect) => effect.name === 'Stamina Cost Reduction')!.amount,
  );
}

function checkWholeNumber(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a whole number from ${min} to ${max}`);
  }
}

function checkStamina(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a whole number of 0 or more`);
  }
}

function reducedCost(baseCost: number, reductionPercent: number): number {
  return Math.round((baseCost * (100 - reductionPercent)) / 100);
}

function hunts(totalStamina: number, cost: number): BeastHunts {
  const count = Math.floor(totalStamina / cost);
  return { count, staminaLeft: totalStamina - count * cost };
}

function eventRows(eventId: string) {
  const event = events().find(eventId)!;
  const rows = event.days!.flatMap((day) => day.scoring);
  return { event, rows };
}

function pointsPerBeast(rows: GameEventScoringAction[], level: number): number {
  return rows.find((row) => {
    if (/Polar Terror/i.test(row.action) || !/Beast/i.test(row.action)) return false;
    const [, low, high] = row.action.match(LEVEL_RANGE)!;
    return level >= Number(low) && level <= Number(high);
  })!.points;
}

/**
 * Calculates how many beasts or Polar Terrors a stamina budget pays for, and the event points that
 * they score. Planned beast runs and Polar Terrors are paid first, and the stamina left shows how
 * many more hunts it pays for. Gina's Endurance Training skill lowers the stamina cost of each
 * hunt. See `docs/beasts.md`.
 *
 * @param input `stamina` and `staminaCans` default to 0. `beastLevel` is the level of the beasts
 * that the stamina left hunts, from 1 to 30. `beastRuns` and `polarTerrors` are the hunts that you
 * plan, and default to none. `ginaSkillLevel` is the level of Gina's Endurance Training skill, from
 * 1 to 5. Leave it out when Gina is not used.
 * @throws RangeError when `stamina`, `staminaCans`, a run count, or `polarTerrors` is not a whole
 * number of 0 or more, or when a level is not a whole number in range.
 */
export function calculateBeasts(input: BeastCalculatorInput): BeastCalculation {
  const {
    stamina = 0,
    staminaCans = 0,
    beastLevel,
    beastRuns = [],
    polarTerrors: plannedPolarTerrors = 0,
    ginaSkillLevel,
  } = input;
  checkStamina('stamina', stamina);
  checkStamina('staminaCans', staminaCans);
  checkStamina('polarTerrors', plannedPolarTerrors);
  checkWholeNumber('beastLevel', beastLevel, 1, BEAST_CALCULATOR.maxBeastLevel);
  beastRuns.forEach((run, i) => {
    checkWholeNumber(`beastRuns[${i}].level`, run.level, 1, BEAST_CALCULATOR.maxBeastLevel);
    checkStamina(`beastRuns[${i}].count`, run.count);
  });
  const percents = enduranceTrainingPercents();
  if (ginaSkillLevel !== undefined) {
    checkWholeNumber('ginaSkillLevel', ginaSkillLevel, 1, percents.length);
  }

  const reductionPercent = ginaSkillLevel === undefined ? 0 : percents[ginaSkillLevel - 1];
  const totalStamina = stamina + staminaCans * BEAST_CALCULATOR.staminaPerCan;
  const beastCost = reducedCost(BEAST_CALCULATOR.beastStamina, reductionPercent);
  const polarTerrorCost = reducedCost(BEAST_CALCULATOR.polarTerrorStamina, reductionPercent);
  const plannedBeasts = beastRuns.reduce((sum, run) => sum + run.count, 0);
  const staminaNeeded = plannedBeasts * beastCost + plannedPolarTerrors * polarTerrorCost;
  const staminaLeft = Math.max(0, totalStamina - staminaNeeded);
  const beasts = hunts(staminaLeft, beastCost);
  const polarTerrors = hunts(staminaLeft, polarTerrorCost);

  return {
    totalStamina,
    ginaReductionPercent: reductionPercent,
    beastStaminaCost: beastCost,
    polarTerrorStaminaCost: polarTerrorCost,
    planned: {
      beasts: plannedBeasts,
      polarTerrors: plannedPolarTerrors,
      staminaNeeded,
      staminaShort: Math.max(0, staminaNeeded - totalStamina),
      staminaLeft,
    },
    beasts,
    polarTerrors,
    events: BEAST_EVENT_IDS.map((eventId) => {
      const { event, rows } = eventRows(eventId);
      const perBeast = pointsPerBeast(rows, beastLevel);
      const perPolarTerror = rows.find((row) => /Polar Terror/i.test(row.action))!.points;
      const runs = beastRuns.map((run) => {
        const perRun = pointsPerBeast(rows, run.level);
        return {
          level: run.level,
          count: run.count,
          pointsPerBeast: perRun,
          points: run.count * perRun,
        };
      });
      const plannedPoints =
        runs.reduce((sum, run) => sum + run.points, 0) + plannedPolarTerrors * perPolarTerror;
      return {
        eventId,
        name: event.name,
        pointsPerBeast: perBeast,
        pointsPerPolarTerror: perPolarTerror,
        beastRuns: runs,
        plannedPoints,
        beastPoints: plannedPoints + beasts.count * perBeast,
        polarTerrorPoints: plannedPoints + polarTerrors.count * perPolarTerror,
      };
    }),
  };
}
