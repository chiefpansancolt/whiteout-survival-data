import { EventScoreCalculation, EventUsage } from '@/types';
import { NO_BONUS, scoreEventDays, sumScores } from './event-score';

/**
 * Calculates Hall of Chief points for each stage from the action counts in `usage`.
 * No expert bonus applies. The event ranks each stage on its own, so read the total of one stage in
 * `days`. See `docs/hall-of-chief.md`.
 *
 * @param usage Counts by stage id (such as `s1-3`) and then by action text. Stages and actions left out count as 0.
 * @throws RangeError when a count is negative.
 * @throws Error when `usage` names a stage or an action that the event does not have.
 */
export function calculateHallOfChief(usage: EventUsage = {}): EventScoreCalculation {
  const days = scoreEventDays('hall-of-chief', 'Hall of Chief', usage, NO_BONUS);
  return { days, event: sumScores(days) };
}
