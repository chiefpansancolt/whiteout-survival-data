import { QueryBase } from '@/common/query-base';
import data from '@/data/event-buff.json';
import { BuffApplicability, EventBuff } from '@/types';

const eventBuffData: EventBuff[] = data as EventBuff[];

type BuffSource = Exclude<keyof EventBuff, 'id' | 'name' | 'notes'>;

export class EventBuffQuery extends QueryBase<EventBuff> {
  constructor(data: EventBuff[] = eventBuffData) {
    super(data);
  }

  appliesFor(buffSource: BuffSource, applicability: BuffApplicability = 'yes'): EventBuffQuery {
    return new EventBuffQuery(this.data.filter((e) => e[buffSource] === applicability));
  }
}

export function eventBuff(source: EventBuff[] = eventBuffData): EventBuffQuery {
  return new EventBuffQuery(source);
}
