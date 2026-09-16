import jsPDF from "jspdf";

interface BrochureData {
  coverImage: string;
  brochurePages: string[];
}

/**
 * addBrochurePages
 * 
 * Appends brochure page images to the PDF
 * 
 * CRITICAL FIX: Loads images from Supabase URLs as base64 before adding them
 * to the PDF. This prevents blank pages caused by jsPDF's inability to load
 * remote URLs asynchronously.
 * 
 * Why this is needed:
 * - jsPDF's doc.addImage() is synchronous
 * - Remote URLs require async fetch()
 * - Direct URL passing → CORS errors → blank pages
 * 
 * Solution:
 * - Fetch each URL as blob
 * - Convert blob to base64
 * - Pass base64 to addImage() → works reliably
 */
export const addBrochurePages = async (
  doc: jsPDF,
  brochure: BrochureData
): Promise<void> => {
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

  // Process each brochure page sequentially
  for (let i = 0; i < brochure.brochurePages.length; i++) {
    const pageUrl = brochure.brochurePages[i];

    // Validate individual page URL
    if (!pageUrl || typeof pageUrl !== "string" || pageUrl.trim() === "") {
      console.warn(
        `[addBrochurePages] Skipping invalid page at index ${i}. ` +
        `Expected non-empty string, received: ${JSON.stringify(pageUrl)}`
      );
      continue;
    }

    try {
      // CRITICAL: Fetch the image from Supabase and convert to base64
      console.log(`[addBrochurePages] Loading page ${i + 1}/${brochure.brochurePages.length} from ${pageUrl.substring(0, 60)}...`);
      
      const response = await fetch(pageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      // Add new page and insert the image
      doc.addPage();
      doc.addImage(
        base64,
        "JPEG",
        0,
        0,
        210,
        297
      );

      console.log(`[addBrochurePages] Page ${i + 1} added successfully`);
    } catch (error) {
      console.error(
        `[addBrochurePages] Failed to add page ${i + 1}. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      // Continue with next page instead of stopping
      // This ensures partial brochures still render
    }
  }

  console.log(`[addBrochurePages] Finished adding brochure pages`);
};

/**
 * Helper function to convert Blob to base64 string
 * @param blob - The Blob object (image data)
 * @returns Promise<string> - base64 encoded data URL
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = () => {
      reject(new Error("FileReader error"));
    };
    reader.readAsDataURL(blob);
  });
}