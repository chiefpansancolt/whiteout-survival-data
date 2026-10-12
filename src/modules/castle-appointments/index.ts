import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/castle-appointments.json';
import { CastleAppointment, CastleAppointmentKind } from '@/types';

const castleAppointmentData: CastleAppointment[] = data as CastleAppointment[];

export const CASTLE_APPOINTMENT = {
  cooldownSeconds: 7200,
  applicationValiditySeconds: 86400,
  maxApplicationsPerPosition: 100,
} as const;

export class CastleAppointmentQuery extends QueryBase<CastleAppointment> {
  constructor(data: CastleAppointment[] = castleAppointmentData) {
    super(data);
  }

  byKind(kind: CastleAppointmentKind): CastleAppointmentQuery {
    return new CastleAppointmentQuery(this.data.filter((a) => a.kind === kind));
  }
}

export function castleAppointments(
  source: CastleAppointment[] = castleAppointmentData,
): CastleAppointmentQuery {
  return new CastleAppointmentQuery(source);
}
