import jsPDF from "jspdf";

/**
 * drawMarketingCoverPage
 * Adds the EDM/marketing cover image to the PDF
 * 
 * ENHANCED: Validates the coverImage URL before attempting to add it
 * Throws a descriptive error if the image is missing or invalid
 * 
 * @param doc - jsPDF document instance
 * @param coverImage - The EDM/cover image URL or base64 string
 * @throws Error if coverImage is null, undefined, or empty
 */
export const drawMarketingCoverPage = (
  doc: jsPDF,
  coverImage: string | null | undefined
): void => {
  // Validate that we have a valid image to work with
  if (!coverImage || typeof coverImage !== "string" || coverImage.trim() === "") {
    throw new Error(
      "[drawMarketingCoverPage] Invalid cover image: " +
      "coverImage must be a non-empty string (URL or base64). " +
      `Received: ${JSON.stringify(coverImage)}`
    );
  }

  try {
    doc.addImage(
      coverImage,
      "JPEG",
      0,
      0,
      210,
      297
    );
  } catch (error) {
    throw new Error(
      "[drawMarketingCoverPage] Failed to add cover image to PDF. " +
      `Error: ${error instanceof Error ? error.message : String(error)}. ` +
      `Image URL/data: ${coverImage.substring(0, 100)}...`
    );
  }
};