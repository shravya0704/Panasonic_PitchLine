import { useEffect, useState } from "react";
import { ProposalService } from "../../services/ProposalService";
import AdminCard from "./ui/AdminCard";

export default function ProposalLeadsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Step 1: Native CSV Data Assembly and File Trigger download
  const exportCsv = () => {
    const headers = [
      "Proposal ID",
      "Customer",
      "Company",
      "Email",
      "Model",
      "Date",
    ];

    const rows = proposals.map((lead) => [
      `"${lead.proposal_id}"`, // wrapped in quotes to preserve formatting in excel
      `"${lead.customer_name || ""}"`,
      `"${lead.company_name || ""}"`,
      `"${lead.email || ""}"`,
      `"${lead.product_model || ""}"`,
      `"${new Date(lead.created_at).toLocaleDateString()}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Panasonic_Proposal_Leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Client-side filtering logic
  const filteredProposals = proposals.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      (lead.customer_name?.toLowerCase() || "").includes(query) ||
      (lead.company_name?.toLowerCase() || "").includes(query) ||
      (lead.product_model?.toLowerCase() || "").includes(query)
    );
  });

  return (
    <AdminCard title="Proposal Leads">
      <p style={{ margin: "0 0 20px 0", color: "#666" }}>
        Review and track automated proposal generation requests submitted by potential clients.
      </p>

      {/* Step 2: Action Row for Search and Export Alignment */}
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
          onChange={(e) => setSearchQuery(e.target.value)}
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
            <th style={thStyle}>Proposal ID</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Company</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Model</th>
            <th style={thStyle}>Date</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredProposals.map((lead, index) => (
            <tr
              key={lead.id}
              style={{
                background: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
              }}
            >
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