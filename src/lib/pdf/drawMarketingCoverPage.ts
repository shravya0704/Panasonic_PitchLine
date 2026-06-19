import jsPDF from "jspdf";

import coverImage from "../../assets/brochures/pfp/0001.jpg";

export const drawMarketingCoverPage = (
  doc: jsPDF
): void => {
  doc.addImage(
    coverImage,
    "JPEG",
    0,
    0,
    210,
    297
  );
};