import jsPDF from "jspdf";
import { Product } from "../../types/Product";

interface ProposalInfo {
  projectName: string;
  customerName: string;
  companyName: string;
  email: string;
}

export const drawProposalSummaryPage = (
  doc: jsPDF,
  product: Product,
  proposalInfo: ProposalInfo,
  proposalId: string
): void => {

  // Clean Engineering Title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0);
  doc.text("Engineering Proposal", 20, 25);

  doc.setDrawColor(210);
  doc.line(20, 32, 190, 32);

  // Section 1: Proposal Information
  doc.setFontSize(16);
  doc.text("Proposal Information", 20, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 65;

  doc.text(`Proposal ID: ${proposalId}`, 20, y);
  y += 12;
  doc.text(`Project Name: ${proposalInfo.projectName}`, 20, y);
  y += 12;
  doc.text(`Customer Name: ${proposalInfo.customerName}`, 20, y);
  y += 12;
  doc.text(`Company Name: ${proposalInfo.companyName}`, 20, y);
  y += 12;
  doc.text(`Email: ${proposalInfo.email}`, 20, y);
  y += 12;
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, y);

  // Section 2: Selected Display
  y += 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Selected Display", 20, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  doc.text(`Model: ${product.model}`, 20, y);
  y += 12;
  doc.text(`Pixel Pitch: ${product.pitch} mm`, 20, y);
  y += 12;
  doc.text(`Brightness: ${product.brightness} nits`, 20, y);

  // All manual footer branding strings have been cleanly deleted
};