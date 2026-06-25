import { SeriesRepository } from "../repositories/SeriesRepository";

export const SeriesService = {
  async getSeries(
    code: string
  ) {
    return await SeriesRepository.getByCode(
      code
    );
  },

  async getAllSeries() {
    return await SeriesRepository.getAll();
  },
};