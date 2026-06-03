import type { Military } from "./military";

export type ServiceSwap = {
  id: string;
  substitutedMilitary: Military;
  substituteMilitary: Military;
  startsAt: string;
  endsAt: string;
};
