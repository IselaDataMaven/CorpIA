import { apiClient } from "./client";

function normalizeUser(apiUser) {
  return {
    id: apiUser.id,
    username: apiUser.username,
    fullName: apiUser.full_name,
    roleKey: apiUser.role_key,
    department: apiUser.department,
    avatarColor: apiUser.avatar_color,
  };
}

export async function loginRequest({ username, password, rememberMe }) {
  const { data } = await apiClient.post("/api/auth/login", {
    username,
    password,
    remember_me: rememberMe,
  });
  return { access_token: data.access_token, user: normalizeUser(data.user) };
}

export async function logoutRequest() {
  try {
    await apiClient.post("/api/auth/logout");
  } catch {
    // El token puede haber expirado ya; el logout local siempre procede.
  }
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/api/auth/me");
  return normalizeUser(data);
}
