export enum VehicleSituation {
  ATIVA = "ativa",
  BAIXADA = "baixada",
}

export type Vehicle = {
  id: string;
  name: string;
  situation: VehicleSituation;
  complement?: string;
};
