import jsPDF from "jspdf";
import { Product } from "../../types/Product";

import { ProductSpecificationService }
  from "../../services/ProductSpecificationService";
export const drawProductSpecsPage = async (
  doc: jsPDF,
  product: Product
): Promise<void> => {
  const specs =
    await ProductSpecificationService.getByModel(
      product.model
    );
  console.log(
    "PRODUCT SPECS JSON:",
    JSON.stringify(specs, null, 2)
  );

 if (
  !specs ||
  Object.keys(specs).length === 0
) {
  
  return;
}

// NORMAL CASE

doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(18);

doc.text(
  "Product Specifications",
  15,
  20
);

doc.setFontSize(12);

doc.text(
  product.model,
  15,
  30
);

doc.setDrawColor(
  180,
  180,
  180
);

doc.line(
  15,
  35,
  195,
  35
);
  const LEFT_X = 15;
  const RIGHT_X = 108;

  let leftY = 48;
  let rightY = 48;

  const drawSection = (
    title: string,
    rows: [string, string][],
    column: "left" | "right"
  ) => {
    const startX =
      column === "left"
        ? LEFT_X
        : RIGHT_X;

    let y =
      column === "left"
        ? leftY
        : rightY;

    doc.setFillColor(
      235,
      235,
      235
    );

    doc.rect(
      startX,
      y - 6,
      82,
      8,
      "F"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      title,
      startX + 2,
      y
    );

    y += 10;

    rows.forEach(
      ([label, value]) => {
        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.text(
          label,
          startX + 2,
          y
        );

        doc.text(
          value ?? "-",
          startX + 40,
          y
        );
        y += 6;
      }
    );

    y += 6;

    if (column === "left") {
      leftY = y;
    } else {
      rightY = y;
    }
  };

  // LEFT COLUMN

  const getSpec = (...keys: string[]) => {
    for (const key of keys) {
      if (specs[key]) {
        return specs[key];
      }
    }

    return "-";
  };

  drawSection(
    "PHYSICAL PARAMETERS",
    [
      [
        "Pixel Configuration",
        specs["Pixel Configuration"],
      ],
      [
        "Pixel Pitch",
        getSpec("Pixel Pitch", "Pixel Pitch (mm)") + " mm",
      ],
      [
        "Module Resolution",
        specs["Module Resolution"],
      ],
      [
        "Module Dimensions",
        specs["Module Dimensions"],
      ],
      [
        "Module Weight",
        specs["Module Weight"],
      ],
      [
        "Modules Per Cabinet",
        specs[
        "Modules Per Cabinet"
        ],
      ],
      [
        "Cabinet Resolution",
        specs[
        "Cabinet Resolution"
        ],
      ],
      [
        "Cabinet Dimensions",
        specs[
        "Cabinet Dimensions"
        ],
      ],
      [
        "Cabinet Surface Area",
        specs[
        "Cabinet Surface Area"
        ],
      ],
      [
        "Cabinet Weight",
        specs["Cabinet Weight"],
      ],
      [
        "Weight Per m²",
        specs["Weight Per Square Meter"] ?? "-"
      ],
      [
        "Flatness",
        specs["Cabinet Flatness"] ?? "-"
      ],
      [
        "Cabinet Material",
        specs[
        "Cabinet Material"
        ],
      ],
      [
        "Service Access",
        specs[
        "Service Access"
        ],
      ],
    ],
    "left"
  );

  drawSection(
    "OPTICAL SPECIFICATIONS",
    [
      [
        "Brightness",
        specs["Brightness"],
      ],
      [
        "Pixel Density",
        specs["Pixel Density"],
      ],
      [
        "Color Temperature",
        specs[
        "Color Temperature"
        ],
      ],
      [
        "Viewing Angle",
        specs[
        "Viewing Angle"
        ],
      ],
      [
        "Brightness Uniformity",
        specs[
        "Brightness Uniformity"
        ],
      ],
      [
        "Color Uniformity",
        specs[
        "Color Uniformity"
        ],
      ],
      [
        "Contrast Ratio",
        specs[
        "Contrast Ratio"
        ],
      ],
      [
        "Processing Depth",
        specs[
        "Processing Depth"
        ],
      ],
    ],
    "left"
  );

  // RIGHT COLUMN

  drawSection(
    "ELECTRICAL SPECIFICATIONS",
    [
      [
        "Power Consumption Max",
        getSpec("Power Consumption Max", "Power Consumption (Max)"),
      ],
      [
        "Power Consumption Average",
        getSpec("Power Consumption Average", "Power Consumption (Average)"),
      ],
      [
        "Power Supply",
        specs["Power Supply"],
      ],
      [
        "Frame Rate",
        specs["Frame Rate"],
      ],
      [
        "Refresh Rate",
        specs["Refresh Rate"],
      ],
    ],
    "right"
  );

  drawSection(
    "OPERATION",
    [
      [
        "LED Lifetime",
        specs["LED Lifetime"] ?? "-",
      ],
      [
        "Application",
        specs["Application"] ?? "-",
      ],
    ],
    "right"
  );

  drawSection(
    "ENVIRONMENT",
    [
      [
        "Operating Temp.",
        specs[
        "Operating Temperature"
        ],
      ],
      [
        "Operating Humidity",
        specs[
        "Operating Humidity"
        ],
      ],
      [
        "IP Rating",
        specs["IP Rating"],
      ],
    ],
    "right"
  );
};