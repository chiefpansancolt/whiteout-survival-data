import { buildings } from '@/modules/buildings';
import { research } from '@/modules/research';
import { highestTierAtCampLevel, troopPower, TroopQuery, troops } from '@/modules/troops';
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

describe('troop power', () => {
  it('gives every tier of the three types the same base power', () => {
    for (const troop of troops().get()) {
      expect(troop.tiers.map((t) => t.power)).toEqual([
        3, 4, 6, 9, 13, 20, 28, 38, 50, 66, 80, 178,
      ]);
    }
  });
});

describe('troop unlock', () => {
  it('gives tiers 1 to 10 the camp level that unlocks them, the same for all three types', () => {
    for (const troop of troops().get()) {
      expect(troop.tiers.slice(0, 10).map((t) => t.unlockCampLevel)).toEqual([
        1, 4, 7, 11, 13, 16, 19, 22, 26, 30,
      ]);
      expect(troop.tiers.slice(10).every((t) => t.unlockCampLevel === undefined)).toBe(true);
    }
  });

  it('requires War Academy FC 1 and the Helios research of the type for tier 11', () => {
    for (const troop of troops().get()) {
      expect(troop.tiers[10].unlockRequirements).toEqual([
        { type: 'building', id: 'war-academy', level: 'FC 1' },
        { type: 'research', id: `helios-${troop.id}`, level: 1 },
      ]);
    }
  });

  it('requires War Academy FC 10 and the Exalted research of the type for tier 12', () => {
    for (const troop of troops().get()) {
      expect(troop.tiers[11].unlockRequirements).toEqual([
        { type: 'building', id: 'war-academy', level: 'FC 10' },
        { type: 'research', id: `exalted-${troop.id}`, level: 1 },
      ]);
    }
  });

  it('links every requirement to a building level or a research level that exists', () => {
    const warAcademyLabels = buildings()
      .find('war-academy')!
      .levels.map((l) => l.label);
    for (const troop of troops().get()) {
      for (const tier of troop.tiers.slice(10)) {
        for (const requirement of tier.unlockRequirements!) {
          if (requirement.type === 'building') {
            expect(warAcademyLabels).toContain(requirement.level);
          } else {
            const node = research().find(requirement.id)!;
            expect(node.levels.map((l) => l.level)).toContain(requirement.level);
          }
        }
      }
    }
  });

  it('gives tiers 1 to 10 no requirements and tiers 11 and 12 no camp level', () => {
    for (const troop of troops().get()) {
      expect(troop.tiers.slice(0, 10).every((t) => t.unlockRequirements === undefined)).toBe(true);
    }
  });
});

describe('highestTierAtCampLevel', () => {
  const infantry = troops().find('infantry')!;

  it('returns the tier that a camp level unlocks', () => {
    expect(highestTierAtCampLevel(infantry, 1)?.tier).toBe(1);
    expect(highestTierAtCampLevel(infantry, 4)?.tier).toBe(2);
    expect(highestTierAtCampLevel(infantry, 25)?.tier).toBe(8);
    expect(highestTierAtCampLevel(infantry, 26)?.tier).toBe(9);
  });

  it('keeps the tier between two unlock levels', () => {
    expect(highestTierAtCampLevel(infantry, 10)?.tier).toBe(3);
    expect(highestTierAtCampLevel(infantry, 29)?.tier).toBe(9);
  });

  it('stops at tier 10, because tiers 11 and 12 do not depend on the camp level', () => {
    expect(highestTierAtCampLevel(infantry, 30)?.tier).toBe(10);
    expect(highestTierAtCampLevel(infantry, 99)?.tier).toBe(10);
  });

  it('returns undefined below camp level 1', () => {
    expect(highestTierAtCampLevel(infantry, 0)).toBeUndefined();
  });
});

describe('Fire Crystal power', () => {
  const t10 = [71, 76, 83, 88, 94, 99, 104, 110, 115, 121];
  const t11 = [86, 92, 100, 106, 114, 120, 126, 135, 141, 148];

  it('gives tiers 10 and 11 the power at Fire Crystal levels 1 to 10, the same for all three types', () => {
    for (const troop of troops().get()) {
      for (const [tier, values] of [
        [10, t10],
        [11, t11],
      ] as const) {
        const entries = troop.tiers[tier - 1].fireCrystalPower!;
        expect(entries.map((e) => e.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(entries.map((e) => e.power)).toEqual(values);
      }
    }
  });

  it('gives no other tier a Fire Crystal power', () => {
    for (const troop of troops().get()) {
      const others = troop.tiers.filter((t) => t.tier !== 10 && t.tier !== 11);
      expect(others.every((t) => t.fireCrystalPower === undefined)).toBe(true);
    }
  });

  it('rises with every Fire Crystal level and starts above the base power', () => {
    for (const troop of troops().get()) {
      for (const tier of [troop.tiers[9], troop.tiers[10]]) {
        const powers = [tier.power!, ...tier.fireCrystalPower!.map((e) => e.power)];
        powers.slice(1).forEach((p, i) => expect(p).toBeGreaterThan(powers[i]));
      }
    }
  });
});

describe('troopPower', () => {
  const lancer = troops().find('lancer')!;

  it('returns the power at a Fire Crystal level for tiers 10 and 11', () => {
    expect(troopPower(lancer, 10, 1)).toBe(71);
    expect(troopPower(lancer, 11, 10)).toBe(148);
  });

  it('returns the base power at level 0 and when no level is given', () => {
    expect(troopPower(lancer, 11)).toBe(80);
    expect(troopPower(lancer, 10, 0)).toBe(66);
  });

  it('returns the base power for a tier that does not change with the Fire Crystal level', () => {
    expect(troopPower(lancer, 12, 5)).toBe(178);
    expect(troopPower(lancer, 4, 10)).toBe(9);
  });

  it('returns undefined for an unknown tier or a level above 10', () => {
    expect(troopPower(lancer, 13)).toBeUndefined();
    expect(troopPower(lancer, 11, 11)).toBeUndefined();
  });
});
