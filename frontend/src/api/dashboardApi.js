import { apiClient } from "./client";

export async function fetchDashboardMetrics() {
  const { data } = await apiClient.get("/api/dashboard");
  return data;
}

export async function fetchSettings() {
  const { data } = await apiClient.get("/api/settings");
  return data;
}

export async function updateSettings(payload) {
  const { data } = await apiClient.put("/api/settings", payload);
  return data;
}
