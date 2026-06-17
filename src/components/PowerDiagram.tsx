import React from "react";

interface PowerDiagramProps {
  cabinetsW: number;
  cabinetsH: number;
  assignmentGrid: string[][];
  showLines?: boolean;
}

const CELL_SIZE = 40;
const GAP = 2;

const COLORS: Record<string, string> = {
  A: "#2563eb",
  B: "#16a34a",
  C: "#dc2626",
  D: "#ca8a04",
  E: "#9333ea",
};

export const PowerDiagram = ({
  cabinetsW,
  cabinetsH,
  assignmentGrid,
  showLines = true,
}: PowerDiagramProps) => {
  const paths = generatePaths(assignmentGrid);

  const diagramWidth = cabinetsW * (CELL_SIZE + GAP);
  const diagramHeight = cabinetsH * (CELL_SIZE + GAP);

  return (
    <div>
      <h2>Power Diagram (220V)</h2>

      <div
        style={{
          position: "relative",
          width: "fit-content",
          border: "2px solid white",
          padding: "5px",
        }}
      >
        {/* Grid Layer */}
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
                backgroundColor: COLORS[chain] ?? "#444",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                color: "white",
                zIndex: 1,
              }}
            >
              {chain}
            </div>
          ))}
        </div>

        {/* Overlay Layer */}
        {showLines && (
          <svg
            width={diagramWidth}
            height={diagramHeight}
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {paths.map((path) => {
              const points = path.points
                .map(
                  (p) =>
                    `${p.col * (CELL_SIZE + GAP) + CELL_SIZE / 2},${
                      p.row * (CELL_SIZE + GAP) + CELL_SIZE / 2
                    }`
                )
                .join(" ");

              return (
                <polyline
                  key={path.chain}
                  points={points}
                  fill="none"
                  stroke={COLORS[path.chain] ?? "white"}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

interface GridPoint {
  row: number;
  col: number;
}

interface PowerPath {
  chain: string;
  points: GridPoint[];
}

function generatePaths(grid: string[][]): PowerPath[] {
  const chainMap = new Map<string, PowerPath>();

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const chain = grid[row][col];

      if (!chainMap.has(chain)) {
        chainMap.set(chain, {
          chain,
          points: [],
        });
      }

      chainMap.get(chain)!.points.push({
        row,
        col,
      });
    }
  }

  return Array.from(chainMap.values());
}