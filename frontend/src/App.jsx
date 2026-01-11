// src/App.jsx

import { useState, useEffect } from "react";
import { login, getApplications, createApplication } from "./api";
import Login from "./components/Login.jsx";

function App() {
  // ---- STATE ---- //
  const [applications, setApplications] = useState([]); // list from backend
  const [error, setError] = useState(""); // error message for UI
  const [loadingApps, setLoadingApps] = useState(false); // loading state
  const [newCompany, setNewCompany] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newStatus, setNewStatus] = useState("applied");
  const [newNotes, setNewNotes] = useState("");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ---- LOAD APPLICATIONS WHEN TOKEN CHANGES ---- //
  useEffect(() => {
    async function fetchApplications() {
      if (!token) {
        setApplications([]);
        return;
      }
      try {
        setLoadingApps(true);
        setError("");
        const apps = await getApplications(token);
        setApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications.");
      } finally {
        setLoadingApps(false);
      }
    }

    fetchApplications();
  }, [token]);

  // ---- HANDLERS ---- //

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setError("");
      const data = await login(email, password);
      setUser(data.user);
      setToken(data.token);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setApplications([]);
    setNewCompany("");
    setNewPosition("");
    setNewStatus("applied");
    setNewNotes("");
    setError("");
  }

  async function handleCreateApplication(e) {
    e.preventDefault();

    if (!newCompany || !newPosition) {
      setError("Company and position are required.");
      return;
    }

    try {
      setError("");

      const appData = {
        company: newCompany,
        position: newPosition,
        status: newStatus,
        notes: newNotes,
        // you could add jobLink, appliedDate, deadline later
      };

      const created = await createApplication(token, appData);

      // Add the created application to the top of the list
      setApplications((prev) => [created, ...prev]);

      // Clear form
      setNewCompany("");
      setNewPosition("");
      setNewStatus("applied");
      setNewNotes("");
    } catch (err) {
      console.error("Error creating application:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create application.");
      }
    }
  }

  // ---- RENDER ---- //
  if (!token) {
    return (
      <Login
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        error={error}
      />
    );
  }

  // If logged in, show applications
  return (
    <div style={{ padding: "1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ marginBottom: "1rem" }}>
        <h1>ApplyTrackr</h1>
        <p>
          Logged in as <strong>{user?.name}</strong> ({user?.email})
        </p>
        <button onClick={handleLogout} style={{ padding: "0.3rem 0.8rem" }}>
          Logout
        </button>
      </header>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Add New Application</h2>

        <form onSubmit={handleCreateApplication} style={{ maxWidth: "400px" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Company *
            </label>
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
              required
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Position *
            </label>
            <input
              type="text"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
              required
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
            >
              <option value="applied">Applied</option>
              <option value="online_assessment">Online Assessment</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Notes
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
              rows={3}
            />
          </div>

          <button type="submit" style={{ padding: "0.4rem 0.9rem" }}>
            Add Application
          </button>
        </form>
      </section>
      <section>


        <h2>Your Applications</h2>

        {loadingApps && <p>Loading applications...</p>}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!loadingApps && applications.length === 0 && !error && (
          <p>No applications found.</p>
        )}

        <ul>
          {applications.map((app) => (
            <li key={app._id} style={{ marginBottom: "0.5rem" }}>
              <strong>{app.company}</strong> – {app.position} (
              {app.status})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
