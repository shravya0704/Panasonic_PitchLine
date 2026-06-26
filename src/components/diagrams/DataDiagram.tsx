import React from "react";
import { generateDataPaths } from "../../lib/calculations/generateDataPaths";

interface DataDiagramProps {
  cabinetsW: number;
  cabinetsH: number;
  assignmentGrid: string[][];
  showLines?: boolean;
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
  G: "#fdba74",
};

const LINE_COLORS: Record<string, string> = {
  A: "#1d4ed8",
  B: "#15803d",
  C: "#b91c1c",
  D: "#a16207",
  E: "#7e22ce",
  F: "#0e7490",
  G: "#c2410c",
};

export const DataDiagram = ({
  cabinetsW,
  cabinetsH,
  assignmentGrid,
  showLines = true,
}: DataDiagramProps) => {
  const paths =
    generateDataPaths(
      assignmentGrid
    );

  const diagramWidth =
    cabinetsW *
    (CELL_SIZE + GAP);

  const diagramHeight =
    cabinetsH *
    (CELL_SIZE + GAP);

  return (
    <div>
      <h2>Data Diagram</h2>

      <div
        style={{
          position: "relative",
          width: "fit-content",
          border: "2px solid white",
          padding: "5px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cabinetsW}, ${CELL_SIZE}px)`,
            gap: `${GAP}px`,
          }}
        >
          {assignmentGrid.flat().map(
            (chain, index) => (
              <div
                key={index}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor:
                    COLORS[chain] ??
                    "#ddd",

                  display: "flex",
                  justifyContent:
                    "center",

                  alignItems:
                    "flex-start",

                  paddingTop: "4px",

                  fontWeight:
                    "bold",

                  color:
                    LINE_COLORS[
                      chain
                    ] ?? "#000",

                  border: `2px solid ${
                    LINE_COLORS[
                      chain
                    ] ?? "#666"
                  }`,

                  position:
                    "relative",

                  zIndex: 1,
                }}
              >
                {chain}
              </div>
            )
          )}
        </div>

        {showLines && (
          <svg
            width={
              diagramWidth
            }
            height={
              diagramHeight
            }
            style={{
              position:
                "absolute",
              top: 5,
              left: 5,
              pointerEvents:
                "none",
              zIndex: 10,
            }}
          >
            {paths.map(
              (path) => {
                const segments: React.ReactElement[] =
                  [];

                for (
                  let i = 0;
                  i <
                  path.points
                    .length -
                    1;
                  i++
                ) {
                  const current =
                    path.points[
                      i
                    ];

                  const next =
                    path.points[
                      i + 1
                    ];

                  const x =
                    current.col *
                      (CELL_SIZE +
                        GAP) +
                    CELL_SIZE /
                      2;

                  const y1 =
                    current.row *
                      (CELL_SIZE +
                        GAP) +
                    CELL_SIZE /
                      2;

                  const y2 =
                    next.row *
                      (CELL_SIZE +
                        GAP) +
                    CELL_SIZE /
                      2;

                  segments.push(
                    <line
                      key={`${path.chain}-${i}`}
                      x1={x}
                      y1={y1}
                      x2={x}
                      y2={y2}
                      stroke={
                        LINE_COLORS[
                          path
                            .chain
                        ]
                      }
                      strokeWidth={
                        4
                      }
                      strokeLinecap="round"
                    />
                  );
                }

                return (
                  <g
                    key={
                      path.chain
                    }
                  >
                    {
                      segments
                    }
                  </g>
                );
              }
            )}
          </svg>
        )}
      </div>
    </div>
  );
};