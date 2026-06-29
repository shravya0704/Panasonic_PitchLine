import React from "react";

interface ViewingDistanceVisualizerProps {
    pixelPitch: number;
    actualWidth: number;
    actualHeight: number;
}

const ViewingDistanceVisualizer: React.FC<ViewingDistanceVisualizerProps> = ({
    pixelPitch,
    actualWidth,
    actualHeight,
}) => {
    const optimalDistance = pixelPitch * 1.5;
    const comfortableDistance = pixelPitch * 3;
    const maximumDistance = pixelPitch * 6;

    const cardStyle: React.CSSProperties = {
        background: "#ffffff",
        borderRadius: 14,
        padding: 18, 
        marginTop: 24,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
    };

    return (
        <div style={cardStyle}>
            <div
                style={{
                    marginBottom: 20,
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        color: "#003B7A",
                    }}
                >
                    Viewing Distance Analysis
                </h2>

                <p
                    style={{
                        marginTop: 8,
                        color: "#666",
                        marginBottom: 0,
                    }}
                >
                    Recommended viewing distance based on pixel pitch.
                </p>
            </div>

            <svg
                width="100%"
                viewBox="0 0 900 210"
                style={{
                    borderRadius: 12,
                    background: "#fbfcfe",
                    border: "1px solid #edf2f7",
                }}
            >
                <defs>
                    <pattern
                        id="grid"
                        width="25"
                        height="25"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M25 0 L0 0 0 25"
                            fill="none"
                            stroke="#eef3f8"
                            strokeWidth="1"
                        />
                    </pattern>

                    <marker
                        id="arrow"
                        markerWidth="8"
                        markerHeight="8"
                        refX="6"
                        refY="3"
                        orient="auto"
                    >
                        <path
                            d="M0,0 L6,3 L0,6"
                            fill="#005BAC"
                        />
                    </marker>
                </defs>

                <rect
                    width="900"
                    height="210"
                    fill="url(#grid)"
                />

                {/* Wall */}
                <rect
                    x="70"
                    y="40"
                    width="16"
                    height="135"
                    rx="3"
                    fill="#5f6368"
                />

                <text
                    x="78"
                    y="32"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#333"
                >
                    Wall
                </text>

                {/* LED */}
                <rect
                    x="92"
                    y="60"
                    width="20"
                    height="96"
                    rx="2"
                    fill="#005BAC"
                />

                <text
                    x="120"
                    y="53"
                    fontSize="14"
                    fill="#005BAC"
                    fontWeight="600"
                >
                    Panasonic LED
                </text>

                {/* Viewing line */}
                <line
                    x1="112"
                    y1="108"
                    x2="720"
                    y2="108"
                    stroke="#005BAC"
                    strokeWidth="2.5"
                    strokeDasharray="10 7"
                    markerEnd="url(#arrow)"
                />

                {/* Distance badge */}
                <rect
                    x="340"
                    y="88"
                    width="160"
                    height="40"
                    rx="20"
                    fill="#ffffff"
                    stroke="#d6e4ff"
                />

                <text
                    x="420"
                    y="113"
                    textAnchor="middle"
                    fontSize="16"
                    fill="#005BAC"
                    fontWeight="700"
                >
                    {optimalDistance.toFixed(2)} m
                </text>

                {/* Viewer (Shifted down dynamically per criteria) */}
                <circle
                    cx="760"
                    cy="95"
                    r="13"
                    fill="none"
                    stroke="#333"
                    strokeWidth="2"
                />

                <line
                    x1="760"
                    y1="108"
                    x2="760"
                    y2="158"
                    stroke="#333"
                    strokeWidth="2"
                />

                <line
                    x1="760"
                    y1="121"
                    x2="740"
                    y2="135"
                    stroke="#333"
                    strokeWidth="2"
                />

                <line
                    x1="760"
                    y1="121"
                    x2="780"
                    y2="135"
                    stroke="#333"
                    strokeWidth="2"
                />

                <line
                    x1="760"
                    y1="158"
                    x2="744"
                    y2="187"
                    stroke="#333"
                    strokeWidth="2"
                />

                <line
                    x1="760"
                    y1="158"
                    x2="776"
                    y2="187"
                    stroke="#333"
                    strokeWidth="2"
                />

                <text
                    x="760"
                    y="210"
                    textAnchor="middle"
                    fill="#555"
                    fontSize="14"
                >
                    Viewer
                </text>

                {/* Engineering dimension */}
                <line
                    x1="112"
                    y1="180"
                    x2="720"
                    y2="180"
                    stroke="#999"
                    strokeWidth="1.5"
                    markerStart="url(#arrow)"
                    markerEnd="url(#arrow)"
                />

                <line
                    x1="112"
                    y1="168"
                    x2="112"
                    y2="192"
                    stroke="#999"
                />

                <line
                    x1="720"
                    y1="168"
                    x2="720"
                    y2="192"
                    stroke="#999"
                />

                <text
                    x="416"
                    y="173"
                    textAnchor="middle"
                    fill="#666"
                    fontSize="13"
                >
                    Optimal Viewing Distance
                </text>
            </svg>

            {/* Audience Viewing Zones */}
            <div
                style={{
                    marginTop: 24,
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: 20,
                    background: "#FCFDFE",
                }}
            >
                <h3
                    style={{
                        margin: "0 0 18px",
                        color: "#003B7A",
                        fontSize: 18,
                    }}
                >
                    Audience Viewing Zones
                </h3>

                {[
                    {
                        color: "#16A34A",
                        title: "Excellent Viewing",
                        value: optimalDistance,
                        description:
                            "Ideal for fine text, spreadsheets, control rooms and detailed presentations.",
                    },
                    {
                        color: "#F59E0B",
                        title: "Comfortable Viewing",
                        value: comfortableDistance,
                        description:
                            "Recommended for conference rooms, classrooms and auditoriums.",
                    },
                    {
                        color: "#2563EB",
                        title: "Maximum Readability",
                        value: maximumDistance,
                        description:
                            "Suitable for large venues where viewers are seated farther away.",
                    },
                ].map((zone) => (
                    <div
                        key={zone.title}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 16,
                            padding: "14px 0",
                            borderBottom:
                                zone.title === "Maximum Readability"
                                    ? "none"
                                    : "1px solid #EDF2F7",
                        }}
                    >
                        <div
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: zone.color,
                                marginTop: 6,
                                flexShrink: 0,
                            }}
                        />

                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 700,
                                        color: "#003B7A",
                                        fontSize: 16,
                                    }}
                                >
                                    {zone.title}
                                </span>

                                <span
                                    style={{
                                        fontWeight: 700,
                                        color: zone.color,
                                        fontSize: 18,
                                    }}
                                >
                                    {zone.value.toFixed(2)} m
                                </span>
                            </div>

                            <div
                                style={{
                                    color: "#64748B",
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                }}
                            >
                                {zone.description}
                            </div>
                        </div>
                    </div>
                ))}

                <div
                    style={{
                        marginTop: 18,
                        paddingTop: 16,
                        borderTop: "1px dashed #CBD5E1",
                        color: "#64748B",
                        fontSize: 13,
                        lineHeight: 1.6,
                    }}
                >
                    <strong>Note:</strong> Viewing distances are engineering recommendations
                    based on the selected pixel pitch and should be used as planning guidance.
                    Actual viewing comfort may vary depending on content type, ambient lighting,
                    and installation environment.
                </div>
            </div>
        </div>
    );
};

export default ViewingDistanceVisualizer;