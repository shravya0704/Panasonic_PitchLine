import { supabase } from "../lib/supabase";

export interface SeriesSpecification {
  id?: string;
  specification_name: string;
  specification_value: string;
}

export const SeriesSpecificationRepository = {
  /**
   * Get all specification defaults for a series
   */
  async getBySeriesCode(seriesCode: string): Promise<SeriesSpecification[]> {
    const { data, error } = await supabase
      .from("series_specifications")
      .select("*")
      .eq("series_code", seriesCode);

    if (error) throw error;
    return data || [];
  },

  /**
   * Save all specification defaults for a series (deletes old, inserts new)
   */
  async saveBySeriesCode(
    seriesCode: string,
    specs: Array<{ name: string; value: string }>
  ): Promise<void> {
    // Step 1: Delete existing defaults for this series
    await this.deleteBySeriesCode(seriesCode);

    // Step 2: Insert new defaults
    const rows = specs.map((spec) => ({
      series_code: seriesCode,
      specification_name: spec.name,
      specification_value: spec.value,
    }));

    const { error } = await supabase
      .from("series_specifications")
      .insert(rows);

    if (error) throw error;
  },

  /**
   * Delete all specification defaults for a series
   */
  async deleteBySeriesCode(seriesCode: string): Promise<void> {
    const { error } = await supabase
      .from("series_specifications")
      .delete()
      .eq("series_code", seriesCode);

    if (error) throw error;
  },

  /**
   * Get a specific default value by series code and specification name
   */
  async getSpecValue(
    seriesCode: string,
    specName: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("series_specifications")
      .select("specification_value")
      .eq("series_code", seriesCode)
      .eq("specification_name", specName)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data?.specification_value ?? null;
  },
};