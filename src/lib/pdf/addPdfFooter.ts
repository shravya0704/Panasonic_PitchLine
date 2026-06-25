import jsPDF from "jspdf";

export const addPdfFooter = (
  doc: jsPDF,
  proposalId: string,
  pageNumber: number,
  totalPages: number
) => {

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  doc.setDrawColor(220);

  doc.line(
    15,
    pageHeight - 15,
    pageWidth - 15,
    pageHeight - 15
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    100,
    100,
    100
  );

  doc.text(
    `Proposal ID: ${proposalId}`,
    15,
    pageHeight - 8
  );

  doc.text(
    "Panasonic LED Configurator",
    pageWidth / 2,
    pageHeight - 8,
    {
      align: "center"
    }
  );

  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth - 15,
    pageHeight - 8,
    {
      align: "right"
    }
  );
};