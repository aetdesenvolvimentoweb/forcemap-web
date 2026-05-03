import type { Military } from "./military";
import type { WorkPeriod, WorkSchedule } from "./work";

export type Telephonist = {
  id: string;
  military: Military;
  workPeriod: WorkPeriod;
  workSchedule: WorkSchedule;
};
