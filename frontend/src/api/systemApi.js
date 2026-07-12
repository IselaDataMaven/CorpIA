import { apiClient } from "./client";

export async function fetchSystemInfo() {
  const { data } = await apiClient.get("/api/system/info");
  return data;
}
