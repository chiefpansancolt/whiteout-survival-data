import { research } from '@/modules/research';
import {
  ResearchCategory,
  ResearchNode,
  ResearchTreeEdge,
  ResearchTreeNode,
  ResearchTreeShape,
  ResearchTreeTab,
} from '@/types';

export const RESEARCH_TREE_LAYOUT = {
  rankGap: 150,
  laneGap: 96,
  nodeWidth: 76,
  nodeHeight: 52,
  labelHeight: 42,
  padding: 20,
} as const;

const { rankGap, laneGap, nodeWidth, nodeHeight, labelHeight, padding } = RESEARCH_TREE_LAYOUT;
const branchLaneGap = nodeHeight + labelHeight + 30;

const HUB_ID = 'fire-crystal-shard';

const GRAPH_TABS: { id: string; name: string; category: ResearchCategory }[] = [
  { id: 'battle', name: 'Battle', category: 'Battle' },
  { id: 'growth', name: 'Growth', category: 'Growth' },
  { id: 'economy', name: 'Economy', category: 'Economy' },
];

const HUB_BRANCHES: { category: ResearchCategory; shape: ResearchTreeShape }[] = [
  { category: 'T11 Infantry', shape: 'horizontal' },
  { category: 'T11 Lancer', shape: 'vertical' },
  { category: 'T11 Marksman', shape: 'up' },
];

const T12_TABS: { id: string; name: string; category: ResearchCategory; capstoneId: string }[] = [
  {
    id: 't12-infantry',
    name: 'T12 Infantry',
    category: 'T12 Infantry',
    capstoneId: 'exalted-infantry',
  },
  {
    id: 't12-marksman',
    name: 'T12 Marksman',
    category: 'T12 Marksman',
    capstoneId: 'exalted-marksman',
  },
  { id: 't12-lancer', name: 'T12 Lancer', category: 'T12 Lancer', capstoneId: 'exalted-lancer' },
];

interface Point {
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

function categoryEdges(nodes: ResearchNode[]): Edge[] {
  const ids = new Set(nodes.map((n) => n.id));
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const node of nodes) {
    for (const level of node.levels) {
      for (const requirement of level.prerequisites) {
        const key = `${requirement.id}>${node.id}`;
        const isTreeEdge =
          requirement.type === 'research' && ids.has(requirement.id) && requirement.id !== node.id;
        if (!isTreeEdge || seen.has(key)) continue;
        seen.add(key);
        edges.push({ from: requirement.id, to: node.id });
      }
    }
  }
  return edges;
}

function computeRanks(ids: string[], parents: Map<string, string[]>): Map<string, number> {
  const rank = new Map<string, number>();
  const computeRank = (id: string, seen: Set<string>): number => {
    if (rank.has(id)) return rank.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const ps = parents.get(id)!;
    const r = ps.length === 0 ? 0 : Math.max(...ps.map((p) => computeRank(p, seen))) + 1;
    rank.set(id, r);
    return r;
  };
  ids.forEach((id) => computeRank(id, new Set()));
  return rank;
}

