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

  doc.text("Screen Specification", 15, 20);

  doc.setDrawColor(180);
  doc.line(15, 28, 195, 28);

  const displayArea = result.actualWidth * result.actualHeight;

  const diagonalMeters = Math.sqrt(
    result.actualWidth * result.actualWidth +
      result.actualHeight * result.actualHeight
  );

  const diagonalInches = diagonalMeters * 39.3701;

  const maxPower = result.maximumPower;
  const avgPower = result.averagePower;

  const maxBTU =
    result.maximumHeatBTU ?? Math.round(maxPower * 3.412142);

  const avgBTU =
    result.averageHeatBTU ?? Math.round(avgPower * 3.412142);

  const drawSection = (
    title: string,
    x: number,
    y: number,
    items: {
      label: string;
      value: string;
    }[]
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, x, y);

    let currentY = y + 10;

    items.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(item.label, x, currentY);

      doc.setFont("helvetica", "bold");
      doc.text(item.value, x, currentY + 7);

      currentY += 18;
    });
  };

  // =============================
  // TOP ROW
  // =============================

  drawSection("Display Requirements", 15, 40, [
    {
      label: "Screen Configuration (W×H)",
      value: `${result.cabinetsW} × ${result.cabinetsH}`,
    },
    {
      label: "No. of Cabinets",
      value: result.totalCabinets.toString(),
    },
  ]);

  drawSection("Display Wall Dimensions", 105, 40, [
    {
      label: "LED Module Dimensions",
      value: `${result.actualWidth.toFixed(2)} × ${result.actualHeight.toFixed(2)} m`,
    },
    {
      label: "Display Area",
      value: `${displayArea.toFixed(2)} m²`,
    },
    {
      label: "Diagonal",
      value: `${diagonalInches.toFixed(2)} inch`,
    },
  ]);

  // moved down
  doc.setDrawColor(220);
  doc.line(15, 102, 195, 102);

  // =============================
  // MIDDLE ROW
  // =============================

  drawSection("Optical Parameters", 15, 112, [
    {
      label: "Resolution",
      value: `${result.resolutionW.toLocaleString()} × ${result.resolutionH.toLocaleString()}`,
    },
    {
      label: "No. of Controllers",
      value: "1",
    },
  ]);

  drawSection("Power Consumption", 105, 112, [
    {
      label: "Maximum Power",
      value: `${Math.round(maxPower).toLocaleString()} W`,
    },
    {
      label: "Average Power",
      value: `${Math.round(avgPower).toLocaleString()} W`,
    },
  ]);

  // moved down
  doc.line(15, 157, 195, 157);

  // =============================
  // HEAT
  // =============================

  drawSection("Heat Dissipation", 15, 167, [
    {
      label: "Maximum Heat Dissipation",
      value: `${Math.round(maxBTU).toLocaleString()} BTU/hr`,
    },
    {
      label: "Average Heat Dissipation",
      value: `${Math.round(avgBTU).toLocaleString()} BTU/hr`,
    },
  ]);

  // =============================
  // SCREEN PREVIEW
  // =============================

  if (screenPreviewImage) {
    doc.addPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("Screen Preview", 15, 20);

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