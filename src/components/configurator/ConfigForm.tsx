import { useMemo, useState, useEffect } from "react";
import { Product } from "../../types/Product";

interface ConfigFormProps {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
  onCalculate: () => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
}

export const ConfigForm = ({
  products,
  selectedProduct,
  setSelectedProduct,
  width,
  setWidth,
  height,
  setHeight,
  onCalculate,
  uploadedImage,
  setUploadedImage,
}: ConfigFormProps) => {
  const [applicationType, setApplicationType] = useState("");
  const [seriesCode, setSeriesCode] = useState("");
  const [modelId, setModelId] = useState("");

  const applicationTypes = useMemo(
    () => Array.from(new Set(products.map((p) => p.applicationType))),
    [products]
  );

  const seriesList = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .filter((p) => p.applicationType === applicationType)
            .map((p) => p.seriesCode)
        )
      ),
    [products, applicationType]
  );

  const modelsList = useMemo(
    () =>
      products.filter(
        (p) =>
          p.applicationType === applicationType && p.seriesCode === seriesCode
      ),
    [products, applicationType, seriesCode]
  );

  useEffect(() => {
    setSeriesCode("");
    setModelId("");
  }, [applicationType]);

  useEffect(() => {
    setModelId("");
  }, [seriesCode]);

  return (
    <div className="config-form">
      <h2>LED Display Configurator</h2>

      {/* Application Dropdown */}
      <div className="form-group">
        <label>Application Type</label>
        <select
          value={applicationType}
          onChange={(e) => setApplicationType(e.target.value)}
        >
          <option value="">Select Application</option>
          {applicationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Series Dropdown */}
      <div className="form-group">
        <label>Series</label>
        <select
          value={seriesCode}
          onChange={(e) => setSeriesCode(e.target.value)}
          disabled={!applicationType}
        >
          <option value="">Select Series</option>
          {seriesList.map((series) => (
            <option key={series} value={series}>
              {series}
            </option>
          ))}
        </select>
      </div>

      {/* Model Dropdown */}
      <div className="form-group">
        <label>Model</label>
        <select
          value={modelId}
          disabled={!seriesCode}
          onChange={(e) => {
            setModelId(e.target.value);
            const product = products.find((p) => p.id === e.target.value);
            if (product) {
              setSelectedProduct(product);
            }
          }}
        >
          <option value="">Select Model</option>
          {modelsList.map((product) => (
            <option key={product.id} value={product.id}>
              {product.model}
            </option>
          ))}
        </select>
      </div>

      {/* Validation Specifications Card Info Deck */}
      {selectedProduct && (
        <div className="selected-model-card" style={{ marginTop: "12px", padding: "12px", border: "1px dashed #ccc", borderRadius: "6px" }}>
          <strong>{selectedProduct.model}</strong>
          <div>Pitch: {selectedProduct.pitch} mm</div>
          <div>Brightness: {selectedProduct.brightness} nits</div>
        </div>
      )}

      {/* Environmental Background Loader Placement */}
      <div className="form-group" style={{ marginTop: "16px" }}>
        <label>Preview Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>

      {/* Width Setting */}
      <div className="form-group">
        <label>Width (meters)</label>
        <div className="dimension-control">
          <button
            type="button"
            onClick={() => setWidth(Math.max(1, width - 1))}
          >
            −
          </button>
          <div className="dimension-value">
            {width} m
          </div>
          <button
            type="button"
            onClick={() => setWidth(width + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Height Setting */}
      <div className="form-group">
        <label>Height (meters)</label>
        <div className="dimension-control">
          <button
            type="button"
            onClick={() => setHeight(Math.max(1, height - 1))}
          >
            −
          </button>
          <div className="dimension-value">
            {height} m
          </div>
          <button
            type="button"
            onClick={() => setHeight(height + 1)}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="calculate-button"
        onClick={onCalculate}
        disabled={!selectedProduct || width <= 0 || height <= 0}
      >
        Calculate Configuration
      </button>
    </div>
  );
};