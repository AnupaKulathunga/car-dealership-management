import { api } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "../types";

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post("/auth/login", data);
  // Backend returns { success, data: { accessToken, refreshToken, user } }
  return res.data.data;
}

export async function registerApi(data: RegisterRequest): Promise<User> {
  const res = await api.post("/auth/register", data);
  return res.data.data;
}

export async function refreshTokenApi(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await api.post("/auth/refresh", { refreshToken });
  return res.data.data;
}

export async function getMeApi(): Promise<User> {
  const res = await api.get("/auth/me");
  return res.data.data;
}
