import { forwardRef } from "react";
const screenImage = new URL("../../assets/screen-preview.jpg", import.meta.url).href;
const human = new URL("../../assets/human.png", import.meta.url).href;

interface ScreenPreviewProps {
  width: number;
  height: number;
  resolutionW: number;
  resolutionH: number;
  cabinetsW: number;
  cabinetsH: number;
  model?: string;
  brightness?: number;
  pixelPitch?: number;
  uploadedImage?: string | null; // Added custom background template simulation tracking property
  result?: {
    actualWidth: number;
    actualHeight: number;
  } | null;
}

export const ScreenPreview = forwardRef<HTMLDivElement, ScreenPreviewProps>(
  (
    {
      width,
      height,
      resolutionW,
      resolutionH,
      cabinetsW,
      cabinetsH,
      model,
      brightness = 800,
      pixelPitch = 1.875,
      uploadedImage,
      result,
    },
    ref
  ) => {
    const MAX_PREVIEW_WIDTH = 550;
    const MAX_PREVIEW_HEIGHT = 360;

    const safeWidth = width || 1;
    const safeHeight = height || 1;

    const displayWidthText = result?.actualWidth ? result.actualWidth.toFixed(2) : safeWidth.toFixed(2);
    const displayHeightText = result?.actualHeight ? result.actualHeight.toFixed(2) : safeHeight.toFixed(2);

    const scale = Math.min(
      MAX_PREVIEW_WIDTH / safeWidth,
      MAX_PREVIEW_HEIGHT / safeHeight
    );

    const screenWidthPx = safeWidth * scale;
    const screenHeightPx = safeHeight * scale;

    const marginLeft = 60;
    const marginRight = 90;
    const marginTop = 50;
    const marginBottom = 60;

    // Fixed: Swapped to commercial round matching sales engineer presentation metrics
    const viewingDistance = pixelPitch ? Math.round(pixelPitch * 1.5) : "-";

    return (
      <div
        ref={ref}
        style={{
          marginTop: "40px",
          padding: "30px",
          background: "#f3f1eb",
          borderRadius: "10px",
          color: "#000",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "14px",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Live Preview
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: 700,
              color: "#005BAC",
              marginBottom: "6px",
            }}
          >
            Screen Configuration
          </div>

          {model && (
            <div
              style={{
                fontSize: "15px",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              {model}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "40px",
          }}
        >
          <div
            style={{
              position: "relative" as const,
              width: screenWidthPx + marginLeft + marginRight,
              height: screenHeightPx + marginTop + marginBottom,
              background: "#e9e7e2",
            }}
          >
            {/* Top Live Dimension Label */}
            <div
              className="dimension-label top"
              style={{
                display: "block",
                position: "absolute" as const,
                top: 15,
                left: `${marginLeft + screenWidthPx / 2}px`,
                transform: "translateX(-50%)",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {displayWidthText} m
            </div>

            {/* Side Live Dimension Label */}
            <div
              className="dimension-label side"
              style={{
                position: "absolute" as const,
                left: 15,
                top: `${marginTop + screenHeightPx / 2}px`,
                transform: "translateY(-50%) rotate(-90deg)",
                transformOrigin: "center" as const,
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {displayHeightText} m
            </div>

            {/* Hero Screen Viewport Container */}
            <div
              style={{
                position: "absolute" as const,
                top: marginTop,
                left: marginLeft,
                width: screenWidthPx,
                height: screenHeightPx,
                border: "2px solid #222",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                overflow: "hidden",
                backgroundImage: `url(${uploadedImage || screenImage})`, // Dynamically swaps templates inline
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Cabinet Lines Vertical */}
              {Array.from({
                length: Math.max(0, cabinetsW - 1),
              }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: "absolute" as const,
                    left: `${((i + 1) * 100) / (cabinetsW || 1)}%`,
                    top: 0,
                    bottom: 0,
                    borderLeft: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              ))}

              {/* Cabinet Lines Horizontal */}
              {Array.from({
                length: Math.max(0, cabinetsH - 1),
              }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: "absolute" as const,
                    top: `${((i + 1) * 100) / (cabinetsH || 1)}%`,
                    left: 0,
                    right: 0,
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            {/* Premium Panasonic Info Card Badge Overlay */}
            <div
              style={{
                position: "absolute" as const,
                top: 10,
                right: 10,
                background: "#e8f5e9",        /* Light premium green background */
                border: "1px solid #a5d6a7",  /* Soft green outline */
                color: "#1b5e20",             /* High-contrast dark green text color */
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                minWidth: "180px",
                textAlign: "left" as const,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  borderBottom: "1px solid rgba(46, 125, 50, 0.2)", /* Soft green divider line */
                  paddingBottom: "4px",
                  marginBottom: "6px",
                  color: "#1b5e20"
                }}
              >
                {(resolutionW ?? 0).toLocaleString()} × {(resolutionH ?? 0).toLocaleString()} px
              </div>

              <div style={{ marginTop: "6px", color: "#2e7d32" }}>
                Pixel Pitch: {pixelPitch} mm
              </div>

              <div style={{ marginTop: "4px", color: "#2e7d32" }}>
                Brightness: {brightness} nits
              </div>

              <div style={{ marginTop: "4px", color: "#2e7d32" }}>
                Viewing Distance: {viewingDistance} m
              </div>
            </div>

            {/* Silhouette Scale Anchor Reference */}
            <img
              src={human}
              alt="Human Scale"
              style={{
                position: "absolute" as const,
                right: -75,
                bottom: marginBottom,
                height: 140,
                opacity: 0.45,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute" as const,
                right: -85,
                bottom: marginBottom - 20,
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 600,
                pointerEvents: "none",
              }}
            >
              183 cm Reference
            </div>

          </div>
        </div>
      </div>
    );
  }
);

ScreenPreview.displayName = "ScreenPreview";