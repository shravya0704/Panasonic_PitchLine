import { Product } from "../../types/Product";
// Make sure this points to your single, unified ProductService file
import { ProductService } from "../../services/ProductService"; 

interface Props {
  products: Product[];
  refresh: () => void;
}

export default function ProductTable({ products, refresh }: Props) {
  const remove = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      // Changed from AdminProductService to our consolidated ProductService
      await ProductService.deleteProduct(id);
      refresh();
    } catch (error) {
      alert(`Error deleting product: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Application</th>
          <th>Series</th>
          <th>Model</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.applicationType}</td>
            <td>{product.seriesCode}</td>
            <td>{product.model}</td>
            <td>
              <button style={{ marginRight: 8 }}>Edit</button>
              <button onClick={() => remove(product.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}