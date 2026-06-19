import jsPDF from "jspdf";
import { Product } from "../../types/Product";

export const drawProductSpecsPage = (
  doc: jsPDF,
  product: Product
): void => {
  doc.setFontSize(20);

  doc.text(
    "Product Specifications",
    20,
    20
  );

  const rows = [
    ["Model", product.model],
    [
      "Pixel Pitch",
      `${product.pitch} mm`,
    ],
    [
      "Brightness",
      `${product.brightness} nits`,
    ],
    [
      "Cabinet Width",
      `${product.cabinetWidth} mm`,
    ],
    [
      "Cabinet Height",
      `${product.cabinetHeight} mm`,
    ],
    [
      "Resolution Width",
      product.cabinetResolutionW.toString(),
    ],
    [
      "Resolution Height",
      product.cabinetResolutionH.toString(),
    ],
    [
      "Modules Per Cabinet",
      product.modulesPerCabinet.toString(),
    ],
  ];

  let y = 40;

  rows.forEach((row) => {
    doc.rect(20, y, 70, 12);

    doc.rect(90, y, 90, 12);

    doc.text(row[0], 25, y + 8);

    doc.text(row[1], 95, y + 8);

    y += 12;
  });
};