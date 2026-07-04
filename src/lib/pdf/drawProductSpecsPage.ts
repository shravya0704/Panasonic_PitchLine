import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { ProductSpecificationService } from "../../services/ProductSpecificationService";

export const drawProductSpecsPage = async (
  doc: jsPDF,
  product: Product
): Promise<void> => {
  const specs = await ProductSpecificationService.getByModel(product.model);

  console.log("PRODUCT SPECS JSON:", JSON.stringify(specs, null, 2));

  if (!specs || Object.keys(specs).length === 0) {
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // 1. GLOBAL PAGE BACKGROUND
  // ==========================================
  doc.setFillColor(244, 247, 250); // Pastel slate-blue theme
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ==========================================
  // 2. PAGE TITLES & MODEL SUBTITLE
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165); // Panasonic Blue
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("PRODUCT SPECIFICATIONS", 15, 45);

  doc.setFontSize(14);
  doc.setTextColor(0, 85, 165);
  doc.text(product.model, 15, 55);

  doc.setDrawColor(210);
  doc.line(15, 60, pageWidth - 15, 60);

  // ==========================================
  // 3. CARD UI HELPER
  // ==========================================
  // ==========================================
  // 3. CARD UI HELPER
  // ==========================================
  const LEFT_X = 15;
  const RIGHT_X = 107.5;
  const COL_WIDTH = 87.5;
  
  // 1. SPACING FIX: Start the cards slightly higher up the page (closer to the line)
  let leftY = 64; 
  let rightY = 64;

  const drawSection = (
    title: string,
    rows: [string, string | undefined | null][],
    column: "left" | "right"
  ) => {
    const startX = column === "left" ? LEFT_X : RIGHT_X;
    let startY = column === "left" ? leftY : rightY;
    
    // Slightly wider text area to prevent aggressive wrapping
    const maxValueWidth = 36; 

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5); 

    let totalRowsHeight = 0;
    const processedRows = rows.map(([label, value]) => {
      const valStr = String(value ?? "-");
      const splitVal = doc.splitTextToSize(valStr, maxValueWidth);
      
      // 2. SPACING FIX: Tighter row heights. 
      // Single line = 6mm (was 7.5mm), Double line = 10mm (was 11.5mm)
      const rowHeight = (splitVal.length * 4) + 2; 
      totalRowsHeight += rowHeight;
      
      return { label, splitVal, rowHeight };
    });

    // 3. SPACING FIX: Reduced top/bottom padding inside the white cards
    const cardHeight = 16 + totalRowsHeight;

    // Draw White Card Background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(startX, startY, COL_WIDTH, cardHeight, 2, 2, "FD");

    // Card Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 85, 165);
    doc.text(title.toUpperCase(), startX + 7, startY + 8); // Shifted text up

    // Header Divider
    doc.setDrawColor(240, 240, 240);
    doc.line(startX + 7, startY + 11, startX + COL_WIDTH - 7, startY + 11); // Shifted line up

    // Draw Rows
    let currentY = startY + 17; // Shifted list start up
    processedRows.forEach(({ label, splitVal, rowHeight }) => {
      // Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 110);
      doc.text(label, startX + 7, currentY);

      // Value
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(splitVal, startX + 47, currentY); 
      
      currentY += rowHeight;
    });

    // 4. SPACING FIX: Reduced gap between stacked cards from 8 to 6
    if (column === "left") {
      leftY += cardHeight + 6;
    } else {
      rightY += cardHeight + 6;
    }
  };
  // ==========================================
  // 4. DATA EXTRACTION LOGIC
  // ==========================================
  const getSpec = (...keys: string[]) => {
    for (const key of keys) {
      if (specs[key]) return specs[key];
    }
    return "-";
  };

  const cabinetArea = (
    (product.cabinetWidth / 1000) *
    (product.cabinetHeight / 1000)
  ).toFixed(2);

  const cabinetWeightText = getSpec("Cabinet Weight");
  const cabinetWeight = parseFloat(cabinetWeightText);

  const weightPerM2 = !isNaN(cabinetWeight)
    ? (cabinetWeight / Number(cabinetArea)).toFixed(1) + " kg"
    : "-";

  const application =
    product.applicationType === "Indoor"
      ? "Indoor Environment"
      : "Outdoor Environment";

  // ==========================================
  // 5. RENDER CARDS
  // ==========================================
  
  // --- LEFT COLUMN ---
  drawSection(
    "PHYSICAL PARAMETERS",
    [
      ["Pixel Configuration", specs["Pixel Configuration"]],
      ["Pixel Pitch", getSpec("Pixel Pitch", "Pixel Pitch (mm)") + " mm"],
      ["Module Resolution", specs["Module Resolution"]],
      ["Module Dimensions", specs["Module Dimensions"]],
      ["Module Weight", specs["Module Weight"]],
      ["Modules Per Cabinet", specs["Modules Per Cabinet"]],
      ["Cabinet Resolution", specs["Cabinet Resolution"]],
      ["Cabinet Dimensions", specs["Cabinet Dimensions"]],
      ["Cabinet Surface Area", `${cabinetArea} m²`],
      ["Cabinet Weight", specs["Cabinet Weight"]],
      ["Weight Per m²", weightPerM2],
      ["Flatness", "0.1 mm"],
      ["Cabinet Material", specs["Cabinet Material"]],
      ["Service Access", specs["Service Access"]],
    ],
    "left"
  );

  drawSection(
    "OPTICAL SPECIFICATIONS",
    [
      ["Brightness", specs["Brightness"]],
      ["Pixel Density", specs["Pixel Density"]],
      ["Color Temperature", specs["Color Temperature"]],
      ["Viewing Angle", specs["Viewing Angle"]],
      ["Brightness Uniformity", specs["Brightness Uniformity"] ?? (product.applicationType === "Outdoor" ? "98%" : "-")],
      ["Color Uniformity", specs["Color Uniformity"] ?? "±0.003"],
      ["Contrast Ratio", specs["Contrast Ratio"]],
      ["Processing Depth", specs["Processing Depth"]],
    ],
    "left"
  );

  // --- RIGHT COLUMN ---
  drawSection(
    "ELECTRICAL SPECIFICATIONS",
    [
      ["Power Consumption Max", getSpec("Power Consumption Max", "Power Consumption (Max)")],
      ["Power Consumption Average", getSpec("Power Consumption Average", "Power Consumption (Average)")],
      ["Power Supply", specs["Power Supply"]],
      ["Frame Rate", specs["Frame Rate"]],
      ["Refresh Rate", specs["Refresh Rate"]],
    ],
    "right"
  );

  drawSection(
    "OPERATION",
    [
      ["LED Lifetime", "100,000 Hours"],
      ["Application", application],
    ],
    "right"
  );

  drawSection(
    "ENVIRONMENT",
    [
      ["Operating Temp.", specs["Operating Temperature"]],
      ["Operating Humidity", specs["Operating Humidity"]],
      ["IP Rating", specs["IP Rating"]],
    ],
    "right"
  );
};