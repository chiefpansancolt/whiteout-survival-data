import { EventScoreCalculation, EventUsage } from '@/types';
import { NO_BONUS, scoreEventDays, sumScores } from './event-score';

/**
 * Calculates King of Icefield points for each day from the action counts in `usage`.
 * No expert bonus applies. See `docs/king-of-icefield.md`.
 *
 * @param usage Counts by day id (`1` to `7`) and then by action text. Days and actions left out count as 0.
 * @throws RangeError when a count is negative.
 * @throws Error when `usage` names a day or an action that the event does not have.
 */
export function calculateKingOfIcefield(usage: EventUsage = {}): EventScoreCalculation {
  const days = scoreEventDays('king-of-icefield', 'King of Icefield', usage, NO_BONUS);
  return { days, event: sumScores(days) };
}
