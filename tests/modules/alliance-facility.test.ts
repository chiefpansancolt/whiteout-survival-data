import { allianceFacility, AllianceFacilityQuery } from '@/modules/alliance/facility';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('allianceFacility', () => allianceFacility());

describe('AllianceFacilityQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = allianceFacility().get().slice(0, 1);
    expect(new AllianceFacilityQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new AllianceFacilityQuery().count()).toBeGreaterThan(0);
  });
});

describe('Alliance Facilities', () => {
  it('covers all 8 facility types', () => {
    expect(allianceFacility().count()).toBe(8);
    [
      'construction',
      'defense',
      'expedition',
      'gathering',
      'production',
      'tech',
      'training',
      'weapons',
    ].forEach((id) => expect(allianceFacility().find(id)).toBeDefined());
  });

  it('documents only the levels shown on the source image, not a guessed full range', () => {
    // The wiki has no structured data for this page at all (confirmed via
    // raw HTML: no table, prose-only capture-mechanics description), so
    // these levels are transcribed directly from a user-provided screenshot
    // that only documents some levels per facility.
    const defense = allianceFacility().find('defense')!;
    expect(defense.bonusStat).toBe('Troop Defense Boost');
    expect(
      defense.levels.map(({ level, boosterPercent, heavilyInjuredPercent, lossesPercent }) => ({
        level,
        boosterPercent,
        heavilyInjuredPercent,
        lossesPercent,
      })),
    ).toEqual([
      { level: 2, boosterPercent: 5, heavilyInjuredPercent: 20, lossesPercent: 0 },
      { level: 4, boosterPercent: 8, heavilyInjuredPercent: 30, lossesPercent: 10 },
    ]);

    const gathering = allianceFacility().find('gathering')!;
    expect(gathering.levels.map((l) => l.level)).toEqual([1]);
  });

  it('limits ownership to 1 facility per level', () => {
    allianceFacility()
      .get()
      .forEach((f) => f.levels.forEach((l) => expect(l.ownLimit).toBe(1)));
  });

  it('lists one map location per available facility', () => {
    allianceFacility()
      .get()
      .forEach((f) => f.levels.forEach((l) => expect(l.locations).toHaveLength(l.available)));
    const defense = allianceFacility().find('defense')!;
    expect(defense.levels.map((l) => l.available)).toEqual([8, 3]);
    expect(defense.levels[1].locations).toEqual([
      { x: 816, y: 717 },
      { x: 387, y: 717 },
      { x: 588, y: 327 },
    ]);
  });

  it('places no two facilities on the same coordinates', () => {
    const keys = allianceFacility()
      .get()
      .flatMap((f) => f.levels.flatMap((l) => l.locations.map(({ x, y }) => `${x};${y}`)));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
