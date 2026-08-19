import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { ConfigurationResult } from "../../types/ConfigurationResult";

// Helper: Capitalizes the first letter of each word (Title Case)
const formatTitleCase = (text: string) => {
  return text;
};

export const drawProposalSummaryPage = (
  doc: jsPDF,
  product: Product,
  result: ConfigurationResult,
  proposalData: {
    projectName: string;
    customerName: string;
    companyName: string;
    email: string;
  },
  proposalId: string
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // 1. GLOBAL PAGE BACKGROUND
  // ==========================================
  doc.setFillColor(244, 247, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ==========================================
  // 2. PAGE TITLES
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165);
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("ENGINEERING PROPOSAL", 15, 45);

  // ==========================================
  // 3. CARD 1: PROPOSAL INFORMATION
  // ==========================================
  const card1Y = 55;
  const card1Height = 85;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(15, card1Y, 180, card1Height, 2, 2, "FD");

  doc.setFontSize(11);
  doc.setTextColor(0, 85, 165);
  doc.text("PROPOSAL INFORMATION", 25, card1Y + 12);
  
  doc.setDrawColor(235, 235, 235);
  doc.line(25, card1Y + 18, 185, card1Y + 18);

  const infoData = [
    { label: "Proposal ID:", value: proposalId },
    { label: "Project Name:", value: formatTitleCase(proposalData.projectName) },
    { label: "Customer Name:", value: formatTitleCase(proposalData.customerName) },
    { label: "Company Name:", value: formatTitleCase(proposalData.companyName) },
    { label: "Email:", value: proposalData.email?.toLowerCase() },
    { label: "Generated On:", value: new Date().toLocaleDateString() }
  ];

  let currentY = card1Y + 30;
  infoData.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, 25, currentY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(item.value || "N/A", 65, currentY);

    currentY += 10;
  });

  // ==========================================
  // 4. CARD 2: SELECTED DISPLAY
  // ==========================================
  const card2Y = card1Y + card1Height + 10;
  const card2Height = 55;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(15, card2Y, 180, card2Height, 2, 2, "FD");

  doc.setFontSize(11);
  doc.setTextColor(0, 85, 165);
  doc.text("SELECTED DISPLAY", 25, card2Y + 12);

  doc.setDrawColor(235, 235, 235);
  doc.line(25, card2Y + 18, 185, card2Y + 18);

  const displayData = [
    { label: "Model", value: `${product.applicationType} ${product.model}` },
    { label: "Pixel Pitch", value: `${product.pitch} mm` },
    { label: "Brightness", value: `${product.brightness} nits` }
  ];

  const colWidth = 55;
  displayData.forEach((item, index) => {
    const xPos = 25 + (index * colWidth);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, xPos, card2Y + 30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    const wrappedValue = doc.splitTextToSize(item.value, colWidth - 3);
    doc.text(wrappedValue, xPos, card2Y + 40);
  });

  // ==========================================
  // 5. CARD 3: POWER & WEIGHT SPECIFICATIONS
  // Only show weight card if totalScreenWeight is defined (not curved display)
  // ==========================================
  const shouldShowWeightCard = result.totalScreenWeight !== undefined;
  const card3Y = card2Y + card2Height + 10;
  const card3Height = shouldShowWeightCard ? 45 : 0;

  if (shouldShowWeightCard) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(15, card3Y, 180, card3Height, 2, 2, "FD");

    doc.setFontSize(11);
    doc.setTextColor(0, 85, 165);
    doc.text("POWER & WEIGHT SPECIFICATIONS", 25, card3Y + 12);

    doc.setDrawColor(235, 235, 235);
    doc.line(25, card3Y + 18, 185, card3Y + 18);

    const powerWeightData = [
      { label: "Maximum Power", value: `${Math.round(result.maximumPower)} W` },
      { label: "Average Power", value: `${Math.round(result.averagePower)} W` },
      { label: "Total System Weight", value: `${Math.round(result.totalScreenWeight!)} kg` },
      { label: "Display Area", value: `${result.totalArea.toFixed(2)} m²` }
    ];

    const gridColWidth = 85;
    powerWeightData.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const xPos = 25 + (col * gridColWidth);
      const yPos = card3Y + 28 + (row * 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(item.label, xPos, yPos);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(item.value, xPos, yPos + 6);
    });
  }
};