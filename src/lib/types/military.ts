export type MilitaryRank = {
  id: string;
  abbreviation: string;
  order: number;
};

export type Military = {
  id: string;
  militaryRank: MilitaryRank;
  rg: number;
  name: string;
};
