import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { ConfigurationResult } from "../../types/ConfigurationResult";

export const drawScreenSpecsPage = (
  doc: jsPDF,
  product: Product,
  result: ConfigurationResult,
  screenPreviewImage: string | undefined,
  requestedWidth: number,
  requestedHeight: number,
  unit: "mtr" | "ft" // ADDED: Unit prop connection
): void => {
  
  const METERS_TO_FEET = 3.28084;
  const SQ_METERS_TO_SQ_FEET = 10.7639;

  // Straightforward Title without external file dependence
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text("Engineering Summary", 15, 20);

  doc.setDrawColor(210);
  doc.line(15, 28, 195, 28);

  // Compute Base Structural Dimensions
  const baseArea = result.actualWidth * result.actualHeight;
  const diagonalMeters = Math.sqrt(
    result.actualWidth * result.actualWidth + result.actualHeight * result.actualHeight
  );
  const diagonalInches = diagonalMeters * 39.3701;

  // Apply conditional metric conversions
  const sizeText = unit === "mtr"
    ? `${result.actualWidth.toFixed(2)} × ${result.actualHeight.toFixed(2)} mtr`
    : `${(result.actualWidth * METERS_TO_FEET).toFixed(2)} × ${(result.actualHeight * METERS_TO_FEET).toFixed(2)} ft`;

  const areaText = unit === "mtr"
    ? `${baseArea.toFixed(2)} mtr²`
    : `${(baseArea * SQ_METERS_TO_SQ_FEET).toFixed(2)} ft²`;

  const maxPower = result.maximumPower;
  const avgPower = result.averagePower;
  const maxBTU = result.maximumHeatBTU ?? Math.round(maxPower * 3.412142);
  const avgBTU = result.averageHeatBTU ?? Math.round(avgPower * 3.412142);

  const drawSection = (
    title: string,
    x: number,
    y: number,
    items: { label: string; value: string }[]
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
    { label: "Screen Configuration (W×H)", value: `${result.cabinetsW} × ${result.cabinetsH}` },
    { label: "Total Cabinets", value: result.totalCabinets.toString() },
  ]);

  drawSection("Display Dimensions", 105, 40, [
    { label: "Actual Display Size", value: sizeText },
    { label: "Display Area", value: areaText },
    { label: "Display Diagonal", value: `${diagonalInches.toFixed(2)} inch` },
  ]);

  doc.setDrawColor(220);
  doc.line(15, 102, 195, 102);

  // =============================
  // MIDDLE ROW
  // =============================
  drawSection("Display Performance", 15, 112, [
    { label: "Resolution", value: `${result.resolutionW.toLocaleString()} × ${result.resolutionH.toLocaleString()}` },
    { label: "No. of Controllers", value: "1" },
  ]);

  drawSection("Electrical Requirements", 105, 112, [
    { label: "Maximum Power", value: `${(maxPower / 1000).toFixed(2)} kW` },
    { label: "Average Power", value: `${(avgPower / 1000).toFixed(2)} kW` },
  ]);

  doc.line(15, 157, 195, 157);

  // =============================
  // HEAT
  // =============================
  drawSection("Thermal Characteristics", 15, 167, [
    { label: "Maximum Heat Dissipation", value: `${(maxBTU / 1000).toFixed(1)} kBTU/hr` },
    { label: "Average Heat Dissipation", value: `${(avgBTU / 1000).toFixed(1)} kBTU/hr` },
  ]);

  // =============================
  // SCREEN PREVIEW (Aspect-ratio locked and centered perfectly)
  // =============================
  if (screenPreviewImage) {
    doc.addPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Screen Preview", 15, 20);

    // Maximum allowable bounding area on an A4 sheet
    const maxWidth = 185;
    const maxHeight = 240;

    // Preserve aspect ratio using the actual display specifications
    const aspectRatio = result.actualHeight / result.actualWidth;

    let imageWidth = maxWidth;
    let imageHeight = imageWidth * aspectRatio;

    // Fall back to capping by height if the display setup is exceptionally tall
    if (imageHeight > maxHeight) {
      imageHeight = maxHeight;
      imageWidth = imageHeight / aspectRatio;
    }

    // Centering vector offsets horizontally
    const x = (210 - imageWidth) / 2;
    const y = 35; // Leave safe clearance under header text

    doc.addImage(
      screenPreviewImage,
      "PNG",
      x,
      y,
      imageWidth,
      imageHeight
    );
  }
};