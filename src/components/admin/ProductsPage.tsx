import { useEffect, useState } from "react";
import { Product } from "../../types/Product";
import { ProductService } from "../../services/ProductService";
import ProductTable from "./ProductTable";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <>
      <h2>Products</h2>

      <button style={{ marginBottom: 20 }}>
        + Add Product
      </button>

      <ProductTable
        products={products}
        refresh={loadProducts}
      />
    </>
  );
}