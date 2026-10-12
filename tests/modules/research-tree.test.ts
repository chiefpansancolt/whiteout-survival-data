import { research } from '@/modules/research';
import { RESEARCH_TREE_LAYOUT, researchTree } from '@/modules/research-tree';
import { ResearchTreeTab } from '@/types';

const { rankGap, laneGap, nodeWidth, nodeHeight, labelHeight, padding } = RESEARCH_TREE_LAYOUT;

const tabs = researchTree();
const tab = (id: string): ResearchTreeTab => tabs.find((t) => t.id === id)!;
const node = (tabId: string, id: string) => tab(tabId).nodes.find((n) => n.id === id)!;

const box = (n: ResearchTreeTab['nodes'][number]) => ({
  left: n.x - nodeWidth / 2,
  right: n.x + nodeWidth / 2,
  top: n.labelAbove ? n.y - nodeHeight / 2 - labelHeight : n.y - nodeHeight / 2,
  bottom: n.labelAbove ? n.y + nodeHeight / 2 : n.y + nodeHeight / 2 + labelHeight,
});

describe('researchTree tabs', () => {
  it('has seven tabs that group the nine research categories', () => {
    expect(tabs.map((t) => [t.id, t.name])).toEqual([
      ['battle', 'Battle'],
      ['growth', 'Growth'],
      ['economy', 'Economy'],
      ['war-academy-troops', 'War Academy Troops'],
      ['t12-infantry', 'T12 Infantry'],
      ['t12-marksman', 'T12 Marksman'],
      ['t12-lancer', 'T12 Lancer'],
    ]);
    expect(tab('war-academy-troops').categories).toEqual([
      'T11 Infantry',
      'T11 Lancer',
      'T11 Marksman',
    ]);
    expect(tabs.flatMap((t) => t.categories)).toHaveLength(9);
  });

  it('places every research node of a tab once', () => {
    for (const t of tabs) {
      const expected = research()
        .get()
        .filter((n) => t.categories.includes(n.category))
        .map((n) => n.id)
        .sort();
      const placed = t.nodes
        .filter((n) => n.kind === 'research')
        .map((n) => n.id)
        .sort();
      expect(placed).toEqual(expected);
    }
  });

  it('counts the nodes and edges of each tab', () => {
    expect(tabs.map((t) => [t.nodes.length, t.edges.length])).toEqual([
      [102, 129],
      [45, 56],
      [44, 62],
      [31, 39],
      [23, 33],
      [23, 33],
      [23, 33],
    ]);
  });

  it('is the same on every call and with the research source given', () => {
    expect(researchTree()).toEqual(researchTree(research().get()));
  });

  it('links every node of every tab to another node', () => {
    for (const t of tabs) {
      const linked = new Set(t.edges.flatMap((e) => [e.from, e.to]));
      expect(t.nodes.filter((n) => !linked.has(n.id)).map((n) => n.id)).toEqual([]);
    }
  });

  it('links Tooling Up I to Tool Enhancement I in Growth', () => {
    const edge = tab('growth').edges.find((e) => e.from === 'tooling-up-i');
    expect(edge).toEqual({ from: 'tooling-up-i', to: 'tool-enhancement-i', shape: 'vertical' });
  });

  it('joins only nodes of the tab, and no node to itself', () => {
    for (const t of tabs) {
      const ids = new Set(t.nodes.map((n) => n.id));
      for (const edge of t.edges) {
        expect(ids.has(edge.from)).toBe(true);
        expect(ids.has(edge.to)).toBe(true);
        expect(edge.from).not.toBe(edge.to);
      }
    }
  });
});

