
import React from "react";

function Login({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  error,
}) {
  return (
    <div style={{ padding: "1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>ApplyTrackr</h1>
      <h2>Login</h2>

      <form onSubmit={onSubmit} style={{ maxWidth: "320px" }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "0.75rem" }}>{error}</div>
        )}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
