import { BrochureRepository }
from "../repositories/BrochureRepository";

/**
 * Service layer responsible for retrieving marketing and brochure assets.
 * * WHY THIS EXISTS: Because V1 does not support UI-based brochure extraction, 
 * the database maintainer manually uploads these assets. This service bridges 
 * that gap, fetching the pre-linked brochure images from the database so the 
 * PDF orchestrator can append them to the final client proposal.
 */
export const BrochurePageService = {
  /**
   * Fetches the specific brochure pages associated with a product's series.
   *
   * @param {string} seriesCode - The unique identifier for the product series, used to locate the correct marketing assets.
   * @returns {Promise<any>} A promise resolving to the brochure page data required by the PDF generator.
   */
  async getPages(
    seriesCode: string
  ) {
    return BrochureRepository.getPages(
      seriesCode
    );
  },
};