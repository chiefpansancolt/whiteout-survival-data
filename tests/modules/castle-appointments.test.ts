import {
  CASTLE_APPOINTMENT,
  CastleAppointmentQuery,
  castleAppointments,
} from '@/modules/castle-appointments';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('castleAppointments', () => castleAppointments());

describe('CastleAppointmentQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = castleAppointments().get().slice(0, 2);
    expect(new CastleAppointmentQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new CastleAppointmentQuery().count()).toBe(8);
  });

  it('filters by kind', () => {
    expect(
      castleAppointments()
        .byKind('minister')
        .get()
        .map((a) => a.id),
    ).toEqual([
      'minister-of-defense',
      'minister-of-strategy',
      'minister-of-health',
      'minister-of-education',
      'minister-of-interior',
    ]);
    expect(castleAppointments().byKind('president').count()).toBe(2);
    expect(castleAppointments().byKind('vice-president').count()).toBe(1);
  });
});

describe('castle appointments', () => {
  it('gives the president positions four troop stats', () => {
    const stats = ['troops-attack', 'troops-defense', 'troops-lethality', 'troops-health'];
    for (const [id, amount] of [
      ['supreme-president', 7.5],
      ['president', 5],
    ] as const) {
      const bonuses = castleAppointments().find(id)!.bonuses;
      expect(bonuses.map((b) => b.statKey)).toEqual(stats);
      expect(bonuses.every((b) => b.amount === amount && b.unit === 'percent')).toBe(true);
    }
  });

  it('gives the Vice President speed bonuses of 10 percent', () => {
    expect(
      castleAppointments()
        .find('vice-president')!
        .bonuses.map((b) => [b.statKey, b.amount]),
    ).toEqual([
      ['construction-speed', 10],
      ['research-speed', 10],
      ['training-speed', 10],
    ]);
  });

  it('gives each minister base and boosted bonuses for the same stats', () => {
    const ministers = castleAppointments().byKind('minister').get();
    for (const minister of ministers) {
      expect(minister.boostedBonuses!.map((b) => b.statKey)).toEqual(
        minister.bonuses.map((b) => b.statKey),
      );
      minister.bonuses.forEach((base, i) =>
        expect(minister.boostedBonuses![i].amount).toBeGreaterThan(base.amount),
      );
    }
  });

  it('reads the Minister of Health values from the source', () => {
    const health = castleAppointments().find('minister-of-health')!;
    expect(health.bonuses.map((b) => [b.value, b.unit])).toEqual([
      ['+100%', 'percent'],
      ['+5,000', 'flat'],
    ]);
    expect(health.boostedBonuses!.map((b) => b.amount)).toEqual([150, 7500]);
  });

  it('gives no boosted bonuses to president positions', () => {
    expect(
      castleAppointments()
        .byKind('president')
        .get()
        .some((a) => a.boostedBonuses),
    ).toBe(false);
  });

  it('exports the appointment rules of the source', () => {
    expect(CASTLE_APPOINTMENT).toEqual({
      cooldownSeconds: 7200,
      applicationValiditySeconds: 86400,
      maxApplicationsPerPosition: 100,
    });
  });
});