describe('researchTree layout', () => {
  it('keeps the nodes of a tab apart', () => {
    for (const t of tabs) {
      const boxes = t.nodes.map(box);
      boxes.forEach((a, i) => {
        boxes.slice(i + 1).forEach((b) => {
          const apart =
            a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
          expect(apart).toBe(true);
        });
      });
    }
  });

  it('puts the top left of every tab at the padding and sizes the tab to its nodes', () => {
    for (const t of tabs) {
      const boxes = t.nodes.map(box);
      expect(Math.min(...boxes.map((b) => b.left))).toBeCloseTo(padding, 9);
      expect(Math.min(...boxes.map((b) => b.top))).toBeCloseTo(padding, 9);
      expect(Math.max(...boxes.map((b) => b.right)) + padding).toBeCloseTo(t.width, 9);
      expect(Math.max(...boxes.map((b) => b.bottom)) + padding).toBeCloseTo(t.height, 9);
    }
  });

  it('lays out Battle, Growth, and Economy downward with each node below its prerequisites', () => {
    for (const id of ['battle', 'growth', 'economy']) {
      const t = tab(id);
      const y = new Map(t.nodes.map((n) => [n.id, n.y]));
      for (const edge of t.edges) {
        expect(edge.shape).toBe('vertical');
        expect(y.get(edge.to)!).toBeGreaterThanOrEqual(y.get(edge.from)! + rankGap);
      }
      expect(Math.min(...t.nodes.map((n) => n.y))).toBeCloseTo(nodeHeight / 2 + padding, 9);
    }
  });

  it('spaces the ranks of Battle by the rank gap and the lanes by the lane gap', () => {
    const t = tab('battle');
    const rows = [...new Set(t.nodes.map((n) => n.y))].sort((a, b) => a - b);
    rows.slice(1).forEach((y, i) => expect(y - rows[i]).toBeCloseTo(rankGap, 9));
    const first = t.nodes
      .filter((n) => n.y === rows[0])
      .map((n) => n.x)
      .sort((a, b) => a - b);
    first.slice(1).forEach((x, i) => expect(x - first[i]).toBeCloseTo(laneGap, 9));
  });

  it('places the three War Academy branches around the Fire Crystal Shard hub', () => {
    const hub = node('war-academy-troops', 'fire-crystal-shard');
    expect(hub.kind).toBe('hub');
    const infantry = node('war-academy-troops', 'flame-squad-2');
    const lancer = node('war-academy-troops', 'flame-squad-3');
    const marksman = node('war-academy-troops', 'flame-squad-4');
    expect(infantry.x - hub.x).toBeCloseTo(nodeWidth / 2 + rankGap, 9);
    expect(infantry.y).toBeCloseTo(hub.y, 9);
    expect(lancer.x).toBeCloseTo(hub.x, 9);
    expect(lancer.y - hub.y).toBeCloseTo(nodeHeight / 2 + rankGap, 9);
    expect(marksman.x).toBeCloseTo(hub.x, 9);
    expect(hub.y - marksman.y).toBeCloseTo(nodeHeight / 2 + rankGap, 9);
  });

  it('puts the label above the node only for the upward branch', () => {
    const t = tab('war-academy-troops');
    const marksmanIds = research()
      .byCategory('T11 Marksman')
      .get()
      .map((n) => n.id);
    for (const n of t.nodes) expect(n.labelAbove).toBe(marksmanIds.includes(n.id));
  });

  it('draws each War Academy branch with the shape of its direction', () => {
    const t = tab('war-academy-troops');
    const shapeOf = (to: string) =>
      t.edges.find((e) => e.from === 'fire-crystal-shard' && e.to === to)!.shape;
    expect(shapeOf('flame-squad-2')).toBe('horizontal');
    expect(shapeOf('flame-squad-3')).toBe('vertical');
    expect(shapeOf('flame-squad-4')).toBe('up');
    expect(t.edges.filter((e) => e.from === 'fire-crystal-shard')).toHaveLength(3);
  });

  it('is identical for the three T12 tabs apart from the node ids', () => {
    const shape = (t: ResearchTreeTab) =>
      t.nodes
        .map((n) => [Math.round(n.x), Math.round(n.y)])
        .sort()
        .join(';');
    expect(shape(tab('t12-marksman'))).toBe(shape(tab('t12-infantry')));
    expect(shape(tab('t12-lancer'))).toBe(shape(tab('t12-infantry')));
  });
});

