import { PowerFlowResult } from "../../types/PowerFlowResult";

/**
 * Calculates the optimal electrical power distribution for a sequence of LED cabinets.
 * Determines the minimum number of power circuits (chains) required and maps out an evenly
 * distributed load across those circuits to prevent overloading any single breaker or power supply.
 *
 * @param {number} totalCabinets - The total number of cabinets to be powered (typically calculated per column).
 * @param {number} maxCabinetsPerChain - The safe maximum number of cabinets a single electrical circuit can support based on voltage and wattage limits.
 * @returns {PowerFlowResult} An object detailing the total number of required circuits and the specific cabinet load assigned to each.
 * @throws {Error} Throws an error if the total number of cabinets is less than or equal to zero.
 */
export const calculatePowerFlow = (
  totalCabinets: number,
  maxCabinetsPerChain: number
): PowerFlowResult => {
  // Guard clause to prevent divide-by-zero errors or meaningless calculations
  // if an invalid configuration state is accidentally passed from the UI.
  if (totalCabinets <= 0) {
    throw new Error(
      "Total cabinets must be greater than zero."
    );
  }

  // Calculate the absolute minimum number of separate electrical home runs needed.
  // Using Math.ceil ensures we always round up to add another circuit if we exceed the safe limit.
  const chainCount = Math.ceil(
    totalCabinets / maxCabinetsPerChain
  );

  // LOAD BALANCING LOGIC:
  // In AV integration, it is dangerous and against code to load one circuit to 100% capacity 
  // while leaving the next circuit nearly empty. We calculate a balanced baseline here.
  // Spreading the electrical load evenly prevents nuisance breaker tripping during white-screen 
  // flashes (peak power draw) and reduces overall thermal stress on the power distribution units.
  const baseCabinetsPerChain = Math.floor(
    totalCabinets / chainCount
  );

  const remainder =
    totalCabinets % chainCount;

  const distribution: number[] = [];

  // Distribute any leftover cabinets (the remainder) one by one across the first few circuits.
  // This guarantees that the load difference between any two electrical circuits is never greater than exactly 1 cabinet.
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