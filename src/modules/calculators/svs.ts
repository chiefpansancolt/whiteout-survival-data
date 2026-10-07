import { SvsCalculation, SvsCalculatorOptions, SvsDayResult, SvsUsage } from '@/types';
import { scoreEventDays, skillPercent, sumScores } from './event-score';

/** Id of the Battle Phase day. Valeria's bonus does not apply to this day. */
export const SVS_BATTLE_DAY_ID = 'Battle';

/**
 * Calculates State of Power points for each day and phase from the action counts in `usage`.
 * Valeria's bonus applies to the Preparation Phase days only. See `docs/svs.md`.
 *
 * @param usage Counts by day id and then by action text. Days and actions left out count as 0.
 * @param options `valeriaLevel` is the level of Valeria's Well Prepared skill, from 1 to 10.
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
