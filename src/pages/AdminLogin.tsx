import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAuthService } from "../services/AdminAuthService";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      alert("Please enter the password.");
      return;
    }

    try {
      setLoading(true);

      const success =
        await AdminAuthService.login(password);

      if (!success) {
        alert("Incorrect password.");
        return;
      }

      sessionStorage.setItem(
        "adminLoggedIn",
        "true"
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          width: 420,
          padding: 40,
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 8px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2>Admin Login</h2>

        <p>
          Enter administrator password.
        </p>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: 12,
            marginTop: 15,
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#005BAC",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          {loading
            ? "Checking..."
            : "Login"}
        </button>
      </div>
    </div>
  );
}