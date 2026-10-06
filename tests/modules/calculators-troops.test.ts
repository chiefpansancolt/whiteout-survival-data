import { buildings } from '@/modules/buildings';
import {
  ALLIANCE_SHOWDOWN_TRUCK_ACTION,
  calculateTroops,
  SVS_BATTLE_DAY_ID,
  TROOP_CALCULATOR,
} from '@/modules/calculators';
import { events } from '@/modules/events';
import { troops } from '@/modules/troops';
import { TroopCalculatorInput, TroopRun } from '@/types';

const camps = (level: string, overrides: Partial<TroopCalculatorInput['camps']> = {}) => ({
  infantry: { level },
  lancer: { level },
  marksman: { level },
  ...overrides,
});

const train = (tier: number, count: number | 'max', batches?: number): TroopRun => ({
  action: { mode: 'training', tier },
  count,
  batches,
});

const promote = (
  fromTier: number,
  toTier: number,
  count: number | 'max',
  batches?: number,
): TroopRun => ({ action: { mode: 'promotion', fromTier, toTier }, count, batches });

describe('camp training capacity data', () => {
  it('gives every camp level a capacity that rises with each level', () => {
    ['infantry-camp', 'lancer-camp', 'marksman-camp'].forEach((id) => {
      const levels = buildings().find(id)!.levels;
      expect(levels).toHaveLength(80);
      levels.forEach((l, i) => {
        expect(l.trainingCapacity).toBeGreaterThan(0);
        if (i > 0) expect(l.trainingCapacity!).toBeGreaterThan(levels[i - 1].trainingCapacity!);
      });
    });
  });

  it('adds 5 for each step from level 30 up to Fire Crystal 10', () => {
    const levels = buildings().find('infantry-camp')!.levels;
    const capacity = (label: string) => levels.find((l) => l.label === label)!.trainingCapacity;
    expect(capacity('30')).toBe(209);
    expect(capacity('30-1')).toBe(214);
    expect(capacity('30-4')).toBe(229);
    expect(capacity('FC 1')).toBe(234);
    expect(capacity('FC 1-1')).toBe(239);
    expect(capacity('FC 2')).toBe(259);
    expect(capacity('FC 10')).toBe(459);
  });
});

describe('calculateTroops capacity', () => {
  it('adds the capacity of the three camp levels', () => {
    const result = calculateTroops({
      camps: { infantry: { level: '1' }, lancer: { level: '2' }, marksman: { level: '3' } },
    });
    expect(result.capacity).toBe(17 + 22 + 26);
  });

  it('adds research capacity and the Minister of Education buff', () => {
    expect(calculateTroops({ camps: camps('30'), researchCapacity: 100 }).capacity).toBe(627 + 100);
    expect(calculateTroops({ camps: camps('30'), ministerOfEducation: 'regular' }).capacity).toBe(
      627 + 200,
    );
    expect(calculateTroops({ camps: camps('30'), ministerOfEducation: 'supreme' }).capacity).toBe(
      627 + 300,
    );
  });

  it('triples the total with the capacity boost after the bonuses', () => {
    const result = calculateTroops({
      camps: camps('FC 10'),
      researchCapacity: 100,
      ministerOfEducation: 'supreme',
      capacityBoost: true,
    });
    expect(result.capacity).toBe((3 * 459 + 100 + 300) * 3);
  });
});

