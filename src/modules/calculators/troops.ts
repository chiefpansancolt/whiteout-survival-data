import { buildings } from '@/modules/buildings';
import { troops } from '@/modules/troops';
import {
  TroopCalculation,
  TroopCalculatorInput,
  TroopCampAction,
  TroopRun,
  TroopTierRow,
  TroopType,
  UpgradeMaterial,
} from '@/types';

/** The values that `calculateTroops()` uses. An app can read them to offer the same choices. */
export const TROOP_CALCULATOR = {
  troopTypes: ['infantry', 'lancer', 'marksman'],
  minTier: 1,
  maxTier: troops().first()!.tiers.length,
  capacityBoostMultiplier: 3,
  ministerOfEducation: {
    capacity: { regular: 200, supreme: 300 },
    speedPercent: { regular: 50, supreme: 75 },
  },
  vicePresidentSpeedPercent: { regular: 10, supreme: 15 },
  mobilizeSpeedPercent: 30,
  advancedTrainingSpeedPercent: 20,
  maxCostReductionPercent: 75,
} as const;

const TROOP_TYPES: readonly TroopType[] = TROOP_CALCULATOR.troopTypes;
const CAMP_IDS: Record<TroopType, string> = {
  infantry: 'infantry-camp',
  lancer: 'lancer-camp',
  marksman: 'marksman-camp',
};
const RESOURCE_IDS = troops()
  .first()!
  .tiers[0].cost.map((c) => c.itemId);

function campCapacity(troopType: TroopType, level: string): number {
  const camp = buildings().find(CAMP_IDS[troopType])!;
  const campLevel = camp.levels.find((l) => l.label === level);
  if (campLevel === undefined) throw new Error(`Unknown ${camp.name} level: ${level}`);
  return campLevel.trainingCapacity!;
}

function checkTier(troopType: TroopType, tier: number): void {
  if (
    !Number.isInteger(tier) ||
    tier < TROOP_CALCULATOR.minTier ||
    tier > TROOP_CALCULATOR.maxTier
  ) {
    throw new RangeError(
      `The ${troopType} tier must be a whole number from ${TROOP_CALCULATOR.minTier} to ${TROOP_CALCULATOR.maxTier}`,
    );
  }
}

function troopsPerBatch(troopType: TroopType, run: TroopRun, capacity: number): number {
  const count = run.count === 'max' ? capacity : run.count;
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`The ${troopType} count must be a whole number of 0 or more, or max`);
  }
  if (count > capacity) {
    throw new RangeError(`The ${troopType} count ${count} is above the capacity of ${capacity}`);
  }
  return count;
}

function checkPercent(name: string, percent: number, max?: number): void {
  if (!Number.isFinite(percent) || percent < 0 || (max !== undefined && percent > max)) {
    throw new RangeError(
      `${name} must be a number from 0${max === undefined ? ' up' : ` to ${max}`}`,
    );
  }
}

function trainingSpeed(input: TroopCalculatorInput): number {
  const base = input.trainingSpeedPercent ?? 0;
  checkPercent('trainingSpeedPercent', base);
  return (
    base +
    (input.vicePresident === undefined
      ? 0
      : TROOP_CALCULATOR.vicePresidentSpeedPercent[input.vicePresident]) +
    (input.ministerOfEducation === undefined
      ? 0
      : TROOP_CALCULATOR.ministerOfEducation.speedPercent[input.ministerOfEducation]) +
    (input.mobilize ? TROOP_CALCULATOR.mobilizeSpeedPercent : 0) +
    (input.advancedTraining ? TROOP_CALCULATOR.advancedTrainingSpeedPercent : 0)
  );
}

/** A promotion step uses the `promotionCost` of the tier when the data has one. Otherwise it costs the difference of the two training costs. */
function troopCost(troopType: TroopType, action: TroopCampAction) {
  const tiers = troops().find(troopType)!.tiers;
  const amountsOf = (tier: number) => tiers[tier - 1].cost.map((c) => c.amount);
  if (action.mode === 'training') {
    return { amounts: amountsOf(action.tier), seconds: tiers[action.tier - 1].trainingTimeSeconds };
  }
  const amounts = RESOURCE_IDS.map(() => 0);
  for (let tier = action.fromTier + 1; tier <= action.toTier; tier++) {
    const step =
      tiers[tier - 1].promotionCost?.map((c) => c.amount) ??
      amountsOf(tier).map((amount, i) => amount - amountsOf(tier - 1)[i]);
    step.forEach((amount, i) => {
      amounts[i] += amount;
    });
  }
  return {
    amounts,
    seconds:
      tiers[action.toTier - 1].trainingTimeSeconds - tiers[action.fromTier - 1].trainingTimeSeconds,
  };
}

