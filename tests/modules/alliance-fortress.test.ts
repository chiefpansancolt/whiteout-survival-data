import { allianceFortress, AllianceFortressQuery } from '@/modules/alliance/fortress';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('allianceFortress', () => allianceFortress());

describe('AllianceFortressQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = allianceFortress().get().slice(0, 1);
    expect(new AllianceFortressQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new AllianceFortressQuery().count()).toBeGreaterThan(0);
  });

  it('filters by kind', () => {
    expect(allianceFortress().ofKind('castle').count()).toBe(1);
    expect(allianceFortress().ofKind('stronghold').count()).toBe(4);
    expect(allianceFortress().ofKind('fortress').count()).toBe(12);
  });
});

describe('Alliance Fortresses', () => {
  it('places the castle at the map center', () => {
    expect(allianceFortress().find('castle')).toMatchObject({ x: 597, y: 597 });
  });

  it('places no two structures on the same coordinates', () => {
    const keys = allianceFortress()
      .get()
      .map(({ x, y }) => `${x};${y}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives every stronghold and fortress one reward for each of 8 phases', () => {
    allianceFortress()
      .get()
      .filter((f) => f.kind !== 'castle')
      .forEach((f) => expect(f.rewards.map((r) => r.phase)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]));
  });

  it('transcribes rewards from the source image', () => {
    expect(
      allianceFortress()
        .find('fortress-12')!
        .rewards.map((r) => r.reward),
    ).toEqual([
      'Deployment',
      'Speedups',
      'Advanced Teleport',
      'Speedups',
      'Advanced Teleport',
      'Speedups',
      'Hero Gear XP',
      'Pet Stone',
    ]);
    expect(allianceFortress().find('stronghold-3')!.rewards[7].reward).toBe('Pet Chest');
  });
});
