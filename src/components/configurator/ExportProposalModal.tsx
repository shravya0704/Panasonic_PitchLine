import { useState } from "react";

interface ExportProposalModalProps {
  onClose: () => void;
  onSubmit: (
    data: {
      projectName: string;
      customerName: string;
      companyName: string;
      email: string;
      phoneNumber?: string;
      location?: string;
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

  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!projectName || !customerName || !companyName || !email) {
      alert("All fields are mandatory.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email.");
      return;
    }

    // Optional phone validation
    if (phoneNumber.trim() !== "" && !phoneRegex.test(phoneNumber.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    onSubmit({
      projectName,
      customerName,
      companyName,
      email,
      phoneNumber: phoneNumber.trim() || undefined,
      location: location.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Proposal Information</h2>

        <p className="modal-subtitle">
          Complete the project details below to generate a Panasonic PitchLine
          proposal.
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

        <div className="form-group">
          <label>Phone Number (Optional)</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="10-digit phone number"
          />
        </div>

        <div className="form-group">
          <label>Location (Optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />
        </div>

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