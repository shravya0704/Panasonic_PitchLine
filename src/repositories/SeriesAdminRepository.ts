import { supabase } from "../lib/supabase";

// ============================================================================
// CONFIGURATION
// ============================================================================
const GLOBAL_EDM_IMAGE_URL =
  "https://srcmsjpvkjnhbwvycjzo.supabase.co/storage/v1/object/public/brochures/edm/global-edm.jpg";
// ============================================================================

export interface Series {
  id: string;
  code: string;
  name: string;
  type?: "standard" | "aio";
  cover_image: string;
  edm_image_url: string;
  aio_display_diagonal_inches?: number;
  aio_resolution_w?: number;
  aio_resolution_h?: number;
  aio_pixel_pitch_mm?: number;
  aio_brightness_nits?: number;
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
   * @param data - Series code, name, type, EDM image URL, and optional AIO specifications
   * @returns The created series object with ID
   * @throws Error if insertion fails
   */
  async createSeries(data: {
    code: string;
    name: string;
    type?: "standard" | "aio";
    edmImageUrl?: string;
    aioDisplayDiagonal?: number;
    aioResolutionW?: number;
    aioResolutionH?: number;
    aioPixelPitch?: number;
    aioBrightness?: number;
  }): Promise<Series> {
    const { data: createdSeries, error } = await supabase
      .from("series")
      .insert({
        code: data.code,
        name: data.name,
        type: data.type ?? "standard",
        edm_image_url: data.edmImageUrl || GLOBAL_EDM_IMAGE_URL,
        cover_image: "",
        // Conditionally include AIO specs if type is "aio"
        ...(data.type === "aio" && {
          aio_display_diagonal_inches: data.aioDisplayDiagonal,
          aio_resolution_w: data.aioResolutionW,
          aio_resolution_h: data.aioResolutionH,
          aio_pixel_pitch_mm: data.aioPixelPitch,
          aio_brightness_nits: data.aioBrightness,
        }),
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
   * Delete a series and all brochure files from storage
   * @param seriesId - The series UUID
   */
  async deleteSeries(seriesId: string): Promise<void> {
    try {
      // Get the series code first
      const { data: series, error: seriesError } = await supabase
        .from("series")
        .select("code")
        .eq("id", seriesId)
        .single();

      if (seriesError) throw seriesError;

      // Delete everything from storage under this series code folder
      if (series && series.code) {
        try {
          const { data: files } = await supabase.storage
            .from("brochures")
            .list(series.code);

          if (files && files.length > 0) {
            const filePaths = files.map(
              (f) => `${series.code}/${f.name}`
            );

            await supabase.storage
              .from("brochures")
              .remove(filePaths);
          }
        } catch (storageError) {
          console.error(
            "Failed to delete storage files:",
            storageError
          );
          // Continue even if storage deletion fails
        }
      }

      // Delete the series from the database
      const { error: deleteError } = await supabase
        .from("series")
        .delete()
        .eq("id", seriesId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error("Error deleting series:", error);
      throw error;
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