import { calculateResearch } from '@/modules/calculators';

jest.mock('@/modules/research', () => {
  const actual = jest.requireActual('@/modules/research');
  const withoutTime = (level: object) =>
    Object.fromEntries(Object.entries(level).filter(([key]) => key !== 'researchTimeSeconds'));
  const nodes = actual
    .research()
    .get()
    .map((node: { id: string; levels: object[] }) =>
      node.id === 'exalted-infantry' ? { ...node, levels: node.levels.map(withoutTime) } : node,
    );
  return { ...actual, research: () => new actual.ResearchQuery(nodes) };
});

describe('calculateResearch with a level that has no research time', () => {
  it('counts the step and adds no time', () => {
    const result = calculateResearch([{ id: 'exalted-infantry', current: 0, goal: 1 }]);
    expect(result.stepsWithoutTime).toBe(1);
    expect(result.baseSeconds).toBe(0);
    expect(result.steps).toBe(1);
  });
});
