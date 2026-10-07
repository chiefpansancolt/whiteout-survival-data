import {
  calculateHeroGear,
  HERO_GEAR_ENHANCEMENT_REQUIREMENT,
  HERO_GEAR_MAX_EMPOWERMENT_LEVEL,
  HERO_GEAR_MAX_ENHANCEMENT_LEVEL,
} from '@/modules/calculators';
import { heroGearMasteryForging } from '@/modules/hero-gear-mastery-forging';

const amount = (resources: { itemId: string; amount: number }[], itemId: string) =>
  resources.find((r) => r.itemId === itemId)?.amount;

describe('calculateHeroGear', () => {
  it('returns zero for a piece with no goal', () => {
    expect(calculateHeroGear()).toEqual({
      masteryForging: { steps: 0, resources: [], statsUpPercent: 0 },
      enhancement: { steps: 0, resources: [], power: 0 },
      empowerment: { steps: 0, resources: [], power: 0 },
      resources: [],
      power: 0,
      currentPower: 0,
      goalPower: 0,
      eventPoints: { svs: 0, allianceShowdown: 0, kingOfIcefield: 0 },
      unmetRequirements: [],
      stats: null,
    });
  });

  it('exports the two level caps and the enhancement requirement', () => {
    expect(HERO_GEAR_MAX_ENHANCEMENT_LEVEL).toBe(100);
    expect(HERO_GEAR_MAX_EMPOWERMENT_LEVEL).toBe(100);
    expect(HERO_GEAR_ENHANCEMENT_REQUIREMENT).toEqual({
      afterRowId: 'level-10-stage-0',
      enhancementLevel: 100,
    });
    expect(heroGearMasteryForging().find('level-10-stage-0')).toBeDefined();
  });

  it('costs the rows after the current mastery forging row up to the goal', () => {
    const result = calculateHeroGear({
      masteryForging: { current: 'level-5-stage-0', goal: 'level-6-stage-0' },
    });
    expect(result.masteryForging).toEqual({
      steps: 5,
      resources: [{ itemId: 'essence-stones', amount: 60 }],
      statsUpPercent: 10,
    });
    expect(result.resources).toEqual([{ itemId: 'essence-stones', amount: 60 }]);
    expect(result.power).toBe(0);
  });

  it('costs all of mastery forging from a piece that has none', () => {
    const result = calculateHeroGear({
      masteryForging: { current: null, goal: 'level-20-stage-0' },
    });
    expect(result.masteryForging.steps).toBe(84);
    expect(result.masteryForging.statsUpPercent).toBe(200);
    expect(amount(result.resources, 'essence-stones')).toBe(2100);
    expect(amount(result.resources, 'custom-mythic-hero-gear-chest')).toBe(55);
  });

  it('costs enhancement levels and the power gained', () => {
    const result = calculateHeroGear({ enhancement: { current: 0, goal: 20 } });
    expect(result.enhancement).toEqual({
      steps: 20,
      resources: [{ itemId: 'enhancement-xp-component', amount: 1150 }],
      power: 56500,
    });
    expect(result.power).toBe(56500);
  });

  it('costs the whole of enhancement', () => {
    const result = calculateHeroGear({ enhancement: { current: 0, goal: 100 } });
    expect(result.enhancement.power).toBe(1086700);
    expect(amount(result.resources, 'enhancement-xp-component')).toBe(73320);
    expect(result.unmetRequirements).toEqual([]);
  });

  it('costs Mythic chests and Mithril at the empowerment milestone levels', () => {
    const result = calculateHeroGear({ empowerment: { current: 19, goal: 20 } });
    expect(result.empowerment.steps).toBe(1);
    expect(amount(result.resources, 'mithril')).toBe(10);
    expect(amount(result.resources, 'custom-mythic-hero-gear-chest')).toBe(3);
    expect(amount(result.resources, 'enhancement-xp-component')).toBeUndefined();
  });

  it('starts the empowerment power at the power of enhancement level 100', () => {
    const first = calculateHeroGear({ empowerment: { current: 0, goal: 1 } });
    expect(first.empowerment.power).toBe(1118000 - 1086700);
    expect(amount(first.resources, 'custom-mythic-hero-gear-chest')).toBe(2);
    const first20 = calculateHeroGear({ empowerment: { current: 0, goal: 20 } });
    expect(first20.empowerment.power).toBe(1712700 - 1086700);
    expect(amount(first20.resources, 'mithril')).toBe(10);
    expect(amount(first20.resources, 'enhancement-xp-component')).toBe(52650);
  });

  it('adds all three tracks and scores Essence Stones and Mithril in each event', () => {
    const result = calculateHeroGear({
      masteryForging: { current: null, goal: 'level-20-stage-0' },
      enhancement: { current: 0, goal: 100 },
      empowerment: { current: 0, goal: 100 },
    });
    expect(amount(result.resources, 'essence-stones')).toBe(2100);
    expect(amount(result.resources, 'mithril')).toBe(150);
    expect(amount(result.resources, 'custom-mythic-hero-gear-chest')).toBe(90);
    expect(amount(result.resources, 'enhancement-xp-component')).toBe(574370);
    expect(result.power).toBe(4216700);
    expect(result.eventPoints).toEqual({
      svs: 2100 * 4000 + 150 * 144000,
      allianceShowdown: 2100 * 1875 + 150 * 67500,
      kingOfIcefield: 2100 * 4000 + 150 * 40000,
    });
    expect(result.unmetRequirements).toEqual([]);
  });

  it('costs nothing when the goal is the current state', () => {
    const result = calculateHeroGear({
      masteryForging: { current: 'level-5-stage-0', goal: 'level-5-stage-0' },
      enhancement: { current: 50, goal: 50 },
      empowerment: { current: 0, goal: 0 },
    });
    expect(result.resources).toEqual([]);
    expect(result.masteryForging.statsUpPercent).toBe(0);
    expect(result.power).toBe(0);
  });

  it('lists mastery forging past level 10 and empowerment as unmet when enhancement ends below 100', () => {
    const result = calculateHeroGear({
      masteryForging: { current: 'level-10-stage-0', goal: 'level-10-stage-1' },
      enhancement: { current: 0, goal: 99 },
      empowerment: { current: 0, goal: 5 },
    });
    expect(result.unmetRequirements).toEqual([
      { track: 'masteryForging', enhancementLevel: 100 },
      { track: 'empowerment', enhancementLevel: 100 },
    ]);
  });

  it('does not list mastery forging up to level 10 or an empowerment range of zero as unmet', () => {
    const result = calculateHeroGear({
      masteryForging: { current: null, goal: 'level-10-stage-0' },
      enhancement: { current: 0, goal: 50 },
      empowerment: { current: 0, goal: 0 },
    });
    expect(result.unmetRequirements).toEqual([]);
  });

  it('does not check the requirements when the goal has no enhancement range', () => {
    const result = calculateHeroGear({
      masteryForging: { current: null, goal: 'level-20-stage-0' },
      empowerment: { current: 0, goal: 5 },
    });
    expect(result.unmetRequirements).toEqual([]);
  });

  it('rejects unknown rows, levels out of range, and goals below the current state', () => {
    expect(() =>
      calculateHeroGear({ masteryForging: { current: 'nope', goal: 'level-1' } }),
    ).toThrow('Unknown mastery forging row: nope');
    expect(() => calculateHeroGear({ masteryForging: { current: null, goal: 'nope' } })).toThrow(
      'Unknown mastery forging row: nope',
    );
    expect(() =>
      calculateHeroGear({ masteryForging: { current: 'level-3', goal: 'level-2' } }),
    ).toThrow('The goal mastery forging row must not be below the current row');
    expect(() => calculateHeroGear({ enhancement: { current: -1, goal: 5 } })).toThrow(
      'The current enhancement level must be a whole number from 0 to 100',
    );
    expect(() => calculateHeroGear({ enhancement: { current: 0, goal: 101 } })).toThrow(RangeError);
    expect(() => calculateHeroGear({ empowerment: { current: 0, goal: 1.5 } })).toThrow(
      'The goal empowerment level must be a whole number from 0 to 100',
    );
    expect(() => calculateHeroGear({ empowerment: { current: 30, goal: 20 } })).toThrow(
      'The goal empowerment level must not be below the current level',
    );
  });

  describe('stats of the piece', () => {
    const goggles = { slot: 'goggles', troopType: 'infantry' } as const;

    it('has no stats without a piece', () => {
      expect(calculateHeroGear({ enhancement: { current: 0, goal: 100 } }).stats).toBeNull();
    });

    it('gains the stats of the levels of the piece', () => {
      const result = calculateHeroGear({ piece: goggles, enhancement: { current: 0, goal: 100 } });
      const full = { combatStat: 345, health: 3375, percentStat: 50 };
      expect(result.stats).toEqual({
        combatStatName: 'Attack',
        percentStatName: 'Lethality',
        current: { combatStat: 0, health: 0, percentStat: 0 },
        goal: full,
        gain: full,
        milestones: [],
      });
    });

    it('gains the difference between two levels and names the stats of Gloves', () => {
      const result = calculateHeroGear({
        piece: { slot: 'gloves', troopType: 'lancer' },
        empowerment: { current: 0, goal: 20 },
        enhancement: { current: 100, goal: 100 },
      });
      expect(result.stats).toMatchObject({
        combatStatName: 'Defense',
        percentStatName: 'Health',
        current: { combatStat: 450, health: 2250, percentStat: 50 },
        goal: { combatStat: 540, health: 2700, percentStat: 60 },
        gain: { combatStat: 90, health: 450, percentStat: 10 },
      });
    });

    it('multiplies the stats with the mastery forging of the piece and rounds down', () => {
      const result = calculateHeroGear({
        piece: goggles,
        masteryForging: { current: null, goal: 'level-5-stage-0' },
        enhancement: { current: 0, goal: 100 },
      });
      expect(result.stats!.goal).toEqual({ combatStat: 517, health: 5062, percentStat: 75 });
      expect(result.stats!.gain).toEqual(result.stats!.goal);
    });

    it('gains the stats of a mastery forging only plan when the enhancement level is given', () => {
      const result = calculateHeroGear({
        piece: goggles,
        masteryForging: { current: null, goal: 'level-5-stage-0' },
        enhancement: { current: 100, goal: 100 },
      });
      expect(result.stats).toMatchObject({
        current: { combatStat: 345, health: 3375, percentStat: 50 },
        goal: { combatStat: 517, health: 5062, percentStat: 75 },
        gain: { combatStat: 172, health: 1687, percentStat: 25 },
      });
      expect(
        calculateHeroGear({
          piece: goggles,
          masteryForging: { current: null, goal: 'level-5-stage-0' },
        }).stats,
      ).toMatchObject({ gain: { combatStat: 0, health: 0, percentStat: 0 } });
    });

    it('changes the level and the mastery forging together across enhancement and empowerment', () => {
      const result = calculateHeroGear({
        piece: { slot: 'belt', troopType: 'marksman' },
        masteryForging: { current: 'level-6-stage-0', goal: 'level-10-stage-0' },
        enhancement: { current: 50, goal: 100 },
        empowerment: { current: 0, goal: 50 },
      });
      expect(result.stats).toMatchObject({
        current: { combatStat: 384, health: 1440, percentStat: 42.66 },
        goal: { combatStat: 1350, health: 5062, percentStat: 150 },
        gain: { combatStat: 966, health: 3622, percentStat: 107.34 },
      });
    });

    it('lists the milestones that the plan unlocks', () => {
      const result = calculateHeroGear({
        piece: goggles,
        enhancement: { current: 100, goal: 100 },
        empowerment: { current: 19, goal: 60 },
      });
      expect(result.stats!.milestones.map((m) => m.empowermentLevel)).toEqual([20, 40, 60]);
      expect(result.stats!.milestones[0].stat).toBe('Infantry Attack +20%');
      const none = calculateHeroGear({
        piece: goggles,
        enhancement: { current: 100, goal: 100 },
        empowerment: { current: 20, goal: 39 },
      });
      expect(none.stats!.milestones).toEqual([]);
    });
  });

  describe('power before and after', () => {
    it('has the power of the level for enhancement and none at level 0', () => {
      const result = calculateHeroGear({ enhancement: { current: 0, goal: 20 } });
      expect(result.currentPower).toBe(0);
      expect(result.goalPower).toBe(56500);
      expect(result.goalPower - result.currentPower).toBe(result.power);
    });

    it('uses the empowerment power once the piece is empowered', () => {
      const result = calculateHeroGear({ empowerment: { current: 19, goal: 60 } });
      expect(result.currentPower).toBe(1681400);
      expect(result.goalPower).toBe(2964700);
      expect(result.goalPower - result.currentPower).toBe(result.power);
    });

    it('follows a plan from enhancement into empowerment', () => {
      const result = calculateHeroGear({
        enhancement: { current: 50, goal: 100 },
        empowerment: { current: 0, goal: 50 },
      });
      expect(result.currentPower).toBe(215300);
      expect(result.goalPower).toBe(2651700);
      expect(result.power).toBe(2436400);
    });
  });
});
