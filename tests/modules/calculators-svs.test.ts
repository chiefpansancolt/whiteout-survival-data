import { calculateSvs } from '@/modules/calculators';
import { events } from '@/modules/events';
import { experts } from '@/modules/experts';

const REFINED = 'Use 1 Refined Fire Crystal to upgrade buildings';
const MITHRIL = 'Use 1 Mithril';
const KILL_LV11 = 'Kill 1 Lv. 11 enemy Troop.';

describe('calculateSvs', () => {
  it('returns every event day with no usage as zero', () => {
    const result = calculateSvs();
    expect(result.days.map((d) => d.day)).toEqual(['1', '2', '3', '4', '5', 'Battle']);
    expect(result.event).toEqual({ base: 0, bonus: 0, total: 0 });
    expect(result.valeriaBonusPercent).toBe(0);
  });

  it('lists the scoring lines of the event for each day', () => {
    const day1 = calculateSvs().days[0];
    const scoring = events().find('svs-state-of-power')!.days![0].scoring;
    expect(day1.lines.map((l) => [l.action, l.points])).toEqual(
      scoring.map((s) => [s.action, s.points]),
    );
    expect(day1.phase).toBe('preparation');
    expect(calculateSvs().days[5].phase).toBe('battle');
  });

  it('multiplies each count by its points and adds the lines of a day', () => {
    const result = calculateSvs({
      '1': { [REFINED]: 2, 'Use 1 Fire Crystal to upgrade buildings': 10 },
    });
    expect(result.days[0].lines.find((l) => l.action === REFINED)).toEqual({
      action: REFINED,
      points: 30000,
      count: 2,
      subtotal: 60000,
    });
    expect(result.days[0]).toMatchObject({ base: 80000, bonus: 0, total: 80000 });
  });

  it('adds the same action on different days separately', () => {
    const result = calculateSvs({ '4': { [MITHRIL]: 1 }, '5': { [MITHRIL]: 2 } });
    expect(result.days[3].base).toBe(144000);
    expect(result.days[4].base).toBe(288000);
    expect(result.event.base).toBe(432000);
  });

  it('adds 2 percent of Valeria per level to the Preparation Phase days only', () => {
    const usage = { '4': { [MITHRIL]: 1 }, Battle: { [KILL_LV11]: 100 } };
    const result = calculateSvs(usage, { valeriaLevel: 5 });
    expect(result.valeriaBonusPercent).toBe(10);
    expect(result.days[3]).toMatchObject({ base: 144000, bonus: 14400, total: 158400 });
    expect(result.days[5]).toMatchObject({ base: 1500, bonus: 0, total: 1500 });
    expect(result.preparation).toEqual({ base: 144000, bonus: 14400, total: 158400 });
    expect(result.battle).toEqual({ base: 1500, bonus: 0, total: 1500 });
    expect(result.event).toEqual({ base: 145500, bonus: 14400, total: 159900 });
  });

  it('uses the percent stored on Valeria for every level from 1 to 10', () => {
    const percents = experts()
      .find('valeria')!
      .skills.find((s) => s.name === 'Well Prepared')!.progressions[0].values;
    expect(percents).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    percents.forEach((percent, i) =>
      expect(calculateSvs({}, { valeriaLevel: i + 1 }).valeriaBonusPercent).toBe(percent),
    );
  });

  it('rounds the bonus of a day to a whole number', () => {
    const result = calculateSvs(
      { '1': { 'Raise Chief Charm max score by 1': 1 } },
      { valeriaLevel: 1 },
    );
    expect(result.days[0]).toMatchObject({ base: 70, bonus: 1, total: 71 });
  });

  it.each([0, 11, 1.5, Number.NaN])('rejects the Valeria level %s', (level) => {
    expect(() => calculateSvs({}, { valeriaLevel: level })).toThrow(RangeError);
  });

  it('rejects negative and non-numeric counts', () => {
    expect(() => calculateSvs({ '1': { [REFINED]: -1 } })).toThrow(RangeError);
    expect(() => calculateSvs({ '1': { [REFINED]: Number.NaN } })).toThrow(RangeError);
  });

  it('rejects days and actions that the event does not have', () => {
    expect(() => calculateSvs({ '9': {} })).toThrow('Unknown SvS day: 9');
    expect(() => calculateSvs({ '1': { 'Not an action': 1 } })).toThrow(
      'Unknown SvS action on day 1: Not an action',
    );
  });

  it('matches the README example', () => {
    const result = calculateSvs(
      { '4': { [MITHRIL]: 3 }, Battle: { [KILL_LV11]: 200 } },
      { valeriaLevel: 10 },
    );
    expect(result.event).toEqual({ base: 435000, bonus: 86400, total: 521400 });
  });
});
