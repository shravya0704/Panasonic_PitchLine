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

    const marginLeft = 80;
    
    // 3. Increased right margin to provide dedicated workspace for metadata panel
    const marginRight = 210;
    
    const marginTop = 70;
    const marginBottom = 80;

    // 2. Standardized to unified .toFixed(2) precision across components
    const viewingDistance = pixelPitch !== undefined ? (pixelPitch * 1.5).toFixed(2) : "-";

    return (
      <div
        ref={ref}
        style={{
          marginTop: "40px",
          padding: "30px",
          background: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15,23,42,.06)",
          color: "#000",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#005BAC",
              textTransform: "uppercase",
            }}
          >
            Live Preview
          </div>

          <div
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: "6px",
            }}
          >
            Screen Configuration
          </div>

          {model && (
            <div className="preview-model-badge">
              {model}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "20px",
          }}
        >
          <div
            style={{
              position: "relative" as const,
              width: screenWidthPx + marginLeft + marginRight,
              height: screenHeightPx + marginTop + marginBottom,
              background: "#F8FAFC",
            }}
          >
            {/* Top Engineering Annotation Label */}
            <div
              className="dimension-label top"
              style={{
                display: "block",
                position: "absolute" as const,
                top: 15,
                left: `${marginLeft + screenWidthPx / 2}px`,
                transform: "translateX(-50%)",
                fontWeight: 600,
                fontSize: "16px",
                background: "#FFFFFF",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(15,23,42,.05)",
              }}
            >
              {displayWidthText} m
            </div>

            {/* Side Engineering Annotation Label */}
            <div
              className="dimension-label side"
              style={{
                position: "absolute" as const,
                left: 15,
                top: `${marginTop + screenHeightPx / 2}px`,
                transform: "translateY(-50%) rotate(-90deg)",
                transformOrigin: "center" as const,
                fontWeight: 600,
                fontSize: "16px",
                background: "#FFFFFF",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(15,23,42,.05)",
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
                border: "1px solid #CBD5E1",
                boxShadow: "0 12px 32px rgba(15,23,42,.12)",
                overflow: "hidden",
                backgroundImage: `url(${uploadedImage || screenImage})`,
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
                    borderLeft: "1px dashed rgba(255,255,255,.22)",
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
                    borderTop: "1px dashed rgba(255,255,255,.22)",
                  }}
                />
              ))}
            </div>

            {/* Premium Panasonic Info Card Badge Overlay */}
            {/* 3. Shifted card right to sit inside new canvas workspace with a uniform polish width */}
            <div
              style={{
                position: "absolute" as const,
                top: 28,
                right: 12,
                background: "#FFFFFF",
                border: "1px solid #D6DEE8",
                borderRadius: 12,
                padding: "10px 14px",
                width: 165,
                boxShadow: "0 6px 18px rgba(15,23,42,.08)",
                color: "#0F172A",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  borderBottom: "1px solid rgba(46, 125, 50, 0.2)",
                  paddingBottom: "6px",
                  marginBottom: "8px",
                  color: "#0F172A"
                }}
              >
                {resolutionW ?? 0} × {resolutionH ?? 0} px
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                Pixel Pitch: {pixelPitch} mm
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                Brightness: {brightness} nits
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                Viewing Distance: {viewingDistance} m
              </div>
            </div>

            {/* Silhouette Scale Anchor Reference */}
            {/* 1 & 3. Locked alignment to screen baseline (marginBottom) and balanced right axis position */}
            <img
              src={human}
              alt="Human Scale"
              style={{
                position: "absolute" as const,
                right: 55,
                bottom: marginBottom,
                height: Math.min(screenHeightPx * 0.42, 125),
                opacity: 0.35,
                pointerEvents: "none",
              }}
            />

            {/* Clean Centered Engineering Text Label */}
            {/* 1. Aligned caption relative to the absolute baseline variable offset */}
            <div
              style={{
                position: "absolute" as const,
                right: 10,
                bottom: marginBottom - 34,
                width: 120,
                textAlign: "center" as const,
                fontSize: 12,
                color: "#64748B",
                fontWeight: 600,
                pointerEvents: "none",
              }}
            >
              Human Scale Reference
            </div>

          </div>
        </div>
      </div>
    );
  }
);

ScreenPreview.displayName = "ScreenPreview";