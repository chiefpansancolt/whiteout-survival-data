import { chiefCharm } from '@/modules/chief-charm';
import { UpgradeRange, UpgradeResult } from '@/types';
import { upgradeRanges } from './upgrade-ranges';

/**
 * Calculates the materials, charm score, power, and event points for upgrading Chief Charms. Pass
 * one range for each charm. See `docs/chief-charm.md`.
 *
 * @param ranges Ranges with level `id` values from `chiefCharm()`. Use `from: null` for a charm with no level yet.
 * @throws Error when a range names a level that does not exist.
 * @throws RangeError when a range goes down, with `to` before `from`.
 */
export function calculateChiefCharm(ranges: UpgradeRange[] = []): UpgradeResult {
  return upgradeRanges(chiefCharm().get(), ranges, 'Chief Charm', /Chief Charm/);
}
