import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/troops.json';
import { TroopData } from '@/types';

const troopData: TroopData[] = data as TroopData[];

/** Query builder for troop types. Each troop type lists the cost and training time of tiers 1 to 11. */
export class TroopQuery extends QueryBase<TroopData> {
  constructor(data: TroopData[] = troopData) {
    super(data);
  }
}

/** Returns a TroopQuery for Infantry, Lancer, and Marksman troops. Pass `source` to wrap a pre-filtered array. */
export function troops(source: TroopData[] = troopData): TroopQuery {
  return new TroopQuery(source);
}
