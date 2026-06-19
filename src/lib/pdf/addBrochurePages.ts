import jsPDF from "jspdf";

import page2 from "../../assets/brochures/pfp/0002.jpg";
import page3 from "../../assets/brochures/pfp/0003.jpg";
import page4 from "../../assets/brochures/pfp/0004.jpg";
import page5 from "../../assets/brochures/pfp/0005.jpg";
import page6 from "../../assets/brochures/pfp/0006.jpg";
import page7 from "../../assets/brochures/pfp/0007.jpg";

const brochurePages = [
  page2,
  page3,
  page4,
  page5,
  page6,
  page7,
];

export const addBrochurePages = (
  doc: jsPDF
): void => {
  brochurePages.forEach((page) => {
    doc.addPage();

    doc.addImage(
      page,
      "JPEG",
      0,
      0,
      210,
      297
    );
  });
};