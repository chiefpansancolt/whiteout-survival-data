import { BonusUnit } from './common';

export type PresidentSkillTarget = 'state' | 'president' | 'chief';

export interface PresidentSkillBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
  durationSeconds: number;
}

export interface PresidentSkill {
  id: string;
  name: string;
  img?: string;
  effect: string;
  target: PresidentSkillTarget;
  authorityCost?: number;
  maxUses?: number;
  cooldownSeconds?: number;
  bonus?: PresidentSkillBonus;
  supremePresidentOnly?: boolean;
}
