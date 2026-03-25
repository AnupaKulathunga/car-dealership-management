import { api } from "./client";
import type { Customer, CustomerQuery, PaginationMeta } from "../types";

export async function getCustomersApi(
  query: CustomerQuery = {},
): Promise<{ data: Customer[]; meta: PaginationMeta }> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== ""),
  );
  const res = await api.get("/customers", { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function getCustomerByIdApi(id: number): Promise<Customer> {
  const res = await api.get(`/customers/${id}`);
  return res.data.data;
}

export async function createCustomerApi(
  data: Partial<Customer>,
): Promise<Customer> {
  const res = await api.post("/customers", data);
  return res.data.data;
}

export async function updateCustomerApi(
  id: number,
  data: Partial<Customer>,
): Promise<Customer> {
  const res = await api.put(`/customers/${id}`, data);
  return res.data.data;
}

export async function deleteCustomerApi(id: number): Promise<void> {
  await api.delete(`/customers/${id}`);
}
