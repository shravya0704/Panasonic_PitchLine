import { useState, useCallback, useMemo, ReactElement } from "react";
import { ProposalInfo } from "../../types/ProposalInfo";

interface ExportProposalModalProps {
  onSubmit: (data: ProposalInfo) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ExportProposalModal = ({
  onSubmit,
  onClose,
  isLoading = false,
}: ExportProposalModalProps) => {
  const [projectName, setProjectName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [salesContactEmail, setSalesContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = "Invalid email format";
    }
    if (!salesContactEmail.trim()) {
      newErrors.salesContactEmail = "Sales contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(salesContactEmail)) {
      newErrors.salesContactEmail = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [projectName, customerName, companyName, customerEmail, salesContactEmail]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (validateForm()) {
        const formData: ProposalInfo = {
          projectName,
          customerName,
          companyName,
          customerEmail,
          salesContactEmail,
          phoneNumber: phoneNumber || undefined,
          location: location || undefined,
        };
        onSubmit(formData);
      }
    },
    [projectName, customerName, companyName, customerEmail, salesContactEmail, phoneNumber, location, validateForm, onSubmit]
  );

  const Field = useMemo(
    () =>
      ({
        label,
        value,
        onChange,
        placeholder,
        required = false,
        error,
      }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
        required?: boolean;
        error?: string;
      }): ReactElement => (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            {label}
            {required && <span style={{ color: "#d32f2f" }}> *</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: error ? "2px solid #d32f2f" : "1px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              boxSizing: "border-box",
              fontFamily: "Arial, sans-serif",
            }}
          />
          {error && (
            <span style={{ color: "#d32f2f", fontSize: 12, display: "block", marginTop: 4 }}>
              {error}
            </span>
          )}
        </div>
      ),
    []
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 30,
        }}
      >
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Proposal Information</h2>
          <p style={{ color: "#666", marginTop: 0 }}>
            Complete the project details below to generate a Panasonic PitchLine proposal.
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <Field
            label="Enter Project Name"
            value={projectName}
            onChange={setProjectName}
            placeholder="Project name"
            required
            error={errors.projectName}
          />

          <Field
            label="Enter Customer Name"
            value={customerName}
            onChange={setCustomerName}
            placeholder="Customer name"
            required
            error={errors.customerName}
          />

          <Field
            label="Enter Company Name"
            value={companyName}
            onChange={setCompanyName}
            placeholder="Company name"
            required
            error={errors.companyName}
          />

          <Field
            label="Customer Email"
            value={customerEmail}
            onChange={setCustomerEmail}
            placeholder="Customer email"
            required
            error={errors.customerEmail}
          />

          <Field
            label="Sales Contact Email"
            value={salesContactEmail}
            onChange={setSalesContactEmail}
            placeholder="Your email"
            required
            error={errors.salesContactEmail}
          />

          <Field
            label="Phone Number (Optional)"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="10-digit phone number"
          />

          <Field
            label="Location (Optional)"
            value={location}
            onChange={setLocation}
            placeholder="Enter location"
          />

          <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "#0052cc",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Generating..." : "Generate Proposal"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "#f0f0f0",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};