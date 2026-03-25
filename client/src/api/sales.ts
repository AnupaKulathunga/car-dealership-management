import { api } from "./client";
import type { Sale, SaleStatus, SaleQuery, PaginationMeta } from "../types";

export async function getSalesApi(
  query: SaleQuery = {},
): Promise<{ data: Sale[]; meta: PaginationMeta }> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== ""),
  );
  const res = await api.get("/sales", { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function getSaleByIdApi(id: number): Promise<Sale> {
  const res = await api.get(`/sales/${id}`);
  return res.data.data;
}

export async function createSaleApi(
  data: Partial<Sale>,
): Promise<Sale> {
  const res = await api.post("/sales", data);
  return res.data.data;
}

export async function updateSaleStatusApi(
  id: number,
  status: SaleStatus,
): Promise<Sale> {
  const res = await api.put(`/sales/${id}/status`, { status });
  return res.data.data;
}
