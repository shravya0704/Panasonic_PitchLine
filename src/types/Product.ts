export interface Product {
  id: string;

  model: string;

  seriesCode: string;

  applicationType: string;

  pitch: number;
  maxPowerPerM2: number;

  avgPowerPerM2: number;

  brightness: number;

  cabinetWidth: number;

  cabinetHeight: number;

  cabinetResolutionW: number;

  cabinetResolutionH: number;

  modulesPerCabinet: number;
}