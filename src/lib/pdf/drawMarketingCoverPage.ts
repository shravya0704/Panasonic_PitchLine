import jsPDF from "jspdf";

export const drawMarketingCoverPage = (
  doc: jsPDF,
  coverImage: string
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