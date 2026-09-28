import { buildings } from '@/modules/buildings';
import { items } from '@/modules/items';
import { research, ResearchQuery } from '@/modules/research';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('research', () => research());

describe('ResearchQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = research().get().slice(0, 1);
    expect(new ResearchQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ResearchQuery().count()).toBeGreaterThan(0);
  });

  it('byCategory() filters to the given category', () => {
    const battle = research().byCategory('Battle');
    expect(battle.count()).toBe(102);
    expect(battle.get().every((n) => n.category === 'Battle')).toBe(true);
  });

  it('byTier() filters to the given tier', () => {
    const tier1 = research().byTier(1);
    expect(tier1.count()).toBeGreaterThan(0);
    expect(tier1.get().every((n) => n.tier === 1)).toBe(true);
  });
});

describe('Research tech tree', () => {
  it('tracks 263 nodes across 9 categories', () => {
    expect(research().count()).toBe(263);
    expect(research().byCategory('Battle').count()).toBe(102);
    expect(research().byCategory('Growth').count()).toBe(45);
    expect(research().byCategory('Economy').count()).toBe(44);
    expect(research().byCategory('T11 Infantry').count()).toBe(10);
    expect(research().byCategory('T11 Marksman').count()).toBe(10);
    expect(research().byCategory('T11 Lancer').count()).toBe(10);
    expect(research().byCategory('T12 Infantry').count()).toBe(14);
    expect(research().byCategory('T12 Marksman').count()).toBe(14);
    expect(research().byCategory('T12 Lancer').count()).toBe(14);
  });

  it('resolves a building-type prerequisite into buildings()', () => {
    const lancerArmorI = research().find('lancer-armor-i')!;
    const buildingReq = lancerArmorI.levels[0].prerequisites.find((p) => p.type === 'building')!;
    expect(buildingReq.id).toBe('research-center');
    const researchCenter = buildings().find(buildingReq.id)!;
    expect(researchCenter.levels.some((l) => l.label === String(buildingReq.level))).toBe(true);
  });

  it('resolves a research-type prerequisite into another research() entry', () => {
    const lancerArmorI = research().find('lancer-armor-i')!;
    const researchReq = lancerArmorI.levels[0].prerequisites.find((p) => p.type === 'research')!;
    expect(research().find(researchReq.id)).toBeDefined();
  });

  it('normalizes a War Academy Fire Crystal level label to round-trip into buildings()', () => {
    const exaltedBlunderbuss = research().find('exalted-blunderbuss')!;
    const warAcademyReq = exaltedBlunderbuss.levels[0].prerequisites[0];
    expect(warAcademyReq).toEqual({ type: 'building', id: 'war-academy', level: 'FC 10' });
    const warAcademy = buildings().find('war-academy')!;
    expect(warAcademy.levels.some((l) => l.label === 'FC 10')).toBe(true);
  });

  it('resolves every cost itemId against a real cataloged item', () => {
    const allItemIds = research()
      .get()
      .flatMap((n) => n.levels.flatMap((l) => l.cost.map((c) => c.itemId)));
    expect(allItemIds.length).toBeGreaterThan(0);
    expect(allItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('leaves researchTimeSeconds unset for T12 nodes with no Time value on the source page', () => {
    const exaltedBlunderbuss = research().find('exalted-blunderbuss')!;
    expect(exaltedBlunderbuss.levels[0].researchTimeSeconds).toBeUndefined();
  });

  it('marks a forward reference to an unpublished tech line as unreleased instead of failing', () => {
    const solarSupremacyLancer = research().find('solar-supremacy-lanc')!;
    const unreleasedReq = solarSupremacyLancer.levels[0].prerequisites.find(
      (p) => p.type === 'unreleased',
    )!;
    expect(unreleasedReq.id).toBe('molten-lance-ii');
    expect(research().find(unreleasedReq.id)).toBeUndefined();
  });
});
