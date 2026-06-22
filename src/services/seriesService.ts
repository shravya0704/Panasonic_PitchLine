import { SeriesRepository } from "../repositories/SeriesRepository";

export const SeriesService = {
  getSeries(
    id: string
  ) {
    return SeriesRepository.getById(id);
  },

  getAllSeries() {
    return SeriesRepository.getAll();
  },
};