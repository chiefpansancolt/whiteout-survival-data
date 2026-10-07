import { chiefGear } from '@/modules/chief-gear';
import { UpgradeRange, UpgradeResult } from '@/types';
import { upgradeRanges } from './upgrade-ranges';

/**
 * Calculates the materials, gear score, power, and event points for upgrading Chief Gear. Pass one
 * range for each gear piece. See `docs/chief-gear.md`.
 *
 * @param ranges Ranges with level `id` values from `chiefGear()`. Use `from: null` for a piece with no level yet.
 * @throws Error when a range names a level that does not exist.
 * @throws RangeError when a range goes down, with `to` before `from`.
 */
export function calculateChiefGear(ranges: UpgradeRange[] = []): UpgradeResult {
  return upgradeRanges(chiefGear().get(), ranges, 'Chief Gear', /Chief Gear/);
}
