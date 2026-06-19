import jsPDF from "jspdf";
import { ConfigurationResult } from "../../types/ConfigurationResult";
import { Product } from "../../types/Product";
import { calculateDataFlow } from "../calculations/calculateDataFlow";
import { assignDataChains } from "../calculations/assignDataChains";
import { DATA_RULES } from "../rules/DataRules";

const BASE_COLORS = [
  {
    fill: [191, 219, 254],
    line: [30, 64, 175],
  },
  {
    fill: [187, 247, 208],
    line: [21, 128, 61],
  },
  {
    fill: [254, 202, 202],
    line: [185, 28, 28],
  },
  {
    fill: [253, 230, 138],
    line: [161, 98, 7],
  },
  {
    fill: [233, 213, 255],
    line: [107, 33, 168],
  },
  {
    fill: [165, 243, 252],
    line: [14, 116, 144],
  },
  {
    fill: [254, 215, 170],
    line: [194, 65, 12],
  },
  {
    fill: [209, 250, 229],
    line: [6, 95, 70],
  },
];

function getColorForChain(
  chain: string
) {
  const index =
    chain.charCodeAt(0) - 65;

  return BASE_COLORS[
    index % BASE_COLORS.length
  ];
}

export const drawDataDiagramPage = (
  doc: jsPDF,
  product: Product,
  result: ConfigurationResult
): void => {
  doc.setFontSize(20);

  doc.text(
    "Data Flow Diagram",
    20,
    20
  );

  const dataFlow =
    calculateDataFlow(
      product.cabinetResolutionW,
      product.cabinetResolutionH,
      result.cabinetsH
    );

  const assignmentGrid =
    assignDataChains(
      result.cabinetsW,
      result.cabinetsH,
      dataFlow.maxCabinetsPerCable
    );

  const rows =
    assignmentGrid.length;

  const cols =
    assignmentGrid[0].length;

  const availableWidth = 160;
  const availableHeight = 150;

  const cellSize = Math.min(
    availableWidth / cols,
    availableHeight / rows
  );

  const gridWidth =
    cols * cellSize;

  const gridHeight =
    rows * cellSize;

  const startX =
    (doc.internal.pageSize.getWidth() -
      gridWidth) /
    2;

  const startY = 40;

  // -----------------------------
  // CABINETS
  // -----------------------------

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const chain =
        assignmentGrid[row][col];

      const colors =
        getColorForChain(chain);

      const x =
        startX +
        col * cellSize;

      const y =
        startY +
        row * cellSize;

      doc.setFillColor(
        colors.fill[0],
        colors.fill[1],
        colors.fill[2]
      );

      doc.setDrawColor(
        120,
        120,
        120
      );

      doc.rect(
        x,
        y,
        cellSize,
        cellSize,
        "FD"
      );

      if (cellSize > 7) {
        doc.setTextColor(
          colors.line[0],
          colors.line[1],
          colors.line[2]
        );

        doc.setFontSize(7);

        doc.text(
          chain,
          x + 1.5,
          y + 4
        );
      }
    }
  }

  // -----------------------------
  // DATA LINES
  // -----------------------------

  const chainMap = new Map<
    string,
    {
      row: number;
      col: number;
    }[]
  >();

  for (let row = 0; row < rows; row++) {
    for (
      let col = 0;
      col < cols;
      col++
    ) {
      const chain =
        assignmentGrid[row][col];

      if (
        !chainMap.has(chain)
      ) {
        chainMap.set(
          chain,
          []
        );
      }

      chainMap.get(chain)!.push({
        row,
        col,
      });
    }
  }

  chainMap.forEach(
    (points, chain) => {
      const colors =
        getColorForChain(chain);

      doc.setDrawColor(
        colors.line[0],
        colors.line[1],
        colors.line[2]
      );

      doc.setLineWidth(1.2);

      points.sort(
        (a, b) =>
          a.row - b.row
      );

      const first =
        points[0];

      const last =
        points[
          points.length - 1
        ];

      const x =
        startX +
        first.col *
          cellSize +
        cellSize * 0.72;

      const y1 =
        startY +
        first.row *
          cellSize +
        cellSize / 2;

      const y2 =
        startY +
        last.row *
          cellSize +
        cellSize / 2;

      doc.line(
        x,
        y1,
        x,
        y2
      );
    }
  );

  // -----------------------------
  // RULES
  // -----------------------------

  const rulesY =
    startY +
    gridHeight +
    15;

  doc.setTextColor(
    0,
    0,
    0
  );

  doc.setFontSize(12);

  doc.text(
    "Data Distribution Rules",
    20,
    rulesY
  );

  doc.setFontSize(9);

  doc.text(
    `LAN Cable Capacity: ${DATA_RULES.maxPixelsPerCable.toLocaleString()} pixels`,
    20,
    rulesY + 10
  );

  doc.text(
    `Maximum Cabinets Per Cable: ${dataFlow.maxCabinetsPerCable}`,
    20,
    rulesY + 18
  );

  doc.text(
    DATA_RULES.note,
    20,
    rulesY + 26
  );

  doc.text(
    DATA_RULES.routing,
    20,
    rulesY + 34
  );
};