import { useState } from "react";
import { Product, ProductSpecification } from "../../types/Product";
import AdminButton from "./ui/AdminButton";

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
    applicationType: product?.applicationType ?? "Indoor (Flat Display)",
    seriesCode: product?.seriesCode ?? "",
    model: product?.model ?? "",
    pitch: product?.pitch ?? 0,
    brightness: product?.brightness ?? 0,
    maxPowerPerM2: product?.maxPowerPerM2 ?? 0, // Keeping variable name, but UI says W/Cabinet
    avgPowerPerM2: product?.avgPowerPerM2 ?? 0,
    cabinetWidth: product?.cabinetWidth ?? 0,
    cabinetHeight: product?.cabinetHeight ?? 0,
    cabinetResolutionW: product?.cabinetResolutionW ?? 0,
    cabinetResolutionH: product?.cabinetResolutionH ?? 0,
    modulesPerCabinet: product?.modulesPerCabinet ?? 0,
    
    // Virtual Specification Fields (will be mapped to JSON array on submit)
    ledType: getSpec("LED Type") || "SMD",
    serviceAccess: getSpec("Service Access") || "Front & Rear",
    cabinetWeight: getSpec("Cabinet Weight") || "",
    contrastRatio: getSpec("Contrast Ratio") || "",
    ipRating: getSpec("IP Rating") || "",
    curveRadius: getSpec("Curve Radius") || "",

    colorTemp: getSpec("Color Temperature (K)") || "3000~10000",
    viewingAngle: getSpec("Visual Viewing Angle (H x V)") || "160/160",
    brightnessUniformity: getSpec("Brightness Uniformity") || "98.20%",
    processingDepth: getSpec("Processing Depth (bit)") || "16",
    powerSupply: getSpec("Power Supply (V)") || "AC100~240V",
    frameRate: getSpec("Frame Rate (Hz)") || "50/60Hz",
    refreshRate: getSpec("Refresh Rate (Hz)") || "3840",
    ledLifetime: getSpec("LED Lifetime (Half Brightness)") || "100,000",
    operatingTemp: getSpec("Operating Temperature (°C)") || "-10~40",
    operatingHumidity: getSpec("Operating Humidity") || "10%~80%",
  });

  const update = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const submit = async () => {
    // Standard Validations
    if (!form.seriesCode.trim()) { alert("Series is required."); return; }
    if (!form.model.trim()) { alert("Model is required."); return; }
    if (form.pitch <= 0) { alert("Pixel Pitch must be greater than zero."); return; }
    if (form.brightness <= 0) { alert("Brightness must be greater than zero."); return; }
    if (form.maxPowerPerM2 <= 0) { alert("Maximum Power must be greater than zero."); return; }
    if (form.avgPowerPerM2 <= 0) { alert("Average Power must be greater than zero."); return; }
    if (form.cabinetWidth <= 0) { alert("Cabinet Width must be greater than zero."); return; }
    if (form.cabinetHeight <= 0) { alert("Cabinet Height must be greater than zero."); return; }
    if (form.cabinetResolutionW <= 0) { alert("Cabinet Resolution Width is required."); return; }
    if (form.cabinetResolutionH <= 0) { alert("Cabinet Resolution Height is required."); return; }
    if (form.modulesPerCabinet <= 0) { alert("Modules Per Cabinet is required."); return; }
    if (!form.cabinetWeight.trim()) { alert("Cabinet Weight is required."); return; }

    // 1. Compile the dynamic specifications JSON array
    const specs: ProductSpecification[] = [
      { specification_name: "LED Type", specification_value: form.ledType },
      { specification_name: "Service Access", specification_value: form.serviceAccess },
      { specification_name: "Cabinet Weight", specification_value: form.cabinetWeight },
      { specification_name: "Color Temperature (K)", specification_value: form.colorTemp },
      { specification_name: "Visual Viewing Angle (H x V)", specification_value: form.viewingAngle },
      { specification_name: "Brightness Uniformity", specification_value: form.brightnessUniformity },
      { specification_name: "Processing Depth (bit)", specification_value: form.processingDepth },
      { specification_name: "Power Supply (V)", specification_value: form.powerSupply },
      { specification_name: "Frame Rate (Hz)", specification_value: form.frameRate },
      { specification_name: "Refresh Rate (Hz)", specification_value: form.refreshRate },
      { specification_name: "LED Lifetime (Half Brightness)", specification_value: form.ledLifetime },
      { specification_name: "Operating Temperature (°C)", specification_value: form.operatingTemp },
      { specification_name: "Operating Humidity", specification_value: form.operatingHumidity },
    ];

    // Conditionally push specialty specs
    if (form.brightness > 1000 && form.contrastRatio) {
      specs.push({ specification_name: "Contrast Ratio", specification_value: form.contrastRatio });
    }
    if (form.applicationType === "Outdoor" && form.ipRating) {
      specs.push({ specification_name: "IP Rating", specification_value: form.ipRating });
    }
    if (form.applicationType === "Indoor (Curve Display)" && form.curveRadius) {
      specs.push({ specification_name: "Curve Radius", specification_value: form.curveRadius });
    }

    // 2. Clone the form and remove the virtual fields before saving
    const finalPayload = { ...form, product_specifications: specs };
    delete finalPayload.ledType;
    delete finalPayload.serviceAccess;
    delete finalPayload.cabinetWeight;
    delete finalPayload.contrastRatio;
    delete finalPayload.ipRating;
    delete finalPayload.curveRadius;
    delete finalPayload.colorTemp;
    delete finalPayload.viewingAngle;
    delete finalPayload.brightnessUniformity;
    delete finalPayload.processingDepth;
    delete finalPayload.powerSupply;
    delete finalPayload.frameRate;
    delete finalPayload.refreshRate;
    delete finalPayload.ledLifetime;
    delete finalPayload.operatingTemp;
    delete finalPayload.operatingHumidity;

    await onSave(finalPayload);
  };

  return (
    <>
      {/* IDENTITY SECTION */}
      <h3 style={{ marginTop: 10, marginBottom: 15, color: "#005BAC" }}>Product Identity</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Application Type">
          <select
            value={form.applicationType}
            onChange={(e) => update("applicationType", e.target.value)}
          >
            <option value="Indoor (Flat Display)">Indoor (Flat Display)</option>
            <option value="Indoor (Curve Display)">Indoor (Curve Display)</option>
            <option value="Outdoor">Outdoor</option>
          </select>
        </Field>

        <Field label="Series">
          <input
            value={form.seriesCode}
            onChange={(e) => update("seriesCode", e.target.value)}
          />
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Model">
            <input
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* CORE SPECS SECTION */}
      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#005BAC" }}>Configuration & Specs</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Pixel Pitch (mm)">
          <input
            type="number"
            step="0.01"
            value={form.pitch || ""}
            onChange={(e) => update("pitch", parseFloat(e.target.value) || 0)}
          />
        </Field>

        <Field label="Brightness (nits)">
          <input
            type="number"
            value={form.brightness || ""}
            onChange={(e) => update("brightness", parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="LED Type">
          <select value={form.ledType} onChange={(e) => update("ledType", e.target.value)}>
            <option value="SMD">SMD</option>
            <option value="COB">COB</option>
          </select>
        </Field>

        <Field label="Service Access">
          <select value={form.serviceAccess} onChange={(e) => update("serviceAccess", e.target.value)}>
            <option value="Front">Front</option>
            <option value="Rear">Rear</option>
            <option value="Front & Rear">Front & Rear</option>
          </select>
        </Field>

        <Field label="Maximum Power (W/Cabinet)">
          <input
            type="number"
            step="0.1"
            value={form.maxPowerPerM2 || ""}
            onChange={(e) => update("maxPowerPerM2", parseFloat(e.target.value) || 0)}
          />
        </Field>

        <Field label="Average Power (W/Cabinet)">
          <input
            type="number"
            step="0.1"
            value={form.avgPowerPerM2 || ""}
            onChange={(e) => update("avgPowerPerM2", parseFloat(e.target.value) || 0)}
          />
        </Field>

        <Field label="Cabinet Width (mm)">
          <input
            type="number"
            value={form.cabinetWidth || ""}
            onChange={(e) => update("cabinetWidth", parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="Cabinet Height (mm)">
          <input
            type="number"
            value={form.cabinetHeight || ""}
            onChange={(e) => update("cabinetHeight", parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="Cabinet Resolution W (px)">
          <input
            type="number"
            value={form.cabinetResolutionW || ""}
            onChange={(e) => update("cabinetResolutionW", parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="Cabinet Resolution H (px)">
          <input
            type="number"
            value={form.cabinetResolutionH || ""}
            onChange={(e) => update("cabinetResolutionH", parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="Modules Per Cabinet">
          <input
            type="number"
            value={form.modulesPerCabinet || ""}
            onChange={(e) => update("modulesPerCabinet", parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="Cabinet Weight (kg)">
          <input
            type="text"
            placeholder="e.g. 6.2"
            value={form.cabinetWeight}
            onChange={(e) => update("cabinetWeight", e.target.value)}
          />
        </Field>
      </div>

      {/* CONDITIONAL SPECS SECTION */}
      {((form.brightness > 1000) || form.applicationType === "Outdoor" || form.applicationType === "Indoor (curve display)") && (
        <>
          <h3 style={{ marginTop: 25, marginBottom: 15, color: "#334155" }}>Specialty Specifications</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", padding: "15px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
            
            {form.brightness > 1000 && (
              <Field label="Contrast Ratio">
                <input
                  type="text"
                  placeholder="e.g. 7000:1"
                  value={form.contrastRatio}
                  onChange={(e) => update("contrastRatio", e.target.value)}
                />
              </Field>
            )}

            {form.applicationType === "Outdoor" && (
              <Field label="IP Rating">
                <input
                  type="text"
                  placeholder="e.g. IP65/IP54"
                  value={form.ipRating}
                  onChange={(e) => update("ipRating", e.target.value)}
                />
              </Field>
            )}

            {form.applicationType === "Indoor (curve display)" && (
              <Field label="Curve Radius">
                <input
                  type="text"
                  placeholder="e.g. 211mm - 311mm diameter"
                  value={form.curveRadius}
                  onChange={(e) => update("curveRadius", e.target.value)}
                />
              </Field>
            )}
          </div>
        </>
      )}

      <h3 style={{ marginTop: 25, marginBottom: 15, color: "#005BAC" }}>PDF Brochure Specifications</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", padding: "15px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        
        <Field label="Color Temperature (K)">
          <input type="text" value={form.colorTemp} onChange={(e) => update("colorTemp", e.target.value)} />
        </Field>
        
        <Field label="Viewing Angle (H x V)">
          <input type="text" value={form.viewingAngle} onChange={(e) => update("viewingAngle", e.target.value)} />
        </Field>

        <Field label="Refresh Rate (Hz)">
          <input type="text" value={form.refreshRate} onChange={(e) => update("refreshRate", e.target.value)} />
        </Field>

        <Field label="Processing Depth (bit)">
          <input type="text" value={form.processingDepth} onChange={(e) => update("processingDepth", e.target.value)} />
        </Field>

        <Field label="LED Lifetime (Hours)">
          <input type="text" value={form.ledLifetime} onChange={(e) => update("ledLifetime", e.target.value)} />
        </Field>

        <Field label="Power Supply (V)">
          <input type="text" value={form.powerSupply} onChange={(e) => update("powerSupply", e.target.value)} />
        </Field>

        <Field label="Operating Temp (°C)">
          <input type="text" value={form.operatingTemp} onChange={(e) => update("operatingTemp", e.target.value)} />
        </Field>

        <Field label="Operating Humidity">
          <input type="text" value={form.operatingHumidity} onChange={(e) => update("operatingHumidity", e.target.value)} />
        </Field>
      </div>

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 25,
        }}
      >
        <AdminButton type="secondary" onClick={onCancel}>
          Cancel
        </AdminButton>

        <AdminButton onClick={submit}>
          Save Product
        </AdminButton>
      </div>
    </>
  );
}

// Re-using your exact Field component
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
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}