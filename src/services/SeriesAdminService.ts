import { SeriesAdminRepository } from "../repositories/SeriesAdminRepository";
import { BrochureUploadRepository } from "../repositories/BrochureUploadRepository";
import { BrochureUploadService } from "./BrochureUploadService";
import { UploadProgress } from "../types/SeriesAdmin";

// EDM URL constant - update this if you use a different EDM image
const GLOBAL_EDM_IMAGE_URL =
  "https://srcmsjpvkjnhbwvycjzo.supabase.co/storage/v1/object/public/brochures/edm/global-edm.jpg";

export interface SeriesCreationInitResponse {
  seriesId: string;
  seriesBrochureId: string;
}

export interface BrochureUploadForSeriesResponse {
  pageCount: number;
  previewUrls: string[];
}

export interface SeriesCreationProgressResponse {
  seriesExists: boolean;
  brochureUploaded: boolean;
  modelsAdded: number;
}

/**
 * SeriesAdminService
 * High-level orchestration of the series creation workflow
 * Handles validation, series creation, brochure upload, and progress tracking
 */
export const SeriesAdminService = {
  /**
   * STEP 1: Initiate series creation
   * Creates the series record and brochure record in the database
   *
   * @param data - Object with series code and name
   * @returns Object with seriesId and seriesBrochureId
   * @throws Error if validation fails or database operation fails
   */
  async initiateSeriesCreation(data: {
    code: string;
    name: string;
  }): Promise<SeriesCreationInitResponse> {
    // ========== VALIDATION ==========
    const code = data.code?.trim() || "";
    const name = data.name?.trim() || "";

    // Validate code is not empty
    if (!code) {
      throw new Error("Series code is required.");
    }

    // Validate name is not empty
    if (!name) {
      throw new Error("Series name is required.");
    }

    // Validate code format: alphanumeric + hyphens only
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    if (!codeRegex.test(code)) {
      throw new Error(
        "Series code must be alphanumeric with hyphens only."
      );
    }

    // Check if code already exists
    const codeExists = await SeriesAdminRepository.seriesCodeExists(code);
    if (codeExists) {
      throw new Error("Series code already exists. Choose a different one.");
    }

    try {
      // ========== CREATE SERIES ==========
      const series = await SeriesAdminRepository.createSeries({
        code,
        name,
        edmImageUrl: GLOBAL_EDM_IMAGE_URL,
      });

      // ========== CREATE BROCHURE RECORD ==========
      const brochureRecord = await BrochureUploadRepository.createBrochureRecord({
        seriesId: series.id,
        seriesCode: code,
        originalPdfUrl: "", // Will be filled later if needed
      });

      return {
        seriesId: series.id,
        seriesBrochureId: brochureRecord.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create series";
      throw new Error(`Failed to create series: ${errorMessage}`);
    }
  },

  /**
   * STEP 2: Upload brochure for a series
   * Converts PDF to images, uploads to storage, saves to database
   *
   * @param seriesId - The series UUID
   * @param seriesCode - The series code
   * @param seriesBrochureId - The brochure record ID
   * @param pdfFile - The PDF file to upload
   * @param onProgress - Optional progress callback
   * @returns Object with page count and preview URLs
   * @throws Error if upload or conversion fails
   */
  async uploadBrochureForSeries(
    seriesId: string,
    seriesCode: string,
    seriesBrochureId: string,
    pdfFile: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BrochureUploadForSeriesResponse> {
    try {
      const result = await BrochureUploadService.uploadAndConvertBrochure(
        seriesCode,
        seriesBrochureId,
        seriesId,
        pdfFile,
        onProgress
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to upload brochure");
      }

      return {
        pageCount: result.pageCount,
        previewUrls: result.imageUrls,
      };
    } catch (error) {
      // Attempt rollback on failure
      try {
        await SeriesAdminService.rollbackSeriesCreation(seriesId);
      } catch {
        // Log but don't throw rollback errors
        console.error("Rollback attempted but may have failed");
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to upload brochure: ${errorMessage}`);
    }
  },

  /**
   * STEP 3 (Optional): Get series creation progress
   * Returns the current state of a series creation workflow
   *
   * @param seriesId - The series UUID
   * @returns Object with progress flags and model count
   */
  async getSeriesCreationProgress(
    seriesId: string
  ): Promise<SeriesCreationProgressResponse> {
    try {
      // Fetch series
      const series = await SeriesAdminRepository.getSeriesById(seriesId);
      const seriesExists = !!series;

      // Fetch brochure record
      const brochure =
        await BrochureUploadRepository.getBrochureBySeriesId(seriesId);
      const brochureUploaded =
        brochure?.conversion_status === "completed" ? true : false;

      // Count models for this series
      let modelsAdded = 0;
      if (series) {
        modelsAdded =
          await SeriesAdminRepository.getModelCountForSeries(series.code);
      }

      return {
        seriesExists,
        brochureUploaded,
        modelsAdded,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get series progress: ${errorMessage}`);
    }
  },

  /**
   * Rollback: Delete series if creation fails
   * Cascades to all related records (brochures, pages, products)
   *
   * @param seriesId - The series UUID to delete
   */
  async rollbackSeriesCreation(seriesId: string): Promise<void> {
    try {
      // Delete series (cascades to related records due to foreign key constraints)
      await SeriesAdminRepository.deleteSeries(seriesId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to rollback series creation: ${errorMessage}`);
    }
  },
};

export default SeriesAdminService;