function applyRun(
  tiers: TroopTierRow[],
  troopType: TroopType,
  action: TroopCampAction,
  troops: number,
) {
  if (action.mode === 'training') {
    checkTier(troopType, action.tier);
    tiers[action.tier - 1][troopType] += troops;
    return;
  }
  checkTier(troopType, action.fromTier);
  checkTier(troopType, action.toTier);
  if (action.toTier <= action.fromTier) {
    throw new RangeError(`The ${troopType} promotion must go to a higher tier`);
  }
  tiers[action.fromTier - 1][troopType] -= troops;
  tiers[action.toTier - 1][troopType] += troops;
}

/**
 * Calculates the troops that the three camps train or promote, by troop type and tier, with the
 * resources and the training time. The three camps share one capacity. See `docs/troops.md`.
 *
 * @param input A config for each of the three camps, the capacity bonuses, the training speed, and the cost reduction.
 * @throws Error when a camp level does not exist.
 * @throws RangeError when a count is not a whole number or is above the capacity, when `batches` is
 * not a whole number of 1 or more, when a tier is not a whole number from 1 to 12, when a promotion
 * does not go up, when the training speed is negative, or when a cost reduction is not from 0 to 75.
 */
export function calculateTroops(input: TroopCalculatorInput): TroopCalculation {
  const levelCapacity = TROOP_TYPES.reduce(
    (sum, type) => sum + campCapacity(type, input.camps[type].level),
    0,
  );
  const bonuses =
    (input.researchCapacity ?? 0) +
    (input.ministerOfEducation === undefined
      ? 0
      : TROOP_CALCULATOR.ministerOfEducation.capacity[input.ministerOfEducation]);
  const capacity =
    (levelCapacity + bonuses) *
    (input.capacityBoost ? TROOP_CALCULATOR.capacityBoostMultiplier : 1);

  const speed = trainingSpeed(input);
  const tiers: TroopTierRow[] = Array.from({ length: TROOP_CALCULATOR.maxTier }, (_, i) => ({
    tier: i + 1,
    infantry: 0,
    lancer: 0,
    marksman: 0,
    total: 0,
  }));
  const camps = {} as TroopCalculation['camps'];
  const resourceTotals = RESOURCE_IDS.map(() => 0);

  TROOP_TYPES.forEach((type) => {
    const reduction = input.costReductionPercent?.[type] ?? 0;
    checkPercent(`The ${type} cost reduction`, reduction, TROOP_CALCULATOR.maxCostReductionPercent);
    const runs = (input.camps[type].runs ?? []).map((run) => {
      const batches = run.batches ?? 1;
      if (!Number.isInteger(batches) || batches < 1) {
        throw new RangeError(`The ${type} batches must be a whole number of 1 or more`);
      }
      const perBatch = troopsPerBatch(type, run, capacity);
      applyRun(tiers, type, run.action, perBatch * batches);
      const cost = troopCost(type, run.action);
      cost.amounts.forEach((amount, i) => {
        resourceTotals[i] += amount * perBatch * batches * (1 - reduction / 100);
      });
      const batchSeconds = Math.floor((cost.seconds * perBatch) / (1 + speed / 100));
      return { troopsPerBatch: perBatch, batches, seconds: batchSeconds * batches };
    });
    camps[type] = { runs, seconds: runs.reduce((sum, r) => sum + r.seconds, 0) };
  });

  tiers.forEach((row) => {
    row.total = row.infantry + row.lancer + row.marksman;
  });
  const totals = {
    infantry: tiers.reduce((sum, r) => sum + r.infantry, 0),
    lancer: tiers.reduce((sum, r) => sum + r.lancer, 0),
    marksman: tiers.reduce((sum, r) => sum + r.marksman, 0),
    total: tiers.reduce((sum, r) => sum + r.total, 0),
  };
  const campSeconds = TROOP_TYPES.map((type) => camps[type].seconds);
  return {
    capacity,
    camps,
    tiers,
    totals,
    trainingSpeedPercent: speed,
    resources: RESOURCE_IDS.map((itemId, i): UpgradeMaterial => ({
      itemId,
      amount: Math.round(resourceTotals[i]),
    })),
    totalSeconds: campSeconds.reduce((sum, seconds) => sum + seconds, 0),
    longestCampSeconds: Math.max(...campSeconds),
  };
}
