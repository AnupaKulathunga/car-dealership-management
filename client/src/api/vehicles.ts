import { api } from "./client";
import type { Vehicle, VehicleQuery, PaginationMeta } from "../types";

export async function getVehiclesApi(
  query: VehicleQuery = {},
): Promise<{ data: Vehicle[]; meta: PaginationMeta }> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== ""),
  );
  const res = await api.get<{ data: Vehicle[]; meta: PaginationMeta }>(
    "/vehicles",
    { params },
  );
  return res.data;
}

export async function getVehicleByIdApi(id: number): Promise<Vehicle> {
  const res = await api.get<Vehicle>(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicleApi(
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  const res = await api.post<Vehicle>("/vehicles", data);
  return res.data;
}

export async function updateVehicleApi(
  id: number,
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  const res = await api.put<Vehicle>(`/vehicles/${id}`, data);
  return res.data;
}

export async function deleteVehicleApi(id: number): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}
