import { useState } from "react";
import { products } from "./data/models";
import { calculateConfiguration } from "./lib/calculations/calculateConfiguration";
import { generatePdf } from "./lib/generatePdf";
import { ConfigForm } from "./components/ConfigForm";
import { ResultsPanel } from "./components/ResultsPanel";
import { Product } from "./types/Product";
import { ConfigurationResult } from "./types/ConfigurationResult";

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [result, setResult] = useState<ConfigurationResult | null>(null);

  const handleCalculate = () => {
    if (!selectedProduct || width <= 0 || height <= 0) {
      alert("Please select a product and enter valid dimensions.");
      return;
    }

    try {
      const config = calculateConfiguration(selectedProduct, width, height);
      setResult(config);
    } catch (error) {
      alert(
        `Error calculating configuration: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleExportPdf = () => {
    if (!selectedProduct || !result) {
      alert("Please calculate a configuration first.");
      return;
    }

    try {
      generatePdf(selectedProduct, result, width, height);
    } catch (error) {
      alert(
        `Error exporting PDF: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Panasonic LED Display Configurator</h1>
        <p>Calculate your optimal display configuration</p>
      </header>

      <main className="app-main">
        <ConfigForm
          products={products}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          width={width}
          setWidth={setWidth}
          height={height}
          setHeight={setHeight}
          onCalculate={handleCalculate}
        />

        {result && (
          <div className="export-section">
            <ResultsPanel result={result} />
            <button className="export-pdf-button" onClick={handleExportPdf}>
              Export PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
