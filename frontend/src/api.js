// src/api.js

import axios from "axios";

// Base URL for your backend API
// When backend runs on localhost:5000, we prefix all paths with this.
const API_BASE_URL = "http://localhost:5001/api";

// Create an axios instance so we can set common config later if needed
const api = axios.create({
  baseURL: API_BASE_URL,
});

// -------- AUTH -------- //

// Login: send email + password, expect user + token back
export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  // response.data should be: { user: {...}, token: "..." }
  return response.data;
}

// -------- APPLICATIONS -------- //

// Get all applications for the logged-in user
export async function getApplications(token) {
  const response = await api.get("/applications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // array of applications
}

// Create a new application for the logged-in user
export async function createApplication(token, appData) {
  const response = await api.post("/applications", appData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // the created application object
}