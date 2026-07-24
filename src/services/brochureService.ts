import { SeriesAdminRepository } from "../repositories/SeriesAdminRepository";
import { BrochureUploadRepository } from "../repositories/BrochureUploadRepository";

/**
 * getBrochureForSeries
 * Fetches series EDM image and brochure pages for a given series code
 * Returns EDM image as coverImage and brochure pages as an array
 * 
 * @param seriesCode - The series code (e.g., "PFP", "PIK")
 * @returns Object with coverImage (EDM URL) and brochurePages (array of image URLs)
 */
export const getBrochureForSeries = async (
  seriesCode: string
) => {
  // Get series by code to retrieve EDM image URL
  const series = await SeriesAdminRepository.getSeriesByCode(seriesCode);

  if (!series) {
    throw new Error(`Series not found: ${seriesCode}`);
  }

  // Get brochure pages for this series
  const pages = await BrochureUploadRepository.getPagesBySeries(seriesCode);

  return {
    // EDM image becomes the cover image for the PDF
    coverImage: series.edm_image_url,

    // Map pages to just the image URLs
    brochurePages: pages.map((page) => page.image_url),
  };
};