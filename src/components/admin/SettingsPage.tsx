import { useState } from "react";
import { AdminAuthService } from "../../services/AdminAuthService";
import AdminCard from "./ui/AdminCard";
import AdminButton from "./ui/AdminButton";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const save = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const success = await AdminAuthService.changePassword(
      currentPassword,
      newPassword
    );

    if (!success) {
      alert("Current password is incorrect.");
      return;
    }

    alert("Password updated successfully.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <AdminCard title="Settings">
      <div style={{ maxWidth: 400 }}>

        <Field
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <Field
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
        />

        <Field
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <AdminButton onClick={save}>
          Save Password
        </AdminButton>

      </div>
    </AdminCard>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
        }}
      />
    </div>
  );
}