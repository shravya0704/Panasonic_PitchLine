import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { getBrochureForSeries } from "../../services/brochureService";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { applyGlobalPageTemplate } from "./addPdfFooter";
import { drawMarketingCoverPage } from "./drawMarketingCoverPage";
import { addBrochurePages } from "./addBrochurePages";
import { drawScreenSpecsPage } from "./drawScreenSpecsPage";
import { drawViewingDistancePage } from "./drawViewingDistancePage";
import { drawProductSpecsPage } from "./drawProductSpecsPage";
import { drawPowerDiagramPage } from "./drawPowerDiagramPage";
import { drawDataDiagramPage } from "./drawDataDiagramPage";
import { drawCurvePowerInfoPage } from "./drawCurvePowerInfoPage";
import { drawCurveDataInfoPage } from "./drawCurveDataInfoPage";
import { calculatePowerFlow } from "../calculations/calculatePowerFlow";
import { assignPowerChains } from "../calculations/assignPowerChains";
import { POWER_RULES } from "../rules/PowerRules";
import { drawProposalSummaryPage } from "./drawProposalSummaryPage";

import { panasonicLogoBase64 } from "../../assets/logoBase64";

export const generatePdf = async (
  product: Product,
  result: ConfigurationResult,
  width: number,
  height: number,
  screenPreviewImage?: string,
  viewingDistanceImage?: string,
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
  

  console.log("=== PDF Generation Started ===");
  console.log("Proposal Data:", proposalData);
  console.log("Proposal ID:", proposalId);
  console.log("Selected Product:", product);
  console.log("Series Code:", product.seriesCode);
  console.log("Series Type:", product.seriesType);

  // ========== BROCHURE FETCH WITH ERROR HANDLING ==========
  let brochure;
  try {
    brochure = await getBrochureForSeries(product.seriesCode);
    console.log(
      `[generatePdf] Brochure for ${product.seriesCode}: cover=${!!brochure.coverImage}, pages=${brochure.brochurePages.length}`
    );
  } catch (brochureError) {
    console.error(`[generatePdf] Failed to fetch brochure for ${product.seriesCode}:`, brochureError);
    throw new Error(
      `Cannot fetch brochure for series ${product.seriesCode}. ` +
      `Error: ${brochureError instanceof Error ? brochureError.message : String(brochureError)}`
    );
  }

  if (!brochure || !brochure.coverImage) {
    throw new Error(
      `[generatePdf] Invalid brochure for series ${product.seriesCode}. Missing coverImage.`
    );
  }

  // ========== AIO DETECTION ==========
  const isAIO = product.seriesType === "aio";

  // ========== AIO BRANCH ==========
  if (isAIO) {
    console.log("[generatePdf] AIO Series - using simplified PDF structure");

    drawMarketingCoverPage(doc, brochure.coverImage);
    await addBrochurePages(doc, brochure);

    if (proposalId) {
      const totalPages = doc.getNumberOfPages();
      doc.setPage(1);
      applyGlobalPageTemplate(doc, proposalId, 1, totalPages, panasonicLogoBase64);
    }

    const targetProject = proposalData?.projectName || "AIO-Display";
    const safeProjectName = targetProject.replace(/[\\/:*?"<>|]/g, "_");
    const finalFilename = `PitchLine_${product.seriesCode}_${safeProjectName}_${proposalId || "Proposal"}.pdf`;
    doc.save(finalFilename);
    console.log("[generatePdf] AIO PDF exported:", finalFilename);
    return;
  }

  // ========== STANDARD BRANCH ==========
  console.log("[generatePdf] Standard series - using full PDF structure");

  // Page 1: EDM Cover Page
  drawMarketingCoverPage(doc, brochure.coverImage);

  // Page 2: Proposal Summary
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

  // Page 4: Viewing Distance Analysis
  doc.addPage();
  await drawViewingDistancePage(doc, viewingDistanceImage);

  // Page 5: Product Specifications
  doc.addPage();
  await drawProductSpecsPage(doc, product);

  // Page 6: Power Diagram Page
  doc.addPage();
  if (product.applicationType === "Indoor (Curve Display)") {
    drawCurvePowerInfoPage(doc);
  } else {
    const maxCabinetsPerChain =
      product.applicationType === "Outdoor"
        ? POWER_RULES.outdoor.maxCabinetsPerChain
        : POWER_RULES.indoor.maxCabinetsPerChain;

    const powerFlow = calculatePowerFlow(result.cabinetsH, maxCabinetsPerChain);
    const assignmentGrid = assignPowerChains(
      result.cabinetsW,
      result.cabinetsH,
      powerFlow.distribution
    );
    drawPowerDiagramPage(doc, result, assignmentGrid);
  }

  // Page 7: Data Diagram Page
  doc.addPage();
  if (product.applicationType === "Indoor (Curve Display)") {
    drawCurveDataInfoPage(doc);
  } else {
    drawDataDiagramPage(doc, product, result);
  }

  // ========== APPEND BROCHURE PAGES ==========
  await addBrochurePages(doc, brochure);

  // ========== APPLY FOOTERS TO ENGINEERING PAGES (2-7) ==========
  // Now we know the final total page count
  if (proposalId) {
    const totalPages = doc.getNumberOfPages();
    console.log("STANDARD PDF TOTAL PAGES:", totalPages);
    
    // Pages 2-7 are engineering pages (get footer)
    // Pages 8+ are brochure pages (no footer)
    for (let i = 2; i <= 7; i++) {
      doc.setPage(i);
      applyGlobalPageTemplate(doc, proposalId, i, totalPages, panasonicLogoBase64);
    }
  }

  // ========== SAVE DOCUMENT ==========
  const targetProject = proposalData?.projectName || "Project";
  const safeProjectName = targetProject.replace(/[\\/:*?"<>|]/g, "_");
  const finalFilename = `PitchLine_${product.seriesCode || "LED"}_${safeProjectName}_${proposalId || "Proposal"}.pdf`;

  doc.save(finalFilename);
  console.log("[generatePdf] Standard PDF exported:", finalFilename);
  console.log("=== PDF Generation Completed ===");
};