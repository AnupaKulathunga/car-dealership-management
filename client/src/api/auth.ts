import { api } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "../types";

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function registerApi(data: RegisterRequest): Promise<User> {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
}

export async function refreshTokenApi(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await api.post<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    { refreshToken },
  );
  return res.data;
}

export async function getMeApi(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}
