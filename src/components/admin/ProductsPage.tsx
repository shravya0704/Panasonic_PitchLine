import { useEffect, useState } from "react";
import { Product } from "../../types/Product";
import { ProductService } from "../../services/ProductService";
import ProductTable from "./ProductTable";
import AdminCard from "./ui/AdminCard";
import AdminButton from "./ui/AdminButton";
import ProductModal from "./ProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

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
    <AdminCard title="Products">
      <p>
        Manage Panasonic LED Display products.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ marginBottom: 4 }}>
        
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            
          </p>
        </div>

        <AdminButton
          onClick={() => {
            setEditingProduct(undefined);
            setShowModal(true);
          }}
        >
          + Add Product
        </AdminButton>
      </div>

      <ProductTable
        products={products}
        refresh={loadProducts}
        onEdit={(product) => {
          setEditingProduct(product);
          setShowModal(true);
        }}
      />

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(undefined);
          }}
          onSave={async (product) => {
            if (editingProduct) {
              await ProductService.updateProduct(product);
            } else {
              await ProductService.createProduct(product);
            }
            await loadProducts();
            setEditingProduct(undefined);
            setShowModal(false);
          }}
        />
      )}
    </AdminCard>
  );
}