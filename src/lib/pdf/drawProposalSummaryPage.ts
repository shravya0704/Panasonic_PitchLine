import jsPDF from "jspdf";
import { Product } from "../../types/Product";

// Helper: Preserves user input exactly as entered
const formatTitleCase = (text: string) => {
  if (!text) return "";
  return text;
};

export const drawProposalSummaryPage = (
  doc: jsPDF,
  product: Product,
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
  // Draw this first so text goes on top!
  // ==========================================
  doc.setFillColor(244, 247, 250); // Soft, professional pastel slate-blue
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ==========================================
  // 2. PAGE TITLES
  // ==========================================
  // Safe zone starts below Y: 22
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165); // Panasonic Blue
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30); // Dark charcoal
  doc.text("ENGINEERING PROPOSAL", 15, 45);

  // ==========================================
  // 3. CARD 1: PROPOSAL INFORMATION
  // ==========================================
  const card1Y = 55;
  const card1Height = 85;

  // Draw White Card Background with light border
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(15, card1Y, 180, card1Height, 2, 2, "FD");

  // Card Header
  doc.setFontSize(11);
  doc.setTextColor(0, 85, 165);
  doc.text("PROPOSAL INFORMATION", 25, card1Y + 12);
  
  // Card Divider Line
  doc.setDrawColor(235, 235, 235);
  doc.line(25, card1Y + 18, 185, card1Y + 18);

  // Card Content - APPLIED TITLE CASE FORMATTING HERE
  const infoData = [
    { label: "Proposal ID:", value: proposalId },
    { label: "Project Name:", value: formatTitleCase(proposalData.projectName) },
    { label: "Customer Name:", value: formatTitleCase(proposalData.customerName) },
    { label: "Company Name:", value: formatTitleCase(proposalData.companyName) },
    { label: "Email:", value: proposalData.email },
    { label: "Generated On:", value: new Date().toLocaleDateString() }
  ];

  let currentY = card1Y + 30;
  infoData.forEach((item) => {
    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, 25, currentY);

    // Value
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

  // Draw White Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(15, card2Y, 180, card2Height, 2, 2, "FD");

  // Card Header
  doc.setFontSize(11);
  doc.setTextColor(0, 85, 165);
  doc.text("SELECTED DISPLAY", 25, card2Y + 12);

  // Card Divider
  doc.setDrawColor(235, 235, 235);
  doc.line(25, card2Y + 18, 185, card2Y + 18);

  // Card Content (Displayed in a 3-column layout)
  const displayData = [
    { label: "Model", value: `${product.applicationType} ${product.model}` },
    { label: "Pixel Pitch", value: `${product.pitch} mm` },
    { label: "Brightness", value: `${product.brightness} nits` }
  ];

  const colWidth = 55;
  displayData.forEach((item, index) => {
    const xPos = 25 + (index * colWidth);
    
    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, xPos, card2Y + 30);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    // Constrain long values (especially the model name)
    // so they remain within their allotted column.
    const wrappedValue = doc.splitTextToSize(item.value, colWidth - 3);

    doc.text(
      wrappedValue,
      xPos,
      card2Y + 40
    );
  });
};