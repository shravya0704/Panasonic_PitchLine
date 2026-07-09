import { DataFlowResult } from "../../types/DataFlowResult";

/**
 * Calculates the data bandwidth requirements and cable distribution for a single column of the LED display.
 * Determines how many physical data cables (typically Ethernet from a sending card) are needed 
 * to support the pixel density of the column without exceeding hardware port limits.
 *
 * @param {number} cabinetResolutionW - The pixel width of a single cabinet.
 * @param {number} cabinetResolutionH - The pixel height of a single cabinet.
 * @param {number} columnHeight - The total number of cabinets stacked vertically in this specific column.
 * @returns {DataFlowResult} An object containing the port limits, total cables required, and the balanced distribution array.
 */
export const calculateDataFlow = (
  cabinetResolutionW: number,
  cabinetResolutionH: number,
  columnHeight: number
): DataFlowResult => {
  const pixelsPerCabinet =
    cabinetResolutionW *
    cabinetResolutionH;

  // 655,000 represents the standard maximum pixel capacity of a single Gigabit Ethernet data port 
  // on standard commercial LED sending cards (e.g., NovaStar). We floor this division to ensure we 
  // never assign a layout that exceeds the hardware's strict bandwidth ceiling.
  const maxCabinetsPerCable =
    Math.floor(
      655000 / pixelsPerCabinet
    );

  const cableCount = Math.ceil(
    columnHeight / maxCabinetsPerCable
  );

  // LOAD BALANCING:
  // Just like in the physical assignment mapping, we calculate an even baseline.
  // Distributing the pixel payload evenly across controller ports (instead of maxing out the 
  // first port and leaving the next almost empty) prevents frame tearing and ensures 
  // uniform signal latency across the entire column.
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