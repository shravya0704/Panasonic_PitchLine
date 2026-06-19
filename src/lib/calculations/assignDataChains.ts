export const assignDataChains = (
  cabinetsW: number,
  cabinetsH: number,
  maxCabinetsPerCable: number
): string[][] => {
  const grid: string[][] = Array.from(
    { length: cabinetsH },
    () => Array(cabinetsW).fill("")
  );

  let currentLetterCode = 65;

  for (let col = 0; col < cabinetsW; col++) {
    const cableCount = Math.ceil(
      cabinetsH / maxCabinetsPerCable
    );

    const baseSize = Math.floor(
      cabinetsH / cableCount
    );

    const remainder =
      cabinetsH % cableCount;

    const distribution: number[] = [];

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

    for (
      let part = 0;
      part < distribution.length;
      part++
    ) {
      const letter =
        String.fromCharCode(
          currentLetterCode++
        );

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