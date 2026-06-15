import jsPDF from "jspdf";
import { Product } from "../types/Product";
import { ConfigurationResult } from "../types/ConfigurationResult";

export const generatePdf = (
  product: Product,
  result: ConfigurationResult,
  width: number,
  height: number
): void => {
  const doc = new jsPDF();

  let yPosition = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const lineHeight = 8;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Panasonic LED Configuration", margin, yPosition);

  yPosition += 15;

  // Reset font for content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Helper function to add a field
  const addField = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 50, yPosition);
    yPosition += lineHeight;
  };

  // Model
  addField("Model", product.model);

  yPosition += 3;

  // Requested Dimensions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Requested Dimensions", margin, yPosition);
  doc.setFontSize(11);
  yPosition += lineHeight;

  doc.setFont("helvetica", "normal");
  addField("Width", `${width} m`);
  addField("Height", `${height} m`);

  yPosition += 3;

  // Cabinet Configuration
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cabinet Configuration", margin, yPosition);
  doc.setFontSize(11);
  yPosition += lineHeight;

  doc.setFont("helvetica", "normal");
  addField("Total Cabinets", `${result.totalCabinets}`);
  addField("Cabinets Width", `${result.cabinetsW}`);
  addField("Cabinets Height", `${result.cabinetsH}`);
  addField("Total Modules", `${result.totalModules}`);

  yPosition += 3;

  // Resolution
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resolution", margin, yPosition);
  doc.setFontSize(11);
  yPosition += lineHeight;

  doc.setFont("helvetica", "normal");
  addField("Resolution Width", `${result.resolutionW} px`);
  addField("Resolution Height", `${result.resolutionH} px`);

  yPosition += 3;

  // Actual Dimensions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Actual Dimensions", margin, yPosition);
  doc.setFontSize(11);
  yPosition += lineHeight;

  doc.setFont("helvetica", "normal");
  addField("Width", `${result.actualWidth.toFixed(2)} m`);
  addField("Height", `${result.actualHeight.toFixed(2)} m`);

  yPosition += 3;

  // Total Area
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Area", margin, yPosition);
  doc.setFontSize(11);
  yPosition += lineHeight;

  doc.setFont("helvetica", "normal");
  addField("Area", `${result.totalArea.toFixed(2)} m²`);

  // Save PDF
  doc.save("Panasonic_LED_Configuration.pdf");
};
