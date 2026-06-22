export interface SeriesMetadata {
  id: string;
  name: string;

  coverImage: string;

  brochurePages: string[];
}

export const SERIES_METADATA: Record<
  string,
  SeriesMetadata
> = {
  PFP: {
    id: "PFP",

    name: "PFP Series",

    coverImage:
      "/brochures/pfp/0001.jpg",

    brochurePages: [
      "/brochures/pfp/0002.jpg",
      "/brochures/pfp/0003.jpg",
      "/brochures/pfp/0004.jpg",
      "/brochures/pfp/0005.jpg",
      "/brochures/pfp/0006.jpg",
      "/brochures/pfp/0007.jpg",
    ],
  },
};