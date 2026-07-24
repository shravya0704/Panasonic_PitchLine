import * as pdfjsLib from "pdfjs-dist";

// Set the worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ConvertPdfToImagesResult {
  pages: string[]; // Array of base64 JPEG strings
  pageCount: number;
}

/**
 * Convert PDF file to array of base64 JPEG images
 * Renders each page at 150 DPI (scale = 2.0)
 *
 * @param pdfFile - The PDF File object to convert
 * @param onProgress - Optional callback for progress tracking (current, total)
 * @returns Object with pages array (base64 JPEGs) and page count
 * @throws Error if PDF is invalid, rendering fails, or timeout occurs
 */
export const convertPdfToImages = async (
  pdfFile: File,
  onProgress?: (current: number, total: number) => void
): Promise<ConvertPdfToImagesResult> => {
  // Validate file type
  if (pdfFile.type !== "application/pdf") {
    throw new Error("Invalid file format. Please upload a PDF.");
  }

  // Validate file size (100MB limit)
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
  if (pdfFile.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 100MB limit.");
  }

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();

    // Set timeout for conversion (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("PDF conversion took too long. Please try a smaller file.")),
        30000
      )
    );

    // Load PDF document
    const pdfDoc = await Promise.race([
      pdfjsLib.getDocument({ data: arrayBuffer }).promise,
      timeoutPromise,
    ]);

    const pageCount = pdfDoc.numPages;
    const pages: string[] = [];

    // Render each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);

      // Get page dimensions and set rendering scale (150 DPI = scale 2.0)
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(`Failed to get canvas context for page ${pageNum}`);
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Convert canvas to base64 JPEG
      const base64Jpeg = canvas.toDataURL("image/jpeg", 0.95);
      pages.push(base64Jpeg);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(pageNum, pageCount);
      }
    }

    return {
      pages,
      pageCount,
    };
  } catch (error) {
    // Handle known PDF errors
    if (error instanceof Error) {
      if (error.message.includes("conversion took too long")) {
        throw error;
      }
      if (error.message.includes("Invalid")) {
        throw error;
      }
      throw new Error(`Failed to render PDF: ${error.message}`);
    }

    throw new Error("Failed to process PDF file");
  }
};