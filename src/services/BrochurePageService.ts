import { BrochureRepository }
from "../repositories/BrochureRepository";

export const BrochurePageService = {
  async getPages(
    seriesCode: string
  ) {
    return BrochureRepository.getPages(
      seriesCode
    );
  },
};