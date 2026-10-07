import { events } from '@/modules/events';
import { UpgradeEventPoints, UpgradeMaterial, UpgradeRange, UpgradeResult } from '@/types';

export interface UpgradeLevel {
  id: string;
  materials: UpgradeMaterial[];
  powerTotal: number;
  score: number;
}

const EVENT_IDS: Record<keyof UpgradeEventPoints, string> = {
  svs: 'svs-state-of-power',
  allianceShowdown: 'alliance-showdown',
  kingOfIcefield: 'king-of-icefield',
  hallOfChief: 'hall-of-chief',
};

/** Returns the points that one point of score is worth in each event, read from the scoring row that matches `rowPattern`. */
function pointsPerScore(rowPattern: RegExp): UpgradeEventPoints {
  const result = {} as UpgradeEventPoints;
  (Object.keys(EVENT_IDS) as (keyof UpgradeEventPoints)[]).forEach((key) => {
    result[key] = events()
      .find(EVENT_IDS[key])!
      .days!.flatMap((day) => day.scoring)
      .find((row) => rowPattern.test(row.action))!.points;
  });
  return result;
}

function addMaterials(lists: UpgradeMaterial[][]): UpgradeMaterial[] {
  const totals = new Map<string, number>();
  lists.flat().forEach((m) => totals.set(m.itemId, (totals.get(m.itemId) ?? 0) + m.amount));
  return [...totals].map(([itemId, amount]) => ({ itemId, amount }));
}

function indexOfLevel(levels: UpgradeLevel[], id: string, label: string): number {
  const index = levels.findIndex((l) => l.id === id);
  if (index === -1) throw new Error(`Unknown ${label} level: ${id}`);
  return index;
}

/**
 * Adds up the upgrade steps of every range. The steps of a range are the levels after `from` up to
 * and including `to`.
 *
 * @param label Name of the kind of piece in error messages.
 * @param scoreRowPattern Matches the scoring row of each event that pays points for this score.
 * @throws Error when a range names a level that does not exist.
 * @throws RangeError when a range goes down.
 */
export function upgradeRanges(
  levels: UpgradeLevel[],
  ranges: UpgradeRange[],
  label: string,
  scoreRowPattern: RegExp,
): UpgradeResult {
  const steps: UpgradeLevel[] = [];
  let power = 0;
  ranges.forEach((range) => {
    const from = range.from === null ? -1 : indexOfLevel(levels, range.from, label);
    const to = indexOfLevel(levels, range.to, label);
    if (to < from) {
      throw new RangeError(`A ${label} range must not go down: ${range.from} to ${range.to}`);
    }
    steps.push(...levels.slice(from + 1, to + 1));
    power += to === from ? 0 : levels[to].powerTotal - (from === -1 ? 0 : levels[from].powerTotal);
  });
  const score = steps.reduce((sum, l) => sum + l.score, 0);
  const perScore = pointsPerScore(scoreRowPattern);
  return {
    steps: steps.length,
    materials: addMaterials(steps.map((l) => l.materials)),
    score,
    power,
    eventPoints: {
      svs: score * perScore.svs,
      allianceShowdown: score * perScore.allianceShowdown,
      kingOfIcefield: score * perScore.kingOfIcefield,
      hallOfChief: score * perScore.hallOfChief,
    },
  };
}
