import * as whiteoutSurvivalData from '../src';

describe('package entry point', () => {
  it('re-exports every module', () => {
    expect(whiteoutSurvivalData.buildings().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.facilities().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.heroes().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.experts().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.pets().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.items().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.skins().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.chiefGearSlots().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.chiefGear().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.chiefCharm().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.research().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.heroGearEnhancement().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.heroGearEmpowerment().count()).toBeGreaterThan(0);
    expect(whiteoutSurvivalData.heroGearMasteryForging().count()).toBeGreaterThan(0);
  });
});
