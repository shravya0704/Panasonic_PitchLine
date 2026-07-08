import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { getBrochureForSeries } from "../../services/brochureService";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { applyGlobalPageTemplate } from "./addPdfFooter"; 
import { drawMarketingCoverPage } from "./drawMarketingCoverPage";
import { addBrochurePages } from "./addBrochurePages";
import { drawScreenSpecsPage } from "./drawScreenSpecsPage";
import { drawProductSpecsPage } from "./drawProductSpecsPage";
import { drawPowerDiagramPage } from "./drawPowerDiagramPage";
import { drawDataDiagramPage } from "./drawDataDiagramPage";
import { calculatePowerFlow } from "../calculations/calculatePowerFlow";
import { assignPowerChains } from "../calculations/assignPowerChains";
import { drawProposalSummaryPage } from "./drawProposalSummaryPage";

// IMPORT THE HARDCODED BASE64 STRING
// WHY BASE64: jsPDF requires images to be in base64 format for embedding. 
// Importing a pre-converted string completely bypasses asynchronous canvas loading issues 
// and CORS restrictions that often cause PDF generators to crash or render blank images.
import { panasonicLogoBase64 } from "../../assets/logoBase64";

/**
 * The master orchestrator for generating the final client-facing PDF proposal.
 * It linearly constructs the document page by page, integrating dynamic configuration 
 * data, visual previews, complex engineering diagrams, and static marketing assets.
 *
 * @param {Product} product - The configured LED product model.
 * @param {ConfigurationResult} result - The mathematical and physical output from the configuration engine.
 * @param {number} width - The requested screen width.
 * @param {number} height - The requested screen height.
 * @param {string} [screenPreviewImage] - The base64 UI screenshot captured via html2canvas.
 * @param {object} [proposalData] - Customer and project details from the export modal.
 * @param {string} [proposalId] - The unique system-generated identifier for the proposal.
 * @param {"mtr" | "ft"} [unit="mtr"] - The measurement system selected by the user, defaults to meters.
 * @returns {Promise<void>} A promise that resolves when the browser triggers the file download.
 */
export const generatePdf = async (
  product: Product,
  result: ConfigurationResult,
  width: number,
  height: number,
  screenPreviewImage?: string,
  proposalData?: {
    projectName: string;
    customerName: string;
    companyName: string;
    email: string;
  },
  proposalId?: string,
  unit: "mtr" | "ft" = "mtr" 
): Promise<void> => {
  const doc = new jsPDF();

  console.log("Proposal Data:", proposalData);
  console.log("Proposal ID:", proposalId);
  console.log("Selected Product:", product);
  console.log("Series Code:", product.seriesCode);

  const brochure = await getBrochureForSeries(product.seriesCode);

  // Page 1: Cover Page
  drawMarketingCoverPage(doc, brochure.coverImage);

  // Page 2: Proposal Summary
  // We explicitly check for proposal data here because an admin might generate a "quick PDF" 
  // without filling out the formal client lead capture form.
  doc.addPage();
  if (proposalData && proposalId) {
    drawProposalSummaryPage(
      doc,
      product,
      proposalData,
      proposalId
    );
  }

  // Page 3: Screen Configuration
  doc.addPage();
  drawScreenSpecsPage(
    doc,
    product,
    result,
    screenPreviewImage,
    width,
    height,
    unit
  );

  // Page 4: Product Specs Page
  doc.addPage();
  await drawProductSpecsPage(doc, product);

  // Page 5: Power Diagram Page
  doc.addPage();
  // We calculate the power flow dynamically right before drawing the page. 
  // This abstracts the heavy math out of the drawing function, keeping the PDF builders strictly focused on layout.
  const powerFlow = calculatePowerFlow(result.cabinetsH, 16);
  const assignmentGrid = assignPowerChains(
    result.cabinetsW,
    result.cabinetsH,
    powerFlow.distribution
  );
  drawPowerDiagramPage(doc, result, assignmentGrid);

  // Page 6: Data Diagram Page
  doc.addPage();
  drawDataDiagramPage(doc, product, result);

  // Append Brochure context pages at the very end
  addBrochurePages(doc, brochure);

  // Stamp Document Footers across pages sequentially
  if (proposalId) {
    const totalPages = doc.getNumberOfPages();
    console.log("TOTAL PDF PAGES:", totalPages);

    // WHY LOOP FROM 2 TO 7?
    // We start at i=2 because Page 1 is a full-bleed marketing cover (we don't want a footer ruining the graphic).
    // We cap it at i<=7 to apply footers only to the core engineering pages. 
    // We intentionally stop before the appended brochure pages, as marketing assets already have their own design layouts.
    // Pass the base64 string directly to the template
    for (let i = 2; i <= 7; i++) {
      doc.setPage(i);
      applyGlobalPageTemplate(
        doc,
        proposalId,
        i,
        totalPages,
        panasonicLogoBase64 // <-- Using the string here!
      );
    }
  }

  // Fallback chain focusing primarily on Project Name
  const targetProject = proposalData?.projectName || "Project";

  // Sanitize illegal operating system characters to prevent crash-on-save
  // WHY REGEX: Users might type project names like "Lobby A/B" or "Date: 10/12". 
  // Characters like / \ : * ? " < > | are completely illegal in Windows and macOS file systems. 
  // If we don't swap them for underscores, the browser's download manager will silently fail or crash.
  const safeProjectName = targetProject.replace(/[\\/:*?"<>|]/g, "_");

  // Construct final engineered filename assembly
  const finalFilename = `PitchLine_${product.seriesCode || "LED"}_${safeProjectName}_${proposalId || "Proposal"}.pdf`;

  // Save Document Binary
  doc.save(finalFilename);
};