import {
  calculateAllianceShowdown,
  calculateHallOfChief,
  calculateKingOfIcefield,
} from '@/modules/calculators';
import { events } from '@/modules/events';

const ESCORT = 'Escort 1 truck of any grade';
const RAID = 'Raid 1 truck of any grade';
const REFINED = 'Use 1 Refined Fire Crystal to upgrade buildings';
const MITHRIL = 'Use 1 Mithril';

const actionsOf = (eventId: string, day: string) =>
  events()
    .find(eventId)!
    .days!.find((d) => d.day === day)!
    .scoring.map((s) => [s.action, s.points]);

describe('calculateAllianceShowdown', () => {
  it('returns every event day with no usage as zero', () => {
    const result = calculateAllianceShowdown();
    expect(result.days.map((d) => d.day)).toEqual(['1', '2', '3', '4', '5', '6-7']);
    expect(result.event).toEqual({ base: 0, bonus: 0, total: 0 });
    expect(result.dawnHymnBonusPercent).toBe(0);
  });

  it('lists the scoring lines of the event for each day', () => {
    expect(calculateAllianceShowdown().days[0].lines.map((l) => [l.action, l.points])).toEqual(
      actionsOf('alliance-showdown', '1'),
    );
  });

  it('adds up the points of each day and of the whole event', () => {
    const result = calculateAllianceShowdown({
      '1': { [ESCORT]: 2, [REFINED]: 2 },
      '4': { [MITHRIL]: 1 },
    });
    expect(result.days[0]).toMatchObject({ base: 20000 + 37500, bonus: 0, total: 57500 });
    expect(result.days[3]).toMatchObject({ base: 67500, total: 67500 });
    expect(result.event).toEqual({ base: 125000, bonus: 0, total: 125000 });
  });

  it('adds the Dawn Hymn percent to every action except the truck actions', () => {
    const result = calculateAllianceShowdown(
      { '1': { [ESCORT]: 2, [RAID]: 1, [REFINED]: 2 }, '4': { [MITHRIL]: 1 } },
      { dawnHymnLevel: 10 },
    );
    expect(result.dawnHymnBonusPercent).toBe(50);
    expect(result.days[0]).toMatchObject({ base: 30000 + 37500, bonus: 18750, total: 86250 });
    expect(result.days[3]).toMatchObject({ base: 67500, bonus: 33750, total: 101250 });
    expect(result.event).toEqual({ base: 135000, bonus: 52500, total: 187500 });
  });

  it('uses the percent stored on Baldur for every Dawn Hymn level from 1 to 10', () => {
    [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach((percent, i) =>
      expect(calculateAllianceShowdown({}, { dawnHymnLevel: i + 1 }).dawnHymnBonusPercent).toBe(
        percent,
      ),
    );
  });

  it('gives no bonus when the day has only truck points', () => {
    const result = calculateAllianceShowdown({ '2': { [ESCORT]: 3 } }, { dawnHymnLevel: 10 });
    expect(result.days[1]).toMatchObject({ base: 30000, bonus: 0, total: 30000 });
  });

  it('rounds the bonus of a day to a whole number', () => {
    const result = calculateAllianceShowdown({ '3': { 'Use 1 gem': 1 } }, { dawnHymnLevel: 1 });
    expect(result.days[2]).toMatchObject({ base: 1, bonus: 0, total: 1 });
  });

  it.each([0, 11, 1.5, Number.NaN])('rejects the Dawn Hymn level %s', (level) => {
    expect(() => calculateAllianceShowdown({}, { dawnHymnLevel: level })).toThrow(
      'dawnHymnLevel must be a whole number from 1 to 10',
    );
  });

  it('rejects negative counts and unknown days and actions', () => {
    expect(() => calculateAllianceShowdown({ '1': { [ESCORT]: -1 } })).toThrow(RangeError);
    expect(() => calculateAllianceShowdown({ '9': {} })).toThrow(
      'Unknown Alliance Showdown day: 9',
    );
    expect(() => calculateAllianceShowdown({ '1': { Nope: 1 } })).toThrow(
      'Unknown Alliance Showdown action on day 1: Nope',
    );
  });
});

describe('calculateKingOfIcefield', () => {
  it('returns the 7 days with no usage as zero', () => {
    const result = calculateKingOfIcefield();
    expect(result.days.map((d) => d.day)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(result.event.total).toBe(0);
    expect(result.days[3].lines.map((l) => [l.action, l.points])).toEqual(
      actionsOf('king-of-icefield', '4'),
    );
  });

  it('adds up the points of each day and of the whole event with no bonus', () => {
    const result = calculateKingOfIcefield({
      '4': { [MITHRIL]: 2, 'Train 1 Lv. 8 Troop': 100 },
      '5': { [MITHRIL]: 1 },
    });
    expect(result.days[3]).toMatchObject({ base: 80000 + 2300, bonus: 0, total: 82300 });
    expect(result.days[4]).toMatchObject({ base: 40000, bonus: 0, total: 40000 });
    expect(result.event).toEqual({ base: 122300, bonus: 0, total: 122300 });
  });

  it('rejects negative counts and unknown days and actions', () => {
    expect(() =>
      calculateKingOfIcefield({ '1': { 'Use 1 Fire Crystal to upgrade buildings': -1 } }),
    ).toThrow(RangeError);
    expect(() => calculateKingOfIcefield({ '8': {} })).toThrow('Unknown King of Icefield day: 8');
    expect(() => calculateKingOfIcefield({ '1': { Nope: 1 } })).toThrow(
      'Unknown King of Icefield action on day 1: Nope',
    );
  });
});

describe('calculateHallOfChief', () => {
  it('returns the 13 stages of both seasons with no usage as zero', () => {
    const result = calculateHallOfChief();
    expect(result.days.map((d) => d.day)).toEqual([
      's1-1',
      's1-2',
      's1-3',
      's1-4',
      's1-5',
      's1-6',
      's2-1',
      's2-2',
      's2-3',
      's2-4',
      's2-5',
      's2-6',
      's2-7',
    ]);
    expect(result.event.total).toBe(0);
    expect(result.days[2].lines.map((l) => [l.action, l.points])).toEqual(
      actionsOf('hall-of-chief', 's1-3'),
    );
  });

  it('adds up the points of each stage and of the whole event with no bonus', () => {
    const result = calculateHallOfChief({
      's1-3': { 'Train 1 Lv. 10 Troop': 10, 'Train 1 Lv. 1 Troop': 100 },
      's2-3': { 'Train 1 Lv. 10 Troop': 5 },
    });
    expect(result.days[2]).toMatchObject({ base: 19600 + 9000, bonus: 0, total: 28600 });
    expect(result.days[8]).toMatchObject({ base: 9800, bonus: 0, total: 9800 });
    expect(result.event).toEqual({ base: 38400, bonus: 0, total: 38400 });
  });

  it('rejects negative counts and unknown stages and actions', () => {
    expect(() => calculateHallOfChief({ 's1-3': { 'Train 1 Lv. 1 Troop': -1 } })).toThrow(
      RangeError,
    );
    expect(() => calculateHallOfChief({ 's3-1': {} })).toThrow('Unknown Hall of Chief day: s3-1');
    expect(() => calculateHallOfChief({ 's1-1': { Nope: 1 } })).toThrow(
      'Unknown Hall of Chief action on day s1-1: Nope',
    );
  });
});