function layoutGraph(
  ids: string[],
  edges: Edge[],
  horizontal: boolean,
): { pos: Map<string, Point>; width: number; height: number } {
  const parents = new Map(ids.map((id) => [id, [] as string[]]));
  const children = new Map(ids.map((id) => [id, [] as string[]]));
  edges.forEach((e) => {
    children.get(e.from)!.push(e.to);
    parents.get(e.to)!.push(e.from);
  });

  const rank = computeRanks(ids, parents);
  const maxRank = Math.max(...ids.map((id) => rank.get(id)!));
  const ranks: string[][] = [];
  for (let r = 0; r <= maxRank; r++) ranks.push(ids.filter((id) => rank.get(id) === r));
  ranks.forEach((group) => group.sort());

  const along = new Map<string, number>();
  const across = new Map<string, number>();
  ranks.forEach((group, r) => {
    group.forEach((id, i) => {
      along.set(id, r * rankGap + rankGap / 2);
      across.set(id, i * laneGap + laneGap / 2);
    });
  });

  const barycenterPass = (forward: boolean) => {
    const order = forward ? ranks.slice(1) : ranks.slice(0, -1).reverse();
    order.forEach((group) => {
      const scored = group.map((id) => {
        const neighbors = forward ? parents.get(id)! : children.get(id)!;
        const values = neighbors
          .map((p) => across.get(p))
          .filter((v): v is number => v !== undefined);
        const average = values.length
          ? values.reduce((a, b) => a + b, 0) / values.length
          : across.get(id)!;
        return { id, average };
      });
      scored.sort((a, b) => a.average - b.average);
      scored.forEach((s, i) => across.set(s.id, i * laneGap + laneGap / 2));
    });
  };
  for (let pass = 0; pass < 4; pass++) {
    barycenterPass(true);
    barycenterPass(false);
  }

  const acrossExtent = Math.max(...ranks.map((group) => group.length)) * laneGap;
  ranks.forEach((group) => {
    const offset = (acrossExtent - group.length * laneGap) / 2;
    group.forEach((id, i) => across.set(id, offset + i * laneGap + laneGap / 2));
  });

  const pos = new Map<string, Point>();
  ids.forEach((id) => {
    const a = along.get(id)!;
    const c = across.get(id)!;
    pos.set(id, horizontal ? { x: a, y: c } : { x: c, y: a });
  });
  const flowExtent = (maxRank + 1) * rankGap;
  return {
    pos,
    width: horizontal ? flowExtent : acrossExtent,
    height: horizontal ? acrossExtent : flowExtent,
  };
}

interface Placed {
  pos: Map<string, Point>;
  labelAbove: Set<string>;
}

function finishTab(
  tab: { id: string; name: string; categories: ResearchCategory[] },
  placed: Placed,
  kinds: Map<string, 'research' | 'hub'>,
  edges: ResearchTreeEdge[],
): ResearchTreeTab {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  placed.pos.forEach((p, id) => {
    const up = placed.labelAbove.has(id);
    minX = Math.min(minX, p.x - nodeWidth / 2);
    maxX = Math.max(maxX, p.x + nodeWidth / 2);
    minY = Math.min(minY, up ? p.y - nodeHeight / 2 - labelHeight : p.y - nodeHeight / 2);
    maxY = Math.max(maxY, up ? p.y + nodeHeight / 2 : p.y + nodeHeight / 2 + labelHeight);
  });
  const dx = -minX + padding;
  const dy = -minY + padding;
  const nodes: ResearchTreeNode[] = [...placed.pos].map(([id, p]) => ({
    id,
    kind: kinds.get(id) ?? 'research',
    x: p.x + dx,
    y: p.y + dy,
    labelAbove: placed.labelAbove.has(id),
  }));
  return {
    ...tab,
    width: maxX - minX + 2 * padding,
    height: maxY - minY + 2 * padding,
    nodes,
    edges,
  };
}

function graphTab(tab: (typeof GRAPH_TABS)[number], source: ResearchNode[]): ResearchTreeTab {
  const nodes = source.filter((n) => n.category === tab.category);
  const edges = categoryEdges(nodes);
  const { pos } = layoutGraph(
    nodes.map((n) => n.id),
    edges,
    false,
  );
  return finishTab(
    { id: tab.id, name: tab.name, categories: [tab.category] },
    { pos, labelAbove: new Set() },
    new Map(),
    edges.map((e) => ({ ...e, shape: 'vertical' as const })),
  );
}

function tierIds(nodes: ResearchNode[], tier: number): string[] {
  return nodes
    .filter((n) => n.tier === tier)
    .map((n) => n.id)
    .sort();
}

