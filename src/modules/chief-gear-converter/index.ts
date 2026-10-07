import { QueryBase } from '@/common/query-base';
import data from '@/data/converters/chief-gear.json';
import { ItemConversion } from '@/types';

const chiefGearConverterData: ItemConversion[] = data as ItemConversion[];

export class ChiefGearConverterQuery extends QueryBase<ItemConversion> {
  constructor(data: ItemConversion[] = chiefGearConverterData) {
    super(data);
  }

  byFromItem(itemId: string): ChiefGearConverterQuery {
    return new ChiefGearConverterQuery(this.data.filter((c) => c.fromItemId === itemId));
  }

  byToItem(itemId: string): ChiefGearConverterQuery {
    return new ChiefGearConverterQuery(this.data.filter((c) => c.toItemId === itemId));
  }
}

/** Returns a query over the Chief Gear converter exchange rates. Pass `source` to query a different array instead of the packaged data. */
export function chiefGearConverter(
  source: ItemConversion[] = chiefGearConverterData,
): ChiefGearConverterQuery {
  return new ChiefGearConverterQuery(source);
}
