import jsPDF from "jspdf";

/**
 * Renders the Viewing Distance Analysis page.
 *
 * This page displays a snapshot of the Viewing Distance Visualizer captured
 * from the React UI using html2canvas. The snapshot is scaled while preserving
 * its original aspect ratio to prevent distortion.
 */
export const drawViewingDistancePage = async (
  doc: jsPDF,
  viewingDistanceImage?: string
): Promise<void> => {
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
  doc.text("VIEWING DISTANCE ANALYSIS", 15, 45);

  doc.setDrawColor(210);
  doc.line(15, 55, pageWidth - 15, 55);

  // Card
  const cardX = 15;
  const cardY = 65;
  const cardW = pageWidth - 30;
  const cardH = 145;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "FD");

  if (viewingDistanceImage) {
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = viewingDistanceImage;
    });

    const maxWidth = cardW - 12;
    const maxHeight = cardH - 12;

    const scale = Math.min(
      maxWidth / img.width,
      maxHeight / img.height
    );

    const renderWidth = img.width * scale;
    const renderHeight = img.height * scale;

    const x = cardX + (cardW - renderWidth) / 2;
    const y = cardY + (cardH - renderHeight) / 2;

    doc.addImage(
      viewingDistanceImage,
      "PNG",
      x,
      y,
      renderWidth,
      renderHeight
    );
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(130,130,130);
    doc.text(
      "Viewing Distance snapshot unavailable.",
      pageWidth/2,
      cardY + cardH/2,
      {align:"center"}
    );
  }

  const rulesY = cardY + cardH + 15;

  doc.setFont("helvetica","bold");
  doc.setFontSize(8);
  doc.setTextColor(0,85,165);
  doc.text("NOTE: VIEWING DISTANCE GUIDELINES",15,rulesY);

  doc.setFont("helvetica","normal");
  doc.setFontSize(7);
  doc.setTextColor(100,100,100);

  doc.text(
    "• Optimal Viewing Distance = Pixel Pitch × 1.5",
    15,
    rulesY + 5
  );

  doc.text(
    "• Maximum Viewing Distance = Pixel Pitch × 6",
    15,
    rulesY + 9
  );

  doc.text(
    "• Viewing distances are calculated dynamically based on the selected LED pixel pitch.",
    15,
    rulesY + 13
  );
};
