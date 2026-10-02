import jsPDF from "jspdf";

interface BrochureData {
  coverImage: string;
  brochurePages: string[];
}

export const addBrochurePages = (
  doc: jsPDF,
  brochure: BrochureData
): void => {
  // Validate brochure object
  if (!brochure) {
    throw new Error("[addBrochurePages] Invalid brochure object");
  }

  // Validate brochurePages array
  if (!Array.isArray(brochure.brochurePages)) {
    console.warn(
      "[addBrochurePages] brochurePages is not an array. " +
      `Received: ${typeof brochure.brochurePages}. Skipping brochure pages.`
    );
    return;
  }

  // If no brochure pages, exit early
  if (brochure.brochurePages.length === 0) {
    console.info("[addBrochurePages] No brochure pages to add.");
    return;
  }

  console.log(`[addBrochurePages] Adding ${brochure.brochurePages.length} brochure pages...`);

  brochure.brochurePages.forEach((pageData, index) => {
    try {
      if (!pageData || typeof pageData !== "string") {
        console.warn(`[addBrochurePages] Skipping invalid page at index ${index}`);
        return;
      }

      doc.addPage();
      doc.addImage(pageData, "JPEG", 0, 0, 210, 297);

      console.log(`[addBrochurePages] Page ${index + 1} added successfully`);
    } catch (error) {
      console.error(`[addBrochurePages] Failed to add page ${index + 1}:`, error);
    }
  });

  console.log(`[addBrochurePages] Finished adding brochure pages`);
};