import { events } from '@/modules/events';
import { pets } from '@/modules/pets';
import {
  Pet,
  PetCalculation,
  PetEventPoints,
  PetGoal,
  PetItemResult,
  UpgradeMaterial,
} from '@/types';

/** Pets advance at every level that is a multiple of this number. */
export const PET_ADVANCEMENT_INTERVAL = 10;

const PET_EVENT_IDS: Record<keyof PetEventPoints, string> = {
  svs: 'svs-state-of-power',
  allianceShowdown: 'alliance-showdown',
  kingOfIcefield: 'king-of-icefield',
};

/** The points that one point of pet advancement score is worth in each event, read from the scoring row of the event. */
function pointsPerScore(): PetEventPoints {
  const result = {} as PetEventPoints;
  (Object.keys(PET_EVENT_IDS) as (keyof PetEventPoints)[]).forEach((key) => {
    result[key] = events()
      .find(PET_EVENT_IDS[key])!
      .days!.flatMap((day) => day.scoring)
      .find((row) => /^Pet advancement score/.test(row.action))!.points;
  });
  return result;
}

function scaleEventPoints(score: number, perScore: PetEventPoints): PetEventPoints {
  return {
    svs: score * perScore.svs,
    allianceShowdown: score * perScore.allianceShowdown,
    kingOfIcefield: score * perScore.kingOfIcefield,
  };
}

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

function checkLevel(pet: Pet, name: string, level: number): void {
  if (!Number.isInteger(level) || level < 1 || level > pet.maxLevel) {
    throw new RangeError(
      `The ${name} level of ${pet.id} must be a whole number from 1 to ${pet.maxLevel}`,
    );
  }
}

function checkAdvanced(pet: Pet, name: string, level: number, advanced: boolean | undefined): void {
  if (advanced && level % PET_ADVANCEMENT_INTERVAL !== 0) {
    throw new RangeError(
      `The ${name} advancement of ${pet.id} needs a level that is a multiple of ${PET_ADVANCEMENT_INTERVAL}`,
    );
  }
}

function addResources(lists: UpgradeMaterial[][]): UpgradeMaterial[] {
  const totals = new Map<string, number>();
  lists.flat().forEach((m) => totals.set(m.itemId, (totals.get(m.itemId) ?? 0) + m.amount));
  return [...totals].map(([itemId, amount]) => ({ itemId, amount }));
}

function petResult(goal: PetGoal): PetItemResult {
  const pet = pets().find(goal.id);
  if (pet === undefined) throw new Error(`Unknown pet: ${goal.id}`);
  checkLevel(pet, 'current', goal.current);
  checkLevel(pet, 'goal', goal.goal);
  if (goal.goal < goal.current) {
    throw new RangeError(`The goal level of ${pet.id} must not be below the current level`);
  }
  checkAdvanced(pet, 'current', goal.current, goal.currentAdvanced);
  checkAdvanced(pet, 'goal', goal.goal, goal.goalAdvanced);

  const row = (level: number) => pet.levels[level - 1];
  const food = pet.levels.slice(goal.current, goal.goal).reduce((sum, l) => sum + l.petFoodCost, 0);
  const advancementLevels = pet.levels
    .filter((l) => l.advancementMaterials !== undefined)
    .map((l) => l.level)
    .filter((level) => {
      const passed = level >= goal.current && level < goal.goal;
      const atGoal = level === goal.goal && goal.goalAdvanced === true;
      const alreadyDone = level === goal.current && goal.currentAdvanced === true;
      return (passed || atGoal) && !alreadyDone;
    });
  const stat = (
    level: number,
    advanced: boolean | undefined,
    key: 'troopAttack' | 'troopDefense' | 'troopsPower',
  ) => (advanced ? row(level)[key].refinedValue! : row(level)[key].value);
  const gain = (key: 'troopAttack' | 'troopDefense' | 'troopsPower') =>
    stat(goal.goal, goal.goalAdvanced, key) - stat(goal.current, goal.currentAdvanced, key);

  const advancementScore = advancementLevels.reduce(
    (sum, level) => sum + row(level).advancementScore!,
    0,
  );

  return {
    id: pet.id,
    name: pet.name,
    levels: goal.goal - goal.current,
    advancements: advancementLevels.length,
    resources: addResources([
      ...(food > 0 ? [[{ itemId: 'pet-food', amount: food }]] : []),
      ...advancementLevels.map((level) => row(level).advancementMaterials!),
    ]),
    troopAttack: roundTo(gain('troopAttack'), 2),
    troopDefense: roundTo(gain('troopDefense'), 2),
    power: gain('troopsPower'),
    advancementScore,
    eventPoints: scaleEventPoints(advancementScore, pointsPerScore()),
  };
}

/**
 * Calculates the resources and the stat gains for leveling pets from a current level to a goal level.
 *
 * Each level costs pet food. A pet advances at every level that is a multiple of 10, and it needs the
 * advancement before it can go past that level, so a range that starts at or passes a multiple of 10
 * pays for that advancement. A goal that is a multiple of 10 only pays for its advancement when
 * `goalAdvanced` is true, and a pet that is already advanced at its current level (`currentAdvanced`)
 * does not pay for it again. The stat gains are the difference between the stats of the two states.
 * Each advancement adds its pet advancement score, which SvS, Alliance Showdown, and King of Icefield
 * count: the event points are the score times the points of the "Pet advancement score increases by 1"
 * row of the event. Pets have no training time in the data, so the result has no time.
 *
 * @param goals One entry for each pet to upgrade.
 * @throws Error when a goal names a pet that does not exist.
 * @throws RangeError when a level is not a whole number from 1 to the max level of the pet, when a
 * goal is below its current level, or when an advanced flag is set on a level that is not a multiple of 10.
 */
export function calculatePets(goals: PetGoal[] = []): PetCalculation {
  const items = goals.map(petResult);
  const advancementScore = items.reduce((sum, i) => sum + i.advancementScore, 0);
  return {
    items,
    levels: items.reduce((sum, i) => sum + i.levels, 0),
    advancements: items.reduce((sum, i) => sum + i.advancements, 0),
    resources: addResources(items.map((i) => i.resources)),
    troopAttack: roundTo(
      items.reduce((sum, i) => sum + i.troopAttack, 0),
      2,
    ),
    troopDefense: roundTo(
      items.reduce((sum, i) => sum + i.troopDefense, 0),
      2,
    ),
    power: items.reduce((sum, i) => sum + i.power, 0),
    advancementScore,
    eventPoints: scaleEventPoints(advancementScore, pointsPerScore()),
  };
}
