import React from "react";

// Base64 is intentionally used instead of a file URL because
// html2canvas does not reliably rasterize external SVG <image>
// references during PDF generation.
// Resolved path for the existing human asset used in ScreenPreview
import { humanBase64 } from "../../assets/humanBase64";

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
    // Structural calculations based on engineering requirements
    const optimalDistance = pixelPitch * 1.5;
    const maximumDistance = pixelPitch * 6;

    // Normalize height fallback values safely
    const displayHeightValue = actualHeight || 14.85;

    const cardStyle: React.CSSProperties = {
        background: "#ffffff",
        borderRadius: 14,
        padding: 24, 
        marginTop: 24,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e5e7eb",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    };

    return (
        <div style={cardStyle}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: "#003B7A", fontSize: 22, fontWeight: 700 }}>
                    Viewing Distance Analysis
                </h2>
                <p style={{ marginTop: 6, color: "#64748B", fontSize: 14, marginBottom: 0 }}>
                    Recommended viewing distances based on the selected pixel pitch.
                </p>
            </div>

            <svg
                width="100%"
                viewBox="0 0 1000 360"
                style={{
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                }}
            >
                <defs>
                    {/* Professional Blueprint CAD Grid */}
                    <pattern
                        id="engineering-grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="1.2"
                        />
                    </pattern>

                    {/* Standardized CAD Arrowheads with matching colors */}
                    <marker
                        id="cad-arrow-right"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                    >
                        <path d="M0,1.5 L6,3.5 L0,5.5 Z" fill="#334155" />
                    </marker>

                    <marker
                        id="cad-arrow-left"
                        markerWidth="7"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                    >
                        <path d="M6,1.5 L0,3.5 L6,5.5 Z" fill="#334155" />
                    </marker>

                    <marker
                        id="arrow-green-right"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                    >
                        <path d="M0,1.5 L6,3.5 L0,5.5 Z" fill="#16a34a" />
                    </marker>

                    <marker
                        id="arrow-green-left"
                        markerWidth="7"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                    >
                        <path d="M6,1.5 L0,3.5 L6,5.5 Z" fill="#16a34a" />
                    </marker>

                    <marker
                        id="arrow-blue-right"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                    >
                        <path d="M0,1.5 L6,3.5 L0,5.5 Z" fill="#2563eb" />
                    </marker>

                    <marker
                        id="arrow-blue-left"
                        markerWidth="7"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                    >
                        <path d="M6,1.5 L0,3.5 L6,5.5 Z" fill="#2563eb" />
                    </marker>
                </defs>

                {/* Grid Overlay Layer */}
                <rect width="1000" height="360" fill="url(#engineering-grid)" />

                {/* Base Ground Plane Alignment line */}
                <line x1="40" y1="290" x2="960" y2="290" stroke="#0f172a" strokeWidth="1.5" />

                {/* STRUCTURE: Physical Architectural Wall Segment */}
                <rect x="125" y="50" width="26" height="240" rx="1" fill="#94a3b8" />
                <text x="138" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569" letterSpacing="0.5">
                    WALL
                </text>

                {/* HARDWARE: Display Chassis Layer (Width: 12, X: 151 means center is at 157) */}
                <rect x="151" y="90" width="12" height="150" rx="2" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
                
                {/* Re-centered text inside the slim screen panel */}
                <text
                    x="157"
                    y="165"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9.5"
                    fill="#ffffff"
                    fontWeight="700"
                    transform="rotate(-90 157 165)"
                    letterSpacing="0.5"
                >
                    Panasonic LED
                </text>

                {/* CAD METRIC: Dynamic Screen Height Dimensioning */}
                <line x1="80" y1="90" x2="80" y2="240" stroke="#475569" strokeWidth="1" markerStart="url(#cad-arrow-left)" markerEnd="url(#cad-arrow-right)" />
                <line x1="70" y1="90" x2="151" y2="90" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="70" y1="240" x2="151" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* Height Label Block */}
                <rect x="45" y="153" width="65" height="24" rx="6" fill="#334155" />
                <text x="77" y="169" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="600">
                    {displayHeightValue.toFixed(2)} m
                </text>

                {/* Green Badge Above Arrow Line */}
                <rect x="260" y="53" width="68" height="24" rx="12" fill="#16a34a" />
                <text x="294" y="69" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="700">
                    {optimalDistance.toFixed(2)} m
                </text>

                {/* OPTIMAL VIEWING DISTANCE ARROW AND TEXT */}
                <line
                    x1="163"
                    y1="95"
                    x2="415"
                    y2="95"
                    stroke="#16a34a"
                    strokeWidth="1.5"
                    markerStart="url(#arrow-green-left)"
                    markerEnd="url(#arrow-green-right)"
                />
                <line x1="415" y1="85" x2="415" y2="105" stroke="#16a34a" strokeWidth="1" strokeDasharray="2 2" />

                <text
                    x="294"
                    y="118"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#1e293b"
                    fontWeight="600"
                >
                    Optimal Viewing Distance
                </text>

                {/* MAXIMUM VIEWING DISTANCE ARROW, BADGE, AND TEXT */}
                <line
                    x1="163"
                    y1="215"
                    x2="735"
                    y2="215"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    markerStart="url(#arrow-blue-left)"
                    markerEnd="url(#arrow-blue-right)"
                />
                <line x1="735" y1="205" x2="735" y2="225" stroke="#2563eb" strokeWidth="1" strokeDasharray="2 2" />
                
                <rect x="440" y="228" width="68" height="24" rx="12" fill="#2563eb" />
                <text x="474" y="244" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="700">
                    {maximumDistance.toFixed(2)} m
                </text>
                
                <text
                    x="474"
                    y="198"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#1e293b"
                    fontWeight="600"
                >
                    Maximum Viewing Distance
                </text>

                {/* HUMAN OPERATOR Y-AXIS SCALE METRIC */}
                <line x1="875" y1="130" x2="875" y2="290" stroke="#475569" strokeWidth="1" markerStart="url(#cad-arrow-left)" markerEnd="url(#cad-arrow-right)" />
                <line x1="800" y1="130" x2="885" y2="130" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                
                <rect x="893" y="193" width="60" height="24" rx="12" fill="#475569" />
                <text x="923" y="209" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="600">
                    183 cm
                </text>

                {/* OPERATOR SILHOUETTE */}
                <g transform="translate(775, 130)">
                    <rect x="0" y="0" width="70" height="160" fill="#f8fafc" opacity="0.9" />
                    <image
                        href={humanBase64}
                        x="0"
                        y="0"
                        width="70"
                        height="160"
                        opacity="0.85"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </g>

                {/* Ground Reference Anchors */}
                <text x="810" y="308" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b" letterSpacing="0.5">
                    VIEWER
                </text>
            </svg>

            {/* Lower Card Panel */}
            <div
                style={{
                    marginTop: 24,
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 20,
                    background: "#ffffff",
                }}
            >
                <h3 style={{ margin: "0 0 16px", color: "#003B7A", fontSize: 16, fontWeight: 700 }}>
                    Viewing Distance Guide
                </h3>

                {[
                    {
                        color: "#16a34a",
                        title: "Excellent Viewing",
                        value: optimalDistance,
                        description: "Ideal for fine text, spreadsheets, control rooms and detailed presentations. Recommended for indoor LED installations where viewers are in close proximity to the screen.",
                    },
                    {
                        color: "#2563eb",
                        title: "Maximum Readability",
                        value: maximumDistance,
                        description: "Suitable for large venues, retail spaces, and advertising displays where content is designed to capture attention from a distance.",
                    },
                ].map((zone, idx, arr) => (
                    <div
                        key={zone.title}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 16,
                            padding: "14px 0",
                            borderBottom: idx === arr.length - 1 ? "none" : "1px solid #f1f5f9",
                        }}
                    >
                        <div
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: zone.color,
                                marginTop: 5,
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
                                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                                    {zone.title}
                                </span>
                                <span style={{ fontWeight: 700, color: zone.color, fontSize: 16 }}>
                                    {zone.value.toFixed(2)} m
                                </span>
                            </div>
                            <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
                                {zone.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewingDistanceVisualizer;