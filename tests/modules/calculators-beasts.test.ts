import { BEAST_CALCULATOR, calculateBeasts } from '@/modules/calculators';

describe('BEAST_CALCULATOR', () => {
  it('holds the stamina of a beast, a Polar Terror, and a can, and the top beast level', () => {
    expect(BEAST_CALCULATOR).toEqual({
      beastStamina: 10,
      polarTerrorStamina: 25,
      staminaPerCan: 10,
      maxBeastLevel: 30,
    });
  });
});

describe('calculateBeasts stamina', () => {
  it('counts 100 beasts or 40 Polar Terrors for 1000 stamina', () => {
    const result = calculateBeasts({ stamina: 1000, beastLevel: 1 });
    expect(result.totalStamina).toBe(1000);
    expect(result.beastStaminaCost).toBe(10);
    expect(result.polarTerrorStaminaCost).toBe(25);
    expect(result.beasts).toEqual({ count: 100, staminaLeft: 0 });
    expect(result.polarTerrors).toEqual({ count: 40, staminaLeft: 0 });
  });

  it('keeps the stamina that does not pay for one more hunt', () => {
    const result = calculateBeasts({ stamina: 105, beastLevel: 1 });
    expect(result.beasts).toEqual({ count: 10, staminaLeft: 5 });
    expect(result.polarTerrors).toEqual({ count: 4, staminaLeft: 5 });
  });

  it('adds 10 stamina for each stamina can', () => {
    const result = calculateBeasts({ stamina: 5, staminaCans: 3, beastLevel: 1 });
    expect(result.totalStamina).toBe(35);
    expect(result.beasts).toEqual({ count: 3, staminaLeft: 5 });
    expect(result.polarTerrors).toEqual({ count: 1, staminaLeft: 10 });
  });

  it('counts the cans alone', () => {
    const result = calculateBeasts({ staminaCans: 50, beastLevel: 1 });
    expect(result.totalStamina).toBe(500);
    expect(result.beasts.count).toBe(50);
    expect(result.polarTerrors.count).toBe(20);
  });

  it('gives no hunts for no stamina', () => {
    const result = calculateBeasts({ beastLevel: 1 });
    expect(result.totalStamina).toBe(0);
    expect(result.beasts).toEqual({ count: 0, staminaLeft: 0 });
    expect(result.polarTerrors).toEqual({ count: 0, staminaLeft: 0 });
    expect(result.events.every((e) => e.beastPoints === 0 && e.polarTerrorPoints === 0)).toBe(true);
  });
});

describe('calculateBeasts with Gina', () => {
  it.each([
    [1, 10, 9, 23],
    [2, 12, 9, 22],
    [3, 15, 9, 21],
    [4, 18, 8, 21],
    [5, 20, 8, 20],
  ])(
    'at skill level %i cuts %i%% and rounds to %i and %i stamina',
    (level, percent, beast, polar) => {
      const result = calculateBeasts({ stamina: 600, beastLevel: 1, ginaSkillLevel: level });
      expect(result.ginaReductionPercent).toBe(percent);
      expect(result.beastStaminaCost).toBe(beast);
      expect(result.polarTerrorStaminaCost).toBe(polar);
      expect(result.beasts.count).toBe(Math.floor(600 / beast));
      expect(result.polarTerrors.count).toBe(Math.floor(600 / polar));
    },
  );

  it('counts 66 beasts and 27 Polar Terrors for 100 stamina and 50 cans at level 2', () => {
    const result = calculateBeasts({
      stamina: 100,
      staminaCans: 50,
      beastLevel: 12,
      ginaSkillLevel: 2,
    });
    expect(result.beasts).toEqual({ count: 66, staminaLeft: 6 });
    expect(result.polarTerrors).toEqual({ count: 27, staminaLeft: 6 });
  });

  it('has no reduction without Gina', () => {
    expect(calculateBeasts({ stamina: 100, beastLevel: 1 }).ginaReductionPercent).toBe(0);
  });
});

