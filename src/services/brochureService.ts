import { getSeriesFromModel } from "../lib/helpers/getSeriesFromModel";

import { getSeriesMetadata } from "./seriesService";

export const getBrochureForModel = (
  model: string
) => {
  const series =
    getSeriesFromModel(model);

  return getSeriesMetadata(series);
};