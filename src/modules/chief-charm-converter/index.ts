import { QueryBase } from '@/common/query-base';
import data from '@/data/converters/chief-charm.json';
import { ItemConversion } from '@/types';

const chiefCharmConverterData: ItemConversion[] = data as ItemConversion[];

/** Query builder for the Chief Charm converter's exchange rates. All filter methods return a new ChiefCharmConverterQuery for chaining. */
export class ChiefCharmConverterQuery extends QueryBase<ItemConversion> {
  constructor(data: ItemConversion[] = chiefCharmConverterData) {
    super(data);
  }

  /** Filter to conversions that consume the given item. */
  byFromItem(itemId: string): ChiefCharmConverterQuery {
    return new ChiefCharmConverterQuery(this.data.filter((c) => c.fromItemId === itemId));
  }

  /** Filter to conversions that produce the given item. */
  byToItem(itemId: string): ChiefCharmConverterQuery {
    return new ChiefCharmConverterQuery(this.data.filter((c) => c.toItemId === itemId));
  }
}

/** Returns a ChiefCharmConverterQuery for the Chief Charm material converter's exchange rates. Pass `source` to wrap a pre-filtered array. */
export function chiefCharmConverter(
  source: ItemConversion[] = chiefCharmConverterData,
): ChiefCharmConverterQuery {
  return new ChiefCharmConverterQuery(source);
}
