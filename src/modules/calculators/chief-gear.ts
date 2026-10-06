import { chiefGear } from '@/modules/chief-gear';
import { UpgradeRange, UpgradeResult } from '@/types';
import { upgradeRanges } from './upgrade-ranges';

/**
 * Calculates the materials, gear score, power, and event points for upgrading Chief Gear from a start
 * level to an end level.
 *
 * Pass one range for each gear piece to upgrade. A range with the same `from` and `to` costs nothing.
 * Event points are the score times the points that the "Raise Chief Gear max score" row pays in each
 * event.
 *
 * @param ranges Ranges with level `id` values from `chiefGear()`. Use `from: null` for a piece with no level yet.
 * @throws Error when a range names a level that does not exist.
 * @throws RangeError when a range goes down, with `to` before `from`.
 */
export function calculateChiefGear(ranges: UpgradeRange[] = []): UpgradeResult {
  return upgradeRanges(chiefGear().get(), ranges, 'Chief Gear', /Chief Gear/);
}
