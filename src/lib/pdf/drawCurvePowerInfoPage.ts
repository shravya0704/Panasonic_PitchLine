import jsPDF from "jspdf";

export const drawCurvePowerInfoPage = (doc: jsPDF): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(244, 247, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 85, 165);
  doc.text("DISPLAY SOLUTIONS", 15, 35);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("POWER FLOW DIAGRAM", 15, 45);

  doc.setDrawColor(210);
  doc.line(15, 55, pageWidth - 15, 55);

  // Engineering Note
  const startY = 75;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 85, 165);
  doc.text("CURVED DISPLAY ENGINEERING NOTE", 15, startY);

  doc.setDrawColor(220);
  doc.line(15, startY + 4, pageWidth - 15, startY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const text = [
    "Power distribution for curved LED displays is engineered using",
    "module-level routing rather than cabinet-level routing.",
    "",
    "Since routing depends on the final display geometry, module",
    "arrangement and installation conditions, a standard cabinet-",
    "based power flow diagram cannot accurately represent the",
    "final installation.",
    "",
    "Detailed power routing drawings are prepared by Panasonic",
    "during the project engineering stage based on the approved",
    "display layout and installation requirements.",
    "",
    "For detailed engineering drawings or installation guidance,",
    "please contact your Panasonic Display Solutions representative."
  ];

  doc.text(text, 15, startY + 15, {
    maxWidth: pageWidth - 30,
    lineHeightFactor: 1.6,
  });
};