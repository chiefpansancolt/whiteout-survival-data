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
    expect(defense.levels).toEqual([
      { level: 2, boosterPercent: 5, heavilyInjuredPercent: 20, lossesPercent: 0 },
      { level: 4, boosterPercent: 8, heavilyInjuredPercent: 30, lossesPercent: 10 },
    ]);

    const gathering = allianceFacility().find('gathering')!;
    expect(gathering.levels).toEqual([
      { level: 1, boosterPercent: 5, heavilyInjuredPercent: 10, lossesPercent: 0 },
    ]);
  });
});
