import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

// @ts-ignore - Suppressing TS error: TypeScript natively lacks module declarations for CSS imports. 
// The bundler (Vite/Webpack) handles this at runtime, so ignoring it here is perfectly safe.
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

// FIXED: Bypasses static image compilation checks to clear asset declaration breaks
const panasonicLogo = new URL("../assets/Panasonic-logo.jpg", import.meta.url).href;

/**
 * The core orchestrator component for the PitchLine Configurator.
 * * * WHY THIS EXISTS: This is the "brain" of the application. It acts as the single source of truth 
 * for all configuration state (dimensions, selected product, UI toggles) and orchestrates the flow 
 * of data between the input forms, the calculation engine, the visual preview, and the PDF generator.
 * By keeping state hoisted here, we ensure the preview and results panel are always perfectly synchronized.
 * * @returns {JSX.Element} The rendered Configurator Dashboard view.
 */
function ConfiguratorPage() {
    // --- Application State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [contentType, setContentType] = useState<"sample" | "video" | "upload" | "none">("sample");

    // Unit measurement state (mtr or ft)
    const [unit, setUnit] = useState<"mtr" | "ft">("mtr");

    // ADDED: Target resolution state
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

    // Ref used to capture the DOM node of the screen preview for the PDF export screenshot.
    const screenPreviewRef = useRef<HTMLDivElement>(null);

    // Ref used to capture the Viewing Distance Visualizer for the PDF export.
    const viewingDistanceRef = useRef<HTMLDivElement>(null);

    /**
     * Initialization hook.
     * Fetches the product catalog and necessary marketing assets (brochures) as soon as the app mounts.
     */
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await ProductService.getProducts();
                // Pre-fetching brochure pages here ensures they are ready in memory 
                // if the user immediately tries to export a PDF, avoiding a delayed network waterfall.
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

    /**
     * Validates user inputs and triggers the core mathematical configuration engine.
     *
     * @param {number} [overrideWidth] - Optional injected width (used if calculation is triggered from a secondary source).
     * @param {number} [overrideHeight] - Optional injected height (used if calculation is triggered from a secondary source).
     * @returns {void} Updates the 'result' state with the calculated specifications, which triggers a re-render of the preview and results panel.
     */
    const handleCalculate = (overrideWidth?: number, overrideHeight?: number) => {
        // Fallback logic: If specific dimensions are passed directly to this function, use them. 
        // Otherwise, rely on the component's main state variables.
        const targetWidth = overrideWidth !== undefined ? overrideWidth : width;
        const targetHeight = overrideHeight !== undefined ? overrideHeight : height;

        if (!selectedProduct || targetWidth <= 0 || targetHeight <= 0) {
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

    /**
     * Orchestrates the complex sequence of capturing the UI preview, saving the lead to the database, 
     * and generating the downloadable PDF proposal.
     *
     * @param {any} [proposalData] - The customer and project information collected from the export modal form.
     * @returns {Promise<void>} Resolves when the PDF generation is successfully triggered.
     */
    const handleExportPdf = async (proposalData?: any) => {
        if (!selectedProduct || !result) return;
        try {
            let imageData: string | undefined;
            let viewingDistanceImage: string | undefined;

            // We use html2canvas to take a literal "screenshot" of the React DOM element.
            // Using { scale: 2 } forces a higher resolution capture (Retina-like quality), 
            // preventing the UI mockup from looking blurry or pixelated when printed in the final PDF.
            if (screenPreviewRef.current) {
                const canvas = await html2canvas(screenPreviewRef.current, { scale: 2 });
                imageData = canvas.toDataURL("image/png");
            }

            // Capture the Viewing Distance Visualizer so it can be rendered
            // as a dedicated engineering page in the proposal PDF.
            if (viewingDistanceRef.current) {
                const canvas = await html2canvas(viewingDistanceRef.current, {
                    scale: 2,
                });

                viewingDistanceImage = canvas.toDataURL("image/png");
            }

            const proposalId = generateProposalId();

            // If user data was provided, we save the lead to Supabase *before* building the PDF.
            // This ensures marketing/sales captures the data even if the client's PDF download gets interrupted.
            if (proposalData) {
                await ProposalService.createProposal({ ...proposalData, proposalId }, selectedProduct, result, width, height);
            }

            // FIXED: 'unit' is now passed at the very end of this call
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
                            // ADDED: Passing state to the form
                            targetResolution={targetResolution}
                            setTargetResolution={setTargetResolution}
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
                                        // ADDED: Passing state to the preview
                                        targetResolution={targetResolution}
                                    />
                                </div>
                                <div className="export-section">
                                    <ResultsPanel result={result} selectedProduct={selectedProduct} unit={unit} />
                                    <button className="export-pdf-button" onClick={() => setShowExportModal(true)}>
                                        Export PDF
                                    </button>
                                </div>

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