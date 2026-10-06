import { TroopQuery, troops } from '@/modules/troops';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('troops', () => troops());

describe('TroopQuery', () => {
  it('accepts an explicit source array', () => {
    expect(new TroopQuery(troops().get().slice(0, 1)).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new TroopQuery().count()).toBe(3);
  });

  it('has Infantry, Lancer, and Marksman', () => {
    expect(
      troops()
        .get()
        .map((t) => t.id),
    ).toEqual(['infantry', 'lancer', 'marksman']);
  });

  it('has tiers 1 to 12 for each type with the four resources', () => {
    troops()
      .get()
      .forEach((troop) => {
        expect(troop.tiers.map((t) => t.tier)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        troop.tiers.forEach((t) => {
          expect(t.cost.map((c) => c.itemId)).toEqual(['meat', 'wood', 'coal', 'iron']);
          expect(t.trainingTimeSeconds).toBeGreaterThan(0);
        });
      });
  });

  it('shares the training time of a tier across the three types and raises it with the tier', () => {
    const [infantry, lancer, marksman] = troops().get();
    infantry.tiers.forEach((t, i) => {
      expect(lancer.tiers[i].trainingTimeSeconds).toBe(t.trainingTimeSeconds);
      expect(marksman.tiers[i].trainingTimeSeconds).toBe(t.trainingTimeSeconds);
      if (i > 0)
        expect(t.trainingTimeSeconds).toBeGreaterThan(infantry.tiers[i - 1].trainingTimeSeconds);
    });
  });

  it('has the cost of a tier 11 troop of each type', () => {
    const cost = (id: string) =>
      troops()
        .find(id)!
        .tiers[10].cost.map((c) => c.amount);
    expect(cost('infantry')).toEqual([6970, 5228, 1220, 253]);
    expect(cost('lancer')).toEqual([6099, 5751, 1185, 271]);
    expect(cost('marksman')).toEqual([4357, 6448, 1081, 349]);
    expect(troops().find('infantry')!.tiers[0].trainingTimeSeconds).toBe(12);
    expect(troops().find('infantry')!.tiers[10].trainingTimeSeconds).toBe(180);
  });

  it('has the cost of a tier 12 troop and the promotion cost to it', () => {
    const tier12 = (id: string) => troops().find(id)!.tiers[11];
    expect(tier12('infantry').cost.map((c) => c.amount)).toEqual([6970, 5228, 1220, 254]);
    expect(tier12('lancer').cost.map((c) => c.amount)).toEqual([6099, 5751, 1185, 272]);
    expect(tier12('marksman').cost.map((c) => c.amount)).toEqual([4357, 6448, 1081, 350]);
    expect(tier12('infantry').trainingTimeSeconds).toBe(215);
    expect(tier12('infantry').promotionCost!.map((c) => c.amount)).toEqual([3476, 2613, 604, 120]);
    expect(tier12('lancer').promotionCost!.map((c) => c.amount)).toEqual([3042, 2875, 587, 128]);
    expect(tier12('marksman').promotionCost!.map((c) => c.amount)).toEqual([2173, 3223, 535, 165]);
  });

  it('has a promotion cost on tier 12 only', () => {
    troops()
      .get()
      .forEach((troop) =>
        troop.tiers.forEach((t) => expect(t.promotionCost !== undefined).toBe(t.tier === 12)),
      );
  });
});