describe('calculateTroops troops', () => {
  it('returns zero troops for camps that do nothing', () => {
    const result = calculateTroops({ camps: camps('30') });
    expect(result.tiers).toHaveLength(12);
    expect(result.tiers.map((r) => r.tier)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.totals).toEqual({ infantry: 0, lancer: 0, marksman: 0, total: 0 });
    expect(result.camps.infantry).toEqual({ runs: [], seconds: 0 });
    expect(result.resources).toEqual([
      { itemId: 'meat', amount: 0 },
      { itemId: 'wood', amount: 0 },
      { itemId: 'coal', amount: 0 },
      { itemId: 'iron', amount: 0 },
    ]);
    expect(result.totalSeconds).toBe(0);
    expect(result.longestCampSeconds).toBe(0);
  });

  it('adds trained troops at their tier for the count times the batches', () => {
    const result = calculateTroops({
      camps: camps('30', {
        infantry: { level: '30', runs: [train(10, 500, 3)] },
        marksman: { level: '30', runs: [train(8, 100)] },
      }),
    });
    expect(result.camps.infantry.runs).toEqual([
      { troopsPerBatch: 500, batches: 3, seconds: 3 * 76000 },
    ]);
    expect(result.camps.marksman.runs).toEqual([
      { troopsPerBatch: 100, batches: 1, seconds: 113 * 100 },
    ]);
    expect(result.tiers[9]).toEqual({
      tier: 10,
      infantry: 1500,
      lancer: 0,
      marksman: 0,
      total: 1500,
    });
    expect(result.tiers[7]).toEqual({ tier: 8, infantry: 0, lancer: 0, marksman: 100, total: 100 });
    expect(result.totals).toEqual({ infantry: 1500, lancer: 0, marksman: 100, total: 1600 });
  });

  it('moves promoted troops from the first tier to the second', () => {
    const result = calculateTroops({
      camps: camps('30', { lancer: { level: '30', runs: [promote(9, 10, 100, 2)] } }),
    });
    expect(result.tiers[8].lancer).toBe(-200);
    expect(result.tiers[9].lancer).toBe(200);
    expect(result.totals.lancer).toBe(0);
  });

  it('trains and promotes in the same camp', () => {
    const result = calculateTroops({
      camps: camps('30', {
        infantry: { level: '30', runs: [train(10, 500, 3), promote(9, 10, 200, 2)] },
      }),
    });
    expect(result.camps.infantry.runs).toEqual([
      { troopsPerBatch: 500, batches: 3, seconds: 3 * 76000 },
      { troopsPerBatch: 200, batches: 2, seconds: 2 * 200 * 21 },
    ]);
    expect(result.tiers[8].infantry).toBe(-400);
    expect(result.tiers[9].infantry).toBe(1500 + 400);
    expect(result.totals.infantry).toBe(1500);
  });

  it('fills the batch to the capacity with max', () => {
    const result = calculateTroops({
      camps: camps('30', { infantry: { level: '30', runs: [train(1, 'max')] } }),
      researchCapacity: 73,
    });
    expect(result.camps.infantry.runs[0].troopsPerBatch).toBe(700);
    expect(result.tiers[0].infantry).toBe(700);
  });

  it('allows a count of zero and the full capacity', () => {
    const base = camps('1');
    expect(
      calculateTroops({ camps: { ...base, infantry: { level: '1', runs: [train(1, 0)] } } })
        .tiers[0].infantry,
    ).toBe(0);
    expect(
      calculateTroops({ camps: { ...base, infantry: { level: '1', runs: [train(1, 51)] } } })
        .tiers[0].infantry,
    ).toBe(51);
  });

  it('adds up the types of one tier in the total', () => {
    const result = calculateTroops({
      camps: {
        infantry: { level: '30', runs: [train(5, 10)] },
        lancer: { level: '30', runs: [train(5, 20)] },
        marksman: { level: '30', runs: [train(5, 30)] },
      },
    });
    expect(result.tiers[4].total).toBe(60);
    expect(result.totals.total).toBe(60);
  });
});

