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
  it('tracks 286 nodes across 9 categories', () => {
    expect(research().count()).toBe(286);
    expect(research().byCategory('Battle').count()).toBe(102);
    expect(research().byCategory('Growth').count()).toBe(45);
    expect(research().byCategory('Economy').count()).toBe(44);
    expect(research().byCategory('T11 Infantry').count()).toBe(10);
    expect(research().byCategory('T11 Marksman').count()).toBe(10);
    expect(research().byCategory('T11 Lancer').count()).toBe(10);
    // Infantry's tier-6 Molten X III items are still pending from the user
    // as of this dataset, so it lags Marksman/Lancer by 4 nodes.
    expect(research().byCategory('T12 Infantry').count()).toBe(19);
    expect(research().byCategory('T12 Marksman').count()).toBe(23);
    expect(research().byCategory('T12 Lancer').count()).toBe(23);
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

  it("resolves Solar Supremacy's Molten X II references now that those pages are published", () => {
    // These were forward references to unpublished tech lines (type
    // 'unreleased') until the Molten X II nodes were added; now that they
    // exist, every one of Solar Supremacy's 3 gated levels (1, 6, 11) should
    // resolve as a normal research-type prerequisite.
    const solarSupremacyLancer = research().find('solar-supremacy-lanc')!;
    const gatedLevels = solarSupremacyLancer.levels.filter((l) => l.prerequisites.length > 0);
    expect(gatedLevels.map((l) => l.level)).toEqual([1, 6, 11]);
    gatedLevels.forEach((level) => {
      const researchReqs = level.prerequisites.filter((p) => p.type === 'research');
      expect(researchReqs).toHaveLength(4);
      researchReqs.forEach((req) => expect(research().find(req.id)).toBeDefined());
    });

    const allNodes = research().get();
    const hasUnreleased = allNodes.some((n) =>
      n.levels.some((l) => l.prerequisites.some((p) => p.type === 'unreleased')),
    );
    expect(hasUnreleased).toBe(false);
  });

  it("disambiguates a same-named prerequisite to the referencing node's own troop type", () => {
    // "Flame Squad" and "Flame Legion" each exist as three separate nodes, one
    // per T11 troop type, and the source text never distinguishes which one it
    // means — every troop type's own chain must resolve to its own node.
    const flameShield = research().find('flame-shield')!; // T11 Infantry
    expect(flameShield.levels[0].prerequisites).toEqual([
      { type: 'research', id: 'flame-squad-2', level: 3 },
    ]);

    const crystalArmor = research().find('crystal-armor')!; // T11 Marksman
    expect(crystalArmor.levels[0].prerequisites).toEqual([
      { type: 'research', id: 'flame-squad-4', level: 3 },
    ]);

    const blazingArmor = research().find('blazing-armor')!; // T11 Lancer
    expect(blazingArmor.levels[0].prerequisites).toEqual([
      { type: 'research', id: 'flame-squad-3', level: 3 },
    ]);

    const heliosInfantry = research().find('helios-infantry')!;
    expect(
      heliosInfantry.levels[0].prerequisites.find((p) => p.id === 'flame-legion-2'),
    ).toBeDefined();
  });

  it('corrects confirmed wiki copy-paste errors that reference the wrong troop type by node name', () => {
    // Flame Legion (Marksman), Helios Marksman, and Helios Lancer each reuse
    // Infantry's prerequisite text verbatim on their own pages ("Flame Strike",
    // "Flame Shield", "Flame Tomahawk", "Flame Protection" — all real nodes,
    // but Infantry's own). Verified against each correct node's own page,
    // which names the referencing node as its own real prerequisite (e.g.
    // Crystal Arrow's page requires "Crystal Vision 6").
    const researchIds = (n: { levels: { prerequisites: { type: string; id: string }[] }[] }) =>
      n.levels[0].prerequisites
        .filter((p) => p.type === 'research')
        .map((p) => p.id)
        .sort();

    const marksmanFlameLegion = research().find('flame-legion')!;
    expect(researchIds(marksmanFlameLegion)).toEqual(['crystal-armor', 'crystal-vision']);

    const heliosMarksman = research().find('helios-marksman')!;
    expect(researchIds(heliosMarksman)).toEqual([
      'crystal-arrow',
      'crystal-protection',
      'flame-legion',
    ]);

    const heliosLancer = research().find('helios-lancer')!;
    expect(researchIds(heliosLancer)).toEqual([
      'blazing-guardian',
      'blazing-lance',
      'flame-legion-3',
    ]);

    // none of Marksman's or Lancer's levels should still reference Infantry's
    // node names anywhere in the chain
    const infantryOnlyIds = new Set([
      'flame-strike',
      'flame-shield',
      'flame-tomahawk',
      'flame-protection',
    ]);
    const crossTroopNodes = research()
      .get()
      .filter((n) => n.category === 'T11 Marksman' || n.category === 'T11 Lancer');
    const leaked = crossTroopNodes.flatMap((n) =>
      n.levels.flatMap((l) => l.prerequisites.filter((p) => infantryOnlyIds.has(p.id))),
    );
    expect(leaked).toEqual([]);
  });

  it('chains T12 tier-1 items in their real in-game unlock order (user-supplied, not scraped)', () => {
    // The wiki's Prerequisites column for these 15 nodes only lists the War
    // Academy Fire Crystal gate and omits that each item's own Level 5 also
    // unlocks the next item in the troop type's chain — confirmed directly
    // from in-game knowledge, not present on the source page.
    const chains: [string, string][] = [
      ['exalted-mantle', 'exalted-veil'],
      ['exalted-war-grab', 'exalted-mantle'],
      ['exalted-cadence', 'exalted-war-grab'],
      ['exalted-blunderbuss', 'exalted-cadence'],
      ['exalted-pauldron', 'exalted-warcrown'],
      ['exalted-platemail', 'exalted-pauldron'],
      ['exalted-warpath', 'exalted-platemail'],
      ['exalted-pike', 'exalted-warpath'],
      ['exalted-shoulderguard', 'exalted-helm'],
      ['exalted-bastion', 'exalted-shoulderguard'],
      ['exalted-trek', 'exalted-bastion'],
      ['exalted-armament', 'exalted-trek'],
    ];
    chains.forEach(([nodeId, priorId]) => {
      const node = research().find(nodeId)!;
      expect(node.levels[0].prerequisites).toContainEqual({
        type: 'research',
        id: priorId,
        level: 5,
      });
    });

    const chainStarts = ['exalted-veil', 'exalted-warcrown', 'exalted-helm'];
    chainStarts.forEach((nodeId) => {
      const node = research().find(nodeId)!;
      expect(node.levels[0].prerequisites.some((p) => p.type === 'research')).toBe(false);
    });
  });

  it('adds an Exalted capstone per T12 troop type requiring all 5 chain items at Level 5 (user-supplied, not scraped)', () => {
    // No page for these exists on the wiki at all — confirmed directly from
    // in-game knowledge. Each has a single level, no cost/bonus data (none is
    // known yet), and no icon (img is "" rather than a broken link, matching
    // the Pets module's precedent for a genuine missing-asset gap).
    const cases: [string, string, string[]][] = [
      [
        'exalted-infantry',
        'T12 Infantry',
        [
          'exalted-armament',
          'exalted-bastion',
          'exalted-helm',
          'exalted-shoulderguard',
          'exalted-trek',
        ],
      ],
      [
        'exalted-marksman',
        'T12 Marksman',
        [
          'exalted-blunderbuss',
          'exalted-cadence',
          'exalted-mantle',
          'exalted-veil',
          'exalted-war-grab',
        ],
      ],
      [
        'exalted-lancer',
        'T12 Lancer',
        [
          'exalted-pauldron',
          'exalted-pike',
          'exalted-platemail',
          'exalted-warcrown',
          'exalted-warpath',
        ],
      ],
    ];

    cases.forEach(([id, category, chain]) => {
      const node = research().find(id)!;
      expect(node.category).toBe(category);
      expect(node.tier).toBe(1);
      expect(node.img).toBe('');
      expect(node.levels).toHaveLength(1);
      expect(node.levels[0].power).toBe(8000000);
      expect(node.levels[0].cost).toEqual([]);
      expect(node.levels[0].bonus).toEqual([]);
      expect(node.levels[0].prerequisites.map((p) => p.id).sort()).toEqual([...chain].sort());
      expect(
        node.levels[0].prerequisites.every((p) => p.type === 'research' && p.level === 5),
      ).toBe(true);
    });
  });

  it("gates each tier-2 Molten I item on its own troop type's Exalted capstone at Level 1 (user-supplied, not scraped)", () => {
    // The wiki's Prerequisites column for these 12 nodes only lists the War
    // Academy Fire Crystal gate — confirmed directly from in-game knowledge
    // that each also requires its own troop type's Exalted capstone.
    const cases: [string, string][] = [
      ['molten-blades-i', 'exalted-infantry'],
      ['molten-guard-i', 'exalted-infantry'],
      ['molten-plating-i', 'exalted-infantry'],
      ['molten-shields-i', 'exalted-infantry'],
      ['molten-shot-i', 'exalted-marksman'],
      ['molten-sharpshooting-i', 'exalted-marksman'],
      ['molten-scales-i', 'exalted-marksman'],
      ['molten-grips-i', 'exalted-marksman'],
      ['molten-lance-i', 'exalted-lancer'],
      ['molten-tactics-i', 'exalted-lancer'],
      ['molten-helmets-i', 'exalted-lancer'],
      ['molten-vambrace-i', 'exalted-lancer'],
    ];

    cases.forEach(([nodeId, capstoneId]) => {
      const node = research().find(nodeId)!;
      expect(node.levels[0].prerequisites).toContainEqual({
        type: 'research',
        id: capstoneId,
        level: 1,
      });
    });
  });

  it("adds each tier-4 Molten X II item, gated on its own troop type's tier-3 capstone at Level 1", () => {
    // Published under the wiki's Unicode Roman numeral slug (e.g.
    // molten-blades-Ⅱ), not the ASCII "-ii" this package uses for its
    // own ids — the name is normalized to ASCII on the way in.
    const cases: [string, string, string][] = [
      ['molten-blades-ii', 'T12 Infantry', 'indomitable-wall'],
      ['molten-guard-ii', 'T12 Infantry', 'indomitable-wall'],
      ['molten-plating-ii', 'T12 Infantry', 'indomitable-wall'],
      ['molten-shields-ii', 'T12 Infantry', 'indomitable-wall'],
      ['molten-grips-ii', 'T12 Marksman', 'starfire'],
      ['molten-scales-ii', 'T12 Marksman', 'starfire'],
      ['molten-sharpshooting-ii', 'T12 Marksman', 'starfire'],
      ['molten-shot-ii', 'T12 Marksman', 'starfire'],
      ['molten-helmets-ii', 'T12 Lancer', 'meridian-phalanx'],
      ['molten-lance-ii', 'T12 Lancer', 'meridian-phalanx'],
      ['molten-tactics-ii', 'T12 Lancer', 'meridian-phalanx'],
      ['molten-vambrace-ii', 'T12 Lancer', 'meridian-phalanx'],
    ];

    cases.forEach(([nodeId, category, capstoneId]) => {
      const node = research().find(nodeId)!;
      expect(node.category).toBe(category);
      expect(node.tier).toBe(4);
      expect(node.levels).toHaveLength(50);
      expect(node.levels[0].prerequisites).toContainEqual({
        type: 'research',
        id: capstoneId,
        level: 1,
      });
    });
  });

  it("adds each tier-6 Molten X III item (Marksman/Lancer so far), gated on its own troop type's Solar Supremacy at Level 15", () => {
    // Infantry's 4 tier-6 Molten X III items are still pending as of this
    // dataset (one duplicate link and one missing link in what was
    // supplied), so only Marksman and Lancer are covered here.
    const cases: [string, string, string][] = [
      ['molten-grips-iii', 'T12 Marksman', 'solar-supremacy-mm'],
      ['molten-scales-iii', 'T12 Marksman', 'solar-supremacy-mm'],
      ['molten-sharpshooting-iii', 'T12 Marksman', 'solar-supremacy-mm'],
      ['molten-shot-iii', 'T12 Marksman', 'solar-supremacy-mm'],
      ['molten-helmets-iii', 'T12 Lancer', 'solar-supremacy-lanc'],
      ['molten-lance-iii', 'T12 Lancer', 'solar-supremacy-lanc'],
      ['molten-tactics-iii', 'T12 Lancer', 'solar-supremacy-lanc'],
      ['molten-vambrace-iii', 'T12 Lancer', 'solar-supremacy-lanc'],
    ];

    cases.forEach(([nodeId, category, solarSupremacyId]) => {
      const node = research().find(nodeId)!;
      expect(node.category).toBe(category);
      expect(node.tier).toBe(6);
      expect(node.levels).toHaveLength(50);
      expect(node.levels[0].prerequisites).toContainEqual({
        type: 'research',
        id: solarSupremacyId,
        level: 15,
      });
    });
  });
});
