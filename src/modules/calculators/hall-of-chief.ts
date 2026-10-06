import { EventScoreCalculation, EventUsage } from '@/types';
import { NO_BONUS, scoreEventDays, sumScores } from './event-score';

/**
 * Calculates Hall of Chief points from how many times each scoring action was done.
 *
 * Points come from the scoring lists of the `hall-of-chief` event. No expert changes these points.
 * The event ranks every stage on its own, so the points of one stage matter more than the sum of
 * all stages.
 *
 * @param usage Counts by stage id (such as `s1-3`) and then by action text. Stages and actions left out count as 0.
 * @throws RangeError when a count is negative.
 * @throws Error when `usage` names a stage or an action that the event does not have.
 */
export function calculateHallOfChief(usage: EventUsage = {}): EventScoreCalculation {
  const days = scoreEventDays('hall-of-chief', 'Hall of Chief', usage, NO_BONUS);
  return { days, event: sumScores(days) };
}
