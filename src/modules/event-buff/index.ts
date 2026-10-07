import { QueryBase } from '@/common/query-base';
import data from '@/data/event-buff.json';
import { BuffApplicability, EventBuff } from '@/types';

const eventBuffData: EventBuff[] = data as EventBuff[];

type BuffSource = Exclude<keyof EventBuff, 'id' | 'name' | 'notes'>;

export class EventBuffQuery extends QueryBase<EventBuff> {
  constructor(data: EventBuff[] = eventBuffData) {
    super(data);
  }

  /** Matches events where the buff source has the given applicability. The default is `'yes'`. */
  appliesFor(buffSource: BuffSource, applicability: BuffApplicability = 'yes'): EventBuffQuery {
    return new EventBuffQuery(this.data.filter((e) => e[buffSource] === applicability));
  }
}

/** Returns a query over the buff applicability of all game modes. Pass `source` to query a different array instead of the packaged data. */
export function eventBuff(source: EventBuff[] = eventBuffData): EventBuffQuery {
  return new EventBuffQuery(source);
}
