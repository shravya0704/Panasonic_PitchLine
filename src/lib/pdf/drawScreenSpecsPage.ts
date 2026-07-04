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
  unit: "mtr" | "ft"
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // HELPER: THEME ENFORCERS
  // ==========================================
  const drawBackground = () => {
    doc.setFillColor(244, 247, 250); // Pastel slate-blue theme
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const drawPageTitles = (subtitle: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 85, 165); // Panasonic Blue
    doc.text("DISPLAY SOLUTIONS", 15, 35);

    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(subtitle, 15, 45);
  };

  const drawCard = (x: number, y: number, w: number, h: number, title: string) => {
    // White Card Background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(x, y, w, h, 2, 2, "FD");

    // Card Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 85, 165);
    doc.text(title.toUpperCase(), x + 7, y + 9);
    
    // Header Divider
    doc.setDrawColor(240, 240, 240);
    doc.line(x + 7, y + 13, x + w - 7, y + 13);
  };

  const drawCardContent = (x: number, y: number, items: { label: string; value: string }[], colWidth: number) => {
    items.forEach((item, index) => {
      const currentX = x + 7 + (index * colWidth);
      
      // Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(item.label, currentX, y + 21);

      // Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(item.value, currentX, y + 29);
    });
  };

  // ==========================================
  // PAGE 1: ENGINEERING SUMMARY
  // ==========================================
  drawBackground();
  drawPageTitles("ENGINEERING SUMMARY");

  // Calculations (Directly from your logic)
  const METERS_TO_FEET = 3.28084;
  const SQ_METERS_TO_SQ_FEET = 10.7639;
  const baseArea = result.actualWidth * result.actualHeight;
  const diagonalMeters = Math.sqrt(
    result.actualWidth * result.actualWidth + result.actualHeight * result.actualHeight
  );
  const diagonalInches = diagonalMeters * 39.3701;

  const sizeText = unit === "mtr"
    ? `${result.actualWidth.toFixed(2)} × ${result.actualHeight.toFixed(2)} m`
    : `${(result.actualWidth * METERS_TO_FEET).toFixed(2)} × ${(result.actualHeight * METERS_TO_FEET).toFixed(2)} ft`;

  const areaText = unit === "mtr"
    ? `${baseArea.toFixed(2)} m²`
    : `${(baseArea * SQ_METERS_TO_SQ_FEET).toFixed(2)} ft²`;

  const maxPower = result.maximumPower;
  const avgPower = result.averagePower;
  const maxBTU = result.maximumHeatBTU ?? Math.round(maxPower * 3.412142);
  const avgBTU = result.averageHeatBTU ?? Math.round(avgPower * 3.412142);

  // Card 1: DISPLAY REQUIREMENTS
  let currentY = 55;
  drawCard(15, currentY, 180, 38, "DISPLAY REQUIREMENTS");
  drawCardContent(15, currentY, [
    { label: "Screen Configuration (W×H)", value: `${result.cabinetsW} × ${result.cabinetsH}` },
    { label: "Total Cabinets", value: result.totalCabinets.toString() }
  ], 85);

  // Card 2: DISPLAY DIMENSIONS
  currentY += 43;
  drawCard(15, currentY, 180, 38, "DISPLAY DIMENSIONS");
  drawCardContent(15, currentY, [
    { label: "Actual Display Size", value: sizeText },
    { label: "Display Area", value: areaText },
    { label: "Display Diagonal", value: `${diagonalInches.toFixed(2)} inch` }
  ], 58);

  // Card 3: DISPLAY PERFORMANCE
  currentY += 43;
  drawCard(15, currentY, 180, 38, "DISPLAY PERFORMANCE");
  drawCardContent(15, currentY, [
    { label: "Resolution", value: `${result.resolutionW.toLocaleString()} × ${result.resolutionH.toLocaleString()}` },
    { label: "No. of Controllers", value: "1" }
  ], 85);

  // Cards 4 & 5: ELECTRICAL & THERMAL (Side-by-Side to match design balance)
  currentY += 43;
  
  // Electrical (Left Half)
  drawCard(15, currentY, 87.5, 38, "ELECTRICAL REQUIREMENTS");
  drawCardContent(15, currentY, [
    { label: "Max Power", value: `${(maxPower / 1000).toFixed(2)} kW` },
    { label: "Avg Power", value: `${(avgPower / 1000).toFixed(2)} kW` }
  ], 40);

  // Thermal (Right Half)
  drawCard(107.5, currentY, 87.5, 38, "THERMAL CHARACTERISTICS");
  drawCardContent(107.5, currentY, [
    { label: "Max Heat", value: `${(maxBTU / 1000).toFixed(1)} kBTU/hr` },
    { label: "Avg Heat", value: `${(avgBTU / 1000).toFixed(1)} kBTU/hr` }
  ], 43);


  /// ==========================================
    // PAGE 2 (Generated from same file): SCREEN PREVIEW
    // ==========================================
    if (screenPreviewImage) {
      doc.addPage();
      drawBackground(); 
      drawPageTitles("SCREEN PREVIEW");
  
      // Frame the image inside a clean white card for a premium look
      const cardY = 55;
      const cardHeight = 205; 
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 225, 230);
      doc.roundedRect(15, cardY, 180, cardHeight, 2, 2, "FD");
  
      // Dimensions for image inside the card boundaries
      const maxWidth = 160;
      const maxHeight = 180;
  
      // STRETCH FIX: Read the natural aspect ratio of the screenshot itself!
      const imgProps = doc.getImageProperties(screenPreviewImage);
      const naturalAspectRatio = imgProps.height / imgProps.width;
  
      let imageWidth = maxWidth;
      let imageHeight = imageWidth * naturalAspectRatio;
  
      // Scale down if it exceeds the max height of our card
      if (imageHeight > maxHeight) {
        imageHeight = maxHeight;
        imageWidth = imageHeight / naturalAspectRatio;
      }
  
      // Mathematically center the image perfectly inside the white card
      const x = 15 + (180 - imageWidth) / 2;
      const y = cardY + (cardHeight - imageHeight) / 2;
  
      doc.addImage(screenPreviewImage, "PNG", x, y, imageWidth, imageHeight);
    }
};