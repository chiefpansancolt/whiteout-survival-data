import * as whiteoutSurvivalData from '../src';

describe('package entry point', () => {
  it('re-exports every module', () => {
    expect(whiteoutSurvivalData.buildings().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.facilities().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.heroes().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.experts().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.pets().count()).toBeGreaterThan(0);
  });
});
