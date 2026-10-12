import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/troops.json';
import { TroopData, TroopTier } from '@/types';

const troopData: TroopData[] = data as TroopData[];

export class TroopQuery extends QueryBase<TroopData> {
  constructor(data: TroopData[] = troopData) {
    super(data);
  }
}

/**
 * Returns the highest tier that a camp level can train, or `undefined` below the first tier.
 * Only the tiers with an `unlockCampLevel` count, so the result is never tier 11 or 12.
 */
export function highestTierAtCampLevel(troop: TroopData, campLevel: number): TroopTier | undefined {
  const unlocked = troop.tiers.filter(
    (t) => t.unlockCampLevel !== undefined && t.unlockCampLevel <= campLevel,
  );
  return unlocked[unlocked.length - 1];
}

/**
 * Returns the power of one troop of a tier at a Fire Crystal level. Level 0 is the base power.
 * Only tiers 10 and 11 change with the Fire Crystal level, so any other tier returns its base
 * power. Returns `undefined` for an unknown tier, or for a level without a value on tier 10 or 11.
 */
export function troopPower(
  troop: TroopData,
  tier: number,
  fireCrystalLevel = 0,
): number | undefined {
  const found = troop.tiers.find((t) => t.tier === tier);
  if (!found) return undefined;
  if (fireCrystalLevel === 0 || !found.fireCrystalPower) return found.power;
  return found.fireCrystalPower.find((p) => p.level === fireCrystalLevel)?.power;
}

export function troops(source: TroopData[] = troopData): TroopQuery {
  return new TroopQuery(source);
}
