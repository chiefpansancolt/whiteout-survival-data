import { SvsCalculation, SvsCalculatorOptions, SvsDayResult, SvsUsage } from '@/types';
import { scoreEventDays, skillPercent, sumScores } from './event-score';

/** The id of the Battle Phase day in the `svs-state-of-power` event. Valeria's bonus does not apply to this day. */
export const SVS_BATTLE_DAY_ID = 'Battle';

/**
 * Calculates State of Power scores from how many times each scoring action was done.
 *
 * Points come from the scoring lists of the `svs-state-of-power` event. Valeria's Well Prepared
 * skill adds its percent to the points of every Preparation Phase day (days 1 to 5) and never to
 * the Battle Phase. The bonus of each day is rounded to a whole number.
 *
 * @param usage Counts by day id and then by action text. Days and actions left out count as 0.
 * @param options `valeriaLevel` turns on the Valeria bonus for a level from 1 to 10.
 * @throws RangeError when `valeriaLevel` is not a whole number from 1 to 10, or a count is negative.
 * @throws Error when `usage` names a day or an action that the event does not have.
 */
export function calculateSvs(
  usage: SvsUsage = {},
  options: SvsCalculatorOptions = {},
): SvsCalculation {
  const bonusPercent = skillPercent(
    'valeria',
    'Well Prepared',
    'Preparation Phase Point gains (%)',
    options.valeriaLevel,
    'valeriaLevel',
  );
  const days: SvsDayResult[] = scoreEventDays('svs-state-of-power', 'SvS', usage, {
    percent: bonusPercent,
    appliesTo: (day) => day.day !== SVS_BATTLE_DAY_ID,
  }).map((day) => ({
    ...day,
    phase: day.day === SVS_BATTLE_DAY_ID ? 'battle' : 'preparation',
  }));

  return {
    valeriaBonusPercent: bonusPercent,
    days,
    preparation: sumScores(days.filter((d) => d.phase === 'preparation')),
    battle: sumScores(days.filter((d) => d.phase === 'battle')),
    event: sumScores(days),
  };
}
