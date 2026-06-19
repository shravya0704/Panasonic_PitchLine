import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { ConfigurationResult } from "../../types/ConfigurationResult";

export const drawScreenSpecsPage = (
  doc: jsPDF,
  product: Product,
  result: ConfigurationResult,
  screenPreviewImage: string | undefined,
  requestedWidth: number,
  requestedHeight: number
): void => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text(
    "Screen Specification",
    15,
    20
  );

  doc.setDrawColor(180);
  doc.line(15, 28, 195, 28);

  // ----------------------------
  // CALCULATIONS
  // ----------------------------

  const displayArea =
    result.actualWidth *
    result.actualHeight;

  const diagonalMeters =
    Math.sqrt(
      result.actualWidth *
        result.actualWidth +
        result.actualHeight *
          result.actualHeight
    );

  const diagonalInches =
    diagonalMeters * 39.3701;

  const maxPower =
    result.totalCabinets * 106;

  const avgPower =
    result.totalCabinets * 36;

  const maxBTU =
    Math.round(
      maxPower * 3.412
    );

  const avgBTU =
    Math.round(
      avgPower * 3.412
    );

  // ----------------------------
  // SECTION HELPER
  // ----------------------------

  const drawSection = (
    title: string,
    x: number,
    y: number,
    items: {
      label: string;
      value: string;
    }[]
  ) => {
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      title,
      x,
      y
    );

    let currentY = y + 10;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    items.forEach(
      (item) => {
        doc.text(
          item.label,
          x,
          currentY
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          item.value,
          x,
          currentY + 7
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        currentY += 18;
      }
    );
  };

  // ----------------------------
  // TOP SECTION
  // ----------------------------

  drawSection(
    "Display Requirements",
    15,
    40,
    [
      {
        label:
          "Screen Configuration (W×H)",
        value: `${result.cabinetsW} × ${result.cabinetsH}`,
      },
      {
        label:
          "No. of Cabinets",
        value:
          result.totalCabinets.toString(),
      },
      {
        label:
          "No. of Spare Modules",
        value: "2",
      },
    ]
  );

  drawSection(
    "Display Wall Dimensions",
    105,
    40,
    [
      {
        label:
          "LED Module Dimensions",
        value: `${result.actualWidth.toFixed(
          2
        )} × ${result.actualHeight.toFixed(
          2
        )} m`,
      },
      {
        label:
          "Display Area",
        value: `${displayArea.toFixed(
          2
        )} m²`,
      },
      {
        label:
          "Diagonal",
        value: `${diagonalInches.toFixed(
          2
        )} inch`,
      },
    ]
  );

  doc.setDrawColor(220);
  doc.line(
    15,
    95,
    195,
    95
  );

  drawSection(
    "Optical Parameters",
    15,
    110,
    [
      {
        label:
          "Resolution",
        value: `${result.resolutionW.toLocaleString()} × ${result.resolutionH.toLocaleString()}`,
      },
      {
        label:
          "No. of Controller",
        value: "1",
      },
    ]
  );

  drawSection(
    "Power Consumption",
    105,
    110,
    [
      {
        label: "Max",
        value: `${maxPower.toLocaleString()} W`,
      },
      {
        label:
          "Average",
        value: `${avgPower.toLocaleString()} W`,
      },
    ]
  );

  doc.line(
    15,
    150,
    195,
    150
  );

  drawSection(
    "Heat Dissipation",
    15,
    165,
    [
      {
        label: "Max",
        value: `${maxBTU.toLocaleString()} BTU`,
      },
      {
        label:
          "Average",
        value: `${avgBTU.toLocaleString()} BTU`,
      },
    ]
  );

  // ----------------------------
  // SCREEN PREVIEW
  // ----------------------------

  if (screenPreviewImage) {
    doc.addPage();

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(18);

    doc.text(
      "Screen Preview",
      15,
      20
    );

    doc.addImage(
      screenPreviewImage,
      "PNG",
      10,
      30,
      190,
      140
    );
  }
};