import type { Military } from "./military";

export enum UserRole {
  ADMIN = "Admin",
  CHEFE = "Chefe",
  ACA = "ACA",
  BOMBEIRO = "Bombeiro",
}

export type User = {
  id: string;
  role: UserRole;
  military: Military;
};