describe('calculateBeasts event points', () => {
  it('lists State of Power, Defeat Nearby Beasts, and Tundra Games in that order', () => {
    const result = calculateBeasts({ stamina: 100, beastLevel: 1 });
    expect(result.events.map((e) => e.eventId)).toEqual([
      'svs-state-of-power',
      'defeat-nearby-beasts',
      'tundra-games',
    ]);
    expect(result.events.map((e) => e.name)).toEqual([
      'SVS - State of Power',
      'Defeat Nearby Beasts',
      'Tundra Games',
    ]);
  });

  it.each([
    [1, 9000],
    [10, 9000],
    [11, 9750],
    [15, 9750],
    [16, 10500],
    [20, 10500],
    [21, 11250],
    [25, 11250],
    [26, 12000],
    [30, 12000],
  ])('scores a level %i beast at %i points in State of Power', (level, points) => {
    const svs = calculateBeasts({ stamina: 1000, beastLevel: level }).events[0];
    expect(svs.pointsPerBeast).toBe(points);
    expect(svs.pointsPerPolarTerror).toBe(30000);
    expect(svs.beastPoints).toBe(100 * points);
    expect(svs.polarTerrorPoints).toBe(40 * 30000);
  });

  it('scores 1 point for a beast and 3 for a Polar Terror in Defeat Nearby Beasts at any level', () => {
    for (const level of [1, 17, 30]) {
      const event = calculateBeasts({ stamina: 1000, beastLevel: level }).events[1];
      expect(event.pointsPerBeast).toBe(1);
      expect(event.pointsPerPolarTerror).toBe(3);
      expect(event.beastPoints).toBe(100);
      expect(event.polarTerrorPoints).toBe(120);
    }
  });

  it('scores 9,900 for a beast and 30,000 for a Polar Terror in Tundra Games at any level', () => {
    for (const level of [1, 30]) {
      const event = calculateBeasts({ stamina: 1000, beastLevel: level }).events[2];
      expect(event.pointsPerBeast).toBe(9900);
      expect(event.pointsPerPolarTerror).toBe(30000);
      expect(event.beastPoints).toBe(990000);
      expect(event.polarTerrorPoints).toBe(1200000);
    }
  });

  it('multiplies the points by the hunts that Gina makes possible', () => {
    const svs = calculateBeasts({ stamina: 600, beastLevel: 12, ginaSkillLevel: 2 }).events[0];
    expect(svs.beastPoints).toBe(66 * 9750);
    expect(svs.polarTerrorPoints).toBe(27 * 30000);
  });
});

describe('calculateBeasts errors', () => {
  it.each([[-1], [1.5], [Number.NaN]])('rejects %p stamina', (value) => {
    expect(() => calculateBeasts({ stamina: value, beastLevel: 1 })).toThrow(
      new RangeError('stamina must be a whole number of 0 or more'),
    );
  });

  it.each([[-1], [0.5]])('rejects %p stamina cans', (value) => {
    expect(() => calculateBeasts({ staminaCans: value, beastLevel: 1 })).toThrow(
      new RangeError('staminaCans must be a whole number of 0 or more'),
    );
  });

  it.each([[0], [31], [1.5]])('rejects beast level %p', (level) => {
    expect(() => calculateBeasts({ stamina: 10, beastLevel: level })).toThrow(
      new RangeError('beastLevel must be a whole number from 1 to 30'),
    );
  });

  it.each([[0], [6], [2.5]])('rejects Gina skill level %p', (level) => {
    expect(() => calculateBeasts({ stamina: 10, beastLevel: 1, ginaSkillLevel: level })).toThrow(
      new RangeError('ginaSkillLevel must be a whole number from 1 to 5'),
    );
  });
});

