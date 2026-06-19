import jsPDF from "jspdf";
import { Product } from "../../types/Product";
import { ConfigurationResult } from "../../types/ConfigurationResult";

export const drawScreenSpecsPage = (
  doc: jsPDF,
  product: Product,
  result: ConfigurationResult,
  screenPreviewImage: string | undefined,
  requestedWidth: number,
  requestedHeight: number
): void => {
  doc.setFontSize(20);

  doc.text(
    "Screen Configuration",
    20,
    20
  );

  // --------------------------------
  // Left Column
  // --------------------------------

  doc.setFontSize(11);

  let y = 35;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    `Model: ${product.model}`,
    20,
    y
  );

  y += 10;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    `Requested Width: ${requestedWidth} m`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Requested Height: ${requestedHeight} m`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Actual Width: ${result.actualWidth.toFixed(
      2
    )} m`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Actual Height: ${result.actualHeight.toFixed(
      2
    )} m`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Resolution: ${result.resolutionW.toLocaleString()} × ${result.resolutionH.toLocaleString()}`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Cabinets: ${result.cabinetsW} × ${result.cabinetsH}`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Total Cabinets: ${result.totalCabinets}`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Total Modules: ${result.totalModules}`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Total Area: ${result.totalArea.toFixed(
      2
    )} m²`,
    20,
    y
  );

  // --------------------------------
  // Screen Preview
  // --------------------------------

  if (screenPreviewImage) {
    doc.addImage(
      screenPreviewImage,
      "PNG",
      15,
      110,
      180,
      120
    );
  }
};