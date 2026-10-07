import { calculateResearch, RESEARCH_CALCULATOR } from '@/modules/calculators';
import { research } from '@/modules/research';

const amountOf = (materials: { itemId: string; amount: number }[], itemId: string) =>
  materials.find((m) => m.itemId === itemId)?.amount;

describe('calculateResearch', () => {
  it('returns zero for no goals', () => {
    expect(calculateResearch()).toEqual({
      items: [],
      steps: 0,
      resources: [],
      power: 0,
      baseSeconds: 0,
      researchSpeedPercent: 0,
      seconds: 0,
      stepsWithoutTime: 0,
      unmetPrerequisites: [],
      buildingRequirements: [],
    });
  });

  it('costs the first level of a line you have not started', () => {
    const result = calculateResearch([{ id: 'assaut-techniques-i', current: 0, goal: 1 }]);
    expect(result.steps).toBe(1);
    expect(result.resources).toEqual([
      { itemId: 'meat', amount: 8700 },
      { itemId: 'wood', amount: 8700 },
      { itemId: 'coal', amount: 1700 },
      { itemId: 'iron', amount: 430 },
      { itemId: 'steel', amount: 520 },
    ]);
    expect(result.power).toBe(4200);
    expect(result.baseSeconds).toBe(175);
    expect(result.seconds).toBe(175);
    expect(result.items).toEqual([
      {
        id: 'assaut-techniques-i',
        name: 'Assaut Techniques I',
        category: 'Battle',
        steps: 1,
        resources: result.resources,
        power: 4200,
        baseSeconds: 175,
      },
    ]);
  });

  it('counts only the levels after the current level up to the goal', () => {
    const result = calculateResearch([{ id: 'assaut-techniques-i', current: 1, goal: 3 }]);
    expect(result.steps).toBe(2);
    expect(amountOf(result.resources, 'meat')).toBe(12000 + 26000);
    expect(result.baseSeconds).toBe(263 + 702);
    expect(result.power).toBe(8400);
  });

  it('costs nothing when the goal equals the current level', () => {
    const result = calculateResearch([{ id: 'assaut-techniques-i', current: 2, goal: 2 }]);
    expect(result).toMatchObject({ steps: 0, resources: [], power: 0, baseSeconds: 0, seconds: 0 });
  });

  it('divides the time by 1 plus the research speed and rounds down', () => {
    const goals = [{ id: 'assaut-techniques-i', current: 1, goal: 3 }];
    expect(calculateResearch(goals, { researchSpeedPercent: 100 }).seconds).toBe(482);
    const buffed = calculateResearch(goals, {
      researchSpeedPercent: 50,
      stateBuff: true,
      vicePresident: 'supreme',
    });
    expect(buffed.researchSpeedPercent).toBe(75);
    expect(buffed.seconds).toBe(Math.floor(965 / 1.75));
    expect(buffed.baseSeconds).toBe(965);
    expect(calculateResearch(goals, { vicePresident: 'regular' }).researchSpeedPercent).toBe(10);
  });

  it('adds the lines together before dividing the time by the speed', () => {
    const result = calculateResearch(
      [
        { id: 'assaut-techniques-i', current: 0, goal: 1 },
        { id: 'assaut-techniques-i', current: 1, goal: 2 },
      ],
      { researchSpeedPercent: 100 },
    );
    expect(result.baseSeconds).toBe(175 + 263);
    expect(result.seconds).toBe(Math.floor((175 + 263) / 2));
    expect(result.items).toHaveLength(2);
    expect(amountOf(result.resources, 'meat')).toBe(8700 + 12000);
  });

  it('counts the steps that have no research time in the data', () => {
    const result = calculateResearch([{ id: 'exalted-armament', current: 0, goal: 2 }]);
    expect(result.stepsWithoutTime).toBe(2);
    expect(result.baseSeconds).toBe(0);
    expect(result.steps).toBe(2);
  });

  it('lists a level whose prerequisite line is below the needed level', () => {
    const result = calculateResearch([{ id: 'assaut-techniques-i', current: 0, goal: 1 }]);
    expect(result.unmetPrerequisites).toEqual([
      {
        id: 'assaut-techniques-i',
        level: 1,
        requires: { id: 'special-defensive-training-i', level: 1 },
        planned: 0,
      },
    ]);
  });

  it('treats the goal level or the current level of the other line as meeting the prerequisite', () => {
    const goalMeets = calculateResearch([
      { id: 'special-defensive-training-i', current: 0, goal: 1 },
      { id: 'assaut-techniques-i', current: 0, goal: 1 },
    ]);
    expect(goalMeets.unmetPrerequisites.filter((u) => u.id === 'assaut-techniques-i')).toEqual([]);
    const currentMeets = calculateResearch([
      { id: 'special-defensive-training-i', current: 1, goal: 1 },
      { id: 'assaut-techniques-i', current: 0, goal: 1 },
    ]);
    expect(currentMeets.unmetPrerequisites.filter((u) => u.id === 'assaut-techniques-i')).toEqual(
      [],
    );
  });

  it('gives the highest building level that the steps need', () => {
    const goals = [{ id: 'assaut-techniques-i', current: 0, goal: 3 }];
    const result = calculateResearch(goals);
    const node = research().find('assaut-techniques-i')!;
    const labels = node.levels
      .flatMap((l) => l.prerequisites)
      .filter((p) => p.type === 'building' && p.id === 'research-center')
      .map((p) => Number(p.level));
    expect(result.buildingRequirements).toContainEqual({
      id: 'research-center',
      level: String(Math.max(...labels)),
    });
    expect(result.buildingRequirements.filter((b) => b.id === 'research-center')).toHaveLength(1);
  });

  it('keeps a Fire Crystal building level label for War Academy research', () => {
    const result = calculateResearch([{ id: 'flame-legion-2', current: 3, goal: 4 }]);
    expect(result.buildingRequirements).toEqual([{ id: 'war-academy', level: 'FC 5' }]);
    expect(amountOf(result.resources, 'fire-crystal-shard')).toBe(150);
  });

  it('adds up every level of a line for a full upgrade', () => {
    const node = research().find('flame-legion-2')!;
    const result = calculateResearch([
      { id: 'flame-legion-2', current: 0, goal: node.levels.length },
    ]);
    expect(result.steps).toBe(node.levels.length);
    expect(result.power).toBe(node.levels.reduce((sum, l) => sum + l.power, 0));
  });

  it('rejects unknown lines, levels out of range, goals below the current level, and a negative speed', () => {
    expect(() => calculateResearch([{ id: 'nope', current: 0, goal: 1 }])).toThrow(
      'Unknown research line: nope',
    );
    expect(() => calculateResearch([{ id: 'assaut-techniques-i', current: 0, goal: 4 }])).toThrow(
      'The goal level of assaut-techniques-i must be a whole number from 0 to 3',
    );
    expect(() => calculateResearch([{ id: 'assaut-techniques-i', current: -1, goal: 1 }])).toThrow(
      RangeError,
    );
    expect(() => calculateResearch([{ id: 'assaut-techniques-i', current: 0, goal: 1.5 }])).toThrow(
      RangeError,
    );
    expect(() => calculateResearch([{ id: 'assaut-techniques-i', current: 2, goal: 1 }])).toThrow(
      'The goal level of assaut-techniques-i must not be below the current level',
    );
    [-1, Number.NaN].forEach((researchSpeedPercent) =>
      expect(() => calculateResearch([], { researchSpeedPercent })).toThrow(
        'researchSpeedPercent must be a number from 0 up',
      ),
    );
  });

  it('exports the buffs it adds', () => {
    expect(RESEARCH_CALCULATOR).toEqual({
      stateBuffSpeedPercent: 10,
      vicePresidentSpeedPercent: { regular: 10, supreme: 15 },
    });
  });
});
