import {
  SERIES_METADATA,
  SeriesMetadata,
} from "../data/seriesMetadata";

export const getSeriesMetadata = (
  seriesId: string
): SeriesMetadata | undefined => {
  return SERIES_METADATA[
    seriesId
  ];
};