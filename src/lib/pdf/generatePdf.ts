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

/**
 * AIO DETECTION: Uses product.seriesType === "aio" (now populated from series.type column)
 * AIO products get simplified PDF: EDM + Brochure only
 * Standard products get full: EDM + Proposal + Engineering pages + Brochure
 */
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

  console.log("Proposal Data:", proposalData);
  console.log("Proposal ID:", proposalId);
  console.log("Selected Product:", product);
  console.log("Series Code:", product.seriesCode);
  console.log("Series Type:", product.seriesType);

  const brochure = await getBrochureForSeries(product.seriesCode);

  // ========== AIO DETECTION ==========
  const isAIO = product.seriesType === "aio";

  // ========== AIO BRANCH ==========
  if (isAIO) {
    // AIO: Simplified PDF structure (EDM + Brochure only)
    // Page 1: EDM Cover
    drawMarketingCoverPage(doc, brochure.coverImage);

    // Pages 2+: Brochure pages (contains all marketing + specs)
    addBrochurePages(doc, brochure);

    // Optionally apply footer to EDM only (minimal branding)
    if (proposalId) {
      const totalPages = doc.getNumberOfPages();
      console.log("AIO PDF TOTAL PAGES:", totalPages);
      
      // Only stamp page 1 (EDM) with footer
      doc.setPage(1);
      applyGlobalPageTemplate(
        doc,
        proposalId,
        1,
        totalPages,
        panasonicLogoBase64
      );
    }

    // Save with AIO-specific filename
    const targetProject = proposalData?.projectName || "AIO-Display";
    const safeProjectName = targetProject.replace(/[\\/:*?"<>|]/g, "_");
    const finalFilename = `PitchLine_${product.seriesCode}_${safeProjectName}_${proposalId || "Proposal"}.pdf`;
    doc.save(finalFilename);
    return; // Exit early for AIO
  }

  // ========== STANDARD BRANCH (Non-AIO) ==========
  // Page 1: EDM Cover Page
  drawMarketingCoverPage(doc, brochure.coverImage);

  // Page 2: Proposal Summary
  doc.addPage();
  if (proposalData && proposalId) {
        drawProposalSummaryPage(
      doc,
      product,
      result,
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
  await drawViewingDistancePage(
    doc,
    viewingDistanceImage
  );

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

    const powerFlow = calculatePowerFlow(
      result.cabinetsH,
      maxCabinetsPerChain
    );

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

  // Append Brochure pages at the very end
  addBrochurePages(doc, brochure);

  // Stamp Document Footers across engineering pages only (pages 2-7)
  if (proposalId) {
    const totalPages = doc.getNumberOfPages();
    console.log("STANDARD PDF TOTAL PAGES:", totalPages);

    // Pages 2-7: Engineering pages get footer
    // Pages 8+: Brochure pages (no footer)
    for (let i = 2; i <= 7; i++) {
      doc.setPage(i);
      applyGlobalPageTemplate(
        doc,
        proposalId,
        i,
        totalPages,
        panasonicLogoBase64
      );
    }
  }

  // Construct final filename
  const targetProject = proposalData?.projectName || "Project";
  const safeProjectName = targetProject.replace(/[\\/:*?"<>|]/g, "_");
  const finalFilename = `PitchLine_${product.seriesCode || "LED"}_${safeProjectName}_${proposalId || "Proposal"}.pdf`;

  // Save Document Binary
  doc.save(finalFilename);
};