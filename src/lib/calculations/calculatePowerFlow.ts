import { PowerFlowResult } from "../../types/PowerFlowResult";

export const calculatePowerFlow = (
  totalCabinets: number,
  maxCabinetsPerChain: number
): PowerFlowResult => {
  if (totalCabinets <= 0) {
    throw new Error(
      "Total cabinets must be greater than zero."
    );
  }

  const chainCount = Math.ceil(
    totalCabinets / maxCabinetsPerChain
  );

  const baseCabinetsPerChain = Math.floor(
    totalCabinets / chainCount
  );

  const remainder =
    totalCabinets % chainCount;

  const distribution: number[] = [];

  for (let i = 0; i < chainCount; i++) {
    distribution.push(
      i < remainder
        ? baseCabinetsPerChain + 1
        : baseCabinetsPerChain
    );
  }

  return {
    chainCount,
    distribution,
  };
};