import jsPDF from "jspdf";

export const applyGlobalPageTemplate = (
  doc: jsPDF,
  proposalId: string,
  pageNumber: number,
  totalPages: number,
  logoImage?: string
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // 1. HEADER (Top of Page)
  // ==========================================
  
  if (logoImage) {
    // OPTICAL ALIGNMENT: 
    // Shifted X from 15 to 12 to counteract the invisible left-padding in the PNG.
    // Increased size slightly (38x10) to balance better with the bold page titles.
    doc.addImage(logoImage, "PNG", 15, 13, 30, 6.5); 
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30); 
    doc.text("Panasonic", 15, 15);
  }

  // Tagline on the top right
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  // Adjusted Y from 16 to 18 so the text sits on the same baseline as the logo's bottom edge
  doc.text("Create Today, Enrich Tomorrow", pageWidth - 15, 18, { align: "right" });

  // Header Divider Line
  doc.setDrawColor(210);
  doc.line(15, 23, pageWidth - 15, 23);
  // 2. FOOTER
  doc.setDrawColor(210);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  doc.text(`Proposal ID: ${proposalId}`, 15, pageHeight - 8);
  doc.text("Panasonic PitchLine", pageWidth / 2, pageHeight - 8, { align: "center" });
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, pageHeight - 8, { align: "right" });
};