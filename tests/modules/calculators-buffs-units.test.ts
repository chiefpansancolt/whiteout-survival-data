import { calculateBuffs as calculateBuffsWithAccount } from '@/modules/calculators';
import { BuffCalculation, BuffProfile } from '@/types';
import { withoutAccountSources } from '../helpers';

const calculateBuffs = (profile: BuffProfile = {}) =>
  withoutAccountSources(calculateBuffsWithAccount(profile));

jest.mock('@/modules/research', () => {
  const actual = jest.requireActual('@/modules/research');
  type Bonus = { stat: string; statKey?: string };
  const asCapacity = (bonus: Bonus): Bonus => ({
    ...bonus,
    stat: 'Training Capacity',
    statKey: 'training-capacity',
  });
  const nodes = actual
    .research()
    .get()
    .map((node: { id: string; levels: { bonus: Bonus[] }[] }) =>
      node.id === 'trainer-tools-ii'
        ? { ...node, levels: node.levels.map((l) => ({ ...l, bonus: l.bonus.map(asCapacity) })) }
        : node,
    );
  return { ...actual, research: () => new actual.ResearchQuery(nodes) };
});

const category = (result: BuffCalculation, statKey: string, unit: string) =>
  result.categories.find((c) => c.statKey === statKey && c.unit === unit);

describe('calculateBuffs with a stat that has a flat and a percent source', () => {
  const profile = { researchLevels: { 'camp-expansion-i': 1, 'trainer-tools-ii': 1 } };

  it('keeps one stat in two categories when its sources have different units', () => {
    const result = calculateBuffs(profile);
    expect(category(result, 'training-capacity', 'flat')!.total).toBe(2);
    expect(category(result, 'training-capacity', 'percent')!.total).toBe(4.6);
  });

  it('orders the two categories of one stat by unit, flat first', () => {
    const result = calculateBuffs(profile);
    const capacity = result.categories.filter((c) => c.statKey === 'training-capacity');
    expect(capacity.map((c) => c.unit)).toEqual(['flat', 'percent']);
    const military = result.groups.find((g) => g.id === 'military')!;
    expect(
      military.categories.filter((c) => c.statKey === 'training-capacity').map((c) => c.unit),
    ).toEqual(['flat', 'percent']);
  });
});
