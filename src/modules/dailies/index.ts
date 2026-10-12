import { QueryBase } from '@/common/query-base';
import data from '@/data/daily-tasks.json';
import { DailyTask } from '@/types';

const dailyTaskData: DailyTask[] = data as DailyTask[];

export class DailyTaskQuery extends QueryBase<DailyTask> {
  constructor(data: DailyTask[] = dailyTaskData) {
    super(data);
  }
}

export function dailies(source: DailyTask[] = dailyTaskData): DailyTaskQuery {
  return new DailyTaskQuery(source);
}
