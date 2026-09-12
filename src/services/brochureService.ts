import { SeriesAdminRepository } from "../repositories/SeriesAdminRepository";
import { BrochureUploadRepository } from "../repositories/BrochureUploadRepository";

/**
 * Global fallback EDM image URL
 * Used when a series doesn't have a custom EDM image
 */
const GLOBAL_EDM_IMAGE_URL =
  "https://srcmsjpvkjnhbwvycjzo.supabase.co/storage/v1/object/public/brochures/edm/global-edm.jpg";

/**
 * getBrochureForSeries
 * Fetches series EDM image and brochure pages for a given series code
 * Returns EDM image as coverImage and brochure pages as an array
 * 
 * ENHANCED: Now handles missing series records and null EDM URLs gracefully
 * 
 * @param seriesCode - The series code (e.g., "PFP", "PIQ")
 * @returns Object with coverImage (EDM URL) and brochurePages (array of image URLs)
 * @throws Error only on database connection failures, not on missing data
 */
export const getBrochureForSeries = async (
  seriesCode: string
) => {
  let series = await SeriesAdminRepository.getSeriesByCode(seriesCode);

  // CASE 1: Series record doesn't exist in the database
  // This can happen if PIQ series was added to products but not to series table
  if (!series) {
    console.warn(
      `[BrochureService] Series record not found for code: ${seriesCode}. ` +
      `Creating a minimal series record with global EDM image.`
    );

    // Try to create a minimal series record on-the-fly
    // This ensures subsequent calls won't fail
    try {
      series = await SeriesAdminRepository.createSeries({
        code: seriesCode,
        name: seriesCode, // Use series code as name temporarily
        type: "standard",
        edmImageUrl: GLOBAL_EDM_IMAGE_URL,
      });
      console.log(`[BrochureService] Created series record for: ${seriesCode}`);
    } catch (createError) {
      console.error(
        `[BrochureService] Failed to create series record for ${seriesCode}:`,
        createError
      );
      // Fall back to returning a minimal brochure object with global EDM
      return {
        coverImage: GLOBAL_EDM_IMAGE_URL,
        brochurePages: [],
      };
    }
  }

  // CASE 2: Series exists but has null/empty EDM image URL
  // Use global fallback
  let coverImage = series.edm_image_url || GLOBAL_EDM_IMAGE_URL;

  if (!series.edm_image_url) {
    console.warn(
      `[BrochureService] Series ${seriesCode} has no EDM image URL. ` +
      `Using global fallback image.`
    );
  }

  // Try to fetch brochure pages for this series
  let brochurePages: string[] = [];
  try {
    const pages = await BrochureUploadRepository.getPagesBySeries(seriesCode);
    brochurePages = pages.map((page) => page.image_url);

    if (pages.length === 0) {
      console.info(
        `[BrochureService] No brochure pages found for series: ${seriesCode}. ` +
        `PDF will include only EDM cover.`
      );
    }
  } catch (pageError) {
    console.warn(
      `[BrochureService] Failed to fetch brochure pages for ${seriesCode}:`,
      pageError
    );
    // Continue gracefully - we have the EDM image at least
    brochurePages = [];
  }

  return {
    coverImage,
    brochurePages,
  };
};