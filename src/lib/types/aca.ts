import type { Military } from "./military";
import type { WorkPeriod, WorkSchedule } from "./work";

export type ACA = {
  id: string;
  military: Military;
  workPeriod: WorkPeriod;
  workSchedule: WorkSchedule;
};