describe('calculateTroops resources and time', () => {
  const infantryT10 = (extra: Partial<TroopCalculatorInput> = {}) =>
    calculateTroops({
      camps: camps('30', { infantry: { level: '30', runs: [train(10, 500)] } }),
      ...extra,
    });
  const amounts = (result: ReturnType<typeof calculateTroops>) =>
    result.resources.map((r) => r.amount);

  it('multiplies the cost of one troop by the troops', () => {
    const result = infantryT10();
    expect(result.resources.map((r) => r.itemId)).toEqual(['meat', 'wood', 'coal', 'iron']);
    expect(amounts(result)).toEqual([500 * 2788, 500 * 2091, 500 * 488, 500 * 102]);
  });

  it('multiplies the cost and the time by the batches', () => {
    const result = calculateTroops({
      camps: camps('30', { infantry: { level: '30', runs: [train(10, 500, 3)] } }),
    });
    expect(amounts(result)[0]).toBe(3 * 500 * 2788);
    expect(result.camps.infantry.seconds).toBe(3 * 500 * 152);
  });

  it('takes the training time of one troop times the troops with no speed bonus', () => {
    const result = infantryT10();
    expect(result.trainingSpeedPercent).toBe(0);
    expect(result.camps.infantry.seconds).toBe(76000);
    expect(result.totalSeconds).toBe(76000);
    expect(result.longestCampSeconds).toBe(76000);
  });

  it('divides the time by 1 plus the training speed and rounds down', () => {
    expect(infantryT10({ trainingSpeedPercent: 100 }).camps.infantry.seconds).toBe(38000);
    expect(infantryT10({ trainingSpeedPercent: 210 }).camps.infantry.seconds).toBe(24516);
  });

  it('adds the buffs to the training speed', () => {
    const result = infantryT10({
      trainingSpeedPercent: 100,
      vicePresident: 'regular',
      ministerOfEducation: 'regular',
      mobilize: true,
      advancedTraining: true,
    });
    expect(result.trainingSpeedPercent).toBe(100 + 10 + 50 + 30 + 20);
    expect(result.camps.infantry.seconds).toBe(Math.floor(76000 / 3.1));
    expect(
      infantryT10({ vicePresident: 'supreme', ministerOfEducation: 'supreme' })
        .trainingSpeedPercent,
    ).toBe(15 + 75);
  });

  it('takes the cost reduction off the resources of that troop type only', () => {
    const result = calculateTroops({
      camps: camps('30', {
        infantry: { level: '30', runs: [train(10, 500)] },
        lancer: { level: '30', runs: [train(1, 100)] },
      }),
      costReductionPercent: { infantry: 50 },
    });
    expect(amounts(result)).toEqual([
      500 * 2788 * 0.5 + 100 * 32,
      500 * 2091 * 0.5 + 100 * 30,
      500 * 488 * 0.5 + 100 * 7,
      500 * 102 * 0.5 + 100 * 2,
    ]);
  });

  it('rounds the total of each resource to a whole number', () => {
    const result = calculateTroops({
      camps: camps('30', { infantry: { level: '30', runs: [train(1, 1)] } }),
      costReductionPercent: { infantry: 33 },
    });
    expect(amounts(result)).toEqual([24, 18, 5, 1]);
  });

  it('costs the difference between the two tiers for a promotion', () => {
    const result = calculateTroops({
      camps: camps('30', { lancer: { level: '30', runs: [promote(9, 10, 100)] } }),
    });
    expect(amounts(result)).toEqual([100 * 1220, 100 * 1150, 100 * 237, 100 * 54]);
    expect(result.camps.lancer.seconds).toBe(100 * 21);
  });

  it('adds the camps for the total time and takes the longest camp', () => {
    const result = calculateTroops({
      camps: camps('30', {
        infantry: { level: '30', runs: [train(10, 500)] },
        lancer: { level: '30', runs: [promote(9, 10, 100)] },
      }),
    });
    expect(result.totalSeconds).toBe(76000 + 2100);
    expect(result.longestCampSeconds).toBe(76000);
  });

  it('rejects a negative or invalid training speed and a cost reduction outside 0 to 75', () => {
    [-1, Number.NaN].forEach((trainingSpeedPercent) =>
      expect(() => infantryT10({ trainingSpeedPercent })).toThrow(
        'trainingSpeedPercent must be a number from 0 up',
      ),
    );
    [-5, 76].forEach((percent) =>
      expect(() => infantryT10({ costReductionPercent: { lancer: percent } })).toThrow(
        'The lancer cost reduction must be a number from 0 to 75',
      ),
    );
  });
});

describe('calculateTroops tier 12', () => {
  const amounts = (result: ReturnType<typeof calculateTroops>) =>
    result.resources.map((r) => r.amount);

  it('trains tier 12 with its own cost and time', () => {
    const result = calculateTroops({
      camps: camps('30', { infantry: { level: '30', runs: [train(12, 100)] } }),
    });
    expect(result.tiers[11].infantry).toBe(100);
    expect(amounts(result)).toEqual([697000, 522800, 122000, 25400]);
    expect(result.camps.infantry.seconds).toBe(215 * 100);
  });

  it('promotes from tier 11 to tier 12 with the promotion cost and the time difference', () => {
    const result = calculateTroops({
      camps: camps('30', { lancer: { level: '30', runs: [promote(11, 12, 100)] } }),
    });
    expect(result.tiers[10].lancer).toBe(-100);
    expect(result.tiers[11].lancer).toBe(100);
    expect(amounts(result)).toEqual([304200, 287500, 58700, 12800]);
    expect(result.camps.lancer.seconds).toBe(35 * 100);
  });

  it('adds up the steps of a promotion across several tiers up to tier 12', () => {
    const result = calculateTroops({
      camps: camps('30', { infantry: { level: '30', runs: [promote(10, 12, 1)] } }),
    });
    expect(amounts(result)).toEqual([
      6970 - 2788 + 3476,
      5228 - 2091 + 2613,
      1220 - 488 + 604,
      253 - 102 + 120,
    ]);
    expect(result.camps.infantry.seconds).toBe(215 - 152);
  });
});

