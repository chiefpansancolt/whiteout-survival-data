import { events } from '@/modules/events';
import { experts } from '@/modules/experts';
import { SvsCalculation, SvsCalculatorOptions, SvsDayResult, SvsScore, SvsUsage } from '@/types';

const SVS_EVENT_ID = 'svs-state-of-power';

function valeriaBonusPercent(level: number | undefined): number {
  if (level === undefined) return 0;
  const wellPrepared = experts()
    .find('valeria')!
    .skills.find((skill) => skill.name === 'Well Prepared')!;
  const percents = wellPrepared.progressions[0].values;
  if (!Number.isInteger(level) || level < 1 || level > percents.length) {
    throw new RangeError(`valeriaLevel must be a whole number from 1 to ${percents.length}`);
  }
  return percents[level - 1];
}

function sumScores(scores: SvsScore[]): SvsScore {
  const base = scores.reduce((sum, s) => sum + s.base, 0);
  const bonus = scores.reduce((sum, s) => sum + s.bonus, 0);
  return { base, bonus, total: base + bonus };
}

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
  const eventDays = events().find(SVS_EVENT_ID)!.days!;
  const bonusPercent = valeriaBonusPercent(options.valeriaLevel);

  Object.keys(usage).forEach((dayId) => {
    if (!eventDays.some((d) => d.day === dayId)) throw new Error(`Unknown SvS day: ${dayId}`);
  });

  const days: SvsDayResult[] = eventDays.map((eventDay) => {
    const dayUsage = usage[eventDay.day] ?? {};
    Object.keys(dayUsage).forEach((action) => {
      if (!eventDay.scoring.some((s) => s.action === action)) {
        throw new Error(`Unknown SvS action on day ${eventDay.day}: ${action}`);
      }
    });
    const lines = eventDay.scoring.map((s) => {
      const count = dayUsage[s.action] ?? 0;
      if (!Number.isFinite(count) || count < 0) {
        throw new RangeError(`Count for "${s.action}" must be a number of 0 or more`);
      }
      return { action: s.action, points: s.points, count, subtotal: s.points * count };
    });
    const phase = eventDay.day === 'Battle' ? 'battle' : 'preparation';
    const base = lines.reduce((sum, l) => sum + l.subtotal, 0);
    const bonus = phase === 'preparation' ? Math.round((base * bonusPercent) / 100) : 0;
    return {
      day: eventDay.day,
      name: eventDay.name,
      phase,
      lines,
      base,
      bonus,
      total: base + bonus,
    };
  });

  return {
    valeriaBonusPercent: bonusPercent,
    days,
    preparation: sumScores(days.filter((d) => d.phase === 'preparation')),
    battle: sumScores(days.filter((d) => d.phase === 'battle')),
    event: sumScores(days),
  };
}
