import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-widget-levels.json';
import { HeroWidgetLevel } from '@/types';

const heroWidgetData: HeroWidgetLevel[] = data as HeroWidgetLevel[];

export class HeroWidgetQuery extends QueryBase<HeroWidgetLevel> {
  constructor(data: HeroWidgetLevel[] = heroWidgetData) {
    super(data);
  }

  byLevel(level: number): HeroWidgetQuery {
    return new HeroWidgetQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a query over the Widgets that each exclusive weapon level costs. Pass `source` to query a different array instead of the packaged data. */
export function heroWidgets(source: HeroWidgetLevel[] = heroWidgetData): HeroWidgetQuery {
  return new HeroWidgetQuery(source);
}
