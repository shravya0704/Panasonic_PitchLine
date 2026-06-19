import jsPDF from "jspdf";
import { Product } from "../../types/Product";

export const drawCoverPage = (
  doc: jsPDF,
  product: Product
): void => {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");

  doc.text(
    "PANASONIC LED CONFIGURATION",
    pageWidth / 2,
    40,
    {
      align: "center",
    }
  );

  doc.setFontSize(18);

  doc.text(
    product.model,
    pageWidth / 2,
    60,
    {
      align: "center",
    }
  );

  doc.setDrawColor(180);

  doc.rect(
    30,
    80,
    pageWidth - 60,
    90
  );

  doc.setFontSize(12);

  doc.text(
    "Panasonic Hero Image Placeholder",
    pageWidth / 2,
    125,
    {
      align: "center",
    }
  );

  doc.setFontSize(10);

  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    210,
    {
      align: "center",
    }
  );
};