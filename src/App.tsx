import "./App.css";
import panasonicLogo from "./assets/Panasonic-logo.jpg";
import { useEffect, useRef, useState } from "react";
import { ProductService } from "./services/productService";
import { calculateConfiguration } from "./lib/calculations/calculateConfiguration";
import { generatePdf } from "./lib/pdf/generatePdf";
import { ConfigForm } from "./components/ConfigForm";
import { ResultsPanel } from "./components/ResultsPanel";
import { ScreenPreview } from "./components/ScreenPreview";
import html2canvas from "html2canvas";

import { Product } from "./types/Product";
import { ConfigurationResult } from "./types/ConfigurationResult";
import { BrochurePageService } from "./services/BrochurePageService";

function App() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await ProductService.getProducts();
                console.log("Products from DB:", data.length);

                const pages = await BrochurePageService.getPages("PFP");
                console.log("Brochure Pages:", pages);

                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, []);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [result, setResult] = useState<ConfigurationResult | null>(null);
    const screenPreviewRef = useRef<HTMLDivElement>(null);

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
                `Error calculating configuration: ${error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    const handleExportPdf = async () => {
        if (!selectedProduct || !result) {
            alert("Please calculate a configuration first.");
            return;
        }

        try {
            let imageData: string | undefined;

            if (screenPreviewRef.current) {
                const canvas = await html2canvas(screenPreviewRef.current, {
                    scale: 2,
                });
                imageData = canvas.toDataURL("image/png");
            }

            await generatePdf(selectedProduct, result, width, height, imageData);
        } catch (error) {
            alert(
                `Error exporting PDF: ${error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    if (loadingProducts) {
        return <div>Loading products...</div>;
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <img
                    src={panasonicLogo}
                    alt="Panasonic"
                    className="company-logo"
                />
                <div>
                    <h1>LED Display Configurator</h1>
                    <p>Professional LED Wall Design & Proposal Generator</p>
                </div>
            </header>

            <main className="app-main">
                <div className="dashboard-layout">
                    <div className="config-card">
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
                    </div>

                    <div className="preview-card">
                        {result ? (
                            <div ref={screenPreviewRef}>
                                <ScreenPreview
                                    width={result.actualWidth}
                                    height={result.actualHeight}
                                    resolutionW={result.resolutionW}
                                    resolutionH={result.resolutionH}
                                    cabinetsW={result.cabinetsW}
                                    cabinetsH={result.cabinetsH}
                                    model={`${selectedProduct?.applicationType} | ${selectedProduct?.seriesCode} | ${selectedProduct?.model}`}
                                />
                            </div>
                        ) : (
                            <div>Screen preview will appear here after calculation.</div>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="export-section">
                        <ResultsPanel result={result} />
                        <button
                            className="export-pdf-button"
                            onClick={handleExportPdf}
                        >
                            Export PDF
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;