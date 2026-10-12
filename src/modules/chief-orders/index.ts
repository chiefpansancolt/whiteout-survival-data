import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/chief-orders.json';
import { ChiefOrder } from '@/types';

const chiefOrderData: ChiefOrder[] = data as ChiefOrder[];

export class ChiefOrderQuery extends QueryBase<ChiefOrder> {
  constructor(data: ChiefOrder[] = chiefOrderData) {
    super(data);
  }

  /**
   * Returns the orders in effect at a Fire Crystal level. Level 0 is before the first upgrade.
   * An order with `unlockFireCrystalLevel` is in effect from that level, and it takes the place of
   * the order in its `replaces` field.
   */
  atFireCrystalLevel(level: number): ChiefOrderQuery {
    const inEffect = this.data.filter((o) => (o.unlockFireCrystalLevel ?? 0) <= level);
    const replaced = new Set(inEffect.map((o) => o.replaces));
    return new ChiefOrderQuery(inEffect.filter((o) => !replaced.has(o.id)));
  }
}

/**
 * Returns the time at which a Chief Order can be used again.
 * The cooldown starts when the order is used.
 */
export function chiefOrderReadyAt(order: ChiefOrder, usedAt: Date): Date {
  return new Date(usedAt.getTime() + order.cooldownSeconds * 1000);
}

export function chiefOrders(source: ChiefOrder[] = chiefOrderData): ChiefOrderQuery {
  return new ChiefOrderQuery(source);
}
