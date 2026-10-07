import { QueryBase } from '@/common/query-base';
import data from '@/data/converters/chief-charm.json';
import { ItemConversion } from '@/types';

const chiefCharmConverterData: ItemConversion[] = data as ItemConversion[];

export class ChiefCharmConverterQuery extends QueryBase<ItemConversion> {
  constructor(data: ItemConversion[] = chiefCharmConverterData) {
    super(data);
  }

  byFromItem(itemId: string): ChiefCharmConverterQuery {
    return new ChiefCharmConverterQuery(this.data.filter((c) => c.fromItemId === itemId));
  }

  byToItem(itemId: string): ChiefCharmConverterQuery {
    return new ChiefCharmConverterQuery(this.data.filter((c) => c.toItemId === itemId));
  }
}

/** Returns a query over the Chief Charm converter exchange rates. Pass `source` to query a different array instead of the packaged data. */
export function chiefCharmConverter(
  source: ItemConversion[] = chiefCharmConverterData,
): ChiefCharmConverterQuery {
  return new ChiefCharmConverterQuery(source);
}
