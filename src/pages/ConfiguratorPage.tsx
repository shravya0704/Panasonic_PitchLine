import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

// @ts-ignore
import "../App.css";

import { ProductService } from "../services/ProductService";
import { calculateConfiguration } from "../lib/calculations/calculateConfiguration";
import { generatePdf } from "../lib/pdf/generatePdf";

import { ConfigForm } from "../components/configurator/ConfigForm";
import { ResultsPanel } from "../components/configurator/ResultsPanel";
import { ScreenPreview } from "../components/configurator/ScreenPreview";
import { ExportProposalModal } from "../components/configurator/ExportProposalModal";
import ViewingDistanceVisualizer from "../components/configurator/ViewingDistanceVisualizer";

import { Product } from "../types/Product";
import { ConfigurationResult } from "../types/ConfigurationResult";
import { BrochurePageService } from "../services/BrochurePageService";
import { ProposalService } from "../services/ProposalService";
import { generateProposalId } from "../lib/generateProposalId";

const panasonicLogo = new URL("../assets/Panasonic-logo.jpg", import.meta.url).href;

/**
 * AIO SUPPORT: Detects if selected product is AIO type and hides irrelevant UI elements.
 */
function ConfiguratorPage() {
    // --- Application State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [contentType, setContentType] = useState<"sample" | "video" | "upload" | "none">("sample");

    const [unit, setUnit] = useState<"mtr" | "ft">("mtr");
    const [targetResolution, setTargetResolution] = useState<"None" | "HD" | "FHD" | "UHD">("None");

    const [showExportModal, setShowExportModal] = useState(false);
    const [proposalInfo, setProposalInfo] = useState({
        projectName: "",
        customerName: "",
        companyName: "",
        email: "",
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [result, setResult] = useState<ConfigurationResult | null>(null);

    const screenPreviewRef = useRef<HTMLDivElement>(null);
    const viewingDistanceRef = useRef<HTMLDivElement>(null);

    // AIO DETECTION
    const isAIO = selectedProduct?.seriesType === "aio";

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await ProductService.getProducts();
                const pages = await BrochurePageService.getPages("PFP");
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    const handleCalculate = (overrideWidth?: number, overrideHeight?: number) => {
        const targetWidth = overrideWidth !== undefined ? overrideWidth : width;
        const targetHeight = overrideHeight !== undefined ? overrideHeight : height;

        if (!selectedProduct) {
            alert("Please select a product.");
            return;
        }

        // AIO: Fixed specs, no calculation needed
        if (isAIO) {
            const aioResult: ConfigurationResult = {
                cabinetsW: 1,
                cabinetsH: 1,
                totalCabinets: 1,
                totalModules: 1,
                actualWidth: 3036.8,
                actualHeight: 1825.8,
                resolutionW: 1920,
                resolutionH: 1080,
                totalArea: 5.06,
                maximumPower: 2500,
                averagePower: 833,
                maximumHeat: 8537,
                averageHeat: 2843,
                maximumHeatBTU: 8537,
                averageHeatBTU: 2843,
                diagonalInches: 136,
                aspectRatio: "16:9",
            };
            setResult(aioResult);
            return;
        }

        // Standard products: require valid dimensions
        if (targetWidth <= 0 || targetHeight <= 0) {
            alert("Please select a product and enter valid dimensions.");
            return;
        }

        try {
            const config = calculateConfiguration(selectedProduct, targetWidth, targetHeight);
            setResult(config);
        } catch (error) {
            alert(`Error calculating: ${error instanceof Error ? error.message : "Unknown"}`);
        }
    };

    const handleExportPdf = async (proposalData?: any) => {
        if (!selectedProduct || !result) return;
        try {
            let imageData: string | undefined;
            let viewingDistanceImage: string | undefined;

            if (screenPreviewRef.current) {
                const canvas = await html2canvas(screenPreviewRef.current, { scale: 2 });
                imageData = canvas.toDataURL("image/png");
            }

            // Capture Viewing Distance only for standard products (not AIO)
            if (viewingDistanceRef.current && !isAIO) {
                const canvas = await html2canvas(viewingDistanceRef.current, {
                    scale: 2,
                });
                viewingDistanceImage = canvas.toDataURL("image/png");
            }

            const proposalId = generateProposalId();

            if (proposalData) {
                await ProposalService.createProposal({ ...proposalData, proposalId }, selectedProduct, result, width, height);
            }

            const typedGeneratePdf = generatePdf as (
                product: Product,
                result: ConfigurationResult,
                width: number,
                height: number,
                screenPreviewImage?: string,
                viewingDistanceImage?: string,
                proposalData?: {
                    projectName: string;
                    customerName: string;
                    companyName: string;
                    email: string;
                },
                proposalId?: string,
                unit?: "mtr" | "ft"
            ) => Promise<void>;

            await typedGeneratePdf(selectedProduct, result, width, height, imageData, viewingDistanceImage, proposalData, proposalId, unit);
        } catch (error) {
            alert(`Error exporting PDF: ${error instanceof Error ? error.message : "Unknown"}`);
        }
    };

    if (loadingProducts) return <div>Loading products...</div>;

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="app-header-left">
                    <img src={panasonicLogo} alt="Panasonic" className="company-logo" />
                    <div className="app-header-content">
                        <h1>Panasonic PitchLine</h1>
                        <p>LED Engineering Suite</p>
                    </div>
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
                            uploadedImage={uploadedImage}
                            setUploadedImage={setUploadedImage}
                            contentType={contentType}
                            setContentType={setContentType}
                            unit={unit}
                            setUnit={setUnit}
                            targetResolution={targetResolution}
                            setTargetResolution={setTargetResolution}
                            isAIO={isAIO}
                        />
                    </div>

                    <div className="preview-card">
                        {result && selectedProduct ? (
                            <>
                                <div ref={screenPreviewRef}>
                                    <ScreenPreview
                                        width={result.actualWidth}
                                        height={result.actualHeight}
                                        resolutionW={result.resolutionW}
                                        resolutionH={result.resolutionH}
                                        cabinetsW={result.cabinetsW}
                                        cabinetsH={result.cabinetsH}
                                        model={`${selectedProduct?.applicationType} | ${selectedProduct?.seriesCode} | ${selectedProduct?.model}`}
                                        brightness={selectedProduct?.brightness}
                                        pixelPitch={selectedProduct?.pitch}
                                        result={result}
                                        uploadedImage={uploadedImage}
                                        contentType={contentType}
                                        unit={unit}
                                        targetResolution={targetResolution}
                                    />
                                </div>

                                {/* HIDE Engineering Summary and Export Button for AIO */}
                                {!isAIO && (
                                    <div className="export-section">
                                        <ResultsPanel result={result} selectedProduct={selectedProduct} unit={unit} />
                                        <button className="export-pdf-button" onClick={() => setShowExportModal(true)}>
                                            Export PDF
                                        </button>
                                    </div>
                                )}

                                {/* FOR AIO: Show simple export button without engineering summary */}
                                {isAIO && (
                                    <div className="export-section">
                                        <button className="export-pdf-button" onClick={() => setShowExportModal(true)}>
                                            Export PDF
                                        </button>
                                    </div>
                                )}

                                {/* HIDE Viewing Distance Visualizer for AIO */}
                                {!isAIO && (
                                    <div
                                        ref={viewingDistanceRef}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            marginTop: "2rem",
                                            marginBottom: "2rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                maxWidth: "760px",
                                            }}
                                        >
                                            <ViewingDistanceVisualizer
                                                pixelPitch={selectedProduct.pitch}
                                                actualWidth={result.actualWidth}
                                                actualHeight={result.actualHeight}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>Screen preview will appear here after calculation.</div>
                        )}
                    </div>
                </div>
            </main>

            {showExportModal && (
                <ExportProposalModal
                    onClose={() => setShowExportModal(false)}
                    onSubmit={(data) => {
                        setProposalInfo(data);
                        setShowExportModal(false);
                        handleExportPdf(data);
                    }}
                />
            )}
        </div>
    );
}

export default ConfiguratorPage;