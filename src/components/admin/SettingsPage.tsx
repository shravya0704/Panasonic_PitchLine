import { useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminCard from "./ui/AdminCard";
import AdminButton from "./ui/AdminButton";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const save = async () => {
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    try {
      setLoading(true);

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        setMessage({ type: "error", text: "Not authenticated. Please log in again." });
        return;
      }

      // Verify current password by attempting to re-authenticate
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setMessage({ type: "error", text: "Current password is incorrect." });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage({ type: "error", text: `Failed to update password: ${updateError.message}` });
        return;
      }

      setMessage({ type: "success", text: "Password updated successfully." });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title="Settings">
      <div style={{ maxWidth: 400 }}>

        <Field
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          disabled={loading}
        />

        <Field
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          disabled={loading}
        />

        <Field
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={loading}
        />

        {message && (
          <div
            style={{
              marginBottom: 20,
              padding: 10,
              borderRadius: 6,
              backgroundColor: message.type === "success" ? "#D4EDDA" : "#F8D7DA",
              color: message.type === "success" ? "#155724" : "#721C24",
              fontSize: 14,
            }}
          >
            {message.text}
          </div>
        )}

        <AdminButton onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save Password"}
        </AdminButton>

      </div>
    </AdminCard>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
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
        disabled={disabled}
        style={{
          width: "100%",
          padding: 10,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "auto",
        }}
      />
    </div>
  );
}