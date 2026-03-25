import { api } from "./client";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentQuery,
  PaginationMeta,
} from "../types";

export async function getAppointmentsApi(
  query: AppointmentQuery = {},
): Promise<{ data: Appointment[]; meta: PaginationMeta }> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== ""),
  );
  const res = await api.get("/appointments", { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function getAppointmentByIdApi(id: number): Promise<Appointment> {
  const res = await api.get(`/appointments/${id}`);
  return res.data.data;
}

export async function createAppointmentApi(
  data: Partial<Appointment>,
): Promise<Appointment> {
  const res = await api.post("/appointments", data);
  return res.data.data;
}

export async function updateAppointmentStatusApi(
  id: number,
  status: AppointmentStatus,
): Promise<Appointment> {
  const res = await api.put(`/appointments/${id}/status`, { status });
  return res.data.data;
}
