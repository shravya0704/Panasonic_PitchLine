import { DataFlowResult } from "../../types/DataFlowResult";

export const calculateDataFlow = (
  cabinetResolutionW: number,
  cabinetResolutionH: number,
  columnHeight: number
): DataFlowResult => {
  const pixelsPerCabinet =
    cabinetResolutionW *
    cabinetResolutionH;

  const maxCabinetsPerCable =
    Math.floor(
      655000 / pixelsPerCabinet
    );

  const cableCount = Math.ceil(
    columnHeight / maxCabinetsPerCable
  );

  const baseCabinetsPerCable =
    Math.floor(
      columnHeight / cableCount
    );

  const remainder =
    columnHeight % cableCount;

  const distribution: number[] = [];

  for (
    let i = 0;
    i < cableCount;
    i++
  ) {
    distribution.push(
      i < remainder
        ? baseCabinetsPerCable + 1
        : baseCabinetsPerCable
    );
  }

  return {
    maxCabinetsPerCable,
    cableCount,
    distribution,
  };
};