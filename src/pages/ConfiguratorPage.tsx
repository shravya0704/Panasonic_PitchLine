import "../App.css";
import panasonicLogo from "../assets/Panasonic-logo.jpg";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

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

function ConfiguratorPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    // NEW: Content type state
    const [contentType, setContentType] = useState<"sample" | "video" | "upload" | "none">("sample");

    const [showExportModal, setShowExportModal] = useState(false);
    const [proposalInfo, setProposalInfo] = useState({
        projectName: "",
        customerName: "",
        companyName: "",
        email: "",
    });

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
            alert(`Error calculating: ${error instanceof Error ? error.message : "Unknown"}`);
        }
    };

    const handleExportPdf = async (proposalData?: any) => {
        if (!selectedProduct || !result) return;
        try {
            let imageData: string | undefined;
            if (screenPreviewRef.current) {
                const canvas = await html2canvas(screenPreviewRef.current, { scale: 2 });
                imageData = canvas.toDataURL("image/png");
            }
            const proposalId = generateProposalId();
            if (proposalData) {
                await ProposalService.createProposal({ ...proposalData, proposalId }, selectedProduct, result, width, height);
            }
            await generatePdf(selectedProduct, result, width, height, imageData, proposalData, proposalId);
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
                                    />
                                </div>
                                <div className="export-section">
                                    <ResultsPanel result={result} selectedProduct={selectedProduct} />
                                    <button className="export-pdf-button" onClick={() => setShowExportModal(true)}>
                                        Export PDF
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div>Screen preview will appear here after calculation.</div>
                        )}
                    </div>
                </div>

                {result && selectedProduct && (
                    <div className="analysis-footer">
                        <ViewingDistanceVisualizer
                            pixelPitch={selectedProduct.pitch}
                            actualWidth={result.actualWidth}
                            actualHeight={result.actualHeight}
                        />
                    </div>
                )}
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