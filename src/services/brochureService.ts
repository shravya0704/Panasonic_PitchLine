import { getSeriesFromModel }
from "../lib/helpers/getSeriesFromModel";

import { SeriesService }
from "./seriesService";

export const getBrochureForModel = (
  model: string
) => {
  const seriesCode =
    getSeriesFromModel(model);

  return SeriesService.getSeries(
    seriesCode
  );
};