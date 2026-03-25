// ── Enums ──

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SALES_AGENT = "SALES_AGENT",
  INVENTORY_STAFF = "INVENTORY_STAFF",
}

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  MAINTENANCE = "MAINTENANCE",
}

export enum FuelType {
  PETROL = "PETROL",
  DIESEL = "DIESEL",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID",
}

export enum Transmission {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
  CVT = "CVT",
}

// ── Models ──

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: number;
  make: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  colour: string;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  price: number;
  status: VehicleStatus;
  images: string[];
  description?: string;
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// ── API helpers ──

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

// ── Auth ──

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

// ── Vehicle query ──

export interface VehicleQuery {
  page?: number;
  limit?: number;
  search?: string;
  make?: string;
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  status?: VehicleStatus;
  fuelType?: FuelType;
  transmission?: Transmission;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Customer ──

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Sale ──

export type SaleStatus = "PENDING" | "NEGOTIATION" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "FINANCE" | "CHEQUE";

export interface Sale {
  id: number;
  vehicleId: number;
  customerId: number;
  agentId: number;
  salePrice: number;
  saleDate: string;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  vehicle?: Vehicle;
  customer?: Customer;
  agent?: User;
  invoice?: Invoice;
  createdAt: string;
  updatedAt: string;
}

export interface SaleQuery {
  page?: number;
  limit?: number;
  status?: SaleStatus;
  customerId?: number;
  vehicleId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Invoice ──

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";

export interface Invoice {
  id: number;
  saleId: number;
  amount: number;
  tax: number;
  total: number;
  issuedDate: string;
  paymentStatus: PaymentStatus;
  sale?: Sale;
}

// ── Appointment ──

export type AppointmentType = "TEST_DRIVE" | "CONSULTATION";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: number;
  customerId: number;
  vehicleId?: number;
  agentId: number;
  type: AppointmentType;
  dateTime: string;
  status: AppointmentStatus;
  notes?: string;
  customer?: Customer;
  vehicle?: Vehicle;
  agent?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  customerId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
