import * as whiteoutSurvivalData from '../src';

describe('package entry point', () => {
  it('re-exports every module', () => {
    expect(whiteoutSurvivalData.buildings().count()).toBeGreaterThan(0);
  });
});
