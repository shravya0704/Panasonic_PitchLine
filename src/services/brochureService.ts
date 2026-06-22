import { getSeriesFromModel } from "../lib/helpers/getSeriesFromModel";

import { SeriesService } from "./seriesService";

export const getBrochureForModel = (
  model: string
) => {
  const series =
    getSeriesFromModel(model);

  return SeriesService.getSeries(
    series
  );
};