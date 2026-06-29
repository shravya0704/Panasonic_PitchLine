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

  // Helper functions to handle limits safely and cleanly
  const adjustWidth = (newValue: number) => {
    const clamped = Math.max(0.5, Math.min(100, Number(newValue.toFixed(2))));
    setWidth(clamped);
  };

  const adjustHeight = (newValue: number) => {
    const clamped = Math.max(0.5, Math.min(30, Number(newValue.toFixed(2))));
    setHeight(clamped);
  };

  return (
    <div className="config-form">
      <h2>Display Configuration</h2>

      <p className="config-subtitle">
        Configure your Panasonic LED display using the PitchLine engineering engine.
      </p>

      {/* SECTION 1: DISPLAY DROPDOWNS */}
      <div className="config-section">
        <div className="config-section-title">DISPLAY</div>

        {/* Application Dropdown */}
        <div className="form-group">
          <label className="section-label">APPLICATION</label>
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
          <label className="section-label">SERIES</label>
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
          <label className="section-label">MODEL</label>
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
      </div>

     {/* SECTION 2: SELECTED PRODUCT SUMMARY */}
{selectedProduct && (
  <div className="config-section">

    <div className="config-section-title">
      SELECTED PRODUCT
    </div>

    <div className="selected-model-card">

      <div className="selected-model">
        {selectedProduct.model}
      </div>

      <div className="selected-spec">
        <span>Pixel Pitch</span>
        <span>{selectedProduct.pitch} mm</span>
      </div>

      <div className="selected-spec">
        <span>Brightness</span>
        <span>{selectedProduct.brightness} nits</span>
      </div>

    </div>

  </div>
)}
  {/* SECTION 3: PREVIEW IMAGE UPLOAD */ }
  < div className = "config-section" >
        <div className="config-section-title">PREVIEW</div>
        <div className="form-group">
          <label className="section-label">PREVIEW IMAGE</label>
          <label className="upload-card">
            <input
              className="upload-input"
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
            <div className="upload-icon">🖼️</div>
            <div className="upload-title">
              {uploadedImage ? "Image Selected" : "Upload Preview Image"}
            </div>
            <div className="upload-subtitle">PNG • JPG • JPEG</div>
          </label>
        </div>
      </div >

  {/* SECTION 4: DISPLAY DIMENSIONS CONTROLS */ }
  < div className = "config-section" >
    <div className="config-section-title">DISPLAY SIZE</div>

{/* Width Setting */ }
<div className="form-group">
  <label className="section-label">DISPLAY WIDTH</label>
  {/* 💡 CHANGED: Wrapped in cleaner dimension-card layout */}
  <div className="dimension-card">
    <div className="dimension-control">
      <button
        type="button"
        onClick={() => adjustWidth(width - 0.1)}
      >
        −
      </button>
      <div className="dimension-value">
        <input
          type="number"
          step="0.01"
          min="0.5"
          max="100"
          /* Fix: Prevents the browser from appending leading zeros by rendering empty text when state is 0 */
          value={width === 0 ? "" : width}
          onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
          onBlur={() => adjustWidth(width)}
        />
        <span>m</span>
      </div>
      <button
        type="button"
        onClick={() => adjustWidth(width + 0.1)}
      >
        +
      </button>
    </div>
  </div>
</div>

{/* Height Setting */ }
<div className="form-group">
  <label className="section-label">DISPLAY HEIGHT</label>
  {/* 💡 CHANGED: Wrapped in cleaner dimension-card layout */}
  <div className="dimension-card">
    <div className="dimension-control">
      <button
        type="button"
        onClick={() => adjustHeight(height - 0.1)}
      >
        −
      </button>
      <div className="dimension-value">
        <input
          type="number"
          step="0.01"
          min="0.5"
          max="30"
          /* Fix: Prevents the browser from appending leading zeros by rendering empty text when state is 0 */
          value={height === 0 ? "" : height}
          onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
          onBlur={() => adjustHeight(height)}
        />
        <span>m</span>
      </div>
      <button
        type="button"
        onClick={() => adjustHeight(height + 0.1)}
      >
        +
      </button>
    </div>
  </div>
</div>
      </div >

  <button
    className="calculate-button"
    onClick={onCalculate}
    disabled={!selectedProduct || width < 0.5 || height < 0.5}
  >
    Generate Configuration
  </button>
    </div >
  );
};