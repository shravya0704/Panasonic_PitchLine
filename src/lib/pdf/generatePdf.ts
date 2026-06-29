import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { getBrochureForSeries } from "../../services/brochureService";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { addPdfFooter } from "./addPdfFooter";
import { drawMarketingCoverPage } from "./drawMarketingCoverPage";
import { addBrochurePages } from "./addBrochurePages";
import { drawScreenSpecsPage } from "./drawScreenSpecsPage";
import { drawProductSpecsPage } from "./drawProductSpecsPage";
import { drawPowerDiagramPage } from "./drawPowerDiagramPage";
import { drawDataDiagramPage } from "./drawDataDiagramPage";
import { calculatePowerFlow } from "../calculations/calculatePowerFlow";
import { assignPowerChains } from "../calculations/assignPowerChains";
import { drawProposalSummaryPage } from "./drawProposalSummaryPage";

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
  proposalId?: string
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
  doc.addPage();
  if (proposalData && proposalId) {
    drawProposalSummaryPage(
      doc,
      product,
      proposalData,
      proposalId
    );
  }

  // Page 4: Screen Configuration (Spares are removed here, Power/Heat added here)
  doc.addPage();
  drawScreenSpecsPage(
    doc,
    product,
    result,
    screenPreviewImage,
    width,
    height
  );

  // Page 5: Product Specs Page
  doc.addPage();
  await drawProductSpecsPage(doc, product);

  // Page 6: Power Diagram Page
  doc.addPage();
  const powerFlow = calculatePowerFlow(result.cabinetsH, 16);
  const assignmentGrid = assignPowerChains(
    result.cabinetsW,
    result.cabinetsH,
    powerFlow.distribution
  );
  drawPowerDiagramPage(doc, result, assignmentGrid);

  // Page 7: Data Diagram Page
  doc.addPage();
  drawDataDiagramPage(doc, product, result);

  // Append Brochure context pages
  addBrochurePages(doc, brochure);

  // Stamp Document Footers across pages sequentially
  if (proposalId) {
    const totalPages = doc.getNumberOfPages();
    console.log("TOTAL PDF PAGES:", totalPages);

    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      addPdfFooter(
        doc,
        proposalId,
        i,
        totalPages
      );
    }
  }

  // Save Document Binary
  doc.save(
    `PitchLine_${proposalId}.pdf`
);
};