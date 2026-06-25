import { SeriesService } from "./seriesService";
import { BrochureRepository } from "../repositories/BrochureRepository";

export const getBrochureForSeries =
  async (
    seriesCode: string
  ) => {
    const series =
      await SeriesService.getSeries(
        seriesCode
      );

    const pages =
      await BrochureRepository.getPages(
        seriesCode
      );

    return {
      coverImage:
        series.cover_image,

      brochurePages:
        pages.map(
          (page) => page.image_url
        ),
    };
  };