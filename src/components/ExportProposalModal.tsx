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
  const [projectName, setProjectName] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const handleSubmit = () => {
    if (
      !projectName ||
      !customerName ||
      !companyName ||
      !email
    ) {
      alert(
        "All fields are mandatory."
      );

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
        <h2>
          Proposal Information
        </h2>

        <div className="form-group">
          <label>
            Project Name *
          </label>

          <input
            value={projectName}
            onChange={(e) =>
              setProjectName(
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label>
            Customer Name *
          </label>

          <input
            value={customerName}
            onChange={(e) =>
              setCustomerName(
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label>
            Company Name *
          </label>

          <input
            value={companyName}
            onChange={(e) =>
              setCompanyName(
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label>
            Email *
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
          >
            Generate Proposal
          </button>
        </div>
      </div>
    </div>
  );
};