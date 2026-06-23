import { Product } from "../types/Product";

interface ConfigFormProps {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
  onCalculate: () => void;
}

export const ConfigForm = ({
  products,
  selectedProduct,
  setSelectedProduct,
  width,
  setWidth,
  height,
  setHeight,
  onCalculate,
}: ConfigFormProps) => {
  return (
    <div className="config-form">
      

      <div className="form-group">
        <label htmlFor="model">LED Model</label>
        <select
          id="model"
          value={selectedProduct?.id || ""}
          onChange={(e) => {
            const product = products.find((p) => p.id === e.target.value);
            if (product) setSelectedProduct(product);
          }}
        >
          <option value="">Select a model</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.applicationType} {" | "} {product.seriesCode} {" | "} {product.model}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="width">Width (meters)</label>
          <input
            id="width"
            type="number"
            min="0.1"
            step="0.1"
            value={width}
            onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
            placeholder="e.g., 6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (meters)</label>
          <input
            id="height"
            type="number"
            min="0.1"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            placeholder="e.g., 8"
          />
        </div>
      </div>

      <button
        className="calculate-button"
        onClick={onCalculate}
        disabled={!selectedProduct || width <= 0 || height <= 0}
      >
        Calculate Configuration
      </button>
    </div>
  );
};
