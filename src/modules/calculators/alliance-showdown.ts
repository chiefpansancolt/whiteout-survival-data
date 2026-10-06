import {
  AllianceShowdownCalculation,
  AllianceShowdownCalculatorOptions,
  EventUsage,
} from '@/types';
import { scoreEventDays, skillPercent, sumScores } from './event-score';

const TRUCK_ACTION = /^(Escort|Raid) 1 truck/;

/**
 * Calculates Alliance Showdown personal points from how many times each scoring action was done.
 *
 * Points come from the scoring lists of the `alliance-showdown` event. Baldur's Dawn Hymn skill
 * adds its percent to every action except the Tundra Trade Route truck actions (escort and raid),
 * which the skill does not cover. The bonus of each day is rounded to a whole number.
 *
 * @param usage Counts by day id and then by action text. Days and actions left out count as 0.
 * @param options `dawnHymnLevel` turns on the Baldur bonus for a level from 1 to 10.
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
    appliesTo: (_day, action) => !TRUCK_ACTION.test(action),
  });
  return { dawnHymnBonusPercent: bonusPercent, days, event: sumScores(days) };
}
