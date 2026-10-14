import {
  COLLECTION_MAX_LEVEL,
  collectionMedallionAt,
  CollectionMedallionQuery,
  collectionMedallions,
  collectionRewardLevels,
} from '@/modules/collection-reward-levels';
import { items } from '@/modules/items';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('collectionMedallions', () => collectionMedallions());

const MEDALLIONS = [
  ['bronze-medallion-1', 'Bronze Medallion I', 1, [2, 0, 0, 0]],
  ['bronze-medallion-2', 'Bronze Medallion II', 6, [2, 2, 0, 0]],
  ['silver-medallion-1', 'Silver Medallion I', 11, [2, 2, 2, 0]],
  ['silver-medallion-2', 'Silver Medallion II', 16, [2, 2, 2, 2]],
  ['gold-medallion-1', 'Gold Medallion I', 21, [4, 2, 2, 2]],
  ['gold-medallion-2', 'Gold Medallion II', 26, [4, 4, 2, 2]],
  ['gold-medallion-3', 'Gold Medallion III', 31, [4, 4, 4, 2]],
  ['light-medallion-1', 'Light Medallion I', 36, [4, 4, 4, 4]],
  ['light-medallion-2', 'Light Medallion II', 41, [6, 4, 4, 4]],
  ['light-medallion-3', 'Light Medallion III', 46, [6, 6, 4, 4]],
  ['light-medallion-4', 'Light Medallion IV', 51, [6, 6, 6, 4]],
] as const;
const STATS = [
  ["Troops' Attack", 'troops-attack'],
  ["Troops' Defense", 'troops-defense'],
  ["Troops' Lethality", 'troops-lethality'],
  ["Troops' Health", 'troops-health'],
] as const;

describe('CollectionMedallionQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = collectionMedallions().get().slice(0, 1);
    expect(new CollectionMedallionQuery(subset).count()).toBe(1);
  });

  it('uses the data of the package when it is built without arguments', () => {
    expect(new CollectionMedallionQuery().count()).toBe(11);
  });
});

describe('collection medallions', () => {
  it('has the 11 medallions in order, with the level that unlocks each', () => {
    expect(
      collectionMedallions()
        .get()
        .map((m) => [m.id, m.name, m.unlockLevel]),
    ).toEqual(MEDALLIONS.map(([id, name, unlockLevel]) => [id, name, unlockLevel]));
  });

  it.each(MEDALLIONS)('gives %s the buffs that the game lists for it', (id, name, _, totals) => {
    const medallion = collectionMedallions().find(id)!;
    expect(medallion.name).toBe(name);
    expect(medallion.buffs).toEqual(
      STATS.flatMap(([stat, statKey], i) =>
        totals[i] === 0
          ? []
          : [{ stat, statKey, value: `+${totals[i]}.0%`, amount: totals[i], unit: 'percent' }],
      ),
    );
  });

  it('adds a stat or raises one at each medallion, and never lowers a stat', () => {
    const medallions = collectionMedallions().get();
    medallions.slice(1).forEach((medallion, i) => {
      const before = Object.fromEntries(medallions[i].buffs.map((b) => [b.statKey, b.amount]));
      const after = Object.fromEntries(medallion.buffs.map((b) => [b.statKey, b.amount]));
      const gains = Object.keys(after).filter((k) => after[k] > (before[k] ?? 0));
      expect(gains).toHaveLength(1);
      for (const key of Object.keys(before)) expect(after[key]).toBeGreaterThanOrEqual(before[key]);
    });
  });

  it('has an image for every medallion and no unused file', () => {
    const medallions = collectionMedallions().get();
    for (const medallion of medallions) {
      expect(medallion.img).toBe(`/images/collection-medallions/${medallion.id}.png`);
      expect(existsSync(join(__dirname, '../..', medallion.img!))).toBe(true);
    }
    const files = readdirSync(join(__dirname, '../../images/collection-medallions'));
    expect(files.sort()).toEqual(medallions.map((m) => `${m.id}.png`).sort());
  });
});

describe('collectionRewardLevels', () => {
  const levels = collectionRewardLevels();

  it('has the levels 1 to 51 in order', () => {
    expect(levels.map((l) => l.level)).toEqual(
      Array.from({ length: COLLECTION_MAX_LEVEL }, (_, i) => i + 1),
    );
    expect(COLLECTION_MAX_LEVEL).toBe(51);
  });

  it('sorts the levels of a source by level', () => {
    expect(collectionRewardLevels([levels[1], levels[0]])).toEqual([levels[0], levels[1]]);
  });

  it('gives each level the medallion that its level reaches', () => {
    for (const level of levels) {
      expect(level.medallionId).toBe(collectionMedallionAt(level.level)!.id);
    }
    expect(levels[0].medallionId).toBe('bronze-medallion-1');
    expect(levels[50].medallionId).toBe('light-medallion-4');
  });

  it('gives no reward at the first level of a medallion and 4 rewards at every other level', () => {
    const first = new Set(
      collectionMedallions()
        .get()
        .map((m) => m.unlockLevel),
    );
    for (const level of levels) {
      if (first.has(level.level)) expect(level.rewards).toEqual([]);
      else
        expect(level.rewards.map((r) => r.itemId)).toEqual([
          'skin-token',
          'gems',
          'mythic-general-hero-shard',
          'lucky-hero-gear-chest',
        ]);
    }
  });

  it('gives the rewards of each medallion that the game lists', () => {
    const amounts = (level: number) => levels[level - 1].rewards.map((r) => r.amount);
    expect(amounts(2)).toEqual([100, 1000, 2, 10]);
    expect(amounts(5)).toEqual([100, 1000, 2, 10]);
    expect(amounts(7)).toEqual([200, 2000, 2, 10]);
    expect(amounts(10)).toEqual([200, 2000, 2, 10]);
    expect(amounts(12)).toEqual([300, 3000, 2, 10]);
    expect(amounts(50)).toEqual([300, 3000, 2, 10]);
  });

  it('links every reward to an item', () => {
    for (const reward of levels.flatMap((l) => l.rewards)) {
      expect(items().find(reward.itemId)).toBeDefined();
    }
  });
});

describe('collectionMedallionAt', () => {
  it('gives nothing below level 1', () => {
    expect(collectionMedallionAt(0)).toBeUndefined();
  });

  it('gives the medallion that a level reaches, and keeps it up to the next unlock level', () => {
    expect(collectionMedallionAt(1)!.id).toBe('bronze-medallion-1');
    expect(collectionMedallionAt(5)!.id).toBe('bronze-medallion-1');
    expect(collectionMedallionAt(6)!.id).toBe('bronze-medallion-2');
    expect(collectionMedallionAt(35)!.id).toBe('gold-medallion-3');
    expect(collectionMedallionAt(36)!.id).toBe('light-medallion-1');
    expect(collectionMedallionAt(51)!.id).toBe('light-medallion-4');
  });

  it('reads a source when one is given', () => {
    const source = collectionMedallions().get().slice(0, 2);
    expect(collectionMedallionAt(40, source)!.id).toBe('bronze-medallion-2');
  });
});
