import { useEffect, useState } from "react";
import { Product, ProductSpecification } from "../../types/Product";
import AdminButton from "./ui/AdminButton";
import { SeriesService } from "../../services/seriesService";

interface Props {
  product?: Product;
  onSave: (product: Product) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  onSave,
  onCancel,
}: Props) {
  // Helper to extract initial spec values if we are editing an existing product
  const getSpec = (name: string) => {
    return product?.product_specifications?.find(s => s.specification_name === name)?.specification_value || "";
  };

  // We keep your single state object paradigm, but add our "virtual" spec fields to it
  const [form, setForm] = useState<any>({
    id: product?.id ?? "",
    applicationType: product?.applicationType ?? "Indoor",
    seriesCode: product?.seriesCode ?? "",
    model: product?.model ?? "",
    pitch: product?.pitch ?? "",
    brightness: product?.brightness ?? "",
    maxPowerPerM2: product?.maxPowerPerM2 ?? "",
    avgPowerPerM2: product?.avgPowerPerM2 ?? "",
    cabinetWidth: product?.cabinetWidth ?? "",
    cabinetHeight: product?.cabinetHeight ?? "",
    cabinetResolutionW: product?.cabinetResolutionW ?? "",
    cabinetResolutionH: product?.cabinetResolutionH ?? "",
    modulesPerCabinet: product?.modulesPerCabinet ?? "",
    
    // PHYSICAL PARAMETERS
    pixelConfiguration: getSpec("Pixel Configuration") || getSpec("LED Type") || "",
    moduleResolution: getSpec("Module Resolution") || "",
    moduleDimensions: getSpec("Module Dimensions") || "",
    moduleWeight: getSpec("Module Weight") || "",
    cabinetWeight: getSpec("Cabinet Weight") || "",
    cabinetMaterial: getSpec("Cabinet Material") || "",
    serviceAccess: getSpec("Service Access") || "",
    curveRadius: getSpec("Curve Radius") || "",
    flatness: getSpec("Flatness") || "0.1 mm",

    // OPTICAL SPECIFICATIONS
    pixelDensity: getSpec("Pixel Density") || "",
    colorTemp: getSpec("Color Temperature (K)") || getSpec("Color Temperature") || "",
    viewingAngle: getSpec("Visual Viewing Angle (H x V)") || getSpec("Viewing Angle") || "",
    brightnessUniformity: getSpec("Brightness Uniformity") || "",
    colorUniformity: getSpec("Color Uniformity") || "",
    contrastRatio: getSpec("Contrast Ratio") || "",
    processingDepth: getSpec("Processing Depth (bit)") || getSpec("Processing Depth") || "",

    // ELECTRICAL SPECIFICATIONS
    powerConsumptionMax: getSpec("Power Consumption (Max)") || getSpec("Power Consumption Max") || "",
    powerConsumptionAvg: getSpec("Power Consumption (Average)") || getSpec("Power Consumption Average") || "",
    powerSupply: getSpec("Power Supply (V)") || getSpec("Power Supply") || "",
    frameRate: getSpec("Frame Rate (Hz)") || getSpec("Frame Rate") || "",
    refreshRate: getSpec("Refresh Rate (Hz)") || getSpec("Refresh Rate") || "",

    // OPERATION
    ledLifetime: getSpec("LED Lifetime (Half Brightness)") || getSpec("LED Lifetime") || "",

    // ENVIRONMENT
    operatingTemp: getSpec("Operating Temperature (°C)") || getSpec("Operating Temperature") || "",
    operatingHumidity: getSpec("Operating Humidity") || "",
    ipRating: getSpec("IP Rating") || "",
  });

  const [series, setSeries] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    physical: true,
    optical: true,
    electrical: true,
    operation: true,
    environment: true,
  });

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await SeriesService.getAllSeries();
        setSeries(data);
      } catch (error) {
        console.error("Failed to load series:", error);
      }
    };

    loadSeries();
  }, []);

  const update = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const submit = async () => {
    // Standard Validations
    if (!form.seriesCode.trim()) { alert("Series is required."); return; }
    if (!form.model.trim()) { alert("Model is required."); return; }
    if (!form.pitch || form.pitch <= 0) { alert("Pixel Pitch must be greater than zero."); return; }
    if (!form.brightness || form.brightness <= 0) { alert("Brightness must be greater than zero."); return; }
    if (!form.maxPowerPerM2 || form.maxPowerPerM2 <= 0) { alert("Maximum Power must be greater than zero."); return; }
    if (!form.avgPowerPerM2 || form.avgPowerPerM2 <= 0) { alert("Average Power must be greater than zero."); return; }
    if (!form.cabinetWidth || form.cabinetWidth <= 0) { alert("Cabinet Width must be greater than zero."); return; }
    if (!form.cabinetHeight || form.cabinetHeight <= 0) { alert("Cabinet Height must be greater than zero."); return; }
    if (!form.cabinetResolutionW || form.cabinetResolutionW <= 0) { alert("Cabinet Resolution Width is required."); return; }
    if (!form.cabinetResolutionH || form.cabinetResolutionH <= 0) { alert("Cabinet Resolution Height is required."); return; }
    if (!form.modulesPerCabinet || form.modulesPerCabinet <= 0) { alert("Modules Per Cabinet is required."); return; }
    if (!form.cabinetWeight || form.cabinetWeight.toString().trim() === "") { alert("Cabinet Weight is required."); return; }

    // 1. Compile the dynamic specifications JSON array
    const specs: ProductSpecification[] = [
      // PHYSICAL
      { specification_name: "Pixel Configuration", specification_value: form.pixelConfiguration },
      { specification_name: "Module Resolution", specification_value: form.moduleResolution },
      { specification_name: "Module Dimensions", specification_value: form.moduleDimensions },
      { specification_name: "Module Weight", specification_value: form.moduleWeight },
      { specification_name: "Cabinet Weight", specification_value: form.cabinetWeight },
      { specification_name: "Cabinet Material", specification_value: form.cabinetMaterial },
      { specification_name: "Service Access", specification_value: form.serviceAccess },
      { specification_name: "Curve Radius", specification_value: form.curveRadius },
      { specification_name: "Flatness", specification_value: form.flatness },

      // OPTICAL
      { specification_name: "Pixel Density", specification_value: form.pixelDensity },
      { specification_name: "Color Temperature (K)", specification_value: form.colorTemp },
      { specification_name: "Visual Viewing Angle (H x V)", specification_value: form.viewingAngle },
      { specification_name: "Brightness Uniformity", specification_value: form.brightnessUniformity },
      { specification_name: "Color Uniformity", specification_value: form.colorUniformity },
      { specification_name: "Contrast Ratio", specification_value: form.contrastRatio },
      { specification_name: "Processing Depth (bit)", specification_value: form.processingDepth },

      // ELECTRICAL
      { specification_name: "Power Consumption (Max)", specification_value: form.powerConsumptionMax },
      { specification_name: "Power Consumption (Average)", specification_value: form.powerConsumptionAvg },
      { specification_name: "Power Supply (V)", specification_value: form.powerSupply },
      { specification_name: "Frame Rate (Hz)", specification_value: form.frameRate },
      { specification_name: "Refresh Rate (Hz)", specification_value: form.refreshRate },

      // OPERATION
      { specification_name: "LED Lifetime (Half Brightness)", specification_value: form.ledLifetime },

      // ENVIRONMENT
      { specification_name: "Operating Temperature (°C)", specification_value: form.operatingTemp },
      { specification_name: "Operating Humidity", specification_value: form.operatingHumidity },
      { specification_name: "IP Rating", specification_value: form.ipRating },
    ];

    // 2. Clone the form and remove the virtual fields before saving
    const finalPayload: Product = {
      id: form.id,
      model: form.model,
      seriesCode: form.seriesCode,
      applicationType: form.applicationType,
      pitch: parseFloat(form.pitch) || 0,
      brightness: parseInt(form.brightness) || 0,
      maxPowerPerM2: parseFloat(form.maxPowerPerM2) || 0,
      avgPowerPerM2: parseFloat(form.avgPowerPerM2) || 0,
      cabinetWidth: parseInt(form.cabinetWidth) || 0,
      cabinetHeight: parseInt(form.cabinetHeight) || 0,
      cabinetResolutionW: parseInt(form.cabinetResolutionW) || 0,
      cabinetResolutionH: parseInt(form.cabinetResolutionH) || 0,
      modulesPerCabinet: parseInt(form.modulesPerCabinet) || 0,
      product_specifications: specs,
    };

    await onSave(finalPayload);
  };

  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
      {/* IDENTITY SECTION */}
      <h3 style={{ marginTop: 0, marginBottom: 15, color: "#005BAC" }}>Product Identity</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Application Type">
          <select
            value={form.applicationType}
            onChange={(e) => update("applicationType", e.target.value)}
          >
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
          </select>
        </Field>

        <Field label="Series">
          <select
            value={form.seriesCode}
            onChange={(e) => update("seriesCode", e.target.value)}
          >
            <option value="">Select Series</option>
            {series.map((item) => (
              <option key={item.id} value={item.code}>
                {item.code}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Model">
            <input
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              placeholder="e.g., LH-NP12B"
            />
          </Field>
        </div>
      </div>

      {/* CORE CONFIG SECTION */}
      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#005BAC" }}>Core Configuration</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Pixel Pitch (mm)">
          <input
            type="text"
            inputMode="decimal"
            value={form.pitch}
            onChange={(e) => update("pitch", e.target.value)}
            placeholder="e.g., 1.25"
          />
        </Field>

        <Field label="Brightness (nits)">
          <input
            type="text"
            inputMode="numeric"
            value={form.brightness}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              update("brightness", val);
            }}
            placeholder="e.g., 600"
          />
        </Field>

        <Field label="Cabinet Width (mm)">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetWidth}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              update("cabinetWidth", val);
            }}
            placeholder="e.g., 600"
          />
        </Field>

        <Field label="Cabinet Height (mm)">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetHeight}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              update("cabinetHeight", val);
            }}
            placeholder="e.g., 337"
          />
        </Field>

        <Field label="Cabinet Resolution W (px)">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetResolutionW}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              update("cabinetResolutionW", val);
            }}
            placeholder="e.g., 480"
          />
        </Field>

        <Field label="Cabinet Resolution H (px)">
          <input
            type="text"
            inputMode="numeric"
            value={form.cabinetResolutionH}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              update("cabinetResolutionH", val);
            }}
            placeholder="e.g., 270"
          />
        </Field>

        <Field label="Modules Per Cabinet">
          <input
            type="text"
            inputMode="numeric"
            value={form.modulesPerCabinet}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              update("modulesPerCabinet", val);
            }}
            placeholder="e.g., 8"
          />
        </Field>

        <Field label="Max Power (W/Cabinet)">
          <input
            type="text"
            inputMode="decimal"
            value={form.maxPowerPerM2}
            onChange={(e) => update("maxPowerPerM2", e.target.value)}
            placeholder="e.g., 325"
          />
        </Field>

        <Field label="Avg Power (W/Cabinet)">
          <input
            type="text"
            inputMode="decimal"
            value={form.avgPowerPerM2}
            onChange={(e) => update("avgPowerPerM2", e.target.value)}
            placeholder="e.g., 163"
          />
        </Field>

        <Field label="Cabinet Weight (kg)">
          <input
            type="text"
            value={form.cabinetWeight}
            onChange={(e) => update("cabinetWeight", e.target.value)}
            placeholder="e.g., 6.2"
          />
        </Field>
      </div>

      {/* COLLAPSIBLE SECTIONS FOR DETAILED SPECS */}
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
              placeholder="e.g., RGB or SMD 2020"
            />
          </Field>
          <Field label="Module Resolution">
            <input
              type="text"
              value={form.moduleResolution}
              onChange={(e) => update("moduleResolution", e.target.value)}
              placeholder="e.g., 120×68"
            />
          </Field>
          <Field label="Module Dimensions">
            <input
              type="text"
              value={form.moduleDimensions}
              onChange={(e) => update("moduleDimensions", e.target.value)}
              placeholder="e.g., 250×125 mm"
            />
          </Field>
          <Field label="Module Weight">
            <input
              type="text"
              value={form.moduleWeight}
              onChange={(e) => update("moduleWeight", e.target.value)}
              placeholder="e.g., 0.6 kg"
            />
          </Field>
          <Field label="Cabinet Material">
            <input
              type="text"
              value={form.cabinetMaterial}
              onChange={(e) => update("cabinetMaterial", e.target.value)}
              placeholder="e.g., Die-cast Aluminum"
            />
          </Field>
          <Field label="Service Access">
            <select value={form.serviceAccess} onChange={(e) => update("serviceAccess", e.target.value)}>
              <option value="">Select</option>
              <option value="Front">Front</option>
              <option value="Rear">Rear</option>
              <option value="Front & Rear">Front & Rear</option>
            </select>
          </Field>
          <Field label="Curve Radius">
            <input
              type="text"
              value={form.curveRadius}
              onChange={(e) => update("curveRadius", e.target.value)}
              placeholder="e.g., 211mm - 311mm"
            />
          </Field>
          <Field label="Flatness">
            <input
              type="text"
              value={form.flatness}
              onChange={(e) => update("flatness", e.target.value)}
              placeholder="e.g., 0.1 mm"
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
          <Field label="Pixel Density">
            <input
              type="text"
              value={form.pixelDensity}
              onChange={(e) => update("pixelDensity", e.target.value)}
              placeholder="e.g., 40000 pixels/m²"
            />
          </Field>
          <Field label="Color Temperature (K)">
            <input
              type="text"
              value={form.colorTemp}
              onChange={(e) => update("colorTemp", e.target.value)}
              placeholder="e.g., 3000~10000"
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
              placeholder="e.g., ±0.003"
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
          <Field label="Power Consumption Max">
            <input
              type="text"
              value={form.powerConsumptionMax}
              onChange={(e) => update("powerConsumptionMax", e.target.value)}
              placeholder="e.g., 325 W/m²"
            />
          </Field>
          <Field label="Power Consumption Average">
            <input
              type="text"
              value={form.powerConsumptionAvg}
              onChange={(e) => update("powerConsumptionAvg", e.target.value)}
              placeholder="e.g., 163 W/m²"
            />
          </Field>
          <Field label="Power Supply (V)">
            <input
              type="text"
              value={form.powerSupply}
              onChange={(e) => update("powerSupply", e.target.value)}
              placeholder="e.g., AC100~240V"
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
              placeholder="e.g., 10%~80%"
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
        <AdminButton type="secondary" onClick={onCancel}>
          Cancel
        </AdminButton>

        <AdminButton onClick={submit}>
          Save Product
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