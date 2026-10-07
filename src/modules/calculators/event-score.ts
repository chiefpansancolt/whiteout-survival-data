import { events } from '@/modules/events';
import { experts } from '@/modules/experts';
import { EventScore, EventScoreDay, EventUsage, GameEventDay } from '@/types';

export interface ScoreBonus {
  percent: number;
  appliesTo: (day: GameEventDay, action: string) => boolean;
}

export const NO_BONUS: ScoreBonus = { percent: 0, appliesTo: () => false };

/**
 * Returns the percent that a skill gives at a level, read from the progression with the given label.
 * Returns 0 when `level` is undefined.
 *
 * @param optionName Name of the option in the error message.
 * @throws RangeError when `level` is not a whole number from 1 to the number of levels of the skill.
 */
export function skillPercent(
  expertId: string,
  skillName: string,
  progressionLabel: string,
  level: number | undefined,
  optionName: string,
): number {
  if (level === undefined) return 0;
  const percents = experts()
    .find(expertId)!
    .skills.find((skill) => skill.name === skillName)!
    .progressions.find((p) => p.label === progressionLabel)!.values;
  if (!Number.isInteger(level) || level < 1 || level > percents.length) {
    throw new RangeError(`${optionName} must be a whole number from 1 to ${percents.length}`);
  }
  return percents[level - 1];
}

export function sumScores(scores: EventScore[]): EventScore {
  const base = scores.reduce((sum, s) => sum + s.base, 0);
  const bonus = scores.reduce((sum, s) => sum + s.bonus, 0);
  return { base, bonus, total: base + bonus };
}

/**
 * Scores every day of an event from the usage. The bonus of a day is the bonus percent of the
 * points of the actions that `bonus.appliesTo` accepts, rounded to a whole number.
 *
 * @param label Name of the event in error messages.
 * @throws Error when `usage` names a day or an action that the event does not have.
 * @throws RangeError when a count is negative or not a finite number.
 */
export function scoreEventDays(
  eventId: string,
  label: string,
  usage: EventUsage,
  bonus: ScoreBonus,
): EventScoreDay[] {
  const eventDays = events().find(eventId)!.days!;

  Object.keys(usage).forEach((dayId) => {
    if (!eventDays.some((d) => d.day === dayId)) throw new Error(`Unknown ${label} day: ${dayId}`);
  });

  return eventDays.map((eventDay) => {
    const dayUsage = usage[eventDay.day] ?? {};
    Object.keys(dayUsage).forEach((action) => {
      if (!eventDay.scoring.some((s) => s.action === action)) {
        throw new Error(`Unknown ${label} action on day ${eventDay.day}: ${action}`);
      }
    });
    const lines = eventDay.scoring.map((s) => {
      const count = dayUsage[s.action] ?? 0;
      if (!Number.isFinite(count) || count < 0) {
        throw new RangeError(`Count for "${s.action}" must be a number of 0 or more`);
      }
      return { action: s.action, points: s.points, count, subtotal: s.points * count };
    });
    const base = lines.reduce((sum, l) => sum + l.subtotal, 0);
    const bonusBase = lines
      .filter((l) => bonus.appliesTo(eventDay, l.action))
      .reduce((sum, l) => sum + l.subtotal, 0);
    const bonusPoints = Math.round((bonusBase * bonus.percent) / 100);
    return {
      day: eventDay.day,
      name: eventDay.name,
      lines,
      base,
      bonus: bonusPoints,
      total: base + bonusPoints,
    };
  });
}
