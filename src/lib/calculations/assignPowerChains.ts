export const assignPowerChains = (
  cabinetsW: number,
  cabinetsH: number,
  distribution: number[]
): string[][] => {
  const grid: string[][] = Array.from(
    { length: cabinetsH },
    () => Array(cabinetsW).fill("")
  );

  let nextLetterCode = 65; // A

  for (let col = 0; col < cabinetsW; col++) {
    let currentRow = 0;

    for (
      let distIndex = 0;
      distIndex < distribution.length;
      distIndex++
    ) {
      const chainSize =
        distribution[distIndex];

      const letter =
        String.fromCharCode(
          nextLetterCode++
        );

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