export const assignPowerChains = (
  cabinetsW: number,
  cabinetsH: number,
  distribution: number[]
): string[][] => {
  const grid: string[][] = [];

  let currentChain = 0;
  let remainingInChain = distribution[0];

  for (let row = 0; row < cabinetsH; row++) {
    const currentRow: string[] = [];

    for (let col = 0; col < cabinetsW; col++) {
      const chainLetter = String.fromCharCode(
        65 + currentChain
      );

      currentRow.push(chainLetter);

      remainingInChain--;

      if (
        remainingInChain === 0 &&
        currentChain < distribution.length - 1
      ) {
        currentChain++;
        remainingInChain =
          distribution[currentChain];
      }
    }

    grid.push(currentRow);
  }

  return grid;
};