import jsPDF from "jspdf";

interface BrochureData {
  coverImage: string;
  brochurePages: string[];
}

export const addBrochurePages = (
  doc: jsPDF,
  brochure: BrochureData
): void => {
  // Add ALL brochure pages from Supabase (starting with index 0)
  // The brochurePages array contains the actual marketing brochure pages
  // in order: page 1 (cover/intro), page 2, page 3, etc.
  brochure.brochurePages.forEach((page) => {
    doc.addPage();
    doc.addImage(
      page,
      "JPEG",
      0,
      0,
      210,
      297
    );
  });
};