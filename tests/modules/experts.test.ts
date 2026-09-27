import { ExpertQuery, experts } from '@/modules/experts';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('experts', () => experts());

describe('ExpertQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = experts().get().slice(0, 1);
    expect(new ExpertQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ExpertQuery().count()).toBeGreaterThan(0);
  });

  it('byGeneration() filters to the given generation', () => {
    const gen1 = experts().byGeneration(1);
    expect(gen1.count()).toBe(4);
    expect(gen1.get().every((e) => e.generation === 1)).toBe(true);
  });
});

describe('Expert roster', () => {
  it('tracks all 10 experts across 3 generations', () => {
    expect(experts().count()).toBe(10);
    expect(experts().byGeneration(1).count()).toBe(4);
    expect(experts().byGeneration(2).count()).toBe(4);
    expect(experts().byGeneration(3).count()).toBe(2);
  });

  it('has a 100-level affinity table for every expert', () => {
    expect(
      experts()
        .get()
        .every((e) => e.affinityLevels.length === 100),
    ).toBe(true);
  });

  it("has affinity advancementCost summing to the expert's known total sigil cost", () => {
    const agnes = experts().findByName('Agnes')!;
    const total = agnes.affinityLevels.reduce((sum, l) => sum + (l.advancementCost ?? 0), 0);
    expect(total).toBe(275);
  });

  it('has a talent with a loot table on Agnes but not on Romulus', () => {
    const agnes = experts().findByName('Agnes')!;
    const romulus = experts().findByName('Romulus')!;
    expect(agnes.talent.lootTable).toBeDefined();
    expect(romulus.talent.lootTable).toBeUndefined();
  });

  it('has a skill with two independent progression tracks (Talent-style)', () => {
    const agnes = experts().findByName('Agnes')!;
    expect(agnes.talent.progressions).toHaveLength(2);
    expect(agnes.talent.progressions.map((p) => p.label)).toEqual(['Chest Gain', 'Daily Cap']);
  });

  it('has milestone item-tier rewards on some Generation 2 skills instead of a numeric progression', () => {
    const baldur = experts().findByName('Baldur')!;
    const blazingSunrise = baldur.skills.find((s) => s.name === 'Blazing Sunrise')!;
    expect(blazingSunrise.progressions).toHaveLength(0);
    expect(blazingSunrise.milestoneRewards).toHaveLength(3);
    expect(blazingSunrise.milestoneRewards![0].levelRequired).toBe(1);
  });

  it('has a loot table on a skill (not just a talent) for Bounty Hunter', () => {
    const baldur = experts().findByName('Baldur')!;
    const bountyHunter = baldur.skills.find((s) => s.name === 'Bounty Hunter')!;
    expect(bountyHunter.lootTable).toBeDefined();
    expect(bountyHunter.lootTable!.length).toBeGreaterThan(0);
  });

  it('defaults maxLevel to 1 for a flat, non-scaling talent', () => {
    const baldur = experts().findByName('Baldur')!;
    expect(baldur.talent.name).toBe('Master Negotiator');
    expect(baldur.talent.maxLevel).toBe(1);
    expect(baldur.talent.progressions).toHaveLength(0);
  });
});
