import { useEffect, useState } from "react";
import { Product } from "../../types/Product";
import { SeriesSpecificationService, ModelSpecOverrides } from "../../services/Seriesspecificationservice";
import { ProductRepository } from "../../repositories/ProductRepository";
import AdminButton from "./ui/AdminButton";

interface Props {
  seriesCode: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function QuickAddModelForm({ seriesCode, onSave, onCancel }: Props) {
  const [seriesType, setSeriesType] = useState<"standard" | "aio" | null>(null);
  const [form, setForm] = useState({
    model: "",
    pitch: "",
    brightness: "",
    cabinetWidth: "",
    cabinetHeight: "",
    cabinetResolutionW: "",
    cabinetResolutionH: "",
    modulesPerCabinet: "",
    maxPowerPerM2: "",
    avgPowerPerM2: "",
    ledType: "",
    aioDisplayDiagonal: "", // NEW: For AIO products
  });

  const [overrides, setOverrides] = useState<ModelSpecOverrides>({});
  const [overrideChecks, setOverrideChecks] = useState({
    pixelConfiguration: false,
    brightness: false,
    contrast: false,
    ipRating: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch series type on mount
  useEffect(() => {
    const fetchSeriesType = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/series?code=eq.${seriesCode}&select=type`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.length > 0) {
          const type = data[0].type as "standard" | "aio";
          setSeriesType(type);
          // Auto-set LED type for AIO
          if (type === "aio") {
            setForm(prev => ({ ...prev, ledType: "GOB" }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch series type:", error);
      }
    };
    fetchSeriesType();
  }, [seriesCode]);

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const toggleOverride = (field: keyof typeof overrideChecks) => {
    setOverrideChecks({
      ...overrideChecks,
      [field]: !overrideChecks[field],
    });
  };

  const submit = async () => {
    // Validations
    if (!form.model.trim()) {
      setError("Model Name is required.");
      return;
    }
    if (!form.pitch || parseFloat(form.pitch) <= 0) {
      setError("Pixel Pitch must be greater than zero.");
      return;
    }
    if (!form.brightness || parseInt(form.brightness) <= 0) {
      setError("Brightness must be greater than zero.");
      return;
    }
    if (!form.cabinetWidth || parseInt(form.cabinetWidth) <= 0) {
      setError("Cabinet Width must be greater than zero.");
      return;
    }
    if (!form.cabinetHeight || parseInt(form.cabinetHeight) <= 0) {
      setError("Cabinet Height must be greater than zero.");
      return;
    }
    if (!form.cabinetResolutionW || parseInt(form.cabinetResolutionW) <= 0) {
      setError("Cabinet Resolution Width must be greater than zero.");
      return;
    }
    if (!form.cabinetResolutionH || parseInt(form.cabinetResolutionH) <= 0) {
      setError("Cabinet Resolution Height must be greater than zero.");
      return;
    }
    if (!form.modulesPerCabinet || parseInt(form.modulesPerCabinet) <= 0) {
      setError("Modules Per Cabinet must be greater than zero.");
      return;
    }
    if (!form.maxPowerPerM2 || parseFloat(form.maxPowerPerM2) <= 0) {
      setError("Max Power must be greater than zero.");
      return;
    }
    if (!form.avgPowerPerM2 || parseFloat(form.avgPowerPerM2) <= 0) {
      setError("Avg Power must be greater than zero.");
      return;
    }
    if (!form.ledType.trim()) {
      setError("LED Type is required.");
      return;
    }
    if (seriesType === "aio" && (!form.aioDisplayDiagonal || parseFloat(form.aioDisplayDiagonal) <= 0)) {
      setError("AIO Display Diagonal must be greater than zero.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build product specs with series defaults + model overrides
      const specs = await SeriesSpecificationService.buildProductSpecs(
        seriesCode,
        overrides
      );

      // Create product object
      const product: Product = {
        id: "",
        model: form.model,
        seriesCode: seriesCode,
        applicationType: seriesType === "aio" ? "AIO" : "Indoor", // Set to AIO if series is AIO
        pitch: parseFloat(form.pitch),
        brightness: parseInt(form.brightness),
        maxPowerPerM2: parseFloat(form.maxPowerPerM2),
        avgPowerPerM2: parseFloat(form.avgPowerPerM2),
        cabinetWidth: parseInt(form.cabinetWidth),
        cabinetHeight: parseInt(form.cabinetHeight),
        cabinetResolutionW: parseInt(form.cabinetResolutionW),
        cabinetResolutionH: parseInt(form.cabinetResolutionH),
        modulesPerCabinet: parseInt(form.modulesPerCabinet),
        product_specifications: specs,
        led_type: form.ledType, // NEW: Save LED type
        aio_display_diagonal: seriesType === "aio" ? parseFloat(form.aioDisplayDiagonal) : undefined, // NEW: Save AIO diagonal
      };

      // Save to database
      await ProductRepository.create(product);

      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
      <h2 style={{ marginTop: 0, color: "#005BAC" }}>
        Add Model to {seriesCode}
      </h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Enter the model variant details. Extended specs will be auto-filled from series defaults.
      </p>

      {/* Series Type Info */}
      {seriesType && (
        <div
          style={{
            background: seriesType === "aio" ? "#f0f8ff" : "#f5f9ff",
            border: `1px solid ${seriesType === "aio" ? "#005BAC" : "#cbd5e1"}`,
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "13px",
            color: seriesType === "aio" ? "#005BAC" : "#334155",
          }}
        >
          {seriesType === "aio" 
            ? "✓ AIO Series - Fixed specs. LED Type will be set to GOB." 
            : "Standard Series - Select LED Type (COB or SMD)"}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #f66",
            color: "#c33",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* IDENTITY & CORE CONFIG */}
      <h3 style={{ marginTop: 15, marginBottom: 15, color: "#005BAC" }}>Model Identity</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Model Name *">
          <input
            type="text"
            value={form.model}
            onChange={(e) => update("model", e.target.value)}
            placeholder="e.g., LH-NP12B"
          />
        </Field>
        <Field label="Pixel Pitch (mm) *">
          <input
            type="text"
            inputMode="decimal"
            value={form.pitch}
            onChange={(e) => update("pitch", e.target.value)}
            placeholder="e.g., 1.25"
          />
        </Field>
      </div>

      {/* LED TYPE - NEW FIELD */}
      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#005BAC" }}>LED Implementation</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="LED Type *">
          {seriesType === "aio" ? (
            <div
              style={{
                padding: "10px 12px",
                background: "#f0f8ff",
                border: "1px solid #005BAC",
                borderRadius: "6px",
                color: "#005BAC",
                fontWeight: 500,
              }}
            >
              GOB (Auto-set for AIO)
            </div>
          ) : (
            <select
              value={form.ledType}
              onChange={(e) => update("ledType", e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="">Select LED Type</option>
              <option value="COB">COB</option>
              <option value="SMD">SMD</option>
            </select>
          )}
        </Field>

        {/* AIO Display Diagonal - Only for AIO series */}
        {seriesType === "aio" && (
          <Field label="Display Diagonal (inches) *">
            <input
              type="text"
              inputMode="decimal"
              value={form.aioDisplayDiagonal}
              onChange={(e) => update("aioDisplayDiagonal", e.target.value)}
              placeholder="e.g., 136"
            />
          </Field>
        )}
      </div>

      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#005BAC" }}>Cabinet Configuration</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Cabinet Width (mm) *">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetWidth}
            onChange={(e) => update("cabinetWidth", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 600"
          />
        </Field>
        <Field label="Cabinet Height (mm) *">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetHeight}
            onChange={(e) => update("cabinetHeight", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 337"
          />
        </Field>
        <Field label="Cabinet Resolution W (px) *">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetResolutionW}
            onChange={(e) => update("cabinetResolutionW", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 480"
          />
        </Field>
        <Field label="Cabinet Resolution H (px) *">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetResolutionH}
            onChange={(e) => update("cabinetResolutionH", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 270"
          />
        </Field>
        <Field label="Modules Per Cabinet *">
          <input
            type="text"
            inputMode="numeric"
            value={form.modulesPerCabinet}
            onChange={(e) => update("modulesPerCabinet", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 8"
          />
        </Field>
      </div>

      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#005BAC" }}>Optical & Electrical</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Brightness (nits) *">
          <input
            type="text"
            inputMode="numeric"
            value={form.brightness}
            onChange={(e) => update("brightness", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 600"
          />
        </Field>
        <Field label="Max Power (W/Cabinet) *">
          <input
            type="text"
            inputMode="decimal"
            value={form.maxPowerPerM2}
            onChange={(e) => update("maxPowerPerM2", e.target.value)}
            placeholder="e.g., 325"
          />
        </Field>
        <Field label="Avg Power (W/Cabinet) *">
          <input
            type="text"
            inputMode="decimal"
            value={form.avgPowerPerM2}
            onChange={(e) => update("avgPowerPerM2", e.target.value)}
            placeholder="e.g., 163"
          />
        </Field>
      </div>

      {/* OPTIONAL OVERRIDES */}
      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#334155" }}>
        Optional Spec Overrides
      </h3>
      <p style={{ color: "#999", fontSize: "13px", marginBottom: 15 }}>
        If this model differs from series defaults in any spec, check the box to override.
      </p>

      <div
        style={{
          padding: "15px",
          background: "#f8fafc",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <CheckboxField
            label="Override Pixel Configuration"
            checked={overrideChecks.pixelConfiguration}
            onChange={() => toggleOverride("pixelConfiguration")}
          >
            {overrideChecks.pixelConfiguration && (
              <input
                type="text"
                value={overrides.pixelConfiguration || ""}
                onChange={(e) =>
                  setOverrides({ ...overrides, pixelConfiguration: e.target.value })
                }
                placeholder="e.g., SMD 3 in 1"
              />
            )}
          </CheckboxField>

          <CheckboxField
            label="Override Brightness"
            checked={overrideChecks.brightness}
            onChange={() => toggleOverride("brightness")}
          >
            {overrideChecks.brightness && (
              <input
                type="text"
                inputMode="numeric"
                value={overrides.brightnessUniformity || ""}
                onChange={(e) =>
                  setOverrides({
                    ...overrides,
                    brightnessUniformity: e.target.value,
                  })
                }
                placeholder="e.g., 98%"
              />
            )}
          </CheckboxField>

          <CheckboxField
            label="Override Contrast Ratio"
            checked={overrideChecks.contrast}
            onChange={() => toggleOverride("contrast")}
          >
            {overrideChecks.contrast && (
              <input
                type="text"
                value={overrides.contrastRatio || ""}
                onChange={(e) =>
                  setOverrides({ ...overrides, contrastRatio: e.target.value })
                }
                placeholder="e.g., 7000:1"
              />
            )}
          </CheckboxField>

          <CheckboxField
            label="Override IP Rating"
            checked={overrideChecks.ipRating}
            onChange={() => toggleOverride("ipRating")}
          >
            {overrideChecks.ipRating && (
              <input
                type="text"
                value={overrides.ipRating || ""}
                onChange={(e) =>
                  setOverrides({ ...overrides, ipRating: e.target.value })
                }
                placeholder="e.g., IP65"
              />
            )}
          </CheckboxField>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 30,
          paddingTop: 15,
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <AdminButton type="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </AdminButton>

        <AdminButton onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Save Model"}
        </AdminButton>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ cursor: "pointer", width: "16px", height: "16px" }}
        />
        <span style={{ fontWeight: 500, fontSize: "14px" }}>{label}</span>
      </label>
      {children && (
        <div style={{ marginTop: 8, marginLeft: "24px" }}>
          {children}
        </div>
      )}
    </div>
  );
}