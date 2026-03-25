import { api } from "./client";
import type { Vehicle, VehicleQuery, PaginationMeta } from "../types";

export async function getVehiclesApi(
  query: VehicleQuery = {},
): Promise<{ data: Vehicle[]; meta: PaginationMeta }> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== ""),
  );
  const res = await api.get("/vehicles", { params });
  // Backend returns { success, data: Vehicle[], meta: { ... } }
  return { data: res.data.data, meta: res.data.meta };
}

export async function getVehicleByIdApi(id: number): Promise<Vehicle> {
  const res = await api.get(`/vehicles/${id}`);
  return res.data.data;
}

export async function createVehicleApi(
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  const res = await api.post("/vehicles", data);
  return res.data.data;
}

export async function updateVehicleApi(
  id: number,
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  const res = await api.put(`/vehicles/${id}`, data);
  return res.data.data;
}

export async function deleteVehicleApi(id: number): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}