describe('calculateBeasts planned runs', () => {
  const plan = {
    stamina: 600,
    beastLevel: 12,
    beastRuns: [
      { level: 12, count: 10 },
      { level: 26, count: 4 },
    ],
    polarTerrors: 3,
  };

  it('pays the planned runs first and keeps the rest of the stamina', () => {
    const result = calculateBeasts(plan);
    expect(result.planned).toEqual({
      beasts: 14,
      polarTerrors: 3,
      staminaNeeded: 14 * 10 + 3 * 25,
      staminaShort: 0,
      staminaLeft: 385,
    });
    expect(result.beasts).toEqual({ count: 38, staminaLeft: 5 });
    expect(result.polarTerrors).toEqual({ count: 15, staminaLeft: 10 });
  });

  it('scores each beast run at its own level in State of Power', () => {
    const svs = calculateBeasts(plan).events[0];
    expect(svs.beastRuns).toEqual([
      { level: 12, count: 10, pointsPerBeast: 9750, points: 97500 },
      { level: 26, count: 4, pointsPerBeast: 12000, points: 48000 },
    ]);
    expect(svs.plannedPoints).toBe(97500 + 48000 + 3 * 30000);
    expect(svs.pointsPerBeast).toBe(9750);
  });

  it('adds the hunts of the stamina left to the planned points', () => {
    const svs = calculateBeasts(plan).events[0];
    expect(svs.beastPoints).toBe(235500 + 38 * 9750);
    expect(svs.polarTerrorPoints).toBe(235500 + 15 * 30000);
  });

  it('scores the planned runs in Defeat Nearby Beasts and Tundra Games', () => {
    const [, nearby, tundra] = calculateBeasts(plan).events;
    expect(nearby.plannedPoints).toBe(14 * 1 + 3 * 3);
    expect(nearby.beastPoints).toBe(23 + 38);
    expect(nearby.polarTerrorPoints).toBe(23 + 15 * 3);
    expect(tundra.plannedPoints).toBe(14 * 9900 + 3 * 30000);
    expect(tundra.beastRuns.map((r) => r.pointsPerBeast)).toEqual([9900, 9900]);
  });

  it('uses the reduced cost of Gina for the planned runs', () => {
    const result = calculateBeasts({ ...plan, ginaSkillLevel: 2 });
    expect(result.planned.staminaNeeded).toBe(14 * 9 + 3 * 22);
    expect(result.planned.staminaLeft).toBe(600 - 192);
    expect(result.beasts.count).toBe(Math.floor(408 / 9));
    expect(result.polarTerrors.count).toBe(Math.floor(408 / 22));
  });

  it('reports the stamina that is short when the plan costs more than the stamina', () => {
    const result = calculateBeasts({ ...plan, stamina: 100 });
    expect(result.planned.staminaNeeded).toBe(215);
    expect(result.planned.staminaShort).toBe(115);
    expect(result.planned.staminaLeft).toBe(0);
    expect(result.beasts).toEqual({ count: 0, staminaLeft: 0 });
    expect(result.polarTerrors).toEqual({ count: 0, staminaLeft: 0 });
    expect(result.events[0].beastPoints).toBe(235500);
  });

  it('plans only Polar Terrors', () => {
    const result = calculateBeasts({ stamina: 100, beastLevel: 1, polarTerrors: 2 });
    expect(result.planned).toMatchObject({ beasts: 0, polarTerrors: 2, staminaNeeded: 50 });
    expect(result.beasts.count).toBe(5);
    expect(result.events[0].beastRuns).toEqual([]);
    expect(result.events[0].plannedPoints).toBe(60000);
  });

  it('gives the same result as before when nothing is planned', () => {
    const result = calculateBeasts({ stamina: 1000, beastLevel: 1 });
    expect(result.planned).toEqual({
      beasts: 0,
      polarTerrors: 0,
      staminaNeeded: 0,
      staminaShort: 0,
      staminaLeft: 1000,
    });
    expect(result.beasts.count).toBe(100);
    expect(result.events[0].plannedPoints).toBe(0);
  });

  it.each([[0], [31], [1.5]])('rejects beast run level %p', (level) => {
    expect(() =>
      calculateBeasts({
        stamina: 10,
        beastLevel: 1,
        beastRuns: [
          { level: 5, count: 1 },
          { level, count: 1 },
        ],
      }),
    ).toThrow(new RangeError('beastRuns[1].level must be a whole number from 1 to 30'));
  });

  it.each([[-1], [0.5]])('rejects beast run count %p', (count) => {
    expect(() =>
      calculateBeasts({ stamina: 10, beastLevel: 1, beastRuns: [{ level: 5, count }] }),
    ).toThrow(new RangeError('beastRuns[0].count must be a whole number of 0 or more'));
  });

  it.each([[-1], [1.5]])('rejects %p planned Polar Terrors', (value) => {
    expect(() => calculateBeasts({ stamina: 10, beastLevel: 1, polarTerrors: value })).toThrow(
      new RangeError('polarTerrors must be a whole number of 0 or more'),
    );
  });
});
