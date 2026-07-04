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
  // MODIFIED: Added optional parameter overrides to signature
  onCalculate: (overrideWidth?: number, overrideHeight?: number) => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  contentType: "sample" | "video" | "upload" | "none";
  setContentType: (type: "sample" | "video" | "upload" | "none") => void;
  unit: "mtr" | "ft";
  setUnit: (unit: "mtr" | "ft") => void;
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
  contentType,
  setContentType,
  unit,
  setUnit,
}: ConfigFormProps) => {
  const [applicationType, setApplicationType] = useState("");
  
  // Facet States
  const [pitchFilter, setPitchFilter] = useState<string>("");
  const [brightnessFilter, setBrightnessFilter] = useState<string>("");
  const [ledTypeFilter, setLedTypeFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");

  const METERS_TO_FEET = 3.28084;

  // Local input string states that capture raw typing completely freely
  const [localWidthStr, setLocalWidthStr] = useState<string>("");
  const [localHeightStr, setLocalHeightStr] = useState<string>("");

  // Initialize local text inputs with parent dimensions on first load or product reset
  useEffect(() => {
    if (width > 0 && localWidthStr === "") {
      const targetVal = unit === "mtr" ? width : Number((width * METERS_TO_FEET).toFixed(2));
      setLocalWidthStr(targetVal.toString());
    }
  }, [width, unit]);

  useEffect(() => {
    if (height > 0 && localHeightStr === "") {
      const targetVal = unit === "mtr" ? height : Number((height * METERS_TO_FEET).toFixed(2));
      setLocalHeightStr(targetVal.toString());
    }
  }, [height, unit]);

  // Convert local text smoothly when explicitly toggling units
  const handleUnitToggle = (newUnit: "mtr" | "ft") => {
    if (newUnit === unit) return;
    
    const wNum = parseFloat(localWidthStr);
    const hNum = parseFloat(localHeightStr);

    if (!isNaN(wNum) && wNum > 0) {
      const convertedW = newUnit === "ft" ? wNum * METERS_TO_FEET : wNum / METERS_TO_FEET;
      setLocalWidthStr(Number(convertedW.toFixed(2)).toString());
    }
    if (!isNaN(hNum) && hNum > 0) {
      const convertedH = newUnit === "ft" ? hNum * METERS_TO_FEET : hNum / METERS_TO_FEET;
      setLocalHeightStr(Number(convertedH.toFixed(2)).toString());
    }

    setUnit(newUnit);
  };

  // Extract distinct master application categories
  const applicationTypes = useMemo(
    () => Array.from(new Set(products.map((p) => p.applicationType))),
    [products]
  );

  const pitchRanges = ["<= 1.0mm", "1.1mm - 1.6mm", ">= 1.7mm"];
  const brightnessRanges = ["<= 1000 nits", "> 1000 nits"];
  const ledTypes = ["COB", "SMD"];
  const serviceTypes = ["Front", "Rear", "Front/Rear"];

  // Helper utility to safely scan table attributes
  const getProductSpec = (product: any, specName: string): string => {
    if (!product.product_specifications) return "";
    const found = product.product_specifications.find(
      (s: any) => s.specification_name?.toLowerCase() === specName.toLowerCase()
    );
    return found ? found.specification_value : "";
  };

  // Master recovery method to unfreeze deadlocks smoothly
  const handleClearFilters = () => {
    setPitchFilter("");
    setBrightnessFilter("");
    setLedTypeFilter("");
    setServiceFilter("");
  };

  // Client-side execution grid filtering
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (applicationType && p.applicationType !== applicationType) return false;

        if (pitchFilter) {
          if (pitchFilter === "<= 1.0mm" && p.pitch > 1.0) return false;
          if (pitchFilter === "1.1mm - 1.6mm" && (p.pitch < 1.1 || p.pitch > 1.6)) return false;
          if (pitchFilter === ">= 1.7mm" && p.pitch < 1.7) return false;
        }

        if (brightnessFilter) {
          if (brightnessFilter === "<= 1000 nits" && p.brightness > 1000) return false;
          if (brightnessFilter === "> 1000 nits" && p.brightness <= 1000) return false;
        }

        if (ledTypeFilter && getProductSpec(p, "LED Type") !== ledTypeFilter) return false;
        if (serviceFilter && getProductSpec(p, "Service Access") !== serviceFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.pitch !== b.pitch) return a.pitch - b.pitch;
        return a.model.localeCompare(b.model);
      });
  }, [products, applicationType, pitchFilter, brightnessFilter, ledTypeFilter, serviceFilter]);

  // Clean state cascade when switching major categories
  useEffect(() => {
    handleClearFilters();
  }, [applicationType]);

  // Submit and lock dimensions ONLY when the user clicks the calculate button
  const handleSubmitCalculate = () => {
    const parsedWidth = parseFloat(localWidthStr);
    const parsedHeight = parseFloat(localHeightStr);

    if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
      alert("Please enter valid width and height dimensions.");
      return;
    }

    const wMeters = unit === "mtr" ? parsedWidth : parsedWidth / METERS_TO_FEET;
    const hMeters = unit === "mtr" ? parsedHeight : parsedHeight / METERS_TO_FEET;

    // Push standard dimensions up to engine state
    setWidth(wMeters);
    setHeight(hMeters);

    // MODIFIED: Passing raw metric variables immediately into calculations to clear the lag bug
    onCalculate(wMeters, hMeters);
  };

  return (
    <div className="config-form">
      <h2>Display Configuration</h2>
      <p className="config-subtitle">
        Configure your Panasonic LED display using the PitchLine engineering engine.
      </p>

      {/* SECTION 1: SMART FILTERING PANEL */}
      <div className="config-section">
        <div className="config-section-title">FILTERS</div>

        {/* Application Dropdown */}
        <div className="form-group">
          <label className="section-label">APPLICATION</label>
          <select
            value={applicationType}
            onChange={(e) => setApplicationType(e.target.value)}
          >
            <option value="">Select Application</option>
            {applicationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Pixel Pitch Range Selection */}
        <div className="form-group">
          <label className="section-label">PIXEL PITCH</label>
          <div className="filter-chips-wrapper">
            {pitchRanges.map((range) => {
              const isActive = pitchFilter === range;
              return (
                <button
                  key={range}
                  type="button"
                  className={`filter-chip-btn ${isActive ? "active" : ""}`}
                  onClick={() => setPitchFilter(isActive ? "" : range)}
                >
                  {isActive ? `✓ ${range}` : range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brightness Threshold Selection */}
        <div className="form-group">
          <label className="section-label">BRIGHTNESS</label>
          <div className="filter-chips-wrapper">
            {brightnessRanges.map((range) => {
              const isActive = brightnessFilter === range;
              return (
                <button
                  key={range}
                  type="button"
                  className={`filter-chip-btn ${isActive ? "active" : ""}`}
                  onClick={() => setBrightnessFilter(isActive ? "" : range)}
                >
                  {isActive ? `✓ ${range}` : range}
                </button>
              );
            })}
          </div>
        </div>

        {/* LED Implementation Variant */}
        <div className="form-group">
          <label className="section-label">LED TYPE</label>
          <div className="filter-chips-wrapper">
            {ledTypes.map((type) => {
              const isActive = ledTypeFilter === type;
              return (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip-btn ${isActive ? "active" : ""}`}
                  onClick={() => setLedTypeFilter(isActive ? "" : type)}
                >
                  {isActive ? `✓ ${type}` : type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Maintenance Architecture */}
        <div className="form-group">
          <label className="section-label">SERVICE ACCESS</label>
          <div className="filter-chips-wrapper">
            {serviceTypes.map((service) => {
              const isActive = serviceFilter === service;
              return (
                <button
                  key={service}
                  type="button"
                  className={`filter-chip-btn ${isActive ? "active" : ""}`}
                  onClick={() => setServiceFilter(isActive ? "" : service)}
                >
                  {isActive ? `✓ ${service}` : service}
                </button>
              );
            })}
          </div>
        </div>
      </div>

     {/* SECTION 2: LIVE HARDWARE SEARCH OUTPUT */}
      <div className="config-section">
        <div className="config-section-title">MATCHED MODELS ({filteredProducts.length})</div>
        {filteredProducts.length === 0 ? (
          <div className="filter-fallback-box">
            No active metrics found matching this profile. 
            <button type="button" className="filter-reset-link" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="matched-models-grid compact-scroll-list">
            {filteredProducts.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              const ledType = getProductSpec(product, "LED Type");
              const service = getProductSpec(product, "Service Access");
              
             return (
                <div
                  key={product.id}
                  className={`model-selection-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedProduct(product)}
                  style={{
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  {/* TOP ROW: Title on left, Badges on right */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    width: "100%",
                    flexWrap: "nowrap",
                    gap: "8px"
                  }}>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: "14px", 
                      whiteSpace: "nowrap", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis",
                      flexGrow: 1
                    }}>
                      {product.model}
                    </div>
                    
                    {(ledType || service) && (
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        {ledType && <span className="card-badge">{ledType}</span>}
                        {service && <span className="card-badge">{service}</span>}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ROW: Pitch and Brightness forced to one line */}
                  <div style={{ 
                    fontSize: "11.5px", 
                    color: "#555", 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis",
                    width: "100%"
                  }}>
                    Pitch: <strong>{product.pitch} mm</strong> 
                    <span style={{ margin: "0 6px", color: "#ccc" }}>•</span> 
                    Brightness: <strong>{product.brightness} nits</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: CORE DATA SELECTION SUMMARY */}
      {selectedProduct && (
        <div className="config-section">
          <div className="config-section-title">SELECTED PRODUCT</div>
          <div className="selected-model-card">
            <div className="selected-model">{selectedProduct.model}</div>
            <div className="selected-spec">
              <span>Pixel Pitch</span>
              <span>{selectedProduct.pitch} mm</span>
            </div>
            <div className="selected-spec">
              <span>Brightness</span>
              <span>{selectedProduct.brightness} nits</span>
            </div>
            {getProductSpec(selectedProduct, "Contrast Ratio") && (
              <div className="selected-spec">
                <span>Contrast Ratio</span>
                <span>{getProductSpec(selectedProduct, "Contrast Ratio")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: PREVIEW CANVAS TARGET */}
      <div className="config-section">
        <div className="config-section-title">PREVIEW CONTENT</div>
        
        {/* Content Mode Selector */}
        <div className="form-group">
          <label className="section-label">SELECT CONTENT TYPE</label>
          <div className="content-mode-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {["sample", "video", "upload", "none"].map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip-btn ${contentType === type ? "active" : ""}`}
                onClick={() => setContentType(type as any)}
                style={{ textTransform: 'capitalize' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Upload Input */}
        {contentType === "upload" && (
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="upload-card">
              <input
                className="upload-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setUploadedImage(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
              <div className="upload-icon">🖼️</div>
              <div className="upload-title">
                {uploadedImage ? "Image Selected" : "Upload Custom Image"}
              </div>
            </label>
          </div>
        )}
      </div>

      {/* SECTION 5: BOUNDARY ENGINE METRICS */}
      <div className="config-section">
        <div className="config-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>DISPLAY SIZE</span>
          <div className="unit-toggle" style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`filter-chip-btn ${unit === 'mtr' ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px', minWidth: 'auto', flex: 'none' }}
              onClick={() => handleUnitToggle('mtr')}
            >
              mtr
            </button>
            <button
              type="button"
              className={`filter-chip-btn ${unit === 'ft' ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px', minWidth: 'auto', flex: 'none' }}
              onClick={() => handleUnitToggle('ft')}
            >
              ft
            </button>
          </div>
        </div>

        {/* Width Workspace Block */}
        <div className="form-group">
          <label className="section-label">DISPLAY WIDTH</label>
          <div className="dimension-card">
            <div className="dimension-control">
              <button type="button" onClick={() => {
                const currentVal = parseFloat(localWidthStr) || 0;
                setLocalWidthStr(Math.max(0, currentVal - 0.1).toFixed(2));
              }}>−</button>
              <div className="dimension-value">
                <input
                  type="text"
                  value={localWidthStr}
                  onChange={(e) => setLocalWidthStr(e.target.value)}
                />
                <span>{unit === 'mtr' ? 'mtr' : 'ft'}</span>
              </div>
              <button type="button" onClick={() => {
                const currentVal = parseFloat(localWidthStr) || 0;
                setLocalWidthStr((currentVal + 0.1).toFixed(2));
              }}>+</button>
            </div>
          </div>
        </div>

        {/* Height Workspace Block */}
        <div className="form-group">
          <label className="section-label">DISPLAY HEIGHT</label>
          <div className="dimension-card">
            <div className="dimension-control">
              <button type="button" onClick={() => {
                const currentVal = parseFloat(localHeightStr) || 0;
                setLocalHeightStr(Math.max(0, currentVal - 0.1).toFixed(2));
              }}>−</button>
              <div className="dimension-value">
                <input
                  type="text"
                  value={localHeightStr}
                  onChange={(e) => setLocalHeightStr(e.target.value)}
                />
                <span>{unit === 'mtr' ? 'mtr' : 'ft'}</span>
              </div>
              <button type="button" onClick={() => {
                const currentVal = parseFloat(localHeightStr) || 0;
                setLocalHeightStr((currentVal + 0.1).toFixed(2));
              }}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        className="calculate-button"
        onClick={handleSubmitCalculate}
        disabled={!selectedProduct || localWidthStr === "" || localHeightStr === ""}
      >
        Generate Configuration
      </button>
      
    </div>
  );
};