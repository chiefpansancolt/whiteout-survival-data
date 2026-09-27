import { heroes, HeroQuery } from '@/modules/heroes';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroes', () => heroes());

describe('HeroQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroes().get().slice(0, 1);
    expect(new HeroQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroQuery().count()).toBeGreaterThan(0);
  });

  it('byRarity() filters to the given rarity', () => {
    const rares = heroes().byRarity('Rare');
    expect(rares.count()).toBeGreaterThan(0);
    expect(rares.get().every((h) => h.rarity === 'Rare')).toBe(true);
  });

  it('byClass() filters to the given class', () => {
    const infantry = heroes().byClass('Infantry');
    expect(infantry.count()).toBeGreaterThan(0);
    expect(infantry.get().every((h) => h.class === 'Infantry')).toBe(true);
  });
});

describe('Generation 0 heroes', () => {
  it('tracks all 13 Generation 0 heroes', () => {
    expect(
      heroes()
        .get()
        .filter((h) => h.generation === 0),
    ).toHaveLength(13);
  });

  it('has no exclusive weapon on Rare or Epic heroes', () => {
    const nonLegendary = heroes()
      .get()
      .filter((h) => h.rarity !== 'Legendary');
    expect(nonLegendary.every((h) => h.exclusiveWeapon === undefined)).toBe(true);
  });

  it('stores subClass per hero rather than deriving it from rarity or class', () => {
    const jasser = heroes().findByName('Jasser')!;
    const gina = heroes().findByName('Gina')!;
    expect(jasser.class).toBe('Marksman');
    expect(gina.class).toBe('Marksman');
    expect(jasser.subClass).toBe('Growth');
    expect(gina.subClass).toBe('Combat');
  });

  it('has a 5-star shard cost table for every hero', () => {
    const smith = heroes().findByName('Smith')!;
    expect(smith.shardCosts).toHaveLength(5);
    expect(smith.shardCosts[0].total).toBe(10);
    expect(smith.shardCosts[4].total).toBe(600);
  });
});
