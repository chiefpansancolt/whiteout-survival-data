import { BonusUnit } from './common';

export type CastleAppointmentKind = 'president' | 'vice-president' | 'minister';

export interface CastleAppointmentBonus {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface CastleAppointment {
  id: string;
  name: string;
  kind: CastleAppointmentKind;
  bonuses: CastleAppointmentBonus[];
  boostedBonuses?: CastleAppointmentBonus[];
}
