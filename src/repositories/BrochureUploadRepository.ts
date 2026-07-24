import { supabase } from "../lib/supabase";

export interface SeriesBrochure {
  id: string;
  series_id: string;
  series_code: string;
  original_pdf_url: string;
  conversion_status: "pending" | "completed" | "failed";
  page_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface BrochurePage {
  id: string;
  series_code: string;
  page_number: number;
  image_url: string;
  series_id?: string;
  series_brochure_id?: string;
}

/**
 * BrochureUploadRepository
 * Handles all database operations for brochure uploads and page management.
 * All methods are async and use the Supabase client.
 */
export const BrochureUploadRepository = {
  /**
   * Create a new series_brochures record to track a PDF upload
   * @param data - Series ID, code, and original PDF URL
   * @returns The created brochure record with ID
   * @throws Error if insertion fails
   */
  async createBrochureRecord(data: {
    seriesId: string;
    seriesCode: string;
    originalPdfUrl: string;
  }): Promise<SeriesBrochure> {
    const { data: createdRecord, error } = await supabase
      .from("series_brochures")
      .insert({
        series_id: data.seriesId,
        series_code: data.seriesCode,
        original_pdf_url: data.originalPdfUrl,
        conversion_status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating brochure record:", error);
      throw new Error(`Failed to create brochure record: ${error.message}`);
    }

    return createdRecord as SeriesBrochure;
  },

  /**
   * Save individual brochure page records to the database
   * Batch inserts multiple pages at once
   * @param seriesBrochureId - The series_brochures ID
   * @param seriesId - The series ID
   * @param pages - Array of page objects with pageNumber and imageUrl
   * @throws Error if insertion fails
   */
  async saveBrochurePages(
    seriesBrochureId: string,
    seriesId: string,
    pages: Array<{ pageNumber: number; imageUrl: string }>
  ): Promise<void> {
    // Transform pages into format for brochure_pages table
    const pagesToInsert = pages.map((page) => ({
      series_id: seriesId,
      series_brochure_id: seriesBrochureId,
      page_number: page.pageNumber,
      image_url: page.imageUrl,
      // series_code will be set by the UI, not here (easier to get from the series object)
    }));

    const { error } = await supabase
      .from("brochure_pages")
      .insert(pagesToInsert);

    if (error) {
      console.error("Error saving brochure pages:", error);
      throw new Error(`Failed to save brochure pages: ${error.message}`);
    }
  },

  /**
   * Get all brochure pages for a series, ordered by page number
   * @param seriesCode - The series code
   * @returns Array of brochure pages ordered by page_number ascending
   */
  async getPagesBySeries(seriesCode: string): Promise<BrochurePage[]> {
    const { data, error } = await supabase
      .from("brochure_pages")
      .select("*")
      .eq("series_code", seriesCode)
      .order("page_number", { ascending: true });

    if (error) {
      console.error("Error fetching brochure pages:", error);
      throw new Error(`Failed to fetch brochure pages: ${error.message}`);
    }

    return (data || []) as BrochurePage[];
  },

  /**
   * Get all brochure pages for a series by series_id
   * @param seriesId - The series UUID
   * @returns Array of brochure pages ordered by page_number ascending
   */
  async getPagesBySeriesId(seriesId: string): Promise<BrochurePage[]> {
    const { data, error } = await supabase
      .from("brochure_pages")
      .select("*")
      .eq("series_id", seriesId)
      .order("page_number", { ascending: true });

    if (error) {
      console.error("Error fetching brochure pages by series ID:", error);
      throw new Error(
        `Failed to fetch brochure pages by series ID: ${error.message}`
      );
    }

    return (data || []) as BrochurePage[];
  },

  /**
   * Update the conversion status of a brochure upload
   * @param seriesBrochureId - The series_brochures ID
   * @param status - New status: 'pending', 'completed', or 'failed'
   * @throws Error if update fails
   */
  async updateBrochureStatus(
    seriesBrochureId: string,
    status: "pending" | "completed" | "failed"
  ): Promise<void> {
    const { error } = await supabase
      .from("series_brochures")
      .update({
        conversion_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", seriesBrochureId);

    if (error) {
      console.error("Error updating brochure status:", error);
      throw new Error(`Failed to update brochure status: ${error.message}`);
    }
  },

  /**
   * Update the page count of a brochure upload
   * @param seriesBrochureId - The series_brochures ID
   * @param pageCount - The number of pages extracted from PDF
   * @throws Error if update fails
   */
  async updateBrochurePageCount(
    seriesBrochureId: string,
    pageCount: number
  ): Promise<void> {
    const { error } = await supabase
      .from("series_brochures")
      .update({
        page_count: pageCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", seriesBrochureId);

    if (error) {
      console.error("Error updating brochure page count:", error);
      throw new Error(
        `Failed to update brochure page count: ${error.message}`
      );
    }
  },

  /**
   * Get a brochure record by series_id (returns latest)
   * @param seriesId - The series UUID
   * @returns The latest brochure record for this series, or null if not found
   */
  async getBrochureBySeriesId(seriesId: string): Promise<SeriesBrochure | null> {
    const { data, error } = await supabase
      .from("series_brochures")
      .select("*")
      .eq("series_id", seriesId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") {
      // Not found - return null
      return null;
    }

    if (error) {
      console.error("Error fetching brochure by series ID:", error);
      throw new Error(`Failed to fetch brochure: ${error.message}`);
    }

    return data as SeriesBrochure;
  },

  /**
   * Get a brochure record by series_brochures ID
   * @param seriesBrochureId - The series_brochures UUID
   * @returns The brochure record or null if not found
   */
  async getBrochureById(seriesBrochureId: string): Promise<SeriesBrochure | null> {
    const { data, error } = await supabase
      .from("series_brochures")
      .select("*")
      .eq("id", seriesBrochureId)
      .single();

    if (error && error.code === "PGRST116") {
      return null;
    }

    if (error) {
      console.error("Error fetching brochure by ID:", error);
      throw new Error(`Failed to fetch brochure: ${error.message}`);
    }

    return data as SeriesBrochure;
  },

  /**
   * Delete brochure pages for a series (used when re-uploading)
   * @param seriesBrochureId - The series_brochures ID
   * @throws Error if deletion fails
   */
  async deleteBrochurePages(seriesBrochureId: string): Promise<void> {
    const { error } = await supabase
      .from("brochure_pages")
      .delete()
      .eq("series_brochure_id", seriesBrochureId);

    if (error) {
      console.error("Error deleting brochure pages:", error);
      throw new Error(`Failed to delete brochure pages: ${error.message}`);
    }
  },

  /**
   * Delete a brochure record (cascades to brochure_pages)
   * @param seriesBrochureId - The series_brochures ID
   * @throws Error if deletion fails
   */
  async deleteBrochure(seriesBrochureId: string): Promise<void> {
    const { error } = await supabase
      .from("series_brochures")
      .delete()
      .eq("id", seriesBrochureId);

    if (error) {
      console.error("Error deleting brochure:", error);
      throw new Error(`Failed to delete brochure: ${error.message}`);
    }
  },

  /**
   * Get page count for a series
   * @param seriesCode - The series code
   * @returns Number of brochure pages for this series
   */
  async getPageCountForSeries(seriesCode: string): Promise<number> {
    const { count, error } = await supabase
      .from("brochure_pages")
      .select("*", { count: "exact" })
      .eq("series_code", seriesCode);

    if (error) {
      console.error("Error counting pages:", error);
      throw new Error(`Failed to count pages: ${error.message}`);
    }

    return count || 0;
  },
};