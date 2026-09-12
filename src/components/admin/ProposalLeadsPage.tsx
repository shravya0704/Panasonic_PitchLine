import { useEffect, useState } from "react";
import { ProposalRepository, ProposalRecord } from "../../repositories/ProposalRepository";
import AdminCard from "./ui/AdminCard";
import AdminTable from "./ui/AdminTable";

const ITEMS_PER_PAGE = 10;

export default function ProposalLeadsPage() {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProposals();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = proposals.filter(
        (p) =>
          p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sales_contact_email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          p.product_model.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProposals(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProposals(proposals);
      setCurrentPage(1);
    }
  }, [searchTerm, proposals]);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      const data = await ProposalRepository.getAll();
      setProposals(data);
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (proposalId: string) => {
    setIsDeleting(true);
    try {
      await ProposalRepository.delete(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete proposal:", err);
      alert("Failed to delete proposal");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadCsv = (leads: ProposalRecord[]) => {
    const headers = [
      "Proposal ID",
      "Customer",
      "Company",
      "Customer Email",
      "Sales Contact Email",
      "Model",
      "Date",
    ];

    const rows = leads.map((lead) => [
      `"${lead.proposal_id}"`,
      `"${lead.customer_name || ""}"`,
      `"${lead.company_name || ""}"`,
      `"${lead.email || ""}"`,
      `"${lead.sales_contact_email || ""}"`,
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

  const handleExportCsv = () => {
    downloadCsv(filteredProposals);
  };

  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 9;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage > totalPages - 5) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 3; i <= currentPage + 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <AdminCard>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Proposal Leads</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Review and track automated proposal generation requests submitted by potential clients.
        </p>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search customer, company or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 14,
          }}
        />
        <button
          onClick={handleExportCsv}
          disabled={isLoading || filteredProposals.length === 0}
          style={{
            padding: "10px 16px",
            background: "#0052cc",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: isLoading || filteredProposals.length === 0 ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
          Loading proposals...
        </div>
      ) : filteredProposals.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
          {proposals.length === 0 ? "No proposals yet" : "No proposals match your search"}
        </div>
      ) : (
        <>
          <AdminTable>
            <thead>
              <tr style={{ background: "#0052cc", color: "#fff" }}>
                <th style={{ padding: "12px 16px", textAlign: "center", width: "30px" }}>
                  <input type="checkbox" style={{ cursor: "pointer" }} />
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "140px" }}>
                  Proposal ID
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "130px" }}>
                  Customer
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "140px" }}>
                  Company
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "180px" }}>
                  Customer Email
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "180px" }}>
                  Sales Contact Email
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "110px" }}>
                  Model
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "100px" }}>
                  Date ▼
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, width: "70px" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  style={{
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <input type="checkbox" style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, wordBreak: "break-word" }}>
                    {proposal.proposal_id}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, wordBreak: "break-word" }}>
                    {proposal.customer_name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, wordBreak: "break-word" }}>
                    {proposal.company_name}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#0052cc",
                      wordBreak: "break-all",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={proposal.email}
                  >
                    {proposal.email}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#0052cc",
                      wordBreak: "break-all",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={proposal.sales_contact_email || "-"}
                  >
                    {proposal.sales_contact_email || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, wordBreak: "break-word" }}>
                    {proposal.product_model}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, whiteSpace: "nowrap" }}>
                    {formatDate(proposal.created_at)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => setDeleteConfirm(proposal.id)}
                      style={{
                        padding: "5px 10px",
                        background: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>

          {totalPages > 1 && (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 12px",
                  background: currentPage === 1 ? "#f0f0f0" : "#fff",
                  color: currentPage === 1 ? "#999" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Previous
              </button>

              {generatePageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  disabled={page === "..." || page === currentPage}
                  style={{
                    padding: "8px 12px",
                    minWidth: "36px",
                    background:
                      page === currentPage
                        ? "#0052cc"
                        : page === "..."
                        ? "transparent"
                        : "#fff",
                    color: page === currentPage ? "#fff" : "#333",
                    border: page === "..." ? "none" : "1px solid #ddd",
                    borderRadius: 4,
                    cursor:
                      page === "..." || page === currentPage ? "default" : "pointer",
                    fontSize: 13,
                    fontWeight: page === currentPage ? 600 : 500,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 12px",
                  background: currentPage === totalPages ? "#f0f0f0" : "#fff",
                  color: currentPage === totalPages ? "#999" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 30,
              maxWidth: 400,
              boxShadow: "0 4px 20px rgba(0,0,0,.15)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Delete Proposal?</h3>
            <p style={{ color: "#666", marginBottom: 24 }}>
              This action cannot be undone. The proposal will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#f44336",
                  color: "#fff",
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
    </AdminCard>
  );
}