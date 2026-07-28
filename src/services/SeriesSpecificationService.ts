import { SeriesSpecificationRepository } from "../repositories/SeriesSpecificationRepository";
import { ProductSpecification } from "../types/Product";

/**
 * Series-level specification defaults (fields that are identical across all models in a series)
 */
export interface SeriesSpecDefaults {
  pixelConfiguration: string;
  cabinetMaterial: string;
  serviceAccess: string;
  flatness: string;
  
  colorTemp: string;
  viewingAngle: string;
  brightnessUniformity: string;
  colorUniformity: string;
  contrastRatio: string;
  processingDepth: string;
  
  powerSupply: string;
  frameRate: string;
  refreshRate: string;
  
  ledLifetime: string;
  
  operatingTemp: string;
  operatingHumidity: string;
  ipRating: string;
}

/**
 * Model-specific overrides (fields that can vary per model)
 */
export interface ModelSpecOverrides {
  pixelConfiguration?: string;
  cabinetMaterial?: string;
  serviceAccess?: string;
  colorTemp?: string;
  viewingAngle?: string;
  brightnessUniformity?: string;
  colorUniformity?: string;
  contrastRatio?: string;
  processingDepth?: string;
  powerSupply?: string;
  frameRate?: string;
  refreshRate?: string;
  ledLifetime?: string;
  operatingTemp?: string;
  operatingHumidity?: string;
  ipRating?: string;
  flatness?: string;
}

export const SeriesSpecificationService = {
  /**
   * Fetch series-level spec defaults as a typed object
   */
  async getSeriesDefaults(seriesCode: string): Promise<SeriesSpecDefaults | null> {
    try {
      const specs = await SeriesSpecificationRepository.getBySeriesCode(seriesCode);
      
      if (specs.length === 0) return null;

      const result: any = {};
      specs.forEach((spec) => {
        result[spec.specification_name] = spec.specification_value;
      });

      return result as SeriesSpecDefaults;
    } catch (error) {
      console.error(`Failed to fetch series defaults for ${seriesCode}:`, error);
      return null;
    }
  },

  /**
   * Save series-level spec defaults
   */
  async saveSeriesDefaults(
    seriesCode: string,
    defaults: SeriesSpecDefaults
  ): Promise<void> {
    const specs = [
      { name: "Pixel Configuration", value: defaults.pixelConfiguration },
      { name: "Cabinet Material", value: defaults.cabinetMaterial },
      { name: "Service Access", value: defaults.serviceAccess },
      { name: "Flatness", value: defaults.flatness },
      
      { name: "Color Temperature (K)", value: defaults.colorTemp },
      { name: "Visual Viewing Angle (H x V)", value: defaults.viewingAngle },
      { name: "Brightness Uniformity", value: defaults.brightnessUniformity },
      { name: "Color Uniformity", value: defaults.colorUniformity },
      { name: "Contrast Ratio", value: defaults.contrastRatio },
      { name: "Processing Depth (bit)", value: defaults.processingDepth },
      
      { name: "Power Supply (V)", value: defaults.powerSupply },
      { name: "Frame Rate (Hz)", value: defaults.frameRate },
      { name: "Refresh Rate (Hz)", value: defaults.refreshRate },
      
      { name: "LED Lifetime (Half Brightness)", value: defaults.ledLifetime },
      
      { name: "Operating Temperature (°C)", value: defaults.operatingTemp },
      { name: "Operating Humidity", value: defaults.operatingHumidity },
      { name: "IP Rating", value: defaults.ipRating },
    ];

    await SeriesSpecificationRepository.saveBySeriesCode(seriesCode, specs);
  },

  /**
   * Build complete product specifications by merging series defaults with model overrides
   * Used when creating a new model
   */
  async buildProductSpecs(
    seriesCode: string,
    modelOverrides: ModelSpecOverrides
  ): Promise<ProductSpecification[]> {
    // Fetch series defaults
    const seriesDefaults = await this.getSeriesDefaults(seriesCode);

    if (!seriesDefaults) {
      throw new Error(
        `No series defaults found for ${seriesCode}. Please save series specs first.`
      );
    }

    // Merge: series defaults + model overrides (overrides take precedence)
    const specs: ProductSpecification[] = [
      {
        specification_name: "Pixel Configuration",
        specification_value: modelOverrides.pixelConfiguration || seriesDefaults.pixelConfiguration,
      },
      {
        specification_name: "Cabinet Material",
        specification_value: modelOverrides.cabinetMaterial || seriesDefaults.cabinetMaterial,
      },
      {
        specification_name: "Service Access",
        specification_value: modelOverrides.serviceAccess || seriesDefaults.serviceAccess,
      },
      {
        specification_name: "Flatness",
        specification_value: modelOverrides.flatness || seriesDefaults.flatness,
      },
      
      {
        specification_name: "Color Temperature (K)",
        specification_value: modelOverrides.colorTemp || seriesDefaults.colorTemp,
      },
      {
        specification_name: "Visual Viewing Angle (H x V)",
        specification_value: modelOverrides.viewingAngle || seriesDefaults.viewingAngle,
      },
      {
        specification_name: "Brightness Uniformity",
        specification_value: modelOverrides.brightnessUniformity || seriesDefaults.brightnessUniformity,
      },
      {
        specification_name: "Color Uniformity",
        specification_value: modelOverrides.colorUniformity || seriesDefaults.colorUniformity,
      },
      {
        specification_name: "Contrast Ratio",
        specification_value: modelOverrides.contrastRatio || seriesDefaults.contrastRatio,
      },
      {
        specification_name: "Processing Depth (bit)",
        specification_value: modelOverrides.processingDepth || seriesDefaults.processingDepth,
      },
      
      {
        specification_name: "Power Supply (V)",
        specification_value: modelOverrides.powerSupply || seriesDefaults.powerSupply,
      },
      {
        specification_name: "Frame Rate (Hz)",
        specification_value: modelOverrides.frameRate || seriesDefaults.frameRate,
      },
      {
        specification_name: "Refresh Rate (Hz)",
        specification_value: modelOverrides.refreshRate || seriesDefaults.refreshRate,
      },
      
      {
        specification_name: "LED Lifetime (Half Brightness)",
        specification_value: modelOverrides.ledLifetime || seriesDefaults.ledLifetime,
      },
      
      {
        specification_name: "Operating Temperature (°C)",
        specification_value: modelOverrides.operatingTemp || seriesDefaults.operatingTemp,
      },
      {
        specification_name: "Operating Humidity",
        specification_value: modelOverrides.operatingHumidity || seriesDefaults.operatingHumidity,
      },
      {
        specification_name: "IP Rating",
        specification_value: modelOverrides.ipRating || seriesDefaults.ipRating,
      },
    ];

    return specs;
  },
};