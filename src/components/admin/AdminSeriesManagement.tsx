import { useEffect, useState } from "react";
import AdminCard from "./AdminCard";
import AdminTable from "./AdminTable";
import AdminButton from "./AdminButton";
import AddNewSeriesModal from "./AddNewSeriesModal";
import AddModelForm from "./AddModelForm";
import { SeriesAdminRepository } from "../../repositories/SeriesAdminRepository";
import { BrochureUploadRepository } from "../../repositories/BrochureUploadRepository";
import { Series } from "../../types/SeriesAdmin";

interface SeriesWithDetails extends Series {
  modelCount: number;
  brochureStatus: "pending" | "completed" | "failed" | "none";
  pageCount: number | null;
}

export default function AdminSeriesManagement() {
  const [series, setSeries] = useState<SeriesWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModelForm, setShowModelForm] = useState(false);
  const [selectedSeriesCode, setSelectedSeriesCode] = useState("");
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  const loadSeries = async () => {
    setIsLoading(true);
    setError("");

    try {
      const allSeries = await SeriesAdminRepository.listAllSeries();

      const enrichedSeries: SeriesWithDetails[] = await Promise.all(
        allSeries.map(async (s) => {
          const modelCount =
            await SeriesAdminRepository.getModelCountForSeries(s.code);
          const brochure =
            await BrochureUploadRepository.getBrochureBySeriesId(s.id);

          return {
            ...s,
            modelCount,
            brochureStatus: brochure?.conversion_status || "none",
            pageCount: brochure?.page_count || null,
          };
        })
      );

      setSeries(enrichedSeries);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load series";
      setError(errorMessage);
      console.error("Error loading series:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleSeriesCreated = (seriesId: string, seriesCode: string) => {
    setShowCreateModal(false);
    loadSeries();
  };

  const handleModelAdded = () => {
    setShowModelForm(false);
    loadSeries();
  };

  const handleDeleteSeries = async (seriesId: string, seriesCode: string) => {
    if (!window.confirm(`Delete series ${seriesCode}? This cannot be undone.`)) {
      return;
    }

    try {
      await SeriesAdminRepository.deleteSeries(seriesId);
      loadSeries();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete series";
      setError(errorMessage);
      console.error("Error deleting series:", err);
    }
  };

  return (
    <AdminCard title="Series Management">
      <p>Manage Panasonic LED Display series, brochures, and models.</p>

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            background: "#fff0f0",
            border: "1px solid #ffcccc",
            borderRadius: 6,
            color: "#cc0000",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            {series.length} series
          </p>
        </div>

        <AdminButton
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          + Create Series
        </AdminButton>
      </div>

      {series.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#f9f9f9",
            borderRadius: 8,
          }}
        >
          <p
            style={{
              color: "#999",
              marginBottom: 16,
            }}
          >
            No series created yet. Create one to get started.
          </p>
          <AdminButton
            onClick={() => {
              setShowCreateModal(true);
            }}
          >
            Create First Series
          </AdminButton>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr
              style={{
                background: "#f5f5f5",
                borderBottom: "1px solid #ddd",
              }}
            >
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#333",
                  borderRight: "1px solid #ddd",
                }}
              >
                Code
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#333",
                  borderRight: "1px solid #ddd",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#333",
                  borderRight: "1px solid #ddd",
                }}
              >
                Models
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#333",
                  borderRight: "1px solid #ddd",
                }}
              >
                Brochure
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#333",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {series.map((s, idx) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: "1px solid #eee",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#333",
                    fontWeight: 600,
                    borderRight: "1px solid #ddd",
                  }}
                >
                  {s.code}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#666",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  {s.name}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#666",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  {s.modelCount}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 12,
                    borderRight: "1px solid #ddd",
                  }}
                >
                  {s.brochureStatus === "completed" ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    >
                      ✓ {s.pageCount} pages
                    </span>
                  ) : s.brochureStatus === "pending" ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#fff3e0",
                        color: "#f57c00",
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    >
                      ⏳ Uploading...
                    </span>
                  ) : s.brochureStatus === "failed" ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#ffebee",
                        color: "#c62828",
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    >
                      ✗ Failed
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#f5f5f5",
                        color: "#999",
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    >
                      Not uploaded
                    </span>
                  )}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedSeriesCode(s.code);
                        setSelectedSeriesId(s.id);
                        setShowModelForm(true);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#005BAC",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      Add Model
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteSeries(s.id, s.code)
                      }
                      style={{
                        padding: "6px 12px",
                        background: "#D32F2F",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {showCreateModal && (
        <AddNewSeriesModal
          onClose={() => setShowCreateModal(false)}
          onSeriesCreated={handleSeriesCreated}
        />
      )}

      {showModelForm && (
        <AddModelForm
          seriesCode={selectedSeriesCode}
          onClose={() => setShowModelForm(false)}
          onModelAdded={handleModelAdded}
        />
      )}
    </AdminCard>
  );
}