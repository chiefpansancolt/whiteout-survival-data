import {
  calculateExperts,
  EXPERT_LEARNING_QUEUE_OPTIONS,
  EXPERT_MAX_LEVEL,
  EXPERT_SKILL_EXP_PER_LEARNING_MINUTE,
} from '@/modules/calculators';
import { experts } from '@/modules/experts';
import { ExpertGoal, ExpertSkillGoal } from '@/types';

const agnes = (level: ExpertGoal['level'], skills?: ExpertSkillGoal[]): ExpertGoal => ({
  id: 'agnes',
  level,
  skills,
});

describe('calculateExperts', () => {
  it('returns zero for no goals', () => {
    expect(calculateExperts()).toMatchObject({
      items: [],
      levels: 0,
      advancements: 0,
      skillLevels: 0,
      sigils: 0,
      books: 0,
      exp: 0,
      learningMinutes: 0,
      affinity: 0,
    });
  });

  it('costs the affinity points of each level after the current level up to the goal', () => {
    const result = calculateExperts([agnes({ current: 1, goal: 10 })]);
    expect(result).toMatchObject({ levels: 9, affinity: 2750, advancements: 0, sigils: 0 });
    expect(result.items[0]).toMatchObject({ id: 'agnes', name: 'Agnes', books: 0, exp: 0 });
  });

  it('pays the sigils of the advancement at a level the range passes', () => {
    const result = calculateExperts([agnes({ current: 1, goal: 11 })]);
    expect(result).toMatchObject({ levels: 10, advancements: 1, sigils: 5, affinity: 3160 });
  });

  it('pays the sigils for an expert that starts at a level with an advancement', () => {
    expect(calculateExperts([agnes({ current: 10, goal: 11 })]).sigils).toBe(5);
  });

  it('does not pay again for an expert that is already advanced at its current level', () => {
    const result = calculateExperts([agnes({ current: 10, goal: 11, currentAdvanced: true })]);
    expect(result).toMatchObject({ advancements: 0, sigils: 0, levels: 1 });
  });

  it('pays only for the advancement when the goal is the current level and is advanced', () => {
    const result = calculateExperts([agnes({ current: 10, goal: 10, goalAdvanced: true })]);
    expect(result).toMatchObject({ levels: 0, advancements: 1, sigils: 5, affinity: 0 });
  });

  it('adds up to 275 sigils for Agnes from level 1 to the advanced level 100', () => {
    const result = calculateExperts([agnes({ current: 1, goal: 100, goalAdvanced: true })]);
    expect(result).toMatchObject({ advancements: 10, sigils: 275, affinity: 205020, levels: 99 });
    expect(calculateExperts([agnes({ current: 1, goal: 100 })]).sigils).toBe(225);
  });

  it('costs the books and EXP of each skill level after the current level up to the goal', () => {
    const result = calculateExperts([
      agnes(undefined, [{ name: 'Efficient Recon', current: 1, goal: 5 }]),
    ]);
    expect(result).toMatchObject({
      skillLevels: 4,
      books: 7500,
      exp: 648000,
      levels: 0,
      sigils: 0,
    });
    const middle = calculateExperts([
      agnes(undefined, [{ name: 'Efficient Recon', current: 2, goal: 4 }]),
    ]);
    expect(middle).toMatchObject({ skillLevels: 2, books: 3000, exp: 259200 });
  });

  it('adds up the skills of an expert and every skill to the max for the full skill cost', () => {
    const agnesData = experts().find('agnes')!;
    const result = calculateExperts([
      agnes(
        undefined,
        agnesData.skills.map((s) => ({ name: s.name, current: 1, goal: s.maxLevel })),
      ),
    ]);
    expect(result.books).toBe(21000);
    expect(result.exp).toBe(1836600);
  });

  it('adds the levels and skills of several experts together', () => {
    const result = calculateExperts([
      agnes({ current: 1, goal: 11 }, [{ name: 'Optimization', current: 1, goal: 3 }]),
      { id: 'cyrille', level: { current: 1, goal: 10, goalAdvanced: true } },
    ]);
    expect(result.items).toHaveLength(2);
    expect(result.sigils).toBe(5 + 5);
    expect(result.books).toBe(400 + 800);
    expect(result.levels).toBe(10 + 9);
    expect(result.advancements).toBe(2);
    expect(result.skillLevels).toBe(2);
    expect(result.affinity).toBe(result.items[0].affinity + result.items[1].affinity);
    expect(result.exp).toBe(result.items[0].exp + result.items[1].exp);
  });

  it('costs nothing for an expert with no level or skills', () => {
    expect(calculateExperts([{ id: 'agnes' }]).items[0]).toEqual({
      id: 'agnes',
      name: 'Agnes',
      levels: 0,
      advancements: 0,
      skillLevels: 0,
      sigils: 0,
      books: 0,
      exp: 0,
      learningMinutes: 0,
      affinity: 0,
    });
  });

  it('gives every expert an advancement cost at level 100', () => {
    experts()
      .get()
      .forEach((expert) => {
        expect(expert.affinityLevels).toHaveLength(EXPERT_MAX_LEVEL);
        expect(expert.affinityLevels[EXPERT_MAX_LEVEL - 1].advancementCost).toBeGreaterThan(0);
      });
  });

  it('rejects unknown experts and skills, levels out of range, goals below the current level, and advanced flags with no cost', () => {
    expect(() => calculateExperts([{ id: 'nope' }])).toThrow('Unknown expert: nope');
    expect(() =>
      calculateExperts([agnes(undefined, [{ name: 'Nope', current: 1, goal: 2 }])]),
    ).toThrow('Unknown skill of agnes: Nope');
    expect(() => calculateExperts([agnes({ current: 0, goal: 5 })])).toThrow(
      'The current level of agnes must be a whole number from 1 to 100',
    );
    expect(() => calculateExperts([agnes({ current: 1, goal: 101 })])).toThrow(RangeError);
    expect(() => calculateExperts([agnes({ current: 1, goal: 2.5 })])).toThrow(RangeError);
    expect(() => calculateExperts([agnes({ current: 9, goal: 5 })])).toThrow(
      'The goal level of agnes must not be below the current level',
    );
    expect(() =>
      calculateExperts([agnes(undefined, [{ name: 'Efficient Recon', current: 1, goal: 6 }])]),
    ).toThrow('The goal level of agnes Efficient Recon must be a whole number from 1 to 5');
    expect(() =>
      calculateExperts([agnes(undefined, [{ name: 'Efficient Recon', current: 4, goal: 2 }])]),
    ).toThrow('The goal level of agnes Efficient Recon must not be below the current level');
    expect(() =>
      calculateExperts([agnes({ current: 5, goal: 11, currentAdvanced: true })]),
    ).toThrow('The current advancement of agnes needs a level that has an advancement cost');
    expect(() => calculateExperts([agnes({ current: 1, goal: 11, goalAdvanced: true })])).toThrow(
      'The goal advancement of agnes needs a level that has an advancement cost',
    );
  });

  it('exports the max level', () => {
    expect(EXPERT_MAX_LEVEL).toBe(100);
  });
});

