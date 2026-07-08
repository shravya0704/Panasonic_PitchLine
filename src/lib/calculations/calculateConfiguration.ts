import { Product } from "../../types/Product";
import { ConfigurationResult } from "../../types/ConfigurationResult";

/**
 * Calculates the exact physical and technical specifications for an LED display wall 
 * based on a target size and the selected hardware constraints.
 *
 * @param {Product} product - The selected Panasonic LED product model containing physical and electrical specifications.
 * @param {number} requestedWidth - The user's target width for the display, provided in meters.
 * @param {number} requestedHeight - The user's target height for the display, provided in meters.
 * @returns {ConfigurationResult} The calculated physical layout, pixel resolution, power consumption, and thermal output metrics.
 * @throws {Error} Throws if either the requested width or height is less than or equal to zero.
 */
export const calculateConfiguration = (
  product: Product,
  requestedWidth: number,
  requestedHeight: number
): ConfigurationResult => {
  if (requestedWidth <= 0 || requestedHeight <= 0) {
    throw new Error(
      "Requested width and height must be greater than zero."
    );
  }

  // Convert requested dimensions from meters to millimeters for precise physical calculations,
  // matching the millimeter-based specifications of the product hardware.
  const requestedWidthMm = requestedWidth * 1000;
  const requestedHeightMm = requestedHeight * 1000;

  // Excel uses ROUNDDOWN
  // We use Math.floor here to ensure the generated screen never exceeds the user's requested physical bounds. 
  // It is better to be slightly smaller than the target space than to generate a configuration that won't fit on the client's wall.
  const cabinetsW = Math.floor(
    requestedWidthMm / product.cabinetWidth
  );

  const cabinetsH = Math.floor(
    requestedHeightMm / product.cabinetHeight
  );

  const totalCabinets = cabinetsW * cabinetsH;

  const totalModules =
    totalCabinets * product.modulesPerCabinet;

  // Convert the calculated physical dimensions back to meters for the UI display and downstream calculations.
  const actualWidth =
    (cabinetsW * product.cabinetWidth) / 1000;

  const actualHeight =
    (cabinetsH * product.cabinetHeight) / 1000;

  const resolutionW =
    cabinetsW * product.cabinetResolutionW;

  const resolutionH =
    cabinetsH * product.cabinetResolutionH;

  const totalArea =
    actualWidth * actualHeight;

  const maximumPower =
    totalArea *
    product.maxPowerPerM2;

  const averagePower =
    totalArea *
    product.avgPowerPerM2;

  const maximumHeat =
    maximumPower;

  const averageHeat =
    averagePower;

  // Multiply wattage by 3.412 to convert watts directly into BTU/hr. 
  // This is a standard conversion factor critical for AV integrators to plan HVAC cooling loads.
  const maximumHeatBTU =
    maximumPower * 3.412;

  const averageHeatBTU =
    averagePower * 3.412;

  return {
    cabinetsW,
    cabinetsH,

    totalCabinets,
    totalModules,

    actualWidth,
    actualHeight,

    resolutionW,
    resolutionH,

    totalArea,

    maximumPower,

    averagePower,

    maximumHeat,

    averageHeat,

    maximumHeatBTU,

    averageHeatBTU,
  };
};