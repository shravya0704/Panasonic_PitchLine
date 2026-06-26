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

    // Calculate viewing distance based on pitch (e.g., Pitch x 1.5)
    const viewingDistance = (selectedProduct.pitch * 1.5).toFixed(1);

    return (
        <div className="results-panel">
            <h2>Configuration Results</h2>

            {/* SECTION 1: Premium Visual Metrics (Sales Pitch Focus) */}
            <div className="metrics-section-title">Visual Performance</div>
            <div className="results-grid premium-cards">
                <div className="spec-item highlight premium-card">
                    <span className="spec-label">Resolution</span>
                    <span className="spec-value">
                        {result.resolutionW} × {result.resolutionH}
                    </span>
                </div>

                <div className="spec-item highlight premium-card">
                    <span className="spec-label">Display Area</span>
                    <span className="spec-value">
                        {result.totalArea.toFixed(2)} m²
                    </span>
                </div>

                <div className="spec-item highlight premium-card">
                    <span className="spec-label">Brightness</span>
                    <span className="spec-value">
                        {selectedProduct.brightness} nits
                    </span>
                </div>

                <div className="spec-item highlight premium-card">
                    <span className="spec-label">Pixel Pitch</span>
                    <span className="spec-value">
                        {selectedProduct.pitch} mm
                    </span>
                </div>

                <div className="spec-item highlight premium-card distance-feature">
                    <span className="spec-label">Optimal Viewing Distance</span>
                    <span className="spec-value">
                        {viewingDistance} m
                    </span>
                </div>
            </div>

            <hr className="results-divider" />

            {/* SECTION 2: Technical & Physical Specifications */}
            <div className="metrics-section-title">Physical Specs</div>
            <div className="results-grid technical-specs">
                <div className="spec-item">
                    <span className="spec-label">Total Cabinets</span>
                    <span className="spec-value">{result.totalCabinets}</span>
                </div>

                <div className="spec-item">
                    <span className="spec-label">Actual Width</span>
                    <span className="spec-value">{result.actualWidth.toFixed(2)} m</span>
                </div>

                <div className="spec-item">
                    <span className="spec-label">Actual Height</span>
                    <span className="spec-value">{result.actualHeight.toFixed(2)} m</span>
                </div>

                <div className="spec-item">
                    <span className="spec-label">Total Modules</span>
                    <span className="spec-value">{result.totalModules}</span>
                </div>

                <div className="spec-item">
                    <span className="spec-label">Cabinets Wide</span>
                    <span className="spec-value">{result.cabinetsW}</span>
                </div>

                <div className="spec-item">
                    <span className="spec-label">Cabinets High</span>
                    <span className="spec-value">{result.cabinetsH}</span>
                </div>
            </div>
        </div>
    );
};