import { ConfigurationResult } from "../types/ConfigurationResult";

interface ResultsPanelProps {
  result: ConfigurationResult | null;
}

export const ResultsPanel = ({ result }: ResultsPanelProps) => {
  if (!result) return null;

  return (
    <div className="results-panel">
      <h2>Configuration Results</h2>
      
      <div className="results-grid">
        <div className="spec-item">
          <span className="spec-label">Cabinets Width:</span>
          <span className="spec-value">{result.cabinetsW}</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Cabinets Height:</span>
          <span className="spec-value">{result.cabinetsH}</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Total Cabinets:</span>
          <span className="spec-value">{result.totalCabinets}</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Total Modules:</span>
          <span className="spec-value">{result.totalModules}</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Actual Width:</span>
          <span className="spec-value">{result.actualWidth.toFixed(2)} m</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Actual Height:</span>
          <span className="spec-value">{result.actualHeight.toFixed(2)} m</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Resolution Width:</span>
          <span className="spec-value">{result.resolutionW}</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Resolution Height:</span>
          <span className="spec-value">{result.resolutionH}</span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Total Area:</span>
          <span className="spec-value">{result.totalArea.toFixed(2)} m²</span>
        </div>
      </div>
    </div>
  );
};
