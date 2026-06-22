import { SeriesMetadata } from "../types/SeriesMetadata";

import pfpCover from "../assets/brochures/pfp/0001.jpg";

import pfpPage2 from "../assets/brochures/pfp/0002.jpg";
import pfpPage3 from "../assets/brochures/pfp/0003.jpg";
import pfpPage4 from "../assets/brochures/pfp/0004.jpg";
import pfpPage5 from "../assets/brochures/pfp/0005.jpg";
import pfpPage6 from "../assets/brochures/pfp/0006.jpg";
import pfpPage7 from "../assets/brochures/pfp/0007.jpg";

export const SERIES_METADATA: Record<
  string,
  SeriesMetadata
> = {
  PFP: {
    id: "PFP",

    name: "PFP Series",

    coverImage: pfpCover,

    brochurePages: [
      pfpPage2,
      pfpPage3,
      pfpPage4,
      pfpPage5,
      pfpPage6,
      pfpPage7,
    ],
  },
};