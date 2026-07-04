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
  uploadedImage?: string | null;
  result?: { actualWidth: number; actualHeight: number } | null;
  contentType: "sample" | "video" | "upload" | "none";
  // ADDED: Unit tracking prop
  unit: "mtr" | "ft";
}

export const ScreenPreview = forwardRef<HTMLDivElement, ScreenPreviewProps>(
  ({ width, height, resolutionW, resolutionH, cabinetsW, cabinetsH, model, brightness = 800, pixelPitch = 1.875, uploadedImage, result, contentType, unit }, ref) => {
    const MAX_PREVIEW_WIDTH = 550;
    const MAX_PREVIEW_HEIGHT = 360;
    const METERS_TO_FEET = 3.28084;

    const safeWidth = width || 1;
    const safeHeight = height || 1;

    // Convert underlying calculations conditionally for display matching
    const baseWidth = result?.actualWidth ? result.actualWidth : safeWidth;
    const baseHeight = result?.actualHeight ? result.actualHeight : safeHeight;

    const displayWidthText = (unit === "mtr" ? baseWidth : baseWidth * METERS_TO_FEET).toFixed(2);
    const displayHeightText = (unit === "mtr" ? baseHeight : baseHeight * METERS_TO_FEET).toFixed(2);

    const scale = Math.min(MAX_PREVIEW_WIDTH / safeWidth, MAX_PREVIEW_HEIGHT / safeHeight);
    const screenWidthPx = safeWidth * scale;
    const screenHeightPx = safeHeight * scale;
    const marginLeft = 80;
    const marginRight = 210;
    const marginTop = 70;
    const marginBottom = 80;

    // Convert viewing distance metrics uniformly matching the global state
    const baseViewingDistance = pixelPitch !== undefined ? pixelPitch * 1.5 : null;
    const viewingDistance = baseViewingDistance !== null 
      ? (unit === "mtr" ? baseViewingDistance : baseViewingDistance * METERS_TO_FEET).toFixed(2) 
      : "-";

    return (
      <div ref={ref} style={{ marginTop: "40px", padding: "30px", background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(15,23,42,.06)", color: "#000" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#005BAC", textTransform: "uppercase" }}>Live Preview</div>
          <div style={{ fontSize: "42px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>Screen Configuration</div>
          {model && <div className="preview-model-badge">{model}</div>}
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "20px" }}>
          <div style={{ position: "relative", width: screenWidthPx + marginLeft + marginRight, height: screenHeightPx + marginTop + marginBottom, background: "#F8FAFC" }}>
            
            {/* Top Engineering Label */}
            <div style={{ position: "absolute", top: 15, left: `${marginLeft + screenWidthPx / 2}px`, transform: "translateX(-50%)", fontWeight: 600, fontSize: "16px", background: "#FFFFFF", padding: "4px 10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>{displayWidthText} {unit}</div>
            
            {/* Side Engineering Label */}
            <div style={{ position: "absolute", left: 15, top: `${marginTop + screenHeightPx / 2}px`, transform: "translateY(-50%) rotate(-90deg)", fontWeight: 600, fontSize: "16px", background: "#FFFFFF", padding: "4px 10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>{displayHeightText} {unit}</div>

            {/* HERO VIEWPORT */}
            <div style={{ position: "absolute", top: marginTop, left: marginLeft, width: screenWidthPx, height: screenHeightPx, border: "1px solid #CBD5E1", overflow: "hidden", backgroundColor: contentType === "none" ? "#0043A4" : "#F8FAFC" }}>
              
              {/* CONTENT LAYER */}
              {(contentType === "sample" || contentType === "upload") && (
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${contentType === "upload" && uploadedImage ? uploadedImage : screenImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              )}
              {contentType === "video" && (
                <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} src="/sample-loop.mp4" />
              )}

              {/* GRID LINES (Now properly contained) */}
              {Array.from({ length: Math.max(0, cabinetsW - 1) }).map((_, i) => (
                <div key={`v-${i}`} style={{ position: "absolute", left: `${((i + 1) * 100) / (cabinetsW || 1)}%`, top: 0, bottom: 0, borderLeft: "1px solid rgba(255, 255, 255, 0.6)" }} />
              ))}
              {Array.from({ length: Math.max(0, cabinetsH - 1) }).map((_, i) => (
                <div key={`h-${i}`} style={{ position: "absolute", top: `${((i + 1) * 100) / (cabinetsH || 1)}%`, left: 0, right: 0, borderTop: "1px solid rgba(255, 255, 255, 0.6)" }} />
              ))}
            </div>

            {/* INFO CARD */}
            <div style={{ position: "absolute", top: 28, right: 12, background: "#FFFFFF", border: "1px solid #D6DEE8", borderRadius: 12, padding: "10px 14px", width: 165, zIndex: 2 }}>
              <div style={{ fontSize: "16px", fontWeight: 700, borderBottom: "1px solid rgba(46, 125, 50, 0.2)", marginBottom: "8px" }}>{resolutionW} × {resolutionH} px</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Pixel Pitch: {pixelPitch} mm</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Brightness: {brightness} nits</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Viewing Distance: {viewingDistance} {unit}</div>
            </div>

            {/* SILHOUETTE */}
            <img src={human} alt="Human Scale" style={{ position: "absolute", right: 55, bottom: marginBottom, height: Math.min(screenHeightPx * 0.42, 125), opacity: 0.35 }} />
            <div style={{ position: "absolute", right: 10, bottom: marginBottom - 34, width: 120, textAlign: "center", fontSize: 12, color: "#64748B", fontWeight: 600 }}>Human Scale Reference</div>
          </div>
        </div>
      </div>
    );
  }
);

ScreenPreview.displayName = "ScreenPreview";