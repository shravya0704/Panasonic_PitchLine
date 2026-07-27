import { convertPdfToImages } from "../lib/pdf/convertPdfToImages";
import { BrochureUploadRepository } from "../repositories/BrochureUploadRepository";
import { supabase } from "../lib/supabase";
import { UploadProgress } from "../types/SeriesAdmin";

export interface BrochureUploadResponse {
  success: boolean;
  pageCount: number;
  imageUrls: string[];
  error?: string;
}

/**
 * BrochureUploadService
 * Orchestrates the entire brochure upload workflow:
 * 1. Validate inputs and file
 * 2. Convert PDF to JPEG images
 * 3. Upload each page to Supabase storage
 * 4. Save page records to database
 * 5. Update brochure status
 */
export const BrochureUploadService = {
  /**
   * Upload and convert a brochure PDF
   * @param seriesCode - The series code (used for storage path)
   * @param seriesBrochureId - The series_brochures record ID
   * @param seriesId - The series ID (for database record)
   * @param pdfFile - The PDF file to upload
   * @param onProgress - Optional progress callback
   * @returns Object with success flag, page count, and image URLs
   * @throws Error if validation, conversion, or upload fails
   */
  async uploadAndConvertBrochure(
    seriesCode: string,
    seriesBrochureId: string,
    seriesId: string,
    pdfFile: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BrochureUploadResponse> {
    try {
      // ========== STEP 1: VALIDATE INPUTS ==========
      if (!seriesCode || seriesCode.trim() === "") {
        throw new Error("Series code is required.");
      }

      if (!seriesBrochureId || seriesBrochureId.trim() === "") {
        throw new Error("Brochure record ID is required.");
      }

      if (!seriesId || seriesId.trim() === "") {
        throw new Error("Series ID is required.");
      }

      if (!pdfFile) {
        throw new Error("PDF file is required.");
      }

      // ========== STEP 2: CONVERT PDF TO IMAGES ==========
      if (onProgress) {
        onProgress({
          current: 0,
          total: 0,
          stage: "converting",
          message: "Converting PDF to images...",
        });
      }

      const { pages, pageCount } = await convertPdfToImages(
        pdfFile,
        (current, total) => {
          if (onProgress) {
            onProgress({
              current,
              total,
              stage: "converting",
              message: `Converted ${current} of ${total} pages`,
            });
          }
        }
      );

      if (pages.length === 0) {
        throw new Error("PDF contains no pages.");
      }

      // ========== STEP 3: UPLOAD IMAGES TO SUPABASE STORAGE ==========
      if (onProgress) {
        onProgress({
          current: 0,
          total: pageCount,
          stage: "uploading",
          message: "Uploading pages to storage...",
        });
      }

      const imageUrls: string[] = [];
      const uploadedFiles: string[] = []; // Track for rollback if needed

      for (let i = 0; i < pages.length; i++) {
        const pageNumber = i + 1;
        const base64Jpeg = pages[i];

        // Convert base64 to Blob
        const base64Data = base64Jpeg.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });

        // Generate file path: {seriesCode}/0001.jpg, 0002.jpg, etc.
        const paddedPageNumber = String(pageNumber).padStart(4, "0");
        const filePath = `${seriesCode}/${paddedPageNumber}.jpg`;

        // Upload to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from("brochures")
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          // Rollback: Delete previously uploaded files
          await BrochureUploadService._rollbackUploadedFiles(
            uploadedFiles
          );
          throw new Error(`Failed to upload page ${pageNumber}: ${uploadError.message}`);
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("brochures").getPublicUrl(filePath);

        imageUrls.push(publicUrl);
        uploadedFiles.push(filePath);

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: pageCount,
            stage: "uploading",
            message: `Uploaded page ${i + 1} of ${pageCount}`,
          });
        }
      }

      // ========== STEP 4: SAVE PAGE RECORDS TO DATABASE ==========
      if (onProgress) {
        onProgress({
          current: 0,
          total: 0,
          stage: "saving",
          message: "Saving page records to database...",
        });
      }

      const pagesToSave = pages.map((_, index) => ({
        pageNumber: index + 1,
        imageUrl: imageUrls[index],
      }));

      // FIXED: Now passing seriesCode as required parameter
      await BrochureUploadRepository.saveBrochurePages(
        seriesBrochureId,
        seriesId,
        seriesCode,
        pagesToSave
      );

      // ========== STEP 5: UPDATE BROCHURE STATUS ==========
      await BrochureUploadRepository.updateBrochureStatus(
        seriesBrochureId,
        "completed"
      );

      await BrochureUploadRepository.updateBrochurePageCount(
        seriesBrochureId,
        pageCount
      );

      if (onProgress) {
        onProgress({
          current: pageCount,
          total: pageCount,
          stage: "complete",
          message: "Brochure upload complete",
        });
      }

      return {
        success: true,
        pageCount,
        imageUrls,
      };
    } catch (error) {
      // Update status to failed
      try {
        await BrochureUploadRepository.updateBrochureStatus(
          seriesBrochureId,
          "failed"
        );
      } catch {
        // Silently fail if status update fails
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        success: false,
        pageCount: 0,
        imageUrls: [],
        error: errorMessage,
      };
    }
  },

  /**
   * Internal: Rollback uploaded files on failure
   * @param filePaths - Array of file paths to delete
   */
  async _rollbackUploadedFiles(filePaths: string[]): Promise<void> {
    try {
      for (const filePath of filePaths) {
        await supabase.storage.from("brochures").remove([filePath]);
      }
    } catch (error) {
      console.error("Error during rollback:", error);
      // Continue despite rollback errors
    }
  },
};