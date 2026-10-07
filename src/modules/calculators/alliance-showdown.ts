import {
  AllianceShowdownCalculation,
  AllianceShowdownCalculatorOptions,
  EventUsage,
} from '@/types';
import { scoreEventDays, skillPercent, sumScores } from './event-score';

/** Matches the truck actions (escort and raid) that Baldur's bonus does not apply to. */
export const ALLIANCE_SHOWDOWN_TRUCK_ACTION = /^(Escort|Raid) 1 truck/;

/**
 * Calculates Alliance Showdown personal points for each day from the action counts in `usage`.
 * Baldur's bonus applies to every action except the truck actions. See `docs/alliance-showdown.md`.
 *
 * @param usage Counts by day id and then by action text. Days and actions left out count as 0.
 * @param options `dawnHymnLevel` is the level of Baldur's Dawn Hymn skill, from 1 to 10.
 * @throws RangeError when `dawnHymnLevel` is not a whole number from 1 to 10, or a count is negative.
 * @throws Error when `usage` names a day or an action that the event does not have.
 */
export function calculateAllianceShowdown(
  usage: EventUsage = {},
  options: AllianceShowdownCalculatorOptions = {},
): AllianceShowdownCalculation {
  const bonusPercent = skillPercent(
    'baldur',
    'Dawn Hymn',
    'Point Boost (%)',
    options.dawnHymnLevel,
    'dawnHymnLevel',
  );
  const days = scoreEventDays('alliance-showdown', 'Alliance Showdown', usage, {
    percent: bonusPercent,
    appliesTo: (_day, action) => !ALLIANCE_SHOWDOWN_TRUCK_ACTION.test(action),
  });
  return { dawnHymnBonusPercent: bonusPercent, days, event: sumScores(days) };
}
