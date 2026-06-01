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

export function formatWorkPeriod(period: WorkPeriod | string | undefined | null): string {
  if (!period) return "";
  if (period === WorkPeriod.INTEGRAL || period === "Integral") return "24 horas";
  return period;
}
