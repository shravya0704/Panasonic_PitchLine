export interface GridPoint {
  row: number;
  col: number;
}

export interface PowerPath {
  chain: string;
  points: GridPoint[];
}