describe('exported constants', () => {
  it('lists the values the troop calculator uses', () => {
    expect(TROOP_CALCULATOR).toEqual({
      troopTypes: ['infantry', 'lancer', 'marksman'],
      minTier: 1,
      maxTier: 12,
      capacityBoostMultiplier: 3,
      ministerOfEducation: {
        capacity: { regular: 200, supreme: 300 },
        speedPercent: { regular: 50, supreme: 75 },
      },
      vicePresidentSpeedPercent: { regular: 10, supreme: 15 },
      mobilizeSpeedPercent: 30,
      advancedTrainingSpeedPercent: 20,
      maxCostReductionPercent: 75,
    });
  });

  it('has a max tier that matches the troop data and the rows of the result', () => {
    troops()
      .get()
      .forEach((troop) => expect(troop.tiers).toHaveLength(TROOP_CALCULATOR.maxTier));
    expect(calculateTroops({ camps: camps('30') }).tiers).toHaveLength(TROOP_CALCULATOR.maxTier);
  });

  it('names the SvS Battle Phase day and the Alliance Showdown truck actions', () => {
    expect(
      events()
        .find('svs-state-of-power')!
        .days!.map((d) => d.day),
    ).toContain(SVS_BATTLE_DAY_ID);
    const actions = events()
      .find('alliance-showdown')!
      .days!.flatMap((d) => d.scoring.map((s) => s.action));
    const trucks = actions.filter((a) => ALLIANCE_SHOWDOWN_TRUCK_ACTION.test(a));
    expect(trucks.length).toBeGreaterThan(0);
    expect(trucks.every((a) => /truck/.test(a))).toBe(true);
  });
});

describe('calculateTroops errors', () => {
  const infantry = (...runs: TroopRun[]) => ({
    camps: camps('30', { infantry: { level: '30', runs } }),
  });

  it('rejects a camp level that does not exist', () => {
    expect(() => calculateTroops({ camps: camps('99') })).toThrow(
      'Unknown Infantry Camp level: 99',
    );
  });

  it('rejects a count that is negative or not a whole number', () => {
    [-1, 1.5, Number.NaN].forEach((count) =>
      expect(() => calculateTroops(infantry(train(1, count)))).toThrow(RangeError),
    );
  });

  it('rejects a count above the capacity in any run', () => {
    expect(() => calculateTroops(infantry(train(1, 628)))).toThrow(
      'The infantry count 628 is above the capacity of 627',
    );
    expect(() => calculateTroops(infantry(train(1, 5), promote(1, 2, 628)))).toThrow(
      'The infantry count 628 is above the capacity of 627',
    );
  });

  it('rejects batches that are not a whole number of 1 or more', () => {
    [0, 1.5, -2].forEach((batches) =>
      expect(() => calculateTroops(infantry(train(1, 1, batches)))).toThrow(
        'The infantry batches must be a whole number of 1 or more',
      ),
    );
  });

  it('rejects tiers outside 1 to 12 and promotions that do not go up', () => {
    [0, 13, 2.5].forEach((tier) =>
      expect(() => calculateTroops(infantry(train(tier, 1)))).toThrow(RangeError),
    );
    expect(() => calculateTroops(infantry(promote(5, 5, 1)))).toThrow(
      'The infantry promotion must go to a higher tier',
    );
    expect(() => calculateTroops(infantry(promote(7, 3, 1)))).toThrow(RangeError);
    expect(() => calculateTroops(infantry(promote(0, 3, 1)))).toThrow(RangeError);
    expect(() => calculateTroops(infantry(promote(3, 13, 1)))).toThrow(RangeError);
  });
});
