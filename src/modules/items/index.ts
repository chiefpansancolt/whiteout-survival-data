import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/items.json';
import { Item, ItemCategory } from '@/types';

const itemData: Item[] = data as Item[];

export class ItemQuery extends QueryBase<Item> {
  constructor(data: Item[] = itemData) {
    super(data);
  }

  byCategory(category: ItemCategory): ItemQuery {
    return new ItemQuery(this.data.filter((i) => i.category === category));
  }
}

/** Returns a query over all items. Pass `source` to query a different array instead of the packaged data. */
export function items(source: Item[] = itemData): ItemQuery {
  return new ItemQuery(source);
}
