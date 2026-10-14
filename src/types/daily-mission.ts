export interface DailyMissionReward {
  /** The id of the item in `items()`. The activeness is the item `activeness`. */
  itemId: string;
  amount: number;
}

/** One level of a daily mission. A level changes the task and what it gives. */
export interface DailyMissionLevel {
  level: number;
  /** The task as the game words it, without the progress, such as `Train 10 Infantry`. */
  task: string;
  /** The amount to reach, such as 10 for `Train 10 Infantry`. */
  target: number;
  /** The activeness comes first, as in the game. */
  rewards: DailyMissionReward[];
}

export interface DailyMission {
  id: string;
  /** The task of level 1 as the game words it. */
  name: string;
  levels: DailyMissionLevel[];
}

/** A reward level of the activity bar at the top of the Daily Missions screen. */
export interface DailyMissionRewardLevel {
  /** The activeness that the level needs. */
  activeness: number;
  /** What the level gives when your activeness reaches it. */
  rewards: DailyMissionReward[];
}
