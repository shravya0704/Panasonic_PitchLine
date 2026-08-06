import { useState, useEffect } from "react";
import { SeriesSpecificationService, SeriesSpecDefaults } from "../../services/Seriesspecificationservice";
import AdminButton from "./ui/AdminButton";

interface Props {
  seriesCode: string;
  onSave: () => void;
  onCancel: () => void;
}

interface SeriesSpecDefaultsWithAIO extends SeriesSpecDefaults {
  aioDisplayDiagonal?: string;
}

export default function SeriesForm({ seriesCode, onSave, onCancel }: Props) {
  const [seriesType, setSeriesType] = useState<"standard" | "aio" | null>(null);
  const [form, setForm] = useState<SeriesSpecDefaultsWithAIO>({
    pixelConfiguration: "",
    cabinetMaterial: "",
    serviceAccess: "",
    flatness: "0.1 mm",
    
    colorTemp: "",
    viewingAngle: "",
    brightnessUniformity: "",
    colorUniformity: "",
    contrastRatio: "",
    processingDepth: "",
    
    powerSupply: "",
    frameRate: "",
    refreshRate: "",
    
    ledLifetime: "",
    
    operatingTemp: "",
    operatingHumidity: "",
    ipRating: "",
    
    aioDisplayDiagonal: "", // NEW: AIO field
  });

  const [expandedSections, setExpandedSections] = useState({
    aio: true,
    physical: true,
    optical: true,
    electrical: true,
    operation: true,
    environment: true,
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
          setSeriesType(data[0].type as "standard" | "aio");
        }
      } catch (error) {
        console.error("Failed to fetch series type:", error);
      }
    };
    fetchSeriesType();
  }, [seriesCode]);

  const update = (field: keyof SeriesSpecDefaultsWithAIO, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const submit = async () => {
    // Validation
    if (!form.pixelConfiguration.trim()) {
      setError("Pixel Configuration is required.");
      return;
    }
    if (!form.cabinetMaterial.trim()) {
      setError("Cabinet Material is required.");
      return;
    }
    if (!form.serviceAccess.trim()) {
      setError("Service Access is required.");
      return;
    }
    
    // AIO-specific validation
    if (seriesType === "aio" && (!form.aioDisplayDiagonal || parseFloat(form.aioDisplayDiagonal) <= 0)) {
      setError("AIO Display Diagonal is required and must be greater than zero.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Save series defaults
      await SeriesSpecificationService.saveSeriesDefaults(seriesCode, form);
      
      // If AIO, also save diagonal to series table
      if (seriesType === "aio" && form.aioDisplayDiagonal) {
        const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
        const response = await fetch(
          `${VITE_SUPABASE_URL}/rest/v1/series?code=eq.${seriesCode}`,
          {
            method: "PATCH",
            headers: {
              "apikey": VITE_SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              aio_display_diagonal: parseFloat(form.aioDisplayDiagonal),
            }),
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save AIO diagonal");
        }
      }
      
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save series defaults.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
      <h2 style={{ marginTop: 0, color: "#005BAC" }}>
        Series Specifications: {seriesCode}
      </h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Enter the default specifications for this series. These will be used for all models.
      </p>

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

      {/* AIO DISPLAY SPECIFICATIONS - Only for AIO series */}
      {seriesType === "aio" && (
        <CollapsibleSection
          title="AIO Display Specifications"
          expanded={expandedSections.aio}
          onToggle={() => toggleSection("aio")}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Display Diagonal (inches) *">
              <input
                type="text"
                inputMode="decimal"
                value={form.aioDisplayDiagonal}
                onChange={(e) => update("aioDisplayDiagonal", e.target.value)}
                placeholder="e.g., 136"
              />
            </Field>
          </div>
        </CollapsibleSection>
      )}

      {/* PHYSICAL PARAMETERS */}
      <CollapsibleSection
        title="Physical Parameters"
        expanded={expandedSections.physical}
        onToggle={() => toggleSection("physical")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Pixel Configuration">
            <input
              type="text"
              value={form.pixelConfiguration}
              onChange={(e) => update("pixelConfiguration", e.target.value)}
              placeholder="e.g., SMD 3 in 1"
            />
          </Field>
          <Field label="Cabinet Material">
            <input
              type="text"
              value={form.cabinetMaterial}
              onChange={(e) => update("cabinetMaterial", e.target.value)}
              placeholder="e.g., Aluminium Diecast"
            />
          </Field>
          <Field label="Service Access">
            <input
              type="text"
              value={form.serviceAccess}
              onChange={(e) => update("serviceAccess", e.target.value)}
              placeholder="e.g., Front & Rear"
            />
          </Field>
          <Field label="Flatness (mm)">
            <input
              type="text"
              value={form.flatness}
              onChange={(e) => update("flatness", e.target.value)}
              placeholder="e.g., 0.1"
            />
          </Field>
        </div>
      </CollapsibleSection>

      {/* OPTICAL SPECIFICATIONS */}
      <CollapsibleSection
        title="Optical Specifications"
        expanded={expandedSections.optical}
        onToggle={() => toggleSection("optical")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Color Temperature (K)">
            <input
              type="text"
              value={form.colorTemp}
              onChange={(e) => update("colorTemp", e.target.value)}
              placeholder="e.g., 3000-10000"
            />
          </Field>
          <Field label="Viewing Angle (H × V)">
            <input
              type="text"
              value={form.viewingAngle}
              onChange={(e) => update("viewingAngle", e.target.value)}
              placeholder="e.g., 160/160"
            />
          </Field>
          <Field label="Brightness Uniformity">
            <input
              type="text"
              value={form.brightnessUniformity}
              onChange={(e) => update("brightnessUniformity", e.target.value)}
              placeholder="e.g., 98%"
            />
          </Field>
          <Field label="Color Uniformity">
            <input
              type="text"
              value={form.colorUniformity}
              onChange={(e) => update("colorUniformity", e.target.value)}
              placeholder="e.g., ±0.003xCy"
            />
          </Field>
          <Field label="Contrast Ratio">
            <input
              type="text"
              value={form.contrastRatio}
              onChange={(e) => update("contrastRatio", e.target.value)}
              placeholder="e.g., 7000:1"
            />
          </Field>
          <Field label="Processing Depth (bit)">
            <input
              type="text"
              value={form.processingDepth}
              onChange={(e) => update("processingDepth", e.target.value)}
              placeholder="e.g., 16"
            />
          </Field>
        </div>
      </CollapsibleSection>

      {/* ELECTRICAL SPECIFICATIONS */}
      <CollapsibleSection
        title="Electrical Specifications"
        expanded={expandedSections.electrical}
        onToggle={() => toggleSection("electrical")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Power Supply (V)">
            <input
              type="text"
              value={form.powerSupply}
              onChange={(e) => update("powerSupply", e.target.value)}
              placeholder="e.g., AC100-240V"
            />
          </Field>
          <Field label="Frame Rate (Hz)">
            <input
              type="text"
              value={form.frameRate}
              onChange={(e) => update("frameRate", e.target.value)}
              placeholder="e.g., 50/60"
            />
          </Field>
          <Field label="Refresh Rate (Hz)">
            <input
              type="text"
              value={form.refreshRate}
              onChange={(e) => update("refreshRate", e.target.value)}
              placeholder="e.g., 3840"
            />
          </Field>
        </div>
      </CollapsibleSection>

      {/* OPERATION */}
      <CollapsibleSection
        title="Operation"
        expanded={expandedSections.operation}
        onToggle={() => toggleSection("operation")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="LED Lifetime (Hours)">
            <input
              type="text"
              value={form.ledLifetime}
              onChange={(e) => update("ledLifetime", e.target.value)}
              placeholder="e.g., 100,000"
            />
          </Field>
        </div>
      </CollapsibleSection>

      {/* ENVIRONMENT */}
      <CollapsibleSection
        title="Environment"
        expanded={expandedSections.environment}
        onToggle={() => toggleSection("environment")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Operating Temperature (°C)">
            <input
              type="text"
              value={form.operatingTemp}
              onChange={(e) => update("operatingTemp", e.target.value)}
              placeholder="e.g., -10~40"
            />
          </Field>
          <Field label="Operating Humidity">
            <input
              type="text"
              value={form.operatingHumidity}
              onChange={(e) => update("operatingHumidity", e.target.value)}
              placeholder="e.g., 10%-90%"
            />
          </Field>
          <Field label="IP Rating">
            <input
              type="text"
              value={form.ipRating}
              onChange={(e) => update("ipRating", e.target.value)}
              placeholder="e.g., IP65"
            />
          </Field>
        </div>
      </CollapsibleSection>

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
          {loading ? "Saving..." : "Save Series Defaults"}
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

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 25 }}>
      <button
        onClick={onToggle}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
          color: "#005BAC",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 0 15px 0",
          marginBottom: 0,
        }}
      >
        <span style={{ fontSize: "14px" }}>{expanded ? "▼" : "▶"}</span>
        {title.toUpperCase()}
      </button>

      {expanded && (
        <div style={{ paddingLeft: "0px", marginBottom: 15 }}>
          {children}
        </div>
      )}
    </div>
  );
}