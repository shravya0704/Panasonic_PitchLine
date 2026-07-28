import { useState, type ChangeEvent } from "react";
import AdminModal from "./AdminModal";
import SeriesAdminService from "../../services/SeriesAdminService";
import SeriesForm from "./SeriesForm";
import QuickAddModelForm from "./QuickAddModelForm";
import type { UploadProgress } from "../../types/SeriesAdmin";

interface Props {
  onClose: () => void;
  onSeriesCreated: (seriesId: string, seriesCode: string) => void;
}

type Step = "create" | "brochure" | "seriesSpecs" | "firstModel" | "complete";

export default function AddNewSeriesModal({
  onClose,
  onSeriesCreated,
}: Props) {
  const [code, setCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [codeError, setCodeError] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");

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

    if (!code.trim()) {
      setCodeError("Series code is required");
      valid = false;
    }
    if (!name.trim()) {
      setNameError("Series name is required");
      valid = false;
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

      // Move to series specs form
      setStep("seriesSpecs");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload brochure";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesSpecsSaved = (): void => {
    // After series specs are saved, move to adding first model
    setStep("firstModel");
  };

  const handleFirstModelAdded = (): void => {
    // After first model is added, show complete message
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
    } else if (step === "firstModel") {
      setStep("seriesSpecs");
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
              placeholder="e.g., PFP, PIK"
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
              placeholder="e.g., Panasonic Full Pitch"
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

      {step === "firstModel" && (
        <QuickAddModelForm
          seriesCode={seriesCode}
          onSave={handleFirstModelAdded}
          onCancel={handleBack}
        />
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
              Series <strong>{seriesCode}</strong> has been created with brochure and specs.
            </p>
            <p
              style={{
                margin: 0,
                color: "#999",
                fontSize: 13,
              }}
            >
              You can add more models from the series list anytime.
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