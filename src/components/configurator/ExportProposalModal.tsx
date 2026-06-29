import { useState } from "react";

interface ExportProposalModalProps {
  onClose: () => void;
  onSubmit: (
    data: {
      projectName: string;
      customerName: string;
      companyName: string;
      email: string;
    }
  ) => void;
}

export const ExportProposalModal = ({
  onClose,
  onSubmit,
}: ExportProposalModalProps) => {
  const [projectName, setProjectName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!projectName || !customerName || !companyName || !email) {
      alert("All fields are mandatory.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email.");
      return;
    }

    onSubmit({
      projectName,
      customerName,
      companyName,
      email,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Step 1: Subtitle added seamlessly below heading */}
        <h2>Proposal Information</h2>
        <p className="modal-subtitle">
          Complete the project details below to generate a Panasonic PitchLine proposal.
        </p>

        <div className="form-group">
          <label>Enter Project Name *</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Enter Customer Name *</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Enter Company Name *</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Enter Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Step 2 & 3: Inline styles replaced with modal-actions class & clean semantic secondary/primary buttons */}
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" onClick={handleSubmit}>
            Export Proposal
          </button>
        </div>
      </div>
    </div>
  );
};