describe('T12 layout', () => {
  const infantry = (id: string) => node('t12-infantry', id);
  const tier = (n: number) =>
    research()
      .byCategory('T12 Infantry')
      .byTier(n)
      .get()
      .map((r) => r.id)
      .filter((id) => id !== 'exalted-infantry');

  it('centers the capstone under the tier 1 chain, one rank below it', () => {
    const chain = tier(1).map(infantry);
    const xs = chain.map((n) => n.x);
    const capstone = infantry('exalted-infantry');
    expect(capstone.x).toBeCloseTo((Math.min(...xs) + Math.max(...xs)) / 2, 9);
    expect(capstone.y).toBeCloseTo(Math.max(...chain.map((n) => n.y)) + rankGap, 9);
  });

  it('stacks tiers 2 to 6 below the capstone, one rank apart, centered in a row', () => {
    const capstone = infantry('exalted-infantry');
    [2, 3, 4, 5, 6].forEach((t, i) => {
      const row = tier(t).map(infantry);
      expect(row.length).toBe(t % 2 === 0 ? 4 : 1);
      for (const n of row) expect(n.y).toBeCloseTo(capstone.y + (i + 1) * rankGap, 9);
      const xs = row.map((n) => n.x).sort((a, b) => a - b);
      xs.slice(1).forEach((x, k) => expect(x - xs[k]).toBeCloseTo(laneGap, 9));
      expect((xs[0] + xs[xs.length - 1]) / 2).toBeCloseTo(capstone.x, 9);
    });
  });

  it('branches tiers 7 and 8 to the right of the tier 3 node, clear of the widest row', () => {
    const anchor = infantry('indomitable-wall');
    const halfWidth = (3 * laneGap) / 2;
    const seven = tier(7).map(infantry);
    const eight = tier(8).map(infantry);
    for (const n of seven) expect(n.x).toBeCloseTo(anchor.x + halfWidth + rankGap, 9);
    for (const n of eight) expect(n.x).toBeCloseTo(anchor.x + halfWidth + 2 * rankGap, 9);
    const branchLaneGap = nodeHeight + labelHeight + 30;
    expect(Math.abs(seven[0].y - seven[1].y)).toBeCloseTo(branchLaneGap, 9);
    expect((seven[0].y + seven[1].y) / 2).toBeCloseTo(anchor.y, 9);
    expect(eight[0].y).toBeCloseTo(anchor.y, 9);
  });

  it('draws the chain across, the stack down, and the branches across with a late split', () => {
    const t = tab('t12-infantry');
    const edge = (from: string, to: string) => t.edges.find((e) => e.from === from && e.to === to)!;
    expect(edge('exalted-helm', 'exalted-shoulderguard').shape).toBe('horizontal');
    expect(edge('exalted-armament', 'exalted-infantry').shape).toBe('vertical');
    expect(edge('exalted-infantry', 'molten-blades-i').shape).toBe('vertical');
    expect(edge('indomitable-wall', 'exalted-infantry-first-aid')).toMatchObject({
      shape: 'horizontal',
      splitFraction: 0.85,
    });
    expect(edge('exalted-infantry-healing', 'exalted-infantry-training')).toMatchObject({
      shape: 'horizontal',
      splitFraction: 0.5,
    });
  });
});

describe('researchTree with a cycle in the prerequisites', () => {
  it('still places every node', () => {
    const nodes = research()
      .get()
      .map((n) => ({ ...n }));
    const first = nodes.find((n) => n.id === 'assaut-techniques-i')!;
    const second = nodes.find((n) => n.id === 'assaut-techniques-ii')!;
    first.levels = [
      { ...first.levels[0], prerequisites: [{ type: 'research', id: second.id, level: 1 }] },
    ];
    const battle = researchTree(nodes).find((t) => t.id === 'battle')!;
    expect(battle.nodes).toHaveLength(102);
  });
});
