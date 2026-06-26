import React from "react";

interface PowerDiagramProps {
  cabinetsW: number;
  cabinetsH: number;
  assignmentGrid: string[][];
}

const CELL_SIZE = 40;
const GAP = 2;

const COLORS: Record<string, string> = {
  A: "#bfdbfe",
  B: "#bbf7d0",
  C: "#fecaca",
  D: "#fde68a",
  E: "#e9d5ff",
  F: "#a5f3fc",
  G: "#e5e7eb",
  H: "#d1d5db",
  I: "#f3f4f6",
  J: "#e5e7eb",
};

const LINE_COLORS: Record<string, string> = {
  A: "#1e40af",
  B: "#15803d",
  C: "#b91c1c",
  D: "#a16207",
  E: "#6b21a8",
  F: "#0e7490",
  G: "#374151",
  H: "#374151",
  I: "#374151",
  J: "#374151",
};

export const PowerDiagram = ({
  cabinetsW,
  cabinetsH,
  assignmentGrid,
}: PowerDiagramProps) => {
  return (
    <div>
      <h2>Power Diagram (220V)</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cabinetsW}, ${CELL_SIZE}px)`,
          gap: `${GAP}px`,
        }}
      >
        {assignmentGrid.flat().map((chain, index) => (
          <div
            key={index}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor:
                COLORS[chain] ?? "#ddd",
              border: `3px solid ${
                LINE_COLORS[chain] ?? "#333"
              }`,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              padding: "4px",
              fontWeight: "bold",
              color:
                LINE_COLORS[chain] ?? "#333",
              boxSizing: "border-box",
            }}
          >
            {chain}
          </div>
        ))}
      </div>
    </div>
  );
};