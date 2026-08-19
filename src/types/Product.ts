// src/types/Product.ts

export interface ProductSpecification {
  specification_name: string;
  specification_value: string;
}

export interface Product {
  id: string;
  model: string;
  seriesCode: string;
  applicationType: string;
  pitch: number;
  brightness: number;
  maxPowerPerM2: number;
  avgPowerPerM2: number;
  cabinetWidth: number;
  cabinetHeight: number;
  cabinetResolutionW: number;
  cabinetResolutionH: number;
  modulesPerCabinet: number;
  product_specifications?: any[];
  seriesType?: string;
  led_type?: string;
  aio_display_diagonal?: number;
  screenWeightPerM2?: number;  // kg/m² - screen weight per square meter from product datasheet
}