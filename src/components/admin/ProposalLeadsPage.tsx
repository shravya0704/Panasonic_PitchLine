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

  // Step 5.1 — New Multi-Select State Hook
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  // Step 5.2 — Select All & Page-Level Selection Helper Formulae
  const currentPageIds = paginatedProposals.map((lead) => lead.proposal_id);

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
    selectedIds.includes(lead.proposal_id)
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

      {/* Step 5.3 — Dynamic Context Selection Action Bar Banner */}
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
              onClick={() => setSelectedIds([])}
              style={{
                padding: "8px 14px",
                background: "#fff",
                border: "1px solid #D1D5DB",
                color: "#374151",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Clear Selection
            </button>
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
            {/* Step 5.4 — Global Page Multi-Select Head Control Column Checkbox */}
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
              {/* Step 5.5 — Individual Data-Row Checkbox Column Element */}
              <td style={tdStyle}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(lead.proposal_id)}
                  onChange={() => toggleRow(lead.proposal_id)}
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Pagination Control Blocks Component Row Layout */}
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
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid #D1D5DB",
            background: currentPage === 1 ? "#F3F4F6" : "#fff",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #D1D5DB",
              background:
                currentPage === i + 1 ? "#005BAC" : "#fff",
              color:
                currentPage === i + 1 ? "#fff" : "#374151",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid #D1D5DB",
            background:
              currentPage === totalPages || totalPages === 0
                ? "#F3F4F6"
                : "#fff",
            cursor:
              currentPage === totalPages || totalPages === 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </AdminCard>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#005BAC",
  color: "white",
  fontWeight: 600,
  fontSize: 14,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #E5E7EB",
  color: "#374151",
  fontSize: 14,
};