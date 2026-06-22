import { SERIES_METADATA } from "../data/seriesMetadata";

export const SeriesRepository = {
  getById(
    id: string
  ) {
    return SERIES_METADATA[id];
  },

  getAll() {
    return SERIES_METADATA;
  },
};