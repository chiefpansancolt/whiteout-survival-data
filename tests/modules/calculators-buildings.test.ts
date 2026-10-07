import { buildings } from '@/modules/buildings';
import { calculateBuildings } from '@/modules/calculators';

const amount = (resources: { itemId: string; amount: number }[], itemId: string) =>
  resources.find((r) => r.itemId === itemId)?.amount;

describe('calculateBuildings', () => {
  it('returns zero for no goals', () => {
    const result = calculateBuildings();
    expect(result).toMatchObject({
      steps: [],
      resources: [],
      power: 0,
      seconds: 0,
      speedupMinutesNeeded: 0,
      unmetPrerequisites: [],
    });
    expect(result.eventPoints).toMatchObject({ svs: 0, kingOfIcefield: 0 });
  });

  it('adds the steps of a prerequisite building before the step that needs it', () => {
    const result = calculateBuildings([{ id: 'furnace', current: null, goal: '2' }]);
    expect(result.steps.map((s) => `${s.buildingId} ${s.level} ${s.prerequisite}`)).toEqual([
      'furnace 1 false',
      'sawmill 1 true',
      'furnace 2 false',
    ]);
    expect(result).toMatchObject({ power: 3840, baseSeconds: 7, seconds: 7 });
    expect(result.resources).toEqual([{ itemId: 'wood', amount: 2210 }]);
  });

  it('adds only the levels after the current level up to the goal', () => {
    const result = calculateBuildings([{ id: 'furnace', current: '2', goal: '4' }]);
    expect(result.steps.map((s) => `${s.buildingId} ${s.level}`)).toEqual([
      'furnace 3',
      'coal-mine 1',
      'coal-mine 2',
      'coal-mine 3',
      'furnace 4',
    ]);
    expect(result).toMatchObject({ power: 6430, baseSeconds: 253 });
    expect(amount(result.resources, 'wood')).toBe(2880);
    expect(amount(result.resources, 'coal')).toBe(360);
  });

  it('skips the prerequisite levels that a building already has', () => {
    const result = calculateBuildings([{ id: 'furnace', current: '2', goal: '4' }], {
      buildingLevels: { 'coal-mine': '3' },
    });
    expect(result.steps.map((s) => `${s.buildingId} ${s.level}`)).toEqual([
      'furnace 3',
      'furnace 4',
    ]);
  });

  it('reports a prerequisite on a building that is not in the data and adds no steps for it', () => {
    const result = calculateBuildings([{ id: 'furnace', current: '2', goal: '4' }]);
    expect(result.unmetPrerequisites).toEqual([{ building: 'Shelter 1', level: '2' }]);
  });

  it('follows a chain of prerequisites across buildings', () => {
    const result = calculateBuildings([{ id: 'embassy', current: null, goal: '3' }]);
    expect(result.steps).toHaveLength(33);
    expect(result.steps.filter((s) => !s.prerequisite).map((s) => s.level)).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(result.steps.some((s) => s.buildingId === 'hunters-hut')).toBe(true);
    expect(result.unmetPrerequisites).toEqual([
      { building: 'Shelter 1', level: '2' },
      { building: 'Hero Hall', level: '1' },
      { building: 'Shelter 3', level: '3' },
    ]);
    expect(result.power).toBe(56442);
    expect(result.baseSeconds).toBe(17789);
  });

  it('costs Fire Crystals and scores the SvS and King of Icefield points for FC levels', () => {
    const result = calculateBuildings([{ id: 'furnace', current: '30', goal: 'FC 1' }]);
    expect(result.steps.map((s) => s.level)).toEqual(['30-1', '30-2', '30-3', '30-4', 'FC 1']);
    expect(amount(result.resources, 'fire-crystal')).toBe(660);
    expect(result).toMatchObject({ power: 287000, baseSeconds: 3024000 });
    expect(result.eventPoints.svs).toBe(660 * 2000);
    expect(result.eventPoints.kingOfIcefield).toBe(660 * 2000);
  });

  it('scores Refined Fire Crystals', () => {
    const result = calculateBuildings([{ id: 'furnace', current: 'FC 5', goal: 'FC 6' }]);
    const refined = amount(result.resources, 'refined-fire-crystal')!;
    expect(refined).toBeGreaterThan(0);
    expect(result.eventPoints.svs).toBe(
      amount(result.resources, 'fire-crystal')! * 2000 + refined * 30000,
    );
  });

  it('divides the build time by the speed bonus and gives the speedup minutes that cover it', () => {
    const goals = [{ id: 'furnace', current: '30', goal: 'FC 1' }];
    const result = calculateBuildings(goals, {
      constructionSpeedPercent: 100,
    });
    expect(result).toMatchObject({
      seconds: 1512000,
      speedupMinutesNeeded: 25200,
    });
    expect(result.eventPoints.svs).toBe(660 * 2000);
    expect(result.speedupPointsPerMinute).toEqual({ svs: 30, kingOfIcefield: 30 });
  });

  it('turns 10 hours into 6 hours 40 minutes at 50% speed', () => {
    const tenHours = buildings()
      .find('furnace')!
      .levels.find((l) => l.buildTimeSeconds === 36000);
    const result = calculateBuildings(
      [{ id: 'furnace', current: null, goal: tenHours?.label ?? '1' }],
      {
        constructionSpeedPercent: 50,
      },
    );
    expect(result.seconds).toBe(Math.floor(result.baseSeconds / 1.5));
  });

  it('lists each Hall of Chief multiplier with its event days', () => {
    const result = calculateBuildings([{ id: 'furnace', current: '30', goal: 'FC 1' }]);
    const [highest, rest] = result.eventPoints.hallOfChief;
    expect(highest).toMatchObject({
      pointsPerPower: 45,
      days: ['Season 1, Stage 1'],
      points: 287000 * 45,
    });
    expect(rest.pointsPerPower).toBe(30);
    expect(rest.days.length).toBeGreaterThan(1);
    expect(rest.points).toBe(287000 * 30);
  });

  it('adds up several goals and rejects two goals for one building', () => {
    const result = calculateBuildings([
      { id: 'furnace', current: '30', goal: '30-1' },
      { id: 'embassy', current: '29', goal: '30' },
    ]);
    expect(result.steps.map((s) => `${s.buildingId} ${s.level}`)).toEqual([
      'furnace 30-1',
      'embassy 30',
    ]);
    expect(() =>
      calculateBuildings([
        { id: 'furnace', current: '30', goal: '30-1' },
        { id: 'furnace', current: '30-1', goal: '30-2' },
      ]),
    ).toThrow('More than one goal for the building furnace');
  });

  it('adds every building to its max level without a circular prerequisite', () => {
    const goals = buildings()
      .get()
      .filter((b) => b.levels[0].cost.every((c) => c.name !== 'Blueprint'))
      .map((b) => ({ id: b.id, current: null, goal: b.levels[b.levels.length - 1].label }));
    const result = calculateBuildings(goals);
    expect(result.steps.length).toBe(
      goals.reduce((n, g) => n + buildings().find(g.id)!.levels.length, 0),
    );
  });

  it('only uses prerequisite levels that exist in the data', () => {
    const labels = new Map(
      buildings()
        .get()
        .map((b) => [b.name, b.levels.map((l) => l.label)]),
    );
    buildings()
      .get()
      .flatMap((b) => b.levels.flatMap((l) => l.prerequisites ?? []))
      .filter((p) => labels.has(p.building))
      .forEach((p) => expect(labels.get(p.building)).toContain(String(p.level)));
  });

  it('rejects unknown buildings and levels, goals below the current level, bad numbers, and non-resource costs', () => {
    expect(() => calculateBuildings([{ id: 'nope', current: null, goal: '1' }])).toThrow(
      'Unknown building: nope',
    );
    expect(() => calculateBuildings([{ id: 'furnace', current: null, goal: '99' }])).toThrow(
      new RangeError('Unknown level of furnace: 99'),
    );
    expect(() => calculateBuildings([{ id: 'furnace', current: '99', goal: '2' }])).toThrow(
      RangeError,
    );
    expect(() => calculateBuildings([{ id: 'furnace', current: '5', goal: '2' }])).toThrow(
      'The goal level of furnace must not be below the current level',
    );
    expect(() => calculateBuildings([], { buildingLevels: { nope: '1' } })).toThrow(
      'Unknown building: nope',
    );
    expect(() => calculateBuildings([], { buildingLevels: { furnace: '99' } })).toThrow(RangeError);
    expect(() => calculateBuildings([], { constructionSpeedPercent: -1 })).toThrow(
      'constructionSpeedPercent must be a number from 0 up',
    );
    expect(() => calculateBuildings([{ id: 'the-bakery', current: null, goal: '1' }])).toThrow(
      /is not a resource that can be calculated/,
    );
  });
});
