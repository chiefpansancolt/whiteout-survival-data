import { allianceTech, AllianceTechQuery } from '@/modules/alliance/tech';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('allianceTech', () => allianceTech());

describe('AllianceTechQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = allianceTech().get().slice(0, 1);
    expect(new AllianceTechQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new AllianceTechQuery().count()).toBeGreaterThan(0);
  });

  it('byCategory() filters to the given category', () => {
    const battle = allianceTech().byCategory('Battle');
    expect(battle.count()).toBe(20);
    expect(battle.get().every((n) => n.category === 'Battle')).toBe(true);
  });

  it('byTier() filters to the given tier', () => {
    const tier1 = allianceTech().byTier(1);
    expect(tier1.count()).toBeGreaterThan(0);
    expect(tier1.get().every((n) => n.tier === 1)).toBe(true);
  });
});

describe('Alliance Tech tree', () => {
  it('tracks 59 nodes across 3 categories', () => {
    expect(allianceTech().count()).toBe(59);
    expect(allianceTech().byCategory('Growth').count()).toBe(23);
    expect(allianceTech().byCategory('Territory').count()).toBe(16);
    expect(allianceTech().byCategory('Battle').count()).toBe(20);
  });

  it('resolves a prerequisite into another allianceTech() node', () => {
    const infantryAttackI = allianceTech().find('infantry-attack-i')!;
    const req = infantryAttackI.levels[0].prerequisites[0];
    expect(req).toEqual({ id: 'rally-expansion-i', level: 1 });
    expect(allianceTech().find(req.id)).toBeDefined();
  });

  it('resolves every cost itemId against a real cataloged item', () => {
    const allItemIds = allianceTech()
      .get()
      .flatMap((n) => n.levels.flatMap((l) => l.cost.map((c) => c.itemId)));
    expect(allItemIds.length).toBeGreaterThan(0);
    expect(allItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('resolves a multi-prerequisite node (Troops Attack I requires all 3 troop-type lines)', () => {
    const troopsAttackI = allianceTech().find('troops-attack-i')!;
    expect(troopsAttackI.levels[0].prerequisites).toEqual([
      { id: 'infantry-attack-i', level: 1 },
      { id: 'lancer-attack-i', level: 1 },
      { id: 'marksman-attack-i', level: 1 },
    ]);
  });

  it('leaves bonus unset for one-off unlock nodes with no stat effect', () => {
    const tundraSurveying = allianceTech().find('tundra-surveying')!;
    expect(tundraSurveying.levels[0].bonus).toBeUndefined();
    expect(tundraSurveying.description).toBe('Alliance may place Alliance buildings on Tundra.');
  });

  it("normalizes a root node's Level cell despite the wiki repeating its own name there", () => {
    // Cooperative Protocols I and Alliance Regimentation I's Level column
    // literally reads "Cooperative Protocols I 1" instead of just "1" for
    // every row — a confirmed wiki copy-paste bug, not a design difference
    // from every other node's bare-number Level cell.
    const cooperativeProtocolsI = allianceTech().find('cooperative-protocols-i')!;
    expect(cooperativeProtocolsI.levels.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    expect(cooperativeProtocolsI.levels.every((l) => l.prerequisites.length === 0)).toBe(true);
  });

  it('infers Level 5 for a confirmed missing prerequisite level number (Tundra Surveying)', () => {
    // The wiki's own text just says "Alliance Regimentation II" with no
    // level, unlike every other cross-reference on the site. Alliance
    // Regimentation II has 5 levels; inferred as requiring full completion,
    // matching this tech's role as a one-off unlock gate.
    const tundraSurveying = allianceTech().find('tundra-surveying')!;
    expect(tundraSurveying.levels[0].prerequisites).toEqual([
      { id: 'alliance-regimentation-ii', level: 5 },
    ]);
  });

  it("drops a confirmed wiki copy-paste error (Marksman Attack I referencing a Rally Expansion I level that doesn't exist)", () => {
    // Rally Expansion I only has 3 levels. Infantry Attack I and Lancer
    // Attack I (otherwise identical pages) correctly leave their own Levels
    // 4-5 with no prerequisite; only Marksman Attack I's page kept
    // referencing "Rally Expansion I 4"/"5".
    const marksmanAttackI = allianceTech().find('marksman-attack-i')!;
    expect(marksmanAttackI.levels[3].prerequisites).toEqual([]);
    expect(marksmanAttackI.levels[4].prerequisites).toEqual([]);

    const infantryAttackI = allianceTech().find('infantry-attack-i')!;
    expect(infantryAttackI.levels[3].prerequisites).toEqual([]);
  });
});
