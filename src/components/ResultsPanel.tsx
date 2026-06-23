import { ConfigurationResult } from "../types/ConfigurationResult";

interface ResultsPanelProps {
    result: ConfigurationResult | null;
}

export const ResultsPanel = ({
    result,
}: ResultsPanelProps) => {
    if (!result) return null;

    return (
        <div className="results-panel">
            <h2>Configuration Results</h2>

            <div className="results-grid">

                <div className="spec-item highlight">
                    <span className="spec-value">
                        {result.totalCabinets}
                    </span>

                    <span className="spec-label">
                        Total Cabinets
                    </span>
                </div>

                <div className="spec-item highlight">
                    <span className="spec-value">
                        {result.resolutionW} × {result.resolutionH}
                    </span>

                    <span className="spec-label">
                        Resolution
                    </span>
                </div>

                <div className="spec-item highlight">
                    <span className="spec-value">
                        {result.totalArea.toFixed(2)} m²
                    </span>

                    <span className="spec-label">
                        Display Area
                    </span>
                </div>

                <div className="spec-item">
                    <span className="spec-value">
                        {result.actualWidth.toFixed(2)} m
                    </span>

                    <span className="spec-label">
                        Actual Width
                    </span>
                </div>

                <div className="spec-item">
                    <span className="spec-value">
                        {result.actualHeight.toFixed(2)} m
                    </span>

                    <span className="spec-label">
                        Actual Height
                    </span>
                </div>

                <div className="spec-item">
                    <span className="spec-value">
                        {result.totalModules}
                    </span>

                    <span className="spec-label">
                        Total Modules
                    </span>
                </div>

                <div className="spec-item">
                    <span className="spec-value">
                        {result.cabinetsW}
                    </span>

                    <span className="spec-label">
                        Cabinets Wide
                    </span>
                </div>

                <div className="spec-item">
                    <span className="spec-value">
                        {result.cabinetsH}
                    </span>

                    <span className="spec-label">
                        Cabinets High
                    </span>
                </div>

            </div>
        </div>
    );
};