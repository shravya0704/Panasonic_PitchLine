import jsPDF from "jspdf";

interface BrochureData {
  coverImage: string;
  brochurePages: string[];
}

/**
 * addBrochurePages
 * Appends brochure page images to the PDF
 * 
 * ENHANCED: Validates input and handles empty/missing brochure pages gracefully
 * Skips invalid pages with warnings instead of crashing
 * 
 * @param doc - jsPDF document instance
 * @param brochure - Brochure data with coverImage and brochurePages array
 * @throws Error if brochure object is null/undefined or coverImage is invalid
 */
export const addBrochurePages = (
  doc: jsPDF,
  brochure: BrochureData | null | undefined
): void => {
  // Validate brochure object
  if (!brochure) {
    throw new Error(
      "[addBrochurePages] Invalid brochure object: " +
      `Received ${brochure}`
    );
  }

  // Validate brochurePages array
  if (!Array.isArray(brochure.brochurePages)) {
    console.warn(
      "[addBrochurePages] brochurePages is not an array. " +
      `Received: ${typeof brochure.brochurePages}. Skipping brochure pages.`
    );
    return;
  }

  // If no brochure pages, log and return early
  if (brochure.brochurePages.length === 0) {
    console.info(
      "[addBrochurePages] No brochure pages to add. PDF will not include brochure section."
    );
    return;
  }

  // Process each brochure page
  brochure.brochurePages.forEach((page, index) => {
    // Validate individual page URL
    if (!page || typeof page !== "string" || page.trim() === "") {
      console.warn(
        `[addBrochurePages] Skipping invalid brochure page at index ${index}. ` +
        `Expected non-empty string, received: ${JSON.stringify(page)}`
      );
      return; // Skip this page, continue with others
    }

    try {
      doc.addPage();
      doc.addImage(
        page,
        "JPEG",
        0,
        0,
        210,
        297
      );
    } catch (error) {
      console.error(
        `[addBrochurePages] Failed to add brochure page ${index + 1}. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}. ` +
        `URL: ${page.substring(0, 100)}...`
      );
      // Continue with next page instead of crashing
    }
  });
};