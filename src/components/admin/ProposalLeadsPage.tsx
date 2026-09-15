import { useEffect, useState } from "react";
import { ProposalService } from "../../services/ProposalService";
import AdminCard from "./ui/AdminCard";

export default function ProposalLeadsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting States
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Multi-Select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await ProposalService.getProposals();
      setProposals(data);
    } catch (error) {
      console.error("Failed to load proposals:", error);
    }
  }

  // Handle single proposal deletion
  const handleDeleteProposal = async (proposalId: string) => {
    try {
      setIsDeleting(true);
      await ProposalService.deleteProposal(proposalId);
      // Remove from local state immediately after successful DB deletion
      setProposals(prev => prev.filter(p => p.id !== proposalId));
      setDeleteConfirm(null);
      console.log(`Proposal ${proposalId} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete proposal:", error);
      alert("Failed to delete proposal. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setIsDeleting(true);
      await ProposalService.deleteProposals(selectedIds);
      // Remove from local state immediately after successful DB deletion
      setProposals(prev => 
        prev.filter(p => !selectedIds.includes(p.id))
      );
      setSelectedIds([]);
      setDeleteConfirm(null);
      console.log(`${selectedIds.length} proposals deleted successfully`);
    } catch (error) {
      console.error("Failed to delete proposals:", error);
      alert("Failed to delete proposals. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Native CSV Data Assembly and File Trigger download
  const downloadCsv = (leads: any[]) => {
    const headers = [
      "Proposal ID",
      "Customer",
      "Company",
      "Email",
      "Model",
      "Date",
    ];

    const rows = leads.map((lead) => [
      `"${lead.proposal_id}"`,
      `"${lead.customer_name || ""}"`,
      `"${lead.company_name || ""}"`,
      `"${lead.email || ""}"`,
      `"${lead.product_model || ""}"`,
      `"${new Date(lead.created_at).toLocaleDateString()}"`,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Panasonic_Proposal_Leads_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    downloadCsv(filteredProposals);
  };

  // Sorting Toggle Handler Function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Search Filtering + Sorting Pipeline Processing
  const filteredProposals = [...proposals]
    .filter((lead) => {
      const query = searchQuery.toLowerCase();

      return (
        (lead.customer_name?.toLowerCase() || "").includes(query) ||
        (lead.company_name?.toLowerCase() || "").includes(query) ||
        (lead.product_model?.toLowerCase() || "").includes(query)
      );
    })
    .sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case "customer":
          valueA = a.customer_name || "";
          valueB = b.customer_name || "";
          break;

        case "company":
          valueA = a.company_name || "";
          valueB = b.company_name || "";
          break;

        case "status":
          valueA = a.status || "";
          valueB = b.status || "";
          break;

        default:
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
      }

      if (typeof valueA === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortDirection === "asc"
        ? valueA - valueB
        : valueB - valueA;
    });

  // Page Computations Applied Strictly After Filtering and Sorting
  const totalPages = Math.ceil(filteredProposals.length / rowsPerPage);

  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Select All & Page-Level Selection Helper Formulae
  const currentPageIds = paginatedProposals.map((lead) => lead.id);

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const toggleRow = (proposalId: string) => {
    setSelectedIds((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...currentPageIds]),
      ]);
    }
  };

  const selectedLeads = filteredProposals.filter((lead) =>
    selectedIds.includes(lead.id)
  );

  return (
    <AdminCard title="Proposal Leads">
      <p style={{ margin: "0 0 20px 0", color: "#666" }}>
        Review and track automated proposal generation requests submitted by potential clients.
      </p>

      {/* Action Row Layout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 16,
        }}
      >
        <input
          type="text"
          placeholder="Search customer, company or model..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: 350,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #D1D5DB",
            outline: "none",
          }}
        />

        <button
          onClick={exportCsv}
          style={{
            padding: "10px 18px",
            background: "#005BAC",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            marginBottom: 16,
            background: "#EEF6FF",
            border: "1px solid #CFE2FF",
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 14, color: "#1E3A8A" }}>
            <strong>{selectedIds.length}</strong> of <strong>{filteredProposals.length}</strong> filtered lead{filteredProposals.length !== 1 ? "s" : ""} selected
          </span>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={() => downloadCsv(selectedLeads)}
              style={{
                padding: "8px 14px",
                background: "#005BAC",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Export Selected CSV
            </button>

            <button
              onClick={() => setDeleteConfirm("bulk")}
              disabled={isDeleting}
              style={{
                padding: "8px 14px",
                background: "#DC2626",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: isDeleting ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </button>

            <button
              onClick={() => setSelectedIds([])}
              disabled={isDeleting}
              style={{
                padding: "8px 14px",
                background: "#fff",
                border: "1px solid #D1D5DB",
                color: "#374151",
                borderRadius: 6,
                cursor: isDeleting ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 8,
              maxWidth: 400,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#1F2937" }}>
              {deleteConfirm === "bulk"
                ? `Delete ${selectedIds.length} Proposal${selectedIds.length > 1 ? "s" : ""}?`
                : "Delete Proposal?"}
            </h3>
            <p style={{ margin: "0 0 20px 0", color: "#6B7280", fontSize: 14 }}>
              This action is permanent and cannot be undone. The proposal will be permanently deleted from the database.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                style={{
                  padding: "8px 16px",
                  background: "#E5E7EB",
                  color: "#374151",
                  border: "none",
                  borderRadius: 6,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm === "bulk") {
                    handleBulkDelete();
                  } else if (deleteConfirm && deleteConfirm !== "bulk") {
                    handleDeleteProposal(deleteConfirm);
                  }
                }}
                disabled={isDeleting}
                style={{
                  padding: "8px 16px",
                  background: "#DC2626",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Table Layout */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 25,
        }}
      >
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 50 }}>
              <input
                type="checkbox"
                checked={allCurrentPageSelected}
                onChange={toggleSelectAll}
                style={{ cursor: "pointer" }}
              />
            </th>

            <th style={thStyle}>Proposal ID</th>
            
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("customer")}
            >
              Customer {sortColumn === "customer" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("company")}
            >
              Company {sortColumn === "company" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Model</th>
            
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("date")}
            >
              Date {sortColumn === "date" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            
            <th
              style={{
                ...thStyle,
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => handleSort("status")}
            >
              Status {sortColumn === "status" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>

            <th style={{ ...thStyle, textAlign: "center", width: 60 }}>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {paginatedProposals.map((lead, index) => (
            <tr
              key={lead.id}
              style={{
                background: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
              }}
            >
              <td style={tdStyle}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(lead.id)}
                  onChange={() => toggleRow(lead.id)}
                  style={{ cursor: "pointer" }}
                />
              </td>

              <td
                style={{
                  ...tdStyle,
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4B5563",
                }}
              >
                {lead.proposal_id}
              </td>

              <td style={tdStyle}>{lead.customer_name}</td>
              <td style={tdStyle}>{lead.company_name}</td>

              <td style={{ ...tdStyle, color: "#005BAC", fontWeight: 500 }}>
                {lead.email}
              </td>

              <td style={tdStyle}>
                <span style={{ background: "#E8F0FE", padding: "4px 8px", borderRadius: 4, fontSize: "0.9em", fontWeight: 500, color: "#1E3A8A" }}>
                  {lead.product_model}
                </span>
              </td>

              <td style={tdStyle}>
                {new Date(lead.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              <td style={{ ...tdStyle, textAlign: "center" }}>
                <span
                  style={{
                    background: lead.status === "Sent" ? "#DEF7EC" : "#FEF3C7",
                    color: lead.status === "Sent" ? "#03543F" : "#92400E",
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {lead.status || "New"}
                </span>
              </td>

              <td style={{ ...tdStyle, textAlign: "center" }}>
                <button
                  onClick={() => setDeleteConfirm(lead.id)}
                  disabled={isDeleting}
                  style={{
                    padding: "4px 8px",
                    background: "#FEE2E2",
                    color: "#DC2626",
                    border: "none",
                    borderRadius: 4,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    opacity: isDeleting ? 0.6 : 1,
                  }}
                  title="Delete this proposal"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Pagination Control */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          style={{
            padding: "6px 10px",
            background: currentPage === 1 ? "#E5E7EB" : "#005BAC",
            color: currentPage === 1 ? "#9CA3AF" : "white",
            border: "none",
            borderRadius: 4,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              padding: "6px 10px",
              background: currentPage === page ? "#005BAC" : "#E5E7EB",
              color: currentPage === page ? "white" : "#374151",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: currentPage === page ? 600 : 400,
            }}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          style={{
            padding: "6px 10px",
            background: currentPage === totalPages ? "#E5E7EB" : "#005BAC",
            color: currentPage === totalPages ? "#9CA3AF" : "white",
            border: "none",
            borderRadius: 4,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </AdminCard>
  );
}

// Styling Constants
const thStyle = {
  padding: "12px 16px",
  textAlign: "left" as const,
  fontWeight: 600,
  background: "#F9FAFB",
  borderBottom: "2px solid #E5E7EB",
  color: "#374151",
  fontSize: 14,
};

const tdStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #E5E7EB",
  color: "#4B5563",
  fontSize: 14,
};