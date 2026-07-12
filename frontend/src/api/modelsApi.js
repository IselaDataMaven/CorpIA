import { apiClient } from "./client";

export async function listModels() {
  const { data } = await apiClient.get("/api/models");
  return data;
}

export async function getModelCatalog() {
  const { data } = await apiClient.get("/api/models/catalog");
  return data;
}

export async function getActiveModel() {
  const { data } = await apiClient.get("/api/models/active");
  return data;
}

export async function activateModel(provider) {
  const { data } = await apiClient.post("/api/models/activate", { provider });
  return data;
}

export async function setApiKey(provider, apiKey) {
  const { data } = await apiClient.post("/api/models/api-key", {
    provider,
    api_key: apiKey,
  });
  return data;
}

export async function deleteApiKey(provider) {
  const { data } = await apiClient.delete(`/api/models/api-key/${provider}`);
  return data;
}

export async function setDefaultModel(provider, model) {
  const { data } = await apiClient.put("/api/models/default-model", { provider, model });
  return data;
}

export async function testConnection(provider) {
  const { data } = await apiClient.post("/api/models/test-connection", { provider });
  return data;
}
