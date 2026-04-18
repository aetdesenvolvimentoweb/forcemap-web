export type MilitaryRank = {
  id: string;
  abbreviation: string;
  order: number;
};

export type Military = {
  id: string;
  militaryRankId: string;
  militaryRank?: MilitaryRank;
  rg: number;
  name: string;
};
