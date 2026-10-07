import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/troops.json';
import { TroopData } from '@/types';

const troopData: TroopData[] = data as TroopData[];

export class TroopQuery extends QueryBase<TroopData> {
  constructor(data: TroopData[] = troopData) {
    super(data);
  }
}

/** Returns a query over Infantry, Lancer, and Marksman. Pass `source` to query a different array instead of the packaged data. */
export function troops(source: TroopData[] = troopData): TroopQuery {
  return new TroopQuery(source);
}
