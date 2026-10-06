import { calculateChiefCharm } from '@/modules/calculators';
import { chiefCharm } from '@/modules/chief-charm';
import { events } from '@/modules/events';

describe('calculateChiefCharm', () => {
  it('returns zero for no ranges', () => {
    expect(calculateChiefCharm()).toEqual({
      steps: 0,
      materials: [],
      score: 0,
      power: 0,
      eventPoints: { svs: 0, allianceShowdown: 0, kingOfIcefield: 0, hallOfChief: 0 },
    });
  });

  it('adds the materials, score, and power of a charm that has no level yet', () => {
    const result = calculateChiefCharm([{ from: null, to: 'level-3' }]);
    expect(result.steps).toBe(3);
    expect(result.materials).toEqual([
      { itemId: 'charm-guide', amount: 5 + 40 + 60 },
      { itemId: 'charm-design', amount: 5 + 15 + 40 },
    ]);
    expect(result.score).toBe(625 + 1250 + 3125);
    expect(result.power).toBe(370000);
  });

  it('adds the steps after the start level up to the end level', () => {
    const result = calculateChiefCharm([{ from: 'level-3', to: 'level-5-stage-0' }]);
    expect(result.steps).toBe(5);
    expect(result.score).toBe(8750 + 11250);
    expect(result.power).toBe(576000 - 370000);
  });

  it('adds the charm secrets that levels above 11 need', () => {
    const result = calculateChiefCharm([{ from: 'level-11-stage-0', to: 'level-12-stage-0' }]);
    expect(result.materials.map((m) => m.itemId)).toEqual([
      'charm-guide',
      'charm-design',
      'charm-secrets',
    ]);
  });

  it('adds the ranges of several charms together', () => {
    const result = calculateChiefCharm(
      Array.from({ length: 18 }, () => ({ from: null, to: 'level-1' })),
    );
    expect(result.steps).toBe(18);
    expect(result.score).toBe(18 * 625);
    expect(result.materials).toEqual([
      { itemId: 'charm-guide', amount: 90 },
      { itemId: 'charm-design', amount: 90 },
    ]);
  });

  it('costs nothing when the start and end are the same level', () => {
    expect(calculateChiefCharm([{ from: 'level-3', to: 'level-3' }])).toMatchObject({
      steps: 0,
      materials: [],
      score: 0,
      power: 0,
    });
  });

  it('turns the score into event points with the points of each event', () => {
    const result = calculateChiefCharm([{ from: null, to: 'level-3' }]);
    expect(result.eventPoints).toEqual({
      svs: 5000 * 70,
      allianceShowdown: 5000 * 45,
      kingOfIcefield: 5000 * 70,
      hallOfChief: 5000 * 1000,
    });
  });

  it('adds up to the whole table for a full upgrade', () => {
    const result = calculateChiefCharm([{ from: null, to: 'level-18-stage-0' }]);
    expect(result.steps).toBe(75);
    expect(result.score).toBe(249800);
    expect(result.power).toBe(chiefCharm().get()[74].powerTotal);
  });

  it('rejects ranges that go down and levels that do not exist', () => {
    expect(() => calculateChiefCharm([{ from: 'level-5-stage-0', to: 'level-2' }])).toThrow(
      'A Chief Charm range must not go down: level-5-stage-0 to level-2',
    );
    expect(() => calculateChiefCharm([{ from: 'nope', to: 'level-2' }])).toThrow(
      'Unknown Chief Charm level: nope',
    );
    expect(() => calculateChiefCharm([{ from: null, to: 'nope' }])).toThrow(
      'Unknown Chief Charm level: nope',
    );
  });

  it('reads one points value for each event from the charm scoring rows of the event', () => {
    ['svs-state-of-power', 'alliance-showdown', 'king-of-icefield', 'hall-of-chief'].forEach(
      (id) => {
        const points = events()
          .find(id)!
          .days!.flatMap((d) => d.scoring)
          .filter((s) => /Chief Charm/.test(s.action))
          .map((s) => s.points);
        expect(points.length).toBeGreaterThan(0);
        expect(new Set(points).size).toBe(1);
      },
    );
  });
});
