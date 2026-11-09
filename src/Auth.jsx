
import { useState } from "react";
import API from "./api/api";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await API.post("/auth/register", {
          name,
          email,
          password,
        });

        setMode("login");
        setError("Registration successful! Please log in.");
      } else {
        const response = await API.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        onLogin(response.data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">✓</div>

        <h1>TankSync</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Welcome back! Sign in to continue."
            : "Create an account to get started."}
        </p>

        {mode === "register" && (
          <input
            className="field"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          className="field"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="field"
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="auth-message">{error}</p>}

        <button className="btn auth-button" type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </button>

        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </form>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 20px;
          background: #f5f6fb;
          font-family: Arial, sans-serif;
          color: #29283e;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          display: grid;
          gap: 15px;
          padding: 35px;
          background: white;
          border: 1px solid #eae9f2;
          border-radius: 16px;
          box-shadow: 0 8px 30px #2823500d;
        }
        .auth-logo {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          background: #7867e9;
          color: white;
          border-radius: 12px;
          font-size: 24px;
          font-weight: bold;
        }
        .auth-card h1 {
          margin: 0;
          font-size: 28px;
        }
        .auth-subtitle {
          margin: -8px 0 8px;
          color: #9291a5;
          font-size: 13px;
        }
        .auth-button {
          min-height: 43px;
        }
        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-message {
          margin: 0;
          color: #7867e9;
          font-size: 12px;
          line-height: 1.5;
        }
        .auth-switch {
          text-align: center;
          color: #9291a5;
          font-size: 12px;
        }
        .auth-switch button {
          margin-left: 6px;
          border: 0;
          background: none;
          color: #7867e9;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
