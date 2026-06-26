import { Product } from "../../types/Product";
import { ProductService } from "../../services/ProductService";
import AdminButton from "./ui/AdminButton";
import AdminTable from "./ui/AdminTable";

interface Props {
  products: Product[];
  refresh: () => void;
  onEdit: (product: Product) => void;
}

export default function ProductTable({
  products,
  refresh,
  onEdit,
}: Props) {
  const remove = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await ProductService.deleteProduct(id);
      refresh();
    } catch (error) {
      alert(`Error deleting product: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <AdminTable>
      <thead>
        <tr
          style={{
            background: "#F4F7FB",
            textAlign: "left",
          }}
        >
          <th style={{ padding: 16, width: "22%" }}>Application</th>
          <th style={{ padding: 16, width: "18%" }}>Series</th>
          <th style={{ padding: 16 }}>Model</th>
          <th
            style={{
              padding: 16,
              width: 180,
              textAlign: "center",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {products.map((product, index) => (
          <tr
            key={product.id}
            style={{
              background:
                index % 2 === 0 ? "#FFFFFF" : "#FAFBFD",
            }}
          >
            <td style={{ padding: 16 }}>
              {product.applicationType}
            </td>

            <td style={{ padding: 16 }}>
              {product.seriesCode}
            </td>

            <td style={{ padding: 16 }}>
              {product.model}
            </td>

            <td
              style={{
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <AdminButton
                  type="secondary"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </AdminButton>

                <AdminButton
                  type="danger"
                  onClick={() => remove(product.id)}
                >
                  Delete
                </AdminButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTable>
  );
}