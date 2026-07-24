import { useState } from "react";
import AdminModal from "./AdminModal";
import { Product } from "../../types/Product";
import { ProductRepository } from "../../repositories/ProductRepository";

interface Props {
  seriesCode: string;
  onClose: () => void;
  onModelAdded: () => void;
}

export default function AddModelForm({
  seriesCode,
  onClose,
  onModelAdded,
}: Props) {
  const [model, setModel] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [pitch, setPitch] = useState("");
  const [brightness, setBrightness] = useState("");
  const [cabinetWidth, setCabinetWidth] = useState("");
  const [cabinetHeight, setCabinetHeight] = useState("");
  const [cabinetResolutionW, setCabinetResolutionW] = useState("");
  const [cabinetResolutionH, setCabinetResolutionH] = useState("");
  const [modulesPerCabinet, setModulesPerCabinet] = useState("");
  const [maxPowerPerM2, setMaxPowerPerM2] = useState("");
  const [avgPowerPerM2, setAvgPowerPerM2] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!model.trim()) errors.model = "Model name is required";
    if (!applicationType) errors.applicationType = "Application type is required";
    if (!pitch || isNaN(Number(pitch))) errors.pitch = "Valid pitch is required";
    if (!brightness || isNaN(Number(brightness)))
      errors.brightness = "Valid brightness is required";
    if (!cabinetWidth || isNaN(Number(cabinetWidth)))
      errors.cabinetWidth = "Valid cabinet width is required";
    if (!cabinetHeight || isNaN(Number(cabinetHeight)))
      errors.cabinetHeight = "Valid cabinet height is required";
    if (!cabinetResolutionW || isNaN(Number(cabinetResolutionW)))
      errors.cabinetResolutionW = "Valid resolution width is required";
    if (!cabinetResolutionH || isNaN(Number(cabinetResolutionH)))
      errors.cabinetResolutionH = "Valid resolution height is required";
    if (!modulesPerCabinet || isNaN(Number(modulesPerCabinet)))
      errors.modulesPerCabinet = "Valid modules count is required";
    if (!maxPowerPerM2 || isNaN(Number(maxPowerPerM2)))
      errors.maxPowerPerM2 = "Valid max power is required";
    if (!avgPowerPerM2 || isNaN(Number(avgPowerPerM2)))
      errors.avgPowerPerM2 = "Valid average power is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const newProduct: Product = {
        id: "",
        seriesCode,
        model: model.trim(),
        applicationType,
        pitch: Number(pitch),
        brightness: Number(brightness),
        cabinetWidth: Number(cabinetWidth),
        cabinetHeight: Number(cabinetHeight),
        cabinetResolutionW: Number(cabinetResolutionW),
        cabinetResolutionH: Number(cabinetResolutionH),
        modulesPerCabinet: Number(modulesPerCabinet),
        maxPowerPerM2: Number(maxPowerPerM2),
        avgPowerPerM2: Number(avgPowerPerM2),
      };

      await ProductRepository.create(newProduct);
      onModelAdded();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add model";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const FormField = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    error,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    error?: string;
  }) => (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (fieldErrors[label]) {
            setFieldErrors({ ...fieldErrors, [label]: "" });
          }
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: error ? "2px solid #ff4444" : "1px solid #ddd",
          borderRadius: 6,
          fontSize: 13,
          boxSizing: "border-box",
        }}
      />
      {error && (
        <p
          style={{
            margin: "4px 0 0 0",
            color: "#ff4444",
            fontSize: 11,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );

  return (
    <AdminModal onClose={onClose}>
      <h3 style={{ marginTop: 0, marginBottom: 20 }}>
        Add Model to {seriesCode}
      </h3>

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
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <FormField
          label="Model Name"
          value={model}
          onChange={setModel}
          placeholder="e.g., LH-NP12B"
          error={fieldErrors.model}
        />

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Application Type
          </label>
          <select
            value={applicationType}
            onChange={(e) => {
              setApplicationType(e.target.value);
              if (fieldErrors.applicationType) {
                setFieldErrors({
                  ...fieldErrors,
                  applicationType: "",
                });
              }
            }}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: fieldErrors.applicationType
                ? "2px solid #ff4444"
                : "1px solid #ddd",
              borderRadius: 6,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          >
            <option value="">Select type</option>
            <option value="Indoor (Flat Display)">Indoor (Flat Display)</option>
            <option value="Indoor (Rental)">Indoor (Rental)</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Fixed Installation">Fixed Installation</option>
          </select>
          {fieldErrors.applicationType && (
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#ff4444",
                fontSize: 11,
              }}
            >
              {fieldErrors.applicationType}
            </p>
          )}
        </div>

        <FormField
          label="Pitch (mm)"
          value={pitch}
          onChange={setPitch}
          type="number"
          placeholder="e.g., 1.25"
          error={fieldErrors.pitch}
        />

        <FormField
          label="Brightness (nits)"
          value={brightness}
          onChange={setBrightness}
          type="number"
          placeholder="e.g., 800"
          error={fieldErrors.brightness}
        />

        <FormField
          label="Cabinet Width (mm)"
          value={cabinetWidth}
          onChange={setCabinetWidth}
          type="number"
          placeholder="e.g., 600"
          error={fieldErrors.cabinetWidth}
        />

        <FormField
          label="Cabinet Height (mm)"
          value={cabinetHeight}
          onChange={setCabinetHeight}
          type="number"
          placeholder="e.g., 337.5"
          error={fieldErrors.cabinetHeight}
        />

        <FormField
          label="Cabinet Resolution W (px)"
          value={cabinetResolutionW}
          onChange={setCabinetResolutionW}
          type="number"
          placeholder="e.g., 480"
          error={fieldErrors.cabinetResolutionW}
        />

        <FormField
          label="Cabinet Resolution H (px)"
          value={cabinetResolutionH}
          onChange={setCabinetResolutionH}
          type="number"
          placeholder="e.g., 270"
          error={fieldErrors.cabinetResolutionH}
        />

        <FormField
          label="Modules per Cabinet"
          value={modulesPerCabinet}
          onChange={setModulesPerCabinet}
          type="number"
          placeholder="e.g., 8"
          error={fieldErrors.modulesPerCabinet}
        />

        <FormField
          label="Max Power per m²"
          value={maxPowerPerM2}
          onChange={setMaxPowerPerM2}
          type="number"
          placeholder="e.g., 325"
          error={fieldErrors.maxPowerPerM2}
        />

        <FormField
          label="Avg Power per m²"
          value={avgPowerPerM2}
          onChange={setAvgPowerPerM2}
          type="number"
          placeholder="e.g., 163"
          error={fieldErrors.avgPowerPerM2}
        />
      </div>

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
          onClick={handleSubmit}
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
          {isLoading ? "Adding..." : "Add Model"}
        </button>
      </div>
    </AdminModal>
  );
}