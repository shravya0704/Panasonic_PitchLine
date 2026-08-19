// src/types/ConfigurationResult.ts

export interface ConfigurationResult {
  cabinetsW: number;
  cabinetsH: number;

  totalCabinets: number;
  totalModules: number;

  actualWidth: number;
  actualHeight: number;

  resolutionW: number;
  resolutionH: number;

  totalArea: number;

  maximumPower: number;
  averagePower: number;

  maximumHeat: number;
  averageHeat: number;

  maximumHeatBTU: number;
  averageHeatBTU: number;

  diagonalInches: number;
  aspectRatio: string;

  screenWeightPerM2?: number;
  totalScreenWeight?: number;
}