describe('calculateExperts event points', () => {
  it('has no event points for no goals', () => {
    const result = calculateExperts();
    expect(result.eventPoints).toEqual({ svs: 0, allianceShowdown: 0 });
  });

  it('scores the Books of Knowledge and the sigils', () => {
    const result = calculateExperts([
      agnes({ current: 1, goal: 11 }, [{ name: 'Efficient Recon', current: 1, goal: 5 }]),
    ]);
    expect(result).toMatchObject({ books: 7500, sigils: 5 });
    expect(result.eventPoints).toEqual({
      svs: 7500 * 60 + 5 * 6000,
      allianceShowdown: 7500 * 36 + 5 * 3600,
    });
  });

  it('gives the points of one minute of speedups to learn expert skills', () => {
    expect(calculateExperts().speedupPointsPerMinute).toEqual({ svs: 30, allianceShowdown: 18 });
  });
});

describe('calculateExperts learning minutes', () => {
  it('exports 60 EXP for each minute of learning', () => {
    expect(EXPERT_SKILL_EXP_PER_LEARNING_MINUTE).toBe(60);
  });

  it('divides the skill EXP by 60 for the minutes of learning', () => {
    const result = calculateExperts([
      agnes(undefined, [{ name: 'Efficient Recon', current: 1, goal: 3 }]),
    ]);
    const skill = experts()
      .find('agnes')!
      .skills.find((s) => s.name === 'Efficient Recon')!;
    const exp = skill.costs[1].exp + skill.costs[2].exp;
    expect(result.exp).toBe(exp);
    expect(result.learningMinutes).toBe(exp / 60);
    expect(result.items[0].learningMinutes).toBe(exp / 60);
  });

  it('gives whole hours of learning for a skill level of 43,200 EXP', () => {
    const result = calculateExperts([
      { id: 'agnes', skills: [{ name: 'Efficient Recon', current: 1, goal: 2 }] },
    ]);
    expect(result.exp).toBe(43200);
    expect(result.learningMinutes).toBe(720);
  });

  it('rounds the minutes up, like Crisis Rescue level 2 of Fabian with 33,053 EXP', () => {
    const result = calculateExperts([
      { id: 'fabian', skills: [{ name: 'Crisis Rescue', current: 1, goal: 2 }] },
    ]);
    expect(result.exp).toBe(33053);
    expect(result.learningMinutes).toBe(551);
  });

  it('rounds the total once, not the minutes of each expert', () => {
    const goals = [
      { id: 'fabian', skills: [{ name: 'Crisis Rescue', current: 1, goal: 2 }] },
      { id: 'fabian', skills: [{ name: 'Crisis Rescue', current: 1, goal: 2 }] },
    ];
    const result = calculateExperts(goals);
    expect(result.items.map((i) => i.learningMinutes)).toEqual([551, 551]);
    expect(result.learningMinutes).toBe(Math.ceil((2 * 33053) / 60));
    expect(result.learningMinutes).toBe(1102);
  });

  it('gives 0 minutes when no skill levels are chosen', () => {
    expect(calculateExperts().learningMinutes).toBe(0);
  });
});

describe('EXPERT_LEARNING_QUEUE_OPTIONS', () => {
  it('lists the six sessions that can be queued, one at a time, with the EXP of each', () => {
    expect(EXPERT_LEARNING_QUEUE_OPTIONS).toEqual([
      { label: '10 min', minutes: 10, exp: 600 },
      { label: '2h', minutes: 120, exp: 7200 },
      { label: '10h', minutes: 600, exp: 36000 },
      { label: '24h', minutes: 1440, exp: 86400 },
      { label: '3d', minutes: 4320, exp: 259200 },
      { label: '5d', minutes: 7200, exp: 432000 },
    ]);
  });

  it('gives each option the EXP of its seconds, at 60 EXP for each minute', () => {
    for (const option of EXPERT_LEARNING_QUEUE_OPTIONS) {
      expect(option.exp).toBe(option.minutes * 60);
    }
  });

  it('pays one 24 hour session for level 3 of Efficient Recon of Agnes', () => {
    const skill = experts()
      .find('agnes')!
      .skills.find((s) => s.name === 'Efficient Recon')!;
    const session = EXPERT_LEARNING_QUEUE_OPTIONS.find((o) => o.label === '24h')!;
    expect(skill.costs[2].exp).toBe(session.exp);
  });
});
