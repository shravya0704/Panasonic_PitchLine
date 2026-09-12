import jsPDF from "jspdf";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { POWER_RULES } from "../rules/PowerRules";

/*
 * Power Flow Diagram Theme
 * ------------------------
 * This page intentionally uses a single monochrome engineering theme.
 * Colour identifies the engineering layer (Power), while the chain
 * labels (A, B, C...) identify individual power chains.
 */
const POWER_THEME = {
  fill: [245, 245, 245],
  line: [0, 0, 0],
  border: [180, 180, 180],
};

function getPowerTheme() {
  return POWER_THEME;
}

/*
 * Generates the Power Flow Diagram page for the proposal PDF.
 *
 * Responsibilities:
 * - Render the cabinet layout received from the power assignment logic.
 * - Draw vertical power cable paths.
 * - Display the engineering assumptions used for power distribution.
 *
 * NOTE:
 * This file performs no power-routing calculations.
 * It only renders the assignmentGrid supplied by upstream business logic.
 * 
 * ✅ CHANGE: Removed thick borders around diagram to match Data Flow page
 * Only header divider line remains (consistent with all pages)
 */
export const drawPowerDiagramPage = (
  doc: jsPDF,
  result: ConfigurationResult,
  assignmentGrid: string[][]
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Global page background
  doc.setFillColor(244, 247, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Page header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165);
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("POWER FLOW DIAGRAM", 15, 45);

  // ✅ CHANGE: Keep only the header divider line (consistent with all pages)
  doc.setDrawColor(210);
  doc.line(15, 55, pageWidth - 15, 55);

  // 3. Calculate printable grid dimensions.
  const rows = assignmentGrid.length;
  const cols = assignmentGrid[0].length;

  const availableWidth = 160;
  const availableHeight = 150;

  const cellSize = Math.min(availableWidth / cols, availableHeight / rows);

  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;

  const startX = (pageWidth - gridWidth) / 2;
  const startY = 70;

  // ✅ CHANGE: REMOVED the white card container with borders
  // The diagram now renders without a surrounding box
  // This matches the Data Flow Diagram page styling

  // 4. Draw cabinets.
  // Every cabinet uses the same light grey fill.
  // Chain letters distinguish different power chains.
  const theme = getPowerTheme();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const chain = assignmentGrid[row][col];
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      doc.setFillColor(theme.fill[0], theme.fill[1], theme.fill[2]);
      doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
      doc.rect(x, y, cellSize, cellSize, "FD");

      if (cellSize > 7) {
        doc.setTextColor(theme.line[0], theme.line[1], theme.line[2]);
        doc.setFontSize(7);
        doc.text(chain, x + 1.5, y + 4);
      }
    }
  }

  // 5. Build a lookup of cabinets belonging to each power chain.
  const chainMap = new Map<string, { row: number; col: number }[]>();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const chain = assignmentGrid[row][col];
      if (!chainMap.has(chain)) chainMap.set(chain, []);
      chainMap.get(chain)!.push({ row, col });
    }
  }

  // Draw one continuous vertical power cable per chain.
  // Unlike the Data Flow Diagram, the cable is centred because this page
  // represents the actual power path.
  chainMap.forEach((points) => {
    doc.setDrawColor(theme.line[0], theme.line[1], theme.line[2]);
    doc.setLineWidth(1.2);

    points.sort((a, b) => a.row - b.row);

    const first = points[0];
    const last = points[points.length - 1];

    const x = startX + first.col * cellSize + cellSize / 2;
    const y1 = startY + first.row * cellSize + cellSize / 2;
    const y2 = startY + last.row * cellSize + cellSize / 2;

    doc.line(x, y1, x, y2);

    // Filled circle indicates the power feed entry point.
    doc.setFillColor(theme.line[0], theme.line[1], theme.line[2]);
    doc.circle(x, y1, 1.5, "F");
  });

  // Reset drawing state so later PDF pages are unaffected.
  doc.setLineWidth(0.2);

  // 6. Engineering notes.
  const rulesY = startY + gridHeight + 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 85, 165);
  doc.text("NOTE: POWER DISTRIBUTION RULES", 15, rulesY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);

  doc.text(
    `• Indoor Layouts: Maximum of ${POWER_RULES.indoor.maxCabinetsPerChain} cabinets per chain | ${POWER_RULES.indoor.voltage}V | ${POWER_RULES.indoor.cable}`,
    15,
    rulesY + 5
  );

  doc.text(
    `• Outdoor Layouts: Maximum of ${POWER_RULES.outdoor.maxCabinetsPerChain} cabinets per chain | ${POWER_RULES.outdoor.voltage}V | ${POWER_RULES.outdoor.cable}`,
    15,
    rulesY + 9
  );
};