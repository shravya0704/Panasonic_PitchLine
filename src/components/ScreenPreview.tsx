import { forwardRef } from "react";
import screenImage from "../assets/screen-preview.jpg";

interface ScreenPreviewProps {
  width: number;
  height: number;
  resolutionW: number;
  resolutionH: number;
  cabinetsW: number;
  cabinetsH: number;
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
    },
    ref
  ) => {
    const scale = 100;

    const screenWidthPx = width * scale;
    const screenHeightPx = height * scale;

    const marginLeft = 80;
    const marginRight = 80;
    const marginTop = 70;
    const marginBottom = 80;

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
        <h2 style={{ textAlign: "center" }}>
          Screen Preview
        </h2>

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
                width: 28,
                height: 150,
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