/**
 * Calculates and assigns data routing paths (chains) for the LED display's cabinets.
 * Maps physical cabinet positions to specific data cables, ensuring no single 
 * cable exceeds the hardware's maximum data capacity constraints.
 *
 * @param {number} cabinetsW - The total number of cabinets across the width of the screen.
 * @param {number} cabinetsH - The total number of cabinets across the height of the screen.
 * @param {number} maxCabinetsPerCable - The maximum number of cabinets a single data cable can support (determined by pixel resolution and refresh rate).
 * @returns {string[][]} A 2D array representing the screen grid, where each cell contains a letter (e.g., 'A', 'B') identifying its assigned data chain.
 */
export const assignDataChains = (
  cabinetsW: number,
  cabinetsH: number,
  maxCabinetsPerCable: number
): string[][] => {
  // Initialize a 2D array to structurally map the physical LED wall.
  // This grid will hold the string identifier for each cabinet's corresponding data cable.
  const grid: string[][] = Array.from(
    { length: cabinetsH },
    () => Array(cabinetsW).fill("")
  );

  // ASCII code 65 corresponds to 'A'. We use letters to generate human-readable, 
  // sequential identifiers for the wiring diagram in the final PDF export.
  let currentLetterCode = 65;

  // We process the grid column by column. In real-world LED installations, data chains 
  // almost always run vertically to keep cable management clean and minimize long horizontal runs.
  for (let col = 0; col < cabinetsW; col++) {
    // Determine the absolute minimum number of cables required for this specific column.
    const cableCount = Math.ceil(
      cabinetsH / maxCabinetsPerCable
    );

    // LOAD BALANCING LOGIC:
    // Instead of maxing out the first cable and leaving the last cable nearly empty, 
    // we calculate a balanced baseline. Evenly distributing the data load across ports 
    // is a best practice for maintaining optimal signal integrity.
    const baseSize = Math.floor(
      cabinetsH / cableCount
    );

    const remainder =
      cabinetsH % cableCount;

    const distribution: number[] = [];

    // Distribute the remainder across the first few cables to ensure the load is as 
    // evenly spread as mathematically possible.
    for (
      let i = 0;
      i < cableCount;
      i++
    ) {
      distribution.push(
        i < remainder
          ? baseSize + 1
          : baseSize
      );
    }

    let currentRow = 0;

    // Apply the calculated distribution sequence to the physical grid, moving downwards.
    for (
      let part = 0;
      part < distribution.length;
      part++
    ) {
      const letter =
        String.fromCharCode(
          currentLetterCode++
        );

      // Stamp the current letter identifier onto the designated number of cabinets 
      // belonging to this specific data chain.
      for (
        let count = 0;
        count < distribution[part];
        count++
      ) {
        grid[currentRow][col] = letter;
        currentRow++;
      }
    }
  }

  return grid;
};