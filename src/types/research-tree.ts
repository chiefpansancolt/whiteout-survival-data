import { ResearchCategory } from './research';

export type ResearchTreeShape = 'vertical' | 'horizontal' | 'up';

export interface ResearchTreeNode {
  id: string;
  kind: 'research' | 'hub';
  x: number;
  y: number;
  labelAbove: boolean;
}

export interface ResearchTreeEdge {
  from: string;
  to: string;
  shape: ResearchTreeShape;
  splitFraction?: number;
}

export interface ResearchTreeTab {
  id: string;
  name: string;
  categories: ResearchCategory[];
  width: number;
  height: number;
  nodes: ResearchTreeNode[];
  edges: ResearchTreeEdge[];
}
