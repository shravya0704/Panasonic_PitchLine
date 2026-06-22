import { SERIES_METADATA } from "../data/seriesMetadata";

export const getSeriesMetadata = (
  seriesId: string
) => {
  return SERIES_METADATA[seriesId];
};