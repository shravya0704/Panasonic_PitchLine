import { PowerPath, GridPoint } from "../../types/PowerPaths";

export function generatePowerPaths(
  assignmentGrid: string[][]
): PowerPath[] {
  const chainNames = Array.from(
    new Set(assignmentGrid.flat())
  );

  return chainNames.map((chain) => ({
    chain,
    points: buildSnakePath(chain, assignmentGrid),
  }));
}

function buildSnakePath(
  chain: string,
  grid: string[][]
): GridPoint[] {
  const rows = new Map<number, GridPoint[]>();

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== chain) continue;

      if (!rows.has(row)) {
        rows.set(row, []);
      }

      rows.get(row)!.push({
        row,
        col,
      });
    }
  }

  const sortedRows = Array.from(rows.keys()).sort(
    (a, b) => a - b
  );

  const path: GridPoint[] = [];

  sortedRows.forEach((rowNumber, rowIndex) => {
    const rowPoints = rows.get(rowNumber)!;

    rowPoints.sort((a, b) => a.col - b.col);

    if (rowIndex % 2 === 1) {
      rowPoints.reverse();
    }

    path.push(...rowPoints);
  });

  return path;
}