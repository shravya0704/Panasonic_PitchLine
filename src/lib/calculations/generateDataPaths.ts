import { PowerPath, GridPoint } from "../../types/PowerPaths";

/**
 * Transforms the 2D conceptual grid of assigned chains into structured, plottable path objects.
 * This prepares the data so the PDF drawing engine can easily render connected lines 
 * between specific cabinets belonging to the same data or power circuit.
 *
 * @param {string[][]} assignmentGrid - The 2D array representing the screen layout, where each cell contains a circuit identifier (e.g., 'A', 'B').
 * @returns {PowerPath[]} An array of distinct paths, each containing its identifier and an ordered list of its physical grid coordinates.
 */
export function generateDataPaths(
  assignmentGrid: string[][]
): PowerPath[] {
  // WHY FLAT & SET: 
  // We need a list of all unique circuits (e.g., [A, B, C]) present on the screen. 
  // Flattening the 2D grid into a 1D array and passing it to a Set is the most 
  // computationally efficient way to strip out all duplicate cabinet assignments in one shot.
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

/**
 * Scans the physical cabinet grid to plot the sequential hardware coordinates for a single, specific circuit.
 *
 * @param {string} chain - The unique identifier (e.g., 'A') for the specific circuit currently being plotted.
 * @param {string[][]} grid - The complete 2D assignment grid of the LED display.
 * @returns {GridPoint[]} An ordered array of (row, col) coordinates showing exactly where this circuit travels.
 */
function buildVerticalPath(
  chain: string,
  grid: string[][]
): GridPoint[] {
  const points: GridPoint[] = [];

  // WHY THIS LOOP ORDER:
  // By iterating through rows first (top to bottom), and then columns, we guarantee 
  // the coordinates are collected sequentially exactly how physical cables are dropped.
  // If the PDF drawing engine connects point [0] to point [1], it will accurately draw 
  // a straight line down the column, mimicking the real-world wire routing.
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