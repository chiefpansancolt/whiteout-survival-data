import { QueryBase } from '@/common/query-base';
import data from '@/data/converters/chief-gear.json';
import { ItemConversion } from '@/types';

const chiefGearConverterData: ItemConversion[] = data as ItemConversion[];

/** Query builder for the Chief Gear converter's exchange rates. All filter methods return a new ChiefGearConverterQuery for chaining. */
export class ChiefGearConverterQuery extends QueryBase<ItemConversion> {
  constructor(data: ItemConversion[] = chiefGearConverterData) {
    super(data);
  }

  /** Filter to conversions that consume the given item. */
  byFromItem(itemId: string): ChiefGearConverterQuery {
    return new ChiefGearConverterQuery(this.data.filter((c) => c.fromItemId === itemId));
  }

  /** Filter to conversions that produce the given item. */
  byToItem(itemId: string): ChiefGearConverterQuery {
    return new ChiefGearConverterQuery(this.data.filter((c) => c.toItemId === itemId));
  }
}

/** Returns a ChiefGearConverterQuery for the Chief Gear material converter's exchange rates. Pass `source` to wrap a pre-filtered array. */
export function chiefGearConverter(
  source: ItemConversion[] = chiefGearConverterData,
): ChiefGearConverterQuery {
  return new ChiefGearConverterQuery(source);
}
