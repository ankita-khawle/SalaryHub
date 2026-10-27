
import { apiClient } from "./client";

export interface AuthUser {
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials) {
  const response = await apiClient.post<AuthUser>(
    "/auth/login",
    credentials,
  );
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}
