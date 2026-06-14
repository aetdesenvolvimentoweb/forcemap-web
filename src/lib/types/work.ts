export enum WorkPeriod {
  DIURNO = "Diurno",
  NOTURNO = "Noturno",
  INTEGRAL = "Integral",
}

export enum WorkSchedule {
  Ordinario = "Ordinário",
  AC4OBM = "AC4 - OBM",
  AC4Prefeitura = "AC4 - Prefeitura",
  Sobreaviso = "Sobreaviso",
}

export function formatWorkPeriod(period: WorkPeriod | string | undefined | null): string {
  if (!period) return "";
  if (period === WorkPeriod.INTEGRAL || period === "Integral") return "24 horas";
  return period;
}
