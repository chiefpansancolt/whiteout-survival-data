import { calculateChiefGear } from '@/modules/calculators';
import { chiefGear } from '@/modules/chief-gear';
import { events } from '@/modules/events';

const amountOf = (materials: { itemId: string; amount: number }[], itemId: string) =>
  materials.find((m) => m.itemId === itemId)?.amount;

describe('calculateChiefGear', () => {
  it('returns zero for no ranges', () => {
    expect(calculateChiefGear()).toEqual({
      steps: 0,
      materials: [],
      score: 0,
      power: 0,
      eventPoints: { svs: 0, allianceShowdown: 0, kingOfIcefield: 0, hallOfChief: 0 },
    });
  });

  it('costs the first row for a gear piece that has no level yet', () => {
    const result = calculateChiefGear([{ from: null, to: 'common-star-0' }]);
    expect(result.steps).toBe(1);
    expect(result.materials).toEqual([
      { itemId: 'hardened-alloy', amount: 1500 },
      { itemId: 'polishing-solution', amount: 15 },
    ]);
    expect(result.score).toBe(1125);
    expect(result.power).toBe(224400);
  });

  it('adds the steps after the start level up to the end level', () => {
    const result = calculateChiefGear([{ from: 'common-star-0', to: 'rare-star-0' }]);
    expect(result.steps).toBe(2);
    expect(amountOf(result.materials, 'hardened-alloy')).toBe(3800 + 7000);
    expect(amountOf(result.materials, 'polishing-solution')).toBe(40 + 70);
    expect(result.score).toBe(1875 + 3000);
    expect(result.power).toBe(408000 - 224400);
  });

  it('adds the ranges of several pieces together', () => {
    const result = calculateChiefGear(
      Array.from({ length: 6 }, () => ({ from: null, to: 'common-star-0' })),
    );
    expect(result.steps).toBe(6);
    expect(amountOf(result.materials, 'hardened-alloy')).toBe(9000);
    expect(result.score).toBe(6750);
    expect(result.power).toBe(6 * 224400);
  });

  it('costs nothing when the start and end are the same level', () => {
    const result = calculateChiefGear([{ from: 'rare-star-1', to: 'rare-star-1' }]);
    expect(result).toMatchObject({ steps: 0, materials: [], score: 0, power: 0 });
  });

  it('counts the steps inside a level', () => {
    const result = calculateChiefGear([
      { from: 'legendary-star-0-stage-0', to: 'legendary-star-1-stage-0' },
    ]);
    expect(result.steps).toBe(4);
    expect(result.score).toBe(9560);
    expect(amountOf(result.materials, 'lunar-amber')).toBeGreaterThan(0);
  });

  it('turns the score into event points with the points of each event', () => {
    const result = calculateChiefGear([{ from: 'common-star-0', to: 'rare-star-0' }]);
    expect(result.eventPoints).toEqual({
      svs: 4875 * 36,
      allianceShowdown: 4875 * 22,
      kingOfIcefield: 4875 * 36,
      hallOfChief: 4875 * 500,
    });
  });

  it('adds up to the whole table for a full upgrade', () => {
    const result = calculateChiefGear([{ from: null, to: 'legendary-t6-star-3-stage-0' }]);
    expect(result.steps).toBe(150);
    expect(result.score).toBe(461880);
    expect(result.power).toBe(chiefGear().get()[149].powerTotal);
  });

  it('rejects ranges that go down and levels that do not exist', () => {
    expect(() => calculateChiefGear([{ from: 'rare-star-1', to: 'common-star-0' }])).toThrow(
      'A Chief Gear range must not go down: rare-star-1 to common-star-0',
    );
    expect(() => calculateChiefGear([{ from: 'rare-star-1', to: 'common-star-0' }])).toThrow(
      RangeError,
    );
    expect(() => calculateChiefGear([{ from: 'nope', to: 'common-star-0' }])).toThrow(
      'Unknown Chief Gear level: nope',
    );
    expect(() => calculateChiefGear([{ from: null, to: 'nope' }])).toThrow(
      'Unknown Chief Gear level: nope',
    );
  });

  it('reads one points value for each event from the gear scoring rows of the event', () => {
    ['svs-state-of-power', 'alliance-showdown', 'king-of-icefield', 'hall-of-chief'].forEach(
      (id) => {
        const points = events()
          .find(id)!
          .days!.flatMap((d) => d.scoring)
          .filter((s) => /Chief Gear/.test(s.action))
          .map((s) => s.points);
        expect(points.length).toBeGreaterThan(0);
        expect(new Set(points).size).toBe(1);
      },
    );
  });
});
