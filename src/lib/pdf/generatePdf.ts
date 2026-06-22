import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { getBrochureForModel } from "../../services/brochureService";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { drawCoverPage } from "./drawCoverPage";
import { drawMarketingCoverPage } from "./drawMarketingCoverPage";
import { addBrochurePages } from "./addBrochurePages";
import { drawScreenSpecsPage } from "./drawScreenSpecsPage";
import { drawProductSpecsPage } from "./drawProductSpecsPage";
import { drawPowerDiagramPage } from "./drawPowerDiagramPage";
import { drawDataDiagramPage } from "./drawDataDiagramPage";
import { calculatePowerFlow } from "../calculations/calculatePowerFlow";
import { assignPowerChains } from "../calculations/assignPowerChains";

export const generatePdf = async (
  product: Product,
  result: ConfigurationResult,
  width: number,
  height: number,
  screenPreviewImage?: string
): Promise<void> => {
  const doc = new jsPDF();
  const brochure = getBrochureForModel(
  product.model
);
if (!brochure) {
  throw new Error(
    `No brochure found for model: ${product.model}`
  );
}
// Page 1
// Page 1
drawMarketingCoverPage(
  doc,
  brochure.coverImage
);

// Page 2
doc.addPage();
drawCoverPage(
  doc,
  product
);
  // Page 3: Screen Configuration
  doc.addPage();
  drawScreenSpecsPage(
    doc,
    product,
  result,
  screenPreviewImage,
  width,
  height
);

  // Page 4: Product Specs Page
  doc.addPage();
  drawProductSpecsPage(doc, product);

  // Page 5: Power Diagram Page
  doc.addPage();
 const powerFlow = calculatePowerFlow(
  result.cabinetsH,
  16
);

const assignmentGrid =
  assignPowerChains(
    result.cabinetsW,
    result.cabinetsH,
    powerFlow.distribution
  );

drawPowerDiagramPage(
  doc,
  result,
  assignmentGrid
);

  // Page 6: Data Diagram Page
  doc.addPage();
  drawDataDiagramPage(
  doc,
  product,
  result
);
addBrochurePages(
  doc,
  brochure
);
  // Save PDF
  doc.save("Panasonic_LED_Configuration.pdf");
};
