import type { Military } from "./military";
import type { Vehicle } from "./vehicle";
import type { WorkPeriod, WorkSchedule } from "./work";

export type MilitaryInGarrison = {
  military: Military;
  workPeriod: WorkPeriod;
  workSchedule: WorkSchedule;
};

export type Garrison = {
  id: string;
  vehicle: Vehicle;
  militaryInGarrison: MilitaryInGarrison[];
};
