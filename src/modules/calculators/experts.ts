import { experts } from '@/modules/experts';
import { Expert, ExpertCalculation, ExpertGoal, ExpertItemResult, ExpertSkillGoal } from '@/types';

/** The highest affinity level of an expert. */
export const EXPERT_MAX_LEVEL = 100;

function checkLevel(name: string, owner: string, level: number, max: number): void {
  if (!Number.isInteger(level) || level < 1 || level > max) {
    throw new RangeError(`The ${name} level of ${owner} must be a whole number from 1 to ${max}`);
  }
}

function checkRange(owner: string, current: number, goal: number): void {
  if (goal < current) {
    throw new RangeError(`The goal level of ${owner} must not be below the current level`);
  }
}

function levelCosts(expert: Expert, level: NonNullable<ExpertGoal['level']>) {
  checkLevel('current', expert.id, level.current, EXPERT_MAX_LEVEL);
  checkLevel('goal', expert.id, level.goal, EXPERT_MAX_LEVEL);
  checkRange(expert.id, level.current, level.goal);
  const row = (n: number) => expert.affinityLevels[n - 1];
  [
    ['current', level.current, level.currentAdvanced],
    ['goal', level.goal, level.goalAdvanced],
  ].forEach(([name, n, advanced]) => {
    if (advanced && row(n as number).advancementCost === undefined) {
      throw new RangeError(
        `The ${name} advancement of ${expert.id} needs a level that has an advancement cost`,
      );
    }
  });
  const advancementLevels = expert.affinityLevels.filter((l) => {
    if (l.advancementCost === undefined) return false;
    const passed = l.level >= level.current && l.level < level.goal;
    const atGoal = l.level === level.goal && level.goalAdvanced === true;
    const alreadyDone = l.level === level.current && level.currentAdvanced === true;
    return (passed || atGoal) && !alreadyDone;
  });
  return {
    levels: level.goal - level.current,
    advancements: advancementLevels.length,
    sigils: advancementLevels.reduce((sum, l) => sum + l.advancementCost!, 0),
    affinity: expert.affinityLevels
      .slice(level.current, level.goal)
      .reduce((sum, l) => sum + l.affinityRequired, 0),
  };
}

function skillCosts(expert: Expert, goals: ExpertSkillGoal[]) {
  return goals.reduce(
    (total, goal) => {
      const skill = expert.skills.find((s) => s.name === goal.name);
      if (skill === undefined) throw new Error(`Unknown skill of ${expert.id}: ${goal.name}`);
      const owner = `${expert.id} ${skill.name}`;
      checkLevel('current', owner, goal.current, skill.maxLevel);
      checkLevel('goal', owner, goal.goal, skill.maxLevel);
      checkRange(owner, goal.current, goal.goal);
      const steps = skill.costs.slice(goal.current, goal.goal);
      return {
        skillLevels: total.skillLevels + steps.length,
        books: total.books + steps.reduce((sum, c) => sum + c.books, 0),
        exp: total.exp + steps.reduce((sum, c) => sum + c.exp, 0),
      };
    },
    { skillLevels: 0, books: 0, exp: 0 },
  );
}

function expertResult(goal: ExpertGoal): ExpertItemResult {
  const expert = experts().find(goal.id);
  if (expert === undefined) throw new Error(`Unknown expert: ${goal.id}`);
  const level =
    goal.level === undefined
      ? { levels: 0, advancements: 0, sigils: 0, affinity: 0 }
      : levelCosts(expert, goal.level);
  const skills = skillCosts(expert, goal.skills ?? []);
  return { id: expert.id, name: expert.name, ...level, ...skills };
}

/**
 * Calculates the Books of Knowledge, expert sigils, skill EXP, and affinity points to level experts and
 * their skills.
 *
 * Only the levels after `current` up to `goal` count. An expert needs an advancement to go past an
 * affinity level that has an advancement cost. Set `goalAdvanced` to pay for the advancement at the goal
 * level. Set `currentAdvanced` when the expert is already advanced at the current level. The talent costs
 * nothing.
 *
 * @param goals One entry for each expert, with an optional affinity level range and skill ranges.
 * @throws Error when a goal names an expert or a skill that does not exist.
 * @throws RangeError when a level is not a whole number in range, when a goal is below its current
 * level, or when an advanced flag is set on a level that has no advancement cost.
 * @see docs/experts.md
 */
export function calculateExperts(goals: ExpertGoal[] = []): ExpertCalculation {
  const items = goals.map(expertResult);
  const sum = (pick: (i: ExpertItemResult) => number) =>
    items.reduce((total, i) => total + pick(i), 0);
  return {
    items,
    levels: sum((i) => i.levels),
    advancements: sum((i) => i.advancements),
    skillLevels: sum((i) => i.skillLevels),
    sigils: sum((i) => i.sigils),
    books: sum((i) => i.books),
    exp: sum((i) => i.exp),
    affinity: sum((i) => i.affinity),
  };
}
