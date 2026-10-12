import { QueryBase } from '@/common/query-base';
import levelData from '@/data/chief/gear-levels.json';
import setBonusData from '@/data/chief/gear-set-bonuses.json';
import slotData from '@/data/chief/gear-slots.json';
import {
  ChiefGearLevel,
  ChiefGearRarity,
  ChiefGearSetBonus,
  ChiefGearSetBonuses,
  ChiefGearSetBonusTier,
  ChiefGearSlot,
  ChiefGearTroopType,
} from '@/types';

const chiefGearSlotData: ChiefGearSlot[] = slotData as ChiefGearSlot[];
const chiefGearLevelData: ChiefGearLevel[] = levelData as ChiefGearLevel[];
const chiefGearSetBonusData: ChiefGearSetBonusTier[] = setBonusData as ChiefGearSetBonusTier[];

export function chiefGearRarity(tier: string): ChiefGearRarity {
  return tier.replace(/T\d+$/, '') as ChiefGearRarity;
}

export function chiefGearImage(slot: ChiefGearSlot, level: ChiefGearLevel): string {
  return slot.images[chiefGearRarity(level.tier)];
}

export class ChiefGearSlotQuery extends QueryBase<ChiefGearSlot> {
  constructor(data: ChiefGearSlot[] = chiefGearSlotData) {
    super(data);
  }

  byTroopType(troopType: ChiefGearTroopType): ChiefGearSlotQuery {
    return new ChiefGearSlotQuery(this.data.filter((s) => s.troopType === troopType));
  }
}

export function chiefGearSlots(source: ChiefGearSlot[] = chiefGearSlotData): ChiefGearSlotQuery {
  return new ChiefGearSlotQuery(source);
}

export class ChiefGearLevelQuery extends QueryBase<ChiefGearLevel> {
  constructor(data: ChiefGearLevel[] = chiefGearLevelData) {
    super(data);
  }

  /** Matches the tier label exactly. "Epic" does not match "EpicT1". */
  byTier(tier: string): ChiefGearLevelQuery {
    return new ChiefGearLevelQuery(this.data.filter((l) => l.tier === tier));
  }
}

export function chiefGear(source: ChiefGearLevel[] = chiefGearLevelData): ChiefGearLevelQuery {
  return new ChiefGearLevelQuery(source);
}

export const CHIEF_GEAR_SET_BONUS = {
  threePiece: { pieces: 3, stat: 'Defense' },
  sixPiece: { pieces: 6, stat: 'Attack' },
  troopTypes: ['infantry', 'lancer', 'marksman'],
} as const;

export class ChiefGearSetBonusQuery extends QueryBase<ChiefGearSetBonusTier> {
  constructor(data: ChiefGearSetBonusTier[] = chiefGearSetBonusData) {
    super(data);
  }
}

export function chiefGearSetBonuses(
  source: ChiefGearSetBonusTier[] = chiefGearSetBonusData,
): ChiefGearSetBonusQuery {
  return new ChiefGearSetBonusQuery(source);
}

/**
 * Returns the 3 piece and 6 piece set bonuses of the Chief Gear that a chief wears.
 *
 * The pieces count toward a set by the `tierId` of their level, so two levels of the same tier match.
 * The 3 piece bonus is the Defense bonus of the highest tier with at least 3 pieces. The 6 piece
 * bonus is the Attack bonus of the tier that all 6 pieces share. A bonus that is not active has a
 * `percent` of 0 and no `tierId`. Both bonuses apply to all three troop types.
 *
 * @param levelIds The ids of the `chiefGear()` levels of the pieces worn, at most 6.
 * @throws Error when a level id does not exist.
 * @throws RangeError when more than 6 pieces are given.
 */
export function chiefGearSetBonus(levelIds: string[]): ChiefGearSetBonuses {
  const { threePiece, sixPiece } = CHIEF_GEAR_SET_BONUS;
  if (levelIds.length > sixPiece.pieces) {
    throw new RangeError(`At most ${sixPiece.pieces} Chief Gear pieces can be worn`);
  }
  const piecesByTier = new Map<string, number>();
  for (const id of levelIds) {
    const level = chiefGear().find(id);
    if (!level) throw new Error(`Unknown Chief Gear level: ${id}`);
    piecesByTier.set(level.tierId, (piecesByTier.get(level.tierId) ?? 0) + 1);
  }
  const bonusAt = (rule: { pieces: 3 | 6; stat: ChiefGearSetBonus['stat'] }, tierIds: string[]) => {
    const best = chiefGearSetBonuses()
      .get()
      .filter((t) => tierIds.includes(t.id))
      .pop();
    return best ? { ...rule, percent: best.percent, tierId: best.id } : { ...rule, percent: 0 };
  };
  const tiersWith = (pieces: number) =>
    [...piecesByTier].filter(([, count]) => count >= pieces).map(([tierId]) => tierId);
  return {
    threePiece: bonusAt(threePiece, tiersWith(threePiece.pieces)),
    sixPiece: bonusAt(sixPiece, tiersWith(sixPiece.pieces)),
  };
}
