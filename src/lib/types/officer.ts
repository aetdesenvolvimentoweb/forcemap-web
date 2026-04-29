import type { Military } from "./military";

export enum WorkPeriod {
  DIURNO = "Diurno",
  NOTURNO = "Noturno",
  INTEGRAL = "Integral",
}

export enum WorkSchedule {
  ORDINARIO = "Ordinário",
  AC4_OBM = "AC4 - OBM",
  AC4_PREFEITURA = "Prefeitura",
}

export type Officer = {
  id: string;
  military: Military;
  workPeriod: WorkPeriod;
  workSchedule: WorkSchedule;
};
