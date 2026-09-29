import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/items.json';
import { Item, ItemCategory } from '@/types';

const itemData: Item[] = data as Item[];

/** Query builder for Item data. All filter methods return a new ItemQuery for chaining. */
export class ItemQuery extends QueryBase<Item> {
  constructor(data: Item[] = itemData) {
    super(data);
  }

  /** Filter to items in the given category. */
  byCategory(category: ItemCategory): ItemQuery {
    return new ItemQuery(this.data.filter((i) => i.category === category));
  }
}

/** Returns an ItemQuery for all Item data. Pass `source` to wrap a pre-filtered array. */
export function items(source: Item[] = itemData): ItemQuery {
  return new ItemQuery(source);
}
