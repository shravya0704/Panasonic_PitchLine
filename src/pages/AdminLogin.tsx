import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        setErrorMsg("Incorrect email or password.");
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
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

        <p>Enter your administrator credentials.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 15,
            marginBottom: 12,
            fontSize: 16,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            fontSize: 16,
            boxSizing: "border-box",
          }}
        />

        {errorMsg && (
          <p style={{ color: "#D64545", marginBottom: 12, fontSize: 14 }}>
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#005BAC",
            color: "#fff",
            border: "none",
            cursor: loading ? "default" : "pointer",
            fontSize: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Checking..." : "Login"}
        </button>
      </div>
    </div>
  );
}