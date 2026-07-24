import { supabase } from "../lib/supabase";

// ============================================================================
// CONFIGURATION: Replace this URL when you have the real EDM image
// ============================================================================
const GLOBAL_EDM_IMAGE_URL =
  "https://via.placeholder.com/1920x1080?text=EDM+Placeholder";
// TODO: Replace with actual Supabase URL once EDM image is uploaded
// Format: https://srcmsjpvkjnhbwvycjzo.supabase.co/storage/v1/object/public/brochures/edm/global-edm.jpg
// ============================================================================

export interface Series {
  id: string;
  code: string;
  name: string;
  cover_image: string;
  edm_image_url: string;
  created_at?: string;
}

/**
 * SeriesAdminRepository
 * Handles all database operations for series management.
 * All methods are async and use the Supabase client.
 */
export const SeriesAdminRepository = {
  /**
   * Create a new series
   * @param data - Series code, name, and EDM image URL
   * @returns The created series object with ID
   * @throws Error if insertion fails
   */
  async createSeries(data: {
    code: string;
    name: string;
    edmImageUrl?: string;
  }): Promise<Series> {
    const { data: createdSeries, error } = await supabase
      .from("series")
      .insert({
        code: data.code,
        name: data.name,
        edm_image_url: data.edmImageUrl || GLOBAL_EDM_IMAGE_URL,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating series:", error);
      throw new Error(`Failed to create series: ${error.message}`);
    }

    return createdSeries as Series;
  },

  /**
   * Fetch a series by its code
   * @param code - The series code (e.g., "PFP", "AIQ")
   * @returns Series object or null if not found
   */
  async getSeriesByCode(code: string): Promise<Series | null> {
    const { data, error } = await supabase
      .from("series")
      .select("*")
      .eq("code", code)
      .single();

    if (error && error.code === "PGRST116") {
      return null;
    }

    if (error) {
      console.error("Error fetching series by code:", error);
      throw new Error(`Failed to fetch series: ${error.message}`);
    }

    return data as Series;
  },

  /**
   * Fetch a series by its ID
   * @param id - The series UUID
   * @returns Series object or null if not found
   */
  async getSeriesById(id: string): Promise<Series | null> {
    const { data, error } = await supabase
      .from("series")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code === "PGRST116") {
      return null;
    }

    if (error) {
      console.error("Error fetching series by ID:", error);
      throw new Error(`Failed to fetch series: ${error.message}`);
    }

    return data as Series;
  },

  /**
   * Check if a series code already exists
   * @param code - The series code to check
   * @returns true if code exists, false otherwise
   */
  async seriesCodeExists(code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("series")
      .select("id", { count: "exact" })
      .eq("code", code)
      .limit(1);

    if (error) {
      console.error("Error checking series code:", error);
      throw new Error(`Failed to check series code: ${error.message}`);
    }

    return data && data.length > 0;
  },

  /**
   * List all series
   * @returns Array of all series, ordered by creation date (newest first)
   */
  async listAllSeries(): Promise<Series[]> {
    const { data, error } = await supabase
      .from("series")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listing series:", error);
      throw new Error(`Failed to list series: ${error.message}`);
    }

    return (data || []) as Series[];
  },

  /**
   * Update a series
   * @param seriesId - The series UUID
   * @param updates - Partial series object with fields to update
   * @returns The updated series object
   */
  async updateSeries(
    seriesId: string,
    updates: Partial<Omit<Series, "id">>
  ): Promise<Series> {
    const { data, error } = await supabase
      .from("series")
      .update(updates)
      .eq("id", seriesId)
      .select()
      .single();

    if (error) {
      console.error("Error updating series:", error);
      throw new Error(`Failed to update series: ${error.message}`);
    }

    return data as Series;
  },

  /**
   * Delete a series (cascades to related records)
   * @param seriesId - The series UUID
   */
  async deleteSeries(seriesId: string): Promise<void> {
    const { error } = await supabase
      .from("series")
      .delete()
      .eq("id", seriesId);

    if (error) {
      console.error("Error deleting series:", error);
      throw new Error(`Failed to delete series: ${error.message}`);
    }
  },

  /**
   * Get the count of models in a series
   * @param seriesCode - The series code
   * @returns Number of products in this series
   */
  async getModelCountForSeries(seriesCode: string): Promise<number> {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("series_code", seriesCode);

    if (error) {
      console.error("Error counting models:", error);
      throw new Error(`Failed to count models: ${error.message}`);
    }

    return count || 0;
  },
};