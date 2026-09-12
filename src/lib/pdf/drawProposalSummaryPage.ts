import jsPDF from "jspdf";
import { Product } from "../../types/Product";

// Helper: Capitalizes the first letter of each word (Title Case)
const formatTitleCase = (text: string) => {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// SIGNATURE UNCHANGED: (doc, product, proposalData, proposalId)
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

  // 1. GLOBAL PAGE BACKGROUND
  doc.setFillColor(244, 247, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. PAGE TITLES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165);
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("ENGINEERING PROPOSAL", 15, 45);

  // 3. CARD 1: PROPOSAL INFORMATION
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

  // FIX: wrap long values (especially email) so they don't overflow the card
  const infoData = [
    { label: "Proposal ID:", value: proposalId },
    { label: "Project Name:", value: formatTitleCase(proposalData.projectName) },
    { label: "Customer Name:", value: formatTitleCase(proposalData.customerName) },
    { label: "Company Name:", value: formatTitleCase(proposalData.companyName) },
    { label: "Email:", value: proposalData.email?.toLowerCase() },
    { label: "Generated On:", value: new Date().toLocaleDateString() }
  ];

  // Max width available for values (from x=65 to card right edge at 195, minus 10 margin)
  const maxValueWidth = 120;

  let currentY = card1Y + 30;
  infoData.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, 25, currentY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    // Split long values to prevent overflow
    const wrappedValue = doc.splitTextToSize(item.value || "N/A", maxValueWidth);
    doc.text(wrappedValue, 65, currentY);

    // Advance Y: each extra wrapped line adds ~5 units
    currentY += wrappedValue.length > 1 ? wrappedValue.length * 5 : 10;
  });

  // 4. CARD 2: SELECTED DISPLAY
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

    // Constrain long values within column width
    const wrappedValue = doc.splitTextToSize(item.value, colWidth - 3);
    doc.text(wrappedValue, xPos, card2Y + 40);
  });
};