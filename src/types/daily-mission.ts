export interface DailyMissionReward {
  itemId: string;
  amount: number;
}

export interface DailyMissionLevel {
  level: number;
  task: string;
  target: number;
  rewards: DailyMissionReward[];
}

export interface DailyMission {
  id: string;
  name: string;
  levels: DailyMissionLevel[];
}

export interface DailyMissionRewardLevel {
  activeness: number;
  rewards: DailyMissionReward[];
}
