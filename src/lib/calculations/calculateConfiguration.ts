import { Product } from "../../types/Product";
import { ConfigurationResult } from "../../types/ConfigurationResult";

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

  const requestedWidthMm = requestedWidth * 1000;
  const requestedHeightMm = requestedHeight * 1000;

  // Excel uses ROUNDDOWN
  const cabinetsW = Math.floor(
    requestedWidthMm / product.cabinetWidth
  );

  const cabinetsH = Math.floor(
    requestedHeightMm / product.cabinetHeight
  );

  const totalCabinets = cabinetsW * cabinetsH;

  const totalModules =
    totalCabinets * product.modulesPerCabinet;

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