function t12Tab(tab: (typeof T12_TABS)[number], source: ResearchNode[]): ResearchTreeTab {
  const nodes = source.filter((n) => n.category === tab.category);
  const edges = categoryEdges(nodes);
  const tierOf = new Map(nodes.map((n) => [n.id, n.tier]));
  const stackTiers = [2, 3, 4, 5, 6].map((tier) => tierIds(nodes, tier));
  const branchTiers = [7, 8].map((tier) => tierIds(nodes, tier));
  const mainIds = tierIds(nodes, 1).filter((id) => id !== tab.capstoneId);
  const mainEdges = edges.filter((e) => mainIds.includes(e.from) && mainIds.includes(e.to));

  const { pos } = layoutGraph(mainIds, mainEdges, true);

  const xs = mainIds.map((id) => pos.get(id)!.x);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const rowY = Math.max(...mainIds.map((id) => pos.get(id)!.y));
  const capstoneY = rowY + rankGap;
  pos.set(tab.capstoneId, { x: centerX, y: capstoneY });

  let rowTop = capstoneY;
  stackTiers.forEach((ids) => {
    rowTop += rankGap;
    const startX = centerX - ((ids.length - 1) * laneGap) / 2;
    ids.forEach((id, i) => pos.set(id, { x: startX + i * laneGap, y: rowTop }));
  });

  const tier3Id = stackTiers[1][0];
  const anchor = pos.get(tier3Id)!;
  const stackHalfWidth = Math.max(0, ...stackTiers.map((ids) => ((ids.length - 1) * laneGap) / 2));
  let branchX = anchor.x + stackHalfWidth;
  let priorIds: string[] | null = null;
  branchTiers.forEach((ids) => {
    branchX += rankGap;
    const totalHeight = (ids.length - 1) * branchLaneGap;
    let centerY = anchor.y;
    if (priorIds) {
      const ys = priorIds.map((id) => pos.get(id)!.y);
      centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
    }
    const startY = centerY - totalHeight / 2;
    ids.forEach((id, i) => pos.set(id, { x: branchX, y: startY + i * branchLaneGap }));
    priorIds = ids;
  });

  const shapeOf = (edge: Edge): ResearchTreeEdge => {
    const tier = tierOf.get(edge.to)!;
    if (edge.to === tab.capstoneId || (tier >= 2 && tier <= 6))
      return { ...edge, shape: 'vertical' };
    if (tier === 7) return { ...edge, shape: 'horizontal', splitFraction: 0.85 };
    if (tier === 8) return { ...edge, shape: 'horizontal', splitFraction: 0.5 };
    return { ...edge, shape: 'horizontal' };
  };

  return finishTab(
    { id: tab.id, name: tab.name, categories: [tab.category] },
    { pos, labelAbove: new Set() },
    new Map(),
    edges.map(shapeOf),
  );
}

function hubTab(source: ResearchNode[]): ResearchTreeTab {
  const hubX = nodeWidth / 2 + padding;
  const hubY = nodeHeight / 2 + padding;
  const pos = new Map<string, Point>([[HUB_ID, { x: hubX, y: hubY }]]);
  const labelAbove = new Set<string>();
  const edges: ResearchTreeEdge[] = [];

  HUB_BRANCHES.forEach(({ category, shape }) => {
    const nodes = source.filter((n) => n.category === category);
    const branchEdges = categoryEdges(nodes);
    const rootId = nodes.find((n) => n.tier === 1)!.id;
    const { pos: local } = layoutGraph(
      nodes.map((n) => n.id),
      branchEdges,
      shape === 'horizontal',
    );
    const root = local.get(rootId)!;
    let transform: (p: Point) => Point;
    if (shape === 'horizontal') {
      const shiftX = hubX + nodeWidth / 2 + rankGap - root.x;
      const shiftY = hubY - root.y;
      transform = (p) => ({ x: p.x + shiftX, y: p.y + shiftY });
    } else if (shape === 'vertical') {
      const shiftX = hubX - root.x;
      const shiftY = hubY + nodeHeight / 2 + rankGap - root.y;
      transform = (p) => ({ x: p.x + shiftX, y: p.y + shiftY });
    } else {
      const shiftX = hubX - root.x;
      const flip = hubY - nodeHeight / 2 - rankGap + root.y;
      transform = (p) => ({ x: p.x + shiftX, y: flip - p.y });
    }
    nodes.forEach((n) => {
      pos.set(n.id, transform(local.get(n.id)!));
      if (shape === 'up') labelAbove.add(n.id);
    });
    branchEdges.forEach((e) => edges.push({ ...e, shape }));
    edges.push({ from: HUB_ID, to: rootId, shape });
  });

  return finishTab(
    {
      id: 'war-academy-troops',
      name: 'War Academy Troops',
      categories: HUB_BRANCHES.map((b) => b.category),
    },
    { pos, labelAbove },
    new Map([[HUB_ID, 'hub']]),
    edges,
  );
}

export function researchTree(source: ResearchNode[] = research().get()): ResearchTreeTab[] {
  return [
    ...GRAPH_TABS.map((tab) => graphTab(tab, source)),
    hubTab(source),
    ...T12_TABS.map((tab) => t12Tab(tab, source)),
  ];
}
