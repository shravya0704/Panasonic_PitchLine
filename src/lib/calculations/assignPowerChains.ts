/**
 * Maps the physical cabinet positions to specific electrical power circuits (chains).
 * This generates the underlying grid data used to draw the power wiring diagram in the PDF export.
 *
 * @param {number} cabinetsW - The total number of cabinets across the width of the display.
 * @param {number} cabinetsH - The total number of cabinets across the height of the display.
 * @param {number[]} distribution - A pre-calculated array defining how many cabinets each circuit should handle in a single column (e.g., [8, 8] for a 16-high column split in half).
 * @returns {string[][]} A 2D array representing the screen grid, where each cell contains a unique letter identifying its assigned electrical circuit.
 */
export const assignPowerChains = (
  cabinetsW: number,
  cabinetsH: number,
  distribution: number[]
): string[][] => {
  // Initialize a 2D array to structurally map the physical LED wall.
  // We use this grid pattern so the PDF renderer can easily iterate through rows and columns to draw the diagram.
  const grid: string[][] = Array.from(
    { length: cabinetsH },
    () => Array(cabinetsW).fill("")
  );

  let nextLetterCode = 65; // 'A'

  // We process the grid column by column. In standard LED video wall integration, 
  // power lines are almost always dropped vertically down columns to simplify cable management.
  for (let col = 0; col < cabinetsW; col++) {
    let currentRow = 0;

    for (
      let distIndex = 0;
      distIndex < distribution.length;
      distIndex++
    ) {
      // chainSize represents the safe maximum number of cabinets one circuit can power
      // before exceeding the breaker limits, as determined by the upstream calculation.
      const chainSize =
        distribution[distIndex];

      // Grab the next sequential letter to act as a unique identifier for this specific circuit.
      // Notice this increments continuously across columns (e.g., Col 1 gets A, B; Col 2 gets C, D). 
      // This correctly models reality, where each column requires its own dedicated home runs to the power distro.
      const letter =
        String.fromCharCode(
          nextLetterCode++
        );

      // Stamp the cabinets in this column with their assigned circuit identifier.
      for (
        let count = 0;
        count < chainSize;
        count++
      ) {
        grid[currentRow][col] = letter;
        currentRow++;
      }
    }
  }

  return grid;
};