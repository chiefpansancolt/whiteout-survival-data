import { QueryBase } from '@/common/query-base';
import data from '@/data/event-buff.json';
import { BuffApplicability, EventBuff } from '@/types';

const eventBuffData: EventBuff[] = data as EventBuff[];

type BuffSource = Exclude<keyof EventBuff, 'id' | 'name' | 'notes'>;

/** Query builder for EventBuff data. All filter methods return a new EventBuffQuery for chaining. */
export class EventBuffQuery extends QueryBase<EventBuff> {
  constructor(data: EventBuff[] = eventBuffData) {
    super(data);
  }

  /** Filter to events matching the given applicability (default `'yes'`) for one buff source. */
  appliesFor(buffSource: BuffSource, applicability: BuffApplicability = 'yes'): EventBuffQuery {
    return new EventBuffQuery(this.data.filter((e) => e[buffSource] === applicability));
  }
}

/** Returns an EventBuffQuery for every tracked game mode's buff applicability. Pass `source` to wrap a pre-filtered array. */
export function eventBuff(source: EventBuff[] = eventBuffData): EventBuffQuery {
  return new EventBuffQuery(source);
}
