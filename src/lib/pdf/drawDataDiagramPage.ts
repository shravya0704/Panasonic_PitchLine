import jsPDF from "jspdf";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { Product } from "../../types/Product";
import { calculateDataFlow } from "../calculations/calculateDataFlow";
import { assignDataChains } from "../calculations/assignDataChains";
import { DATA_RULES } from "../rules/DataRules";

const BASE_COLORS = [
  { fill: [191, 219, 254], line: [30, 64, 175] },
  { fill: [187, 247, 208], line: [21, 128, 61] },
  { fill: [254, 202, 202], line: [185, 28, 28] },
  { fill: [253, 230, 138], line: [161, 98, 7] },
  { fill: [233, 213, 255], line: [107, 33, 168] },
  { fill: [165, 243, 252], line: [14, 116, 144] },
  { fill: [254, 215, 170], line: [194, 65, 12] },
  { fill: [209, 250, 229], line: [6, 95, 70] },
];

function getColorForChain(chain: string) {
  const index = chain.charCodeAt(0) - 65;
  return BASE_COLORS[index % BASE_COLORS.length];
}

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
  doc.setFillColor(244, 247, 250); // Pastel slate-blue theme
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ==========================================
  // 2. PAGE TITLES
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165); // Panasonic Blue
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("DATA FLOW DIAGRAM", 15, 45);

  // Header Divider
  doc.setDrawColor(210);
  doc.line(15, 55, pageWidth - 15, 55);

  // ==========================================
  // 3. GRID CALCULATIONS
  // ==========================================
  const dataFlow = calculateDataFlow(
    product.cabinetResolutionW,
    product.cabinetResolutionH,
    result.cabinetsH
  );

  const assignmentGrid = assignDataChains(
    result.cabinetsW,
    result.cabinetsH,
    dataFlow.maxCabinetsPerCable
  );

  const rows = assignmentGrid.length;
  const cols = assignmentGrid[0].length;

  const availableWidth = 160;
  const availableHeight = 150;

  const cellSize = Math.min(
    availableWidth / cols,
    availableHeight / rows
  );

  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;

  // Center the grid horizontally
  const startX = (pageWidth - gridWidth) / 2;
  const startY = 70; // Shifted down to accommodate the enterprise header

  // ==========================================
  // 4. DRAW WHITE CARD CONTAINER
  // ==========================================
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
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const chain = assignmentGrid[row][col];
      const colors = getColorForChain(chain);
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      doc.setFillColor(colors.fill[0], colors.fill[1], colors.fill[2]);
      doc.setDrawColor(120, 120, 120);
      doc.rect(x, y, cellSize, cellSize, "FD");

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

  chainMap.forEach((points, chain) => {
    const colors = getColorForChain(chain);
    doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
    doc.setLineWidth(1.2); // Thicker line for cables

    points.sort((a, b) => a.row - b.row);

    const first = points[0];
    const last = points[points.length - 1];

    // Data cables are slightly offset (0.72) so they don't perfectly overlap power lines if drawn together
    const x = startX + first.col * cellSize + cellSize * 0.72;
    const y1 = startY + first.row * cellSize + cellSize / 2;
    const y2 = startY + last.row * cellSize + cellSize / 2;

    doc.line(x, y1, x, y2);

    doc.setFillColor(colors.line[0], colors.line[1], colors.line[2]);
    doc.circle(x, y1, 1.5, "F");
  });

  // ==========================================
  // RESET LINE THICKNESS FIX
  // ==========================================
  // Reset the paintbrush back to normal to protect the header and footer!
  doc.setLineWidth(0.2);

  // ==========================================
  // 7. DATA DISTRIBUTION RULES (Note format)
  // ==========================================
  // ==========================================
  // 7. DATA DISTRIBUTION RULES (Note format)
  // ==========================================
  const rulesY = startY + gridHeight + padding + 15;

  // Rule Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8); // Reduced from 9
  doc.setTextColor(0, 85, 165); // Panasonic Blue
  doc.text("NOTE: DATA DISTRIBUTION RULES", 15, rulesY);

  // Rule Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7); // Reduced from 8
  doc.setTextColor(100, 100, 100); // Changed to soft grey to match

  doc.text(
    `• LAN Cable Capacity: ${DATA_RULES.maxPixelsPerCable.toLocaleString()} pixels`,
    15,
    rulesY + 5 // Tightened spacing
  );

  doc.text(
    `• Maximum Cabinets Per Cable: ${dataFlow.maxCabinetsPerCable}`,
    15,
    rulesY + 9 // Tightened spacing
  );

  doc.text(
    `• ${DATA_RULES.note}`,
    15,
    rulesY + 13 // Tightened spacing
  );

  doc.text(
    `• ${DATA_RULES.routing}`,
    15,
    rulesY + 17 // Tightened spacing
  );
};