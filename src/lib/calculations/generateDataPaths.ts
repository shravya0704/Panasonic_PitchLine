import { PowerPath, GridPoint } from "../../types/PowerPaths";

export function generateDataPaths(
  assignmentGrid: string[][]
): PowerPath[] {
  const chainNames = Array.from(
    new Set(assignmentGrid.flat())
  );

  return chainNames.map((chain) => ({
    chain,
    points: buildVerticalPath(
      chain,
      assignmentGrid
    ),
  }));
}

function buildVerticalPath(
  chain: string,
  grid: string[][]
): GridPoint[] {
  const points: GridPoint[] = [];

  for (let row = 0; row < grid.length; row++) {
    for (
      let col = 0;
      col < grid[row].length;
      col++
    ) {
      if (grid[row][col] === chain) {
        points.push({
          row,
          col,
        });
      }
    }
  }

  return points;
}