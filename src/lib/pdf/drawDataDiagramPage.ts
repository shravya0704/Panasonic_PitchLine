import jsPDF from "jspdf";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { Product } from "../../types/Product";
import { calculateDataFlow } from "../calculations/calculateDataFlow";
import { assignDataChains } from "../calculations/assignDataChains";
import { DATA_RULES } from "../rules/DataRules";

function getColorForChain(chain: string) {
  return {
    fill: [254, 242, 242],
    line: [185, 28, 28],
  };
}

/*
 * Generates the "Data Flow Diagram" page inside the proposal PDF.
 *
 * Purpose of this page:
 * ---------------------
 * This diagram gives installers and system integrators a visual
 * representation of how LED cabinets should be grouped into LAN/Data
 * chains based on Panasonic's supported pixel limitations.
 *
 * NOTE:
 * This file is responsible ONLY for rendering the PDF.
 * All engineering calculations are delegated to calculation helpers
 * (calculateDataFlow and assignDataChains).
 */
export const drawDataDiagramPage = (
  doc: jsPDF,
  product: Product,
  result: ConfigurationResult
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // 1. GLOBAL PAGE BACKGROUND
  // ==========================================
  doc.setFillColor(244, 247, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ==========================================
  // 2. PAGE TITLES (matching Power Flow Diagram structure)
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165);
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("DATA FLOW DIAGRAM", 15, 45);

  // Visual separator between header and page content.
  doc.setDrawColor(210);
  doc.line(15, 55, pageWidth - 15, 55);

  // ==========================================
  // 3. GRID CALCULATIONS
  // ==========================================

  /*
   * Step 1:
   * Determine the maximum number of cabinets that a single LAN/data
   * cable can safely support based on cabinet resolution.
   *
   * This calculation uses Panasonic's engineering rules and maximum
   * pixels per cable limitations.
   */
  const dataFlow = calculateDataFlow(
    product.cabinetResolutionW,
    product.cabinetResolutionH,
    result.cabinetsH
  );

  /*
   * Step 2:
   * Distribute all cabinets into logical data chains
   * (A, B, C, D...) while respecting the calculated cabinet limit.
   *
   * This function contains the routing/business logic.
   * This file simply visualises the returned assignment.
   */
  const assignmentGrid = assignDataChains(
    result.cabinetsW,
    result.cabinetsH,
    dataFlow.maxCabinetsPerCable
  );

  const rows = assignmentGrid.length;
  const cols = assignmentGrid[0].length;

  /*
   * Dynamically scale the cabinet grid so that it always fits
   * inside the printable area regardless of screen dimensions.
   */
  const availableWidth = 160;
  const availableHeight = 150;

  const cellSize = Math.min(
    availableWidth / cols,
    availableHeight / rows
  );

  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;

  // Centre the cabinet layout horizontally.
  const startX = (pageWidth - gridWidth) / 2;

  // Fixed top offset below the PDF header.
  const startY = 70;

  // ==========================================
  // 4. DRAW WHITE CARD CONTAINER
  // ==========================================
  /*
   * Draw a white rounded rectangle behind the cabinet grid.
   * This improves readability by separating the diagram from
   * the page background.
   */
  const padding = 10;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(
    startX - padding,
    startY - padding,
    gridWidth + (padding * 2),
    gridHeight + (padding * 2),
    2,
    2,
    "FD"
  );

  // ==========================================
  // 5. DRAW CABINETS
  // ==========================================
  /*
   * Draw every LED cabinet as a coloured square.
   *
   * The cabinet colour indicates which LAN/data chain it belongs to.
   * When space permits, the chain identifier (A, B, C...) is also
   * rendered inside each cabinet.
   */
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const chain = assignmentGrid[row][col];
      const colors = getColorForChain(chain);
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      doc.setFillColor(colors.fill[0], colors.fill[1], colors.fill[2]);
      doc.setDrawColor(180, 180, 180);
      doc.rect(x, y, cellSize, cellSize, "FD");

      // Avoid rendering labels when cabinets become too small.
      if (cellSize > 7) {
        doc.setTextColor(colors.line[0], colors.line[1], colors.line[2]);
        doc.setFontSize(7);
        doc.text(chain, x + 1.5, y + 4);
      }
    }
  }

  // ==========================================
  // 6. DRAW DATA CABLES
  // ==========================================
  /*
   * Group every cabinet by its assigned chain.
   *
   * Example:
   * A -> [(0,0), (1,0), (2,0)]
   * B -> [(0,1), (1,1), (2,1)]
   *
   * This grouped structure makes it easy to draw one cable
   * for each data chain.
   */
  const chainMap = new Map<string, { row: number; col: number }[]>();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const chain = assignmentGrid[row][col];
      if (!chainMap.has(chain)) {
        chainMap.set(chain, []);
      }
      chainMap.get(chain)!.push({ row, col });
    }
  }

  /*
   * Draw a coloured vertical data cable for every chain.
   *
   * Rather than drawing between every cabinet individually,
   * a single continuous cable is drawn from the first cabinet
   * in the chain to the last.
   */
  chainMap.forEach((points, chain) => {
    const colors = getColorForChain(chain);
    doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
    doc.setLineWidth(1.2);

    // Ensure cabinets are processed from top to bottom.
    points.sort((a, b) => a.row - b.row);

    const first = points[0];
    const last = points[points.length - 1];

    /*
     * The cable is intentionally shifted horizontally so that
     * if a Power Diagram is viewed alongside this page, the
     * data cable does not visually overlap the power cable.
     */
    const x = startX + first.col * cellSize + cellSize * 0.72;
    const y1 = startY + first.row * cellSize + cellSize / 2;
    const y2 = startY + last.row * cellSize + cellSize / 2;

    doc.line(x, y1, x, y2);

    // Small filled circle indicating cable entry point.
    doc.setFillColor(colors.line[0], colors.line[1], colors.line[2]);
    doc.circle(x, y1, 1.5, "F");
  });

  // ==========================================
  // RESET LINE THICKNESS FIX
  // ==========================================
  /*
   * jsPDF retains drawing state.
   * Reset the line width so subsequent PDF pages don't inherit
   * the thicker cable line styling.
   */
  doc.setLineWidth(0.2);

  // ==========================================
  // 7. DATA DISTRIBUTION RULES (Note format)
  // ==========================================
  /*
   * Display the engineering assumptions used while generating
   * this diagram.
   *
   * The values shown here come directly from the shared
   * DATA_RULES configuration and the calculated data flow,
   * ensuring the PDF remains consistent with the business logic.
   */
  const rulesY = startY + gridHeight + padding + 15;

  // Rule Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 85, 165);
  doc.text("NOTE: DATA DISTRIBUTION RULES", 15, rulesY);

  // Rule Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);

  doc.text(
    `• LAN Cable Capacity: ${DATA_RULES.maxPixelsPerCable.toLocaleString()} pixels`,
    15,
    rulesY + 5
  );

  doc.text(
    `• Maximum Cabinets Per Cable: ${dataFlow.maxCabinetsPerCable}`,
    15,
    rulesY + 9
  );

  doc.text(
    `• ${DATA_RULES.note}`,
    15,
    rulesY + 13
  );

  doc.text(
    `• ${DATA_RULES.routing}`,
    15,
    rulesY + 17
  );
};