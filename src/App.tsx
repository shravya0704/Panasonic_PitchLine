import {
    useEffect,
    useRef,
    useState,
} from "react";
import { ProductService } from "./services/productService";
import { calculateConfiguration } from "./lib/calculations/calculateConfiguration";
import { generatePdf } from "./lib/pdf/generatePdf";
import { ConfigForm } from "./components/ConfigForm";
import { ResultsPanel } from "./components/ResultsPanel";
import { ScreenPreview } from "./components/ScreenPreview";

import html2canvas from "html2canvas";



import { Product } from "./types/Product";
import { ConfigurationResult } from "./types/ConfigurationResult";



function App() {
    const [products, setProducts] =
        useState<Product[]>([]);

    const [loadingProducts, setLoadingProducts] =
        useState(true);

    useEffect(() => {
        const loadProducts =
            async () => {
                try {
                    const data =
                        await ProductService.getProducts();

                    console.log(
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    );

                    setProducts(data);
                } catch (error) {
                    console.error(
                        "Error loading products:",
                        error
                    );

                    alert(
                        "Failed to load products from database."
                    );
                } finally {
                    setLoadingProducts(false);
                }
            };

        loadProducts();
    }, []);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    const [result, setResult] =
        useState<ConfigurationResult | null>(null);
    const screenPreviewRef =
        useRef<HTMLDivElement>(null);

    const handleCalculate = () => {
        if (!selectedProduct || width <= 0 || height <= 0) {
            alert(
                "Please select a product and enter valid dimensions."
            );
            return;
        }

        try {
            const config = calculateConfiguration(
                selectedProduct,
                width,
                height
            );

            setResult(config);
        } catch (error) {
            alert(
                `Error calculating configuration: ${error instanceof Error
                    ? error.message
                    : "Unknown error"
                }`
            );
        }
    };

    const handleExportPdf = async () => {
        if (!selectedProduct || !result) {
            alert(
                "Please calculate a configuration first."
            );
            return;
        }

        try {
            let imageData: string | undefined;

            if (screenPreviewRef.current) {
                const canvas =
                    await html2canvas(
                        screenPreviewRef.current,
                        {
                            scale: 2,
                        }
                    );

                imageData =
                    canvas.toDataURL("image/png");
            }

            await generatePdf(
                selectedProduct,
                result,
                width,
                height,
                imageData
            );
        } catch (error) {
            alert(
                `Error exporting PDF: ${error instanceof Error
                    ? error.message
                    : "Unknown error"
                }`
            );
        }
    };

    if (loadingProducts) {
        return (
            <div>
                Loading products...
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Panasonic LED Display Configurator</h1>
                <p>
                    Calculate your optimal display
                    configuration
                </p>
            </header>

            <main className="app-main">
                <section>
                    <h2>LED Display Configurator</h2>

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

                            <ScreenPreview
                                ref={screenPreviewRef}
                                width={result.actualWidth}
                                height={result.actualHeight}
                                resolutionW={result.resolutionW}
                                resolutionH={result.resolutionH}
                                cabinetsW={result.cabinetsW}
                                cabinetsH={result.cabinetsH}
                            />

                            <button
                                className="export-pdf-button"
                                onClick={handleExportPdf}
                            >
                                Export PDF
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;