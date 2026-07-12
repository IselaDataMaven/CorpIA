import { apiClient } from "./client";

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function listDocuments() {
  const { data } = await apiClient.get("/api/documents");
  return data;
}

export async function deleteDocument(documentId) {
  const { data } = await apiClient.delete(`/api/documents/${documentId}`);
  return data;
}

export async function reindexDocument(documentId) {
  const { data } = await apiClient.post(`/api/documents/${documentId}/reindex`);
  return data;
}

export async function previewDocument(documentId) {
  const { data } = await apiClient.get(`/api/documents/${documentId}/preview`);
  return data;
}
