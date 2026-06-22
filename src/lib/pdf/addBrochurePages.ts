import jsPDF from "jspdf";

interface BrochureData {
  coverImage: string;
  brochurePages: string[];
}

export const addBrochurePages = (
  doc: jsPDF,
  brochure: BrochureData
): void => {
  brochure.brochurePages.forEach(
    (page) => {
      doc.addPage();

      doc.addImage(
        page,
        "JPEG",
        0,
        0,
        210,
        297
      );
    }
  );
};