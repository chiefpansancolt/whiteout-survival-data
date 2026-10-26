import { ChiefOrderQuery, chiefOrderReadyAt, chiefOrders } from '@/modules/chief-orders';
import { facilities } from '@/modules/facilities';
import { items } from '@/modules/items';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('chiefOrders', () => chiefOrders());

describe('ChiefOrderQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefOrders().get().slice(0, 2);
    expect(new ChiefOrderQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefOrderQuery().count()).toBe(9);
  });
});

describe('chief orders', () => {
  it('lists the six orders of the Chief’s House with cost and cooldown', () => {
    expect(
      chiefOrders()
        .atFireCrystalLevel(0)
        .get()
        .map((o) => [o.name, o.contentmentCost, o.cooldownSeconds / 3600]),
    ).toEqual([
      ['Double Time', 800000, 23],
      ['Rush Job', 150000, 23],
      ['Productivity Day', 50000, 12],
      ['Urgent Mobilization', 50000, 8],
      ['Festivities', 50000, 24],
      ['Comprehensive Care', 150000, 4],
    ]);
  });

  it('gives Double Time a construction bonus of 20 percent for five minutes', () => {
    expect(chiefOrders().find('double-time')!.bonus).toEqual({
      stat: 'Construction Time Reduction',
      statKey: 'construction-time-reduction',
      value: '20%',
      amount: 20,
      unit: 'percent',
      windowSeconds: 300,
    });
  });

  it('gives a bonus to the orders with a percent effect over a window of real time', () => {
    const withBonus = chiefOrders()
      .get()
      .filter((o) => o.bonus);
    expect(withBonus.map((o) => o.id)).toEqual(['double-time', 'advanced-training']);
  });

  it('unlocks together with the Chief’s House at Furnace 6', () => {
    expect(facilities().find('chiefs-house')!.unlockFurnaceLevel).toBe(6);
  });
});

describe('orders of the Fire Crystal Age', () => {
  const newOrders = [
    ['dawn-alliance-commendation', 'Dawn Alliance Commendation', 'festivities', 800000, 47],
    ['crunch-time', 'Crunch Time', 'urgent-mobilization', 100000, 12],
    ['advanced-training', 'Advanced Training', 'productivity-day', 150000, 47],
  ] as const;

  it('replaces three orders from Fire Crystal level 1', () => {
    for (const [id, name, replaces, cost, hours] of newOrders) {
      const order = chiefOrders().find(id)!;
      expect(order).toMatchObject({
        name,
        replaces,
        unlockFireCrystalLevel: 1,
        contentmentCost: cost,
        cooldownSeconds: hours * 3600,
      });
      expect(chiefOrders().find(replaces)).toBeDefined();
    }
  });

  it('gives Advanced Training a training speed bonus of 20 percent for 2 hours', () => {
    expect(chiefOrders().find('advanced-training')!.bonus).toMatchObject({
      statKey: 'training-speed',
      amount: 20,
      unit: 'percent',
      windowSeconds: 7200,
    });
  });

  it('gives the Dawn Alliance Commendation ten rewards of 10 percent that link to items', () => {
    const rewards = chiefOrders().find('dawn-alliance-commendation')!.rewards!;
    expect(rewards.map((r) => [r.itemId, r.quantity])).toEqual([
      ['fire-crystal', 5],
      ['fire-crystal', 10],
      ['essence-stones', 3],
      ['lucky-hero-gear-chest', 3],
      ['design-plans', 3],
      ['design-plans', 8],
      ['charm-design', 3],
      ['charm-design', 8],
      ['charm-guide', 3],
      ['charm-guide', 8],
    ]);
    expect(rewards.every((r) => r.chance === 10)).toBe(true);
    for (const reward of rewards) expect(items().find(reward.itemId)).toBeDefined();
  });

  it('keeps the six original orders before Fire Crystal level 1', () => {
    expect(
      chiefOrders()
        .atFireCrystalLevel(0)
        .get()
        .map((o) => o.id),
    ).toEqual([
      'double-time',
      'rush-job',
      'productivity-day',
      'urgent-mobilization',
      'festivities',
      'comprehensive-care',
    ]);
  });

  it('swaps in the new orders from Fire Crystal level 1', () => {
    const ids = (level: number) =>
      chiefOrders()
        .atFireCrystalLevel(level)
        .get()
        .map((o) => o.id);
    expect(ids(1)).toEqual([
      'double-time',
      'rush-job',
      'comprehensive-care',
      'dawn-alliance-commendation',
      'crunch-time',
      'advanced-training',
    ]);
    expect(ids(10)).toEqual(ids(1));
  });
});

describe('chief order images', () => {
  it('gives the six first orders an icon file', () => {
    const withImg = chiefOrders()
      .get()
      .filter((o) => o.img);
    expect(withImg.map((o) => o.id)).toEqual([
      'double-time',
      'rush-job',
      'productivity-day',
      'urgent-mobilization',
      'festivities',
      'comprehensive-care',
    ]);
    for (const order of withImg) {
      expect(order.img).toBe(`/images/chief-orders/${order.id}.png`);
      expect(existsSync(join(__dirname, '../..', order.img!))).toBe(true);
    }
  });
});

describe('chiefOrderReadyAt', () => {
  it('adds the cooldown to the time of use', () => {
    const usedAt = new Date('2026-10-12T10:00:00Z');
    const order = chiefOrders().find('comprehensive-care')!;
    expect(chiefOrderReadyAt(order, usedAt).toISOString()).toBe('2026-10-12T14:00:00.000Z');
  });
});
