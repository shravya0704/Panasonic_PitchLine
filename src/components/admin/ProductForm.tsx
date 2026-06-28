import { useState } from "react";
import { Product } from "../../types/Product";
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

  const [form, setForm] = useState<any>({
    id: product?.id ?? "",
    applicationType: product?.applicationType ?? "Indoor",
    seriesCode: product?.seriesCode ?? "",
    model: product?.model ?? "",
    pitch: product?.pitch ?? 0,
    brightness: product?.brightness ?? 0,
    maxPowerPerM2: product?.maxPowerPerM2 ?? 0,
    avgPowerPerM2: product?.avgPowerPerM2 ?? 0,
    cabinetWidth: product?.cabinetWidth ?? 0,
    cabinetHeight: product?.cabinetHeight ?? 0,
    cabinetResolutionW: product?.cabinetResolutionW ?? 0,
    cabinetResolutionH: product?.cabinetResolutionH ?? 0,
    modulesPerCabinet: product?.modulesPerCabinet ?? 0,
  });

  const update = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const submit = async () => {
    if (!form.seriesCode.trim()) {
      alert("Series is required.");
      return;
    }

    if (!form.model.trim()) {
      alert("Model is required.");
      return;
    }

    if (form.pitch <= 0) {
      alert("Pixel Pitch must be greater than zero.");
      return;
    }

    if (form.brightness <= 0) {
      alert("Brightness must be greater than zero.");
      return;
    }

    if (form.maxPowerPerM2 <= 0) {
      alert("Maximum Power must be greater than zero.");
      return;
    }

    if (form.avgPowerPerM2 <= 0) {
      alert("Average Power must be greater than zero.");
      return;
    }

    if (form.cabinetWidth <= 0) {
      alert("Cabinet Width must be greater than zero.");
      return;
    }

    if (form.cabinetHeight <= 0) {
      alert("Cabinet Height must be greater than zero.");
      return;
    }

    if (form.cabinetResolutionW <= 0) {
      alert("Cabinet Resolution Width is required.");
      return;
    }

    if (form.cabinetResolutionH <= 0) {
      alert("Cabinet Resolution Height is required.");
      return;
    }

    if (form.modulesPerCabinet <= 0) {
      alert("Modules Per Cabinet is required.");
      return;
    }

    await onSave(form);
  };

  return (
    <>
      <Field label="Application">
        <select
          value={form.applicationType}
          onChange={(e) =>
            update("applicationType", e.target.value)
          }
        >
          <option>Indoor</option>
          <option>Outdoor</option>
        </select>
      </Field>

      <Field label="Series">
        <input
          value={form.seriesCode}
          onChange={(e) =>
            update("seriesCode", e.target.value)
          }
        />
      </Field>

      <Field label="Model">
        <input
          value={form.model}
          onChange={(e) =>
            update("model", e.target.value)
          }
        />
      </Field>

      <h3
        style={{
          marginTop: 25,
          marginBottom: 15,
          color: "#005BAC",
        }}
      >
        Configuration
      </h3>

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

        <Field label="Maximum Power (W/m²)">
          <input
            type="number"
            step="0.1"
            value={form.maxPowerPerM2 || ""}
            onChange={(e) =>
              update(
                "maxPowerPerM2",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </Field>

        <Field label="Average Power (W/m²)">
          <input
            type="number"
            step="0.1"
            value={form.avgPowerPerM2 || ""}
            onChange={(e) =>
              update(
                "avgPowerPerM2",
                parseFloat(e.target.value) || 0
              )
            }
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
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 25,
        }}
      >
        <AdminButton
          type="secondary"
          onClick={onCancel}
        >
          Cancel
        </AdminButton>

        <AdminButton
          onClick={submit}
        >
          Save Product
        </AdminButton>
      </div>
    </>
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
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}