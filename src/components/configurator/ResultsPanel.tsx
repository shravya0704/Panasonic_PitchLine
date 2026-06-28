import { ConfigurationResult } from "../../types/ConfigurationResult";
import { Product } from "../../types/Product";

interface ResultsPanelProps {
  result: ConfigurationResult | null;
  selectedProduct: Product | null;
}

export const ResultsPanel = ({
  result,
  selectedProduct,
}: ResultsPanelProps) => {
  if (!result || !selectedProduct) return null;

  const viewingDistance = (selectedProduct.pitch * 1.5).toFixed(1);
  const maxHeatBTU = result.maximumHeatBTU ?? (result.maximumPower * 3.412142);
  const avgHeatBTU = result.averageHeatBTU ?? (result.averagePower * 3.412142);

  return (
    <div className="results-panel">
      <div className="results-panel-header">
        <h2>Engineering Summary</h2>
        <p className="results-subtitle">
          Complete engineering output for the configured LED display.
        </p>
      </div>

      <div className="metrics-rows-container">
        {/* ROW 1: VISUAL PERFORMANCE */}
        <div className="metrics-row-group">
          <div className="metrics-row-title">
            <span>Visual Performance</span>
          </div>
          <div className="metrics-row-grid">
            <div className="premium-metric-card">
              <span className="metric-label">Resolution</span>
              <span className="metric-value">
                {result.resolutionW} × {result.resolutionH}
              </span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Display Area</span>
              <span className="metric-value">
                {result.totalArea.toFixed(2)} m²
              </span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Brightness</span>
              <span className="metric-value">
                {selectedProduct.brightness} nits
              </span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Pixel Pitch</span>
              <span className="metric-value">
                {selectedProduct.pitch} mm
              </span>
            </div>
            <div className="premium-metric-card distance-highlight">
              <span className="metric-label">Optimal Distance</span>
              <span className="metric-value">
                {viewingDistance} m
              </span>
            </div>
          </div>
        </div>

        {/* ROW 2: POWER & INFRASTRUCTURE */}
        <div className="metrics-row-group">
          <div className="metrics-row-title">
            <span>Power & Infrastructure</span>
          </div>
          <div className="metrics-row-grid">
            <div className="premium-metric-card">
              <span className="metric-label">Maximum Power</span>
              <span className="metric-value">
                {result.maximumPower.toLocaleString(undefined, { maximumFractionDigits: 0 })} W
              </span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Average Power</span>
              <span className="metric-value">
                {result.averagePower.toLocaleString(undefined, { maximumFractionDigits: 0 })} W
              </span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Max Heat Dissipation</span>
              <span className="metric-value">
                {maxHeatBTU.toLocaleString(undefined, { maximumFractionDigits: 0 })} <small>BTU/h</small>
              </span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Avg Heat Dissipation</span>
              <span className="metric-value">
                {avgHeatBTU.toLocaleString(undefined, { maximumFractionDigits: 0 })} <small>BTU/h</small>
              </span>
            </div>
          </div>
        </div>

        {/* ROW 3: PHYSICAL SPECS */}
        <div className="metrics-row-group">
          <div className="metrics-row-title">
            <span>Physical Specs</span>
          </div>
          <div className="metrics-row-grid physical-six-columns">
            <div className="premium-metric-card">
              <span className="metric-label">Total Cabinets</span>
              <span className="metric-value">{result.totalCabinets}</span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Actual Width</span>
              <span className="metric-value">{result.actualWidth.toFixed(2)} m</span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Actual Height</span>
              <span className="metric-value">{result.actualHeight.toFixed(2)} m</span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Total Modules</span>
              <span className="metric-value">{result.totalModules}</span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Cabinets Wide</span>
              <span className="metric-value">{result.cabinetsW}</span>
            </div>
            <div className="premium-metric-card">
              <span className="metric-label">Cabinets High</span>
              <span className="metric-value">{result.cabinetsH}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};