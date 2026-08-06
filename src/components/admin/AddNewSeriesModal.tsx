import { useState, type ChangeEvent } from "react";
import AdminModal from "./AdminModal";
import SeriesAdminService from "../../services/SeriesAdminService";
import SeriesForm from "./SeriesForm";
import ProductService from "../../services/ProductService";
import type { UploadProgress } from "../../types/SeriesAdmin";

interface Props {
  onClose: () => void;
  onSeriesCreated: (seriesId: string, seriesCode: string) => void;
}

type Step = "create" | "brochure" | "seriesSpecs" | "creating" | "complete";
type SeriesType = "standard" | "aio";

// AIO Defaults (136-inch reference)
const AIO_DEFAULTS = {
  displayDiagonal: 136,
  resolutionW: 1920,
  resolutionH: 1080,
  pixelPitch: 1.56,
  brightness: 800,
};

export default function AddNewSeriesModal({
  onClose,
  onSeriesCreated,
}: Props) {
  const [code, setCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [seriesType, setSeriesType] = useState<SeriesType>("standard");
  const [codeError, setCodeError] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");

  // AIO Specs State
  const [aioDisplayDiagonal, setAioDisplayDiagonal] = useState<number>(AIO_DEFAULTS.displayDiagonal);
  const [aioResolutionW, setAioResolutionW] = useState<number>(AIO_DEFAULTS.resolutionW);
  const [aioResolutionH, setAioResolutionH] = useState<number>(AIO_DEFAULTS.resolutionH);
  const [aioPixelPitch, setAioPixelPitch] = useState<number>(AIO_DEFAULTS.pixelPitch);
  const [aioBrightness, setAioBrightness] = useState<number>(AIO_DEFAULTS.brightness);
  const [aioSpecsError, setAioSpecsError] = useState<string>("");

  const [step, setStep] = useState<Step>("create");
  const [seriesId, setSeriesId] = useState<string>("");
  const [seriesCode, setSeriesCode] = useState<string>("");
  const [seriesBrochureId, setSeriesBrochureId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    current: 0,
    total: 0,
    stage: "uploading",
  });

  const validateStep1 = (): boolean => {
    let valid = true;
    setCodeError("");
    setNameError("");
    setAioSpecsError("");

    if (!code.trim()) {
      setCodeError("Series code is required");
      valid = false;
    }
    if (!name.trim()) {
      setNameError("Series name is required");
      valid = false;
    }

    // Validate AIO specs if AIO series
    if (seriesType === "aio") {
      if (aioDisplayDiagonal <= 0 || aioDisplayDiagonal > 500) {
        setAioSpecsError("Display diagonal must be between 1 and 500 inches");
        valid = false;
      }
      if (aioResolutionW <= 0 || aioResolutionH <= 0) {
        setAioSpecsError("Resolution must be positive values");
        valid = false;
      }
      if (aioPixelPitch <= 0 || aioPixelPitch > 10) {
        setAioSpecsError("Pixel pitch must be between 0 and 10 mm");
        valid = false;
      }
      if (aioBrightness <= 0 || aioBrightness > 10000) {
        setAioSpecsError("Brightness must be between 1 and 10000 nits");
        valid = false;
      }
    }

    return valid;
  };

  const handleCreateSeries = async (): Promise<void> => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await SeriesAdminService.initiateSeriesCreation({
        code: code.trim(),
        name: name.trim(),
        type: seriesType,
        // Pass AIO specs if AIO series
        ...(seriesType === "aio" && {
          aioDisplayDiagonal,
          aioResolutionW,
          aioResolutionH,
          aioPixelPitch,
          aioBrightness,
        }),
      });

      setSeriesId(result.seriesId);
      setSeriesCode(code.trim());
      setSeriesBrochureId(result.seriesBrochureId);
      setStep("brochure");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create series";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    setFileError("");
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setFileError("File size must be less than 100MB");
      return;
    }

    setPdfFile(file);
  };

  const handleUploadBrochure = async (): Promise<void> => {
    if (!pdfFile) {
      setFileError("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await SeriesAdminService.uploadBrochureForSeries(
        seriesId,
        seriesCode,
        seriesBrochureId,
        pdfFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // For AIO: auto-create product and go to complete
      // For Standard: go to series specs form
      if (seriesType === "aio") {
        setStep("creating");
        await createAIOProduct();
      } else {
        setStep("seriesSpecs");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload brochure";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Auto-create default product for AIO series
   * AIO = one series, one product. No variants.
   */
  const createAIOProduct = async (): Promise<void> => {
    try {
      await ProductService.createProduct({
        model: seriesCode, // Model name = series code (e.g., "AIO-L")
        seriesCode: seriesCode,
        applicationType: "Indoor (Flat Display)", // AIO is always flat indoor
        pitch: aioPixelPitch,
        brightness: aioBrightness,
        maxPowerPerM2: 0, // Not applicable for AIO
        avgPowerPerM2: 0, // Not applicable for AIO
        cabinetWidth: 0, // Not applicable for AIO
        cabinetHeight: 0, // Not applicable for AIO
        cabinetResolutionW: aioResolutionW,
        cabinetResolutionH: aioResolutionH,
        modulesPerCabinet: 1, // Dummy value, not used
        led_type: "GOB",                          // ← UPDATED
        aio_display_diagonal: aioDisplayDiagonal,  // ← UPDATED
        product_specifications: [
          {
            specification_name: "LED Type",
            specification_value: "GOB",
          },
        ],
      });

      setStep("complete");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create AIO product";
      setError(errorMessage);
      setStep("creating");
    }
  };

  const handleSeriesSpecsSaved = (): void => {
    // After series specs are saved (standard series only), move to adding first model
    // This step is skipped for AIO
    setStep("complete");
  };

  const handleComplete = (): void => {
    onSeriesCreated(seriesId, seriesCode);
    onClose();
  };

  const handleBack = (): void => {
    if (step === "brochure") {
      setStep("create");
      setError("");
    } else if (step === "seriesSpecs") {
      setStep("brochure");
      setError("");
    }
  };

  return (
    <AdminModal onClose={onClose}>
      {step === "create" && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Create New Series</h3>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Series Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError("");
              }}
              placeholder="e.g., PFP, PIK, AIO-L"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: codeError ? "2px solid #ff4444" : "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            {codeError && (
              <p style={{ margin: "6px 0 0 0", color: "#ff4444", fontSize: 12 }}>
                {codeError}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Series Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="e.g., Panasonic Full Pitch, AIO 136-inch"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: nameError ? "2px solid #ff4444" : "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            {nameError && (
              <p style={{ margin: "6px 0 0 0", color: "#ff4444", fontSize: 12 }}>
                {nameError}
              </p>
            )}
          </div>

          {/* Series Type Dropdown */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Series Type
            </label>
            <select
              value={seriesType}
              onChange={(e) => setSeriesType(e.target.value as SeriesType)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
            >
              <option value="standard">Standard (Cabinet-based)</option>
              <option value="aio">AIO (Fixed Display Unit)</option>
            </select>
            <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: 12 }}>
              {seriesType === "aio"
                ? "Enter the display specifications below"
                : "Standard series allow flexible cabinet configuration"}
            </p>
          </div>

          {/* AIO SPECS FORM - Only show if AIO selected */}
          {seriesType === "aio" && (
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f0f8ff",
                border: "1px solid #005BAC",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 16px 0", color: "#005BAC" }}>
                AIO Display Specifications
              </h4>

              {/* Display Diagonal */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Display Diagonal (inches)
                </label>
                <input
                  type="number"
                  value={aioDisplayDiagonal}
                  onChange={(e) => {
                    setAioDisplayDiagonal(parseFloat(e.target.value) || 0);
                    setAioSpecsError("");
                  }}
                  min="1"
                  max="500"
                  step="0.1"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: aioSpecsError ? "2px solid #ff4444" : "1px solid #ddd",
                    borderRadius: 4,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Resolution W × H */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Resolution W (px)
                  </label>
                  <input
                    type="number"
                    value={aioResolutionW}
                    onChange={(e) => {
                      setAioResolutionW(parseInt(e.target.value) || 0);
                      setAioSpecsError("");
                    }}
                    min="1"
                    step="1"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: aioSpecsError ? "2px solid #ff4444" : "1px solid #ddd",
                      borderRadius: 4,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Resolution H (px)
                  </label>
                  <input
                    type="number"
                    value={aioResolutionH}
                    onChange={(e) => {
                      setAioResolutionH(parseInt(e.target.value) || 0);
                      setAioSpecsError("");
                    }}
                    min="1"
                    step="1"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: aioSpecsError ? "2px solid #ff4444" : "1px solid #ddd",
                      borderRadius: 4,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Pixel Pitch */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Pixel Pitch (mm)
                </label>
                <input
                  type="number"
                  value={aioPixelPitch}
                  onChange={(e) => {
                    setAioPixelPitch(parseFloat(e.target.value) || 0);
                    setAioSpecsError("");
                  }}
                  min="0.1"
                  max="10"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: aioSpecsError ? "2px solid #ff4444" : "1px solid #ddd",
                    borderRadius: 4,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Brightness */}
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Brightness (nits)
                </label>
                <input
                  type="number"
                  value={aioBrightness}
                  onChange={(e) => {
                    setAioBrightness(parseInt(e.target.value) || 0);
                    setAioSpecsError("");
                  }}
                  min="1"
                  max="10000"
                  step="1"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: aioSpecsError ? "2px solid #ff4444" : "1px solid #ddd",
                    borderRadius: 4,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {aioSpecsError && (
                <p style={{ margin: "8px 0 0 0", color: "#ff4444", fontSize: 12 }}>
                  {aioSpecsError}
                </p>
              )}
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#fff0f0",
                border: "1px solid #ffcccc",
                borderRadius: 6,
                color: "#cc0000",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: "8px 20px",
                background: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: 6,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSeries}
              disabled={isLoading}
              style={{
                padding: "8px 20px",
                background: "#005BAC",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Creating..." : "Next: Upload Brochure"}
            </button>
          </div>
        </div>
      )}

      {step === "brochure" && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Upload Brochure</h3>

          <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
            Series code: <strong>{seriesCode}</strong>
          </p>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Brochure PDF
            </label>

            {!pdfFile ? (
              <div
                style={{
                  border: "2px dashed #005BAC",
                  borderRadius: 8,
                  padding: 40,
                  textAlign: "center",
                  background: "#f5f9ff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{
                    display: "none",
                  }}
                  id="brochure-upload"
                />
                <label
                  htmlFor="brochure-upload"
                  style={{
                    display: "block",
                    cursor: "pointer",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#005BAC",
                      fontWeight: 500,
                    }}
                  >
                    Click to upload or drag and drop
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "#999",
                      fontSize: 12,
                    }}
                  >
                    PDF (max 100MB)
                  </p>
                </label>
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid #4caf50",
                  borderRadius: 8,
                  padding: 16,
                  background: "#f1f8f4",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontWeight: 500,
                      color: "#2e7d32",
                    }}
                  >
                    ✓ {pdfFile.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPdfFile(null);
                    setFileError("");
                  }}
                  style={{
                    padding: "6px 12px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            {fileError && (
              <p style={{ margin: "6px 0 0 0", color: "#ff4444", fontSize: 12 }}>
                {fileError}
              </p>
            )}
          </div>

          {uploadProgress.stage !== "uploading" && uploadProgress.total > 0 && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#f5f5f5",
                borderRadius: 6,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {uploadProgress.message}
              </p>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: "#e0e0e0",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    height: "100%",
                    background: "#005BAC",
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#fff0f0",
                border: "1px solid #ffcccc",
                borderRadius: 6,
                color: "#cc0000",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleBack}
              disabled={isLoading}
              style={{
                padding: "8px 20px",
                background: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: 6,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Back
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: "8px 20px",
                background: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: 6,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUploadBrochure}
              disabled={!pdfFile || isLoading}
              style={{
                padding: "8px 20px",
                background: "#005BAC",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: !pdfFile || isLoading ? "not-allowed" : "pointer",
                opacity: !pdfFile || isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Uploading..." : "Upload Brochure"}
            </button>
          </div>
        </div>
      )}

      {step === "seriesSpecs" && (
        <SeriesForm
          seriesCode={seriesCode}
          onSave={handleSeriesSpecsSaved}
          onCancel={handleBack}
        />
      )}

      {step === "creating" && (
        <div>
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #005BAC",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: 14,
              }}
            >
              Creating AIO product...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div>
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: "#2e7d32",
              }}
            >
              ✓ Series Ready
            </h3>
            <p
              style={{
                margin: "0 0 16px 0",
                color: "#666",
                fontSize: 14,
              }}
            >
              Series <strong>{seriesCode}</strong> has been created{seriesType === "aio" ? " with default AIO product" : ""}.
            </p>
            <p
              style={{
                margin: 0,
                color: "#999",
                fontSize: 13,
              }}
            >
              {seriesType === "aio"
                ? "AIO product auto-created with display specs."
                : "You can add more models from the series list anytime."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={handleComplete}
              style={{
                padding: "8px 20px",
                background: "#005BAC",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AdminModal>
  );
}