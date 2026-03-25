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
