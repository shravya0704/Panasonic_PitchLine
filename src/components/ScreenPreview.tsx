import { forwardRef } from "react";
import screenImage from "../assets/screen-preview.jpg";

interface ScreenPreviewProps {
  width: number;
  height: number;
  resolutionW: number;
  resolutionH: number;
  cabinetsW: number;
  cabinetsH: number;
  model?: string;
}

export const ScreenPreview = forwardRef<
  HTMLDivElement,
  ScreenPreviewProps
>(
  (
    {
      width,
      height,
      resolutionW,
      resolutionH,
      cabinetsW,
      cabinetsH,
      model,
    },
    ref
  ) => {
    const MAX_PREVIEW_WIDTH = 450;
    const MAX_PREVIEW_HEIGHT = 280;

    const safeWidth = width || 1;
    const safeHeight = height || 1;

    const scale = Math.min(
      MAX_PREVIEW_WIDTH / safeWidth,
      MAX_PREVIEW_HEIGHT / safeHeight
    );

    const screenWidthPx = width * scale;
    const screenHeightPx = height * scale;

    const marginLeft = 60;
    const marginRight = 60;
    const marginTop = 50;
    const marginBottom = 60;

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
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
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
              position: "relative",
              width:
                screenWidthPx +
                marginLeft +
                marginRight,
              height:
                screenHeightPx +
                marginTop +
                marginBottom,
              background: "#e9e7e2",
            }}
          >
            {/* Width */}
            <div
              style={{
                display: "none",
                position: "absolute",
                top: 15,
                left: "50%",
                transform: "translateX(-50%)",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {width.toFixed(2)} m
            </div>

            {/* Height */}
            <div
              style={{
                position: "absolute",
                left: 15,
                top: "50%",
                transform:
                  "translateY(-50%) rotate(-90deg)",
                transformOrigin: "center",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {height.toFixed(2)} m
            </div>

            {/* Screen */}
            <div
              style={{
                position: "absolute",
                top: marginTop,
                left: marginLeft,
                width: screenWidthPx,
                height: screenHeightPx,
                border: "3px solid red",
                overflow: "hidden",
                backgroundImage: `url(${screenImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >



              {/* Vertical Cabinet Lines */}
              {Array.from({
                length: cabinetsW - 1,
              }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: "absolute",
                    left: `${((i + 1) * 100) / cabinetsW}%`,
                    top: 0,
                    bottom: 0,
                    borderLeft:
                      "1px solid rgba(255,255,255,0.5)",
                  }}
                />
              ))}

              {/* Horizontal Cabinet Lines */}
              {Array.from({
                length: cabinetsH - 1,
              }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: "absolute",
                    top: `${((i + 1) * 100) / cabinetsH}%`,
                    left: 0,
                    right: 0,
                    borderTop:
                      "1px solid rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>

            {/* Resolution */}
            <div
              style={{
                position: "absolute",
                top:
                  marginTop +
                  screenHeightPx +
                  15,
                left: marginLeft,
                fontWeight: "bold",
              }}
            >
              Resolution:{" "}
              {resolutionW.toLocaleString()} ×{" "}
              {resolutionH.toLocaleString()}
            </div>

            {/* Human silhouette */}
            <div
              style={{
                position: "absolute",
                right: 15,
                bottom: marginBottom,
                width: 18,
                height: 110,
                opacity: 0.7,
                background: "#888",
                borderRadius: "20px 20px 0 0",
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

ScreenPreview.displayName = "ScreenPreview";