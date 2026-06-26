import { Product } from "../../types/Product";
import AdminModal from "./ui/AdminModal";
import ProductForm from "./ProductForm";

interface Props {
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

export default function ProductModal({
  product,
  onClose,
  onSave,
}: Props) {
  return (
    <AdminModal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>
        {product ? "Edit Product" : "Add Product"}
      </h2>

      <ProductForm
        product={product}
        onSave={onSave}
        onCancel={onClose}
      />
    </AdminModal>
  );
}