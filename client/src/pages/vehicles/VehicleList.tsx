import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  LayoutList,
  Car,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { getVehiclesApi, deleteVehicleApi } from "../../api/vehicles";
import { useAuth } from "../../context/AuthContext";
import type {
  Vehicle,
  VehicleStatus,
  FuelType,
  Transmission,
  VehicleQuery,
  PaginationMeta,
} from "../../types";

// ---------- helpers ----------

function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString()}`;
}

const statusClasses: Record<VehicleStatus, string> = {
  Available: "bg-green-100 text-green-800",
  Reserved: "bg-amber-100 text-amber-800",
  Sold: "bg-red-100 text-red-800",
};

// ---------- component ----------

export default function VehicleList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // view toggle
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // filters from URL
  const page = Number(searchParams.get("page") ?? "1");
  const searchTerm = searchParams.get("search") ?? "";
  const statusFilter = (searchParams.get("status") ?? "") as
    | VehicleStatus
    | "";
  const fuelFilter = (searchParams.get("fuelType") ?? "") as FuelType | "";
  const transFilter = (searchParams.get("transmission") ?? "") as
    | Transmission
    | "";

  // local search input (for debounce)
  const [searchInput, setSearchInput] = useState(searchTerm);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set("search", searchInput);
        else next.delete("search");
        next.set("page", "1");
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  // build query
  const query: VehicleQuery = {
    page,
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter && { status: statusFilter }),
    ...(fuelFilter && { fuelType: fuelFilter }),
    ...(transFilter && { transmission: transFilter }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", query],
    queryFn: () => getVehiclesApi(query),
  });

  const vehicles: Vehicle[] = data?.data ?? [];
  const pagination: PaginationMeta | undefined = data?.meta;

  // delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteVehicleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const handleDelete = useCallback(
    (vehicle: Vehicle) => {
      if (
        window.confirm(
          `Are you sure you want to delete "${vehicle.make} ${vehicle.model}"?`
        )
      ) {
        deleteMutation.mutate(vehicle.id);
      }
    },
    [deleteMutation]
  );

  // filter change helpers
  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      return next;
    });
  };

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  };

  // ---------- render ----------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <Link
          to="/vehicles/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setFilter("status", e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>

          <select
            value={fuelFilter}
            onChange={(e) => setFilter("fuelType", e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Fuel Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>

          <select
            value={transFilter}
            onChange={(e) => setFilter("transmission", e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Transmissions</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center rounded-md border border-gray-300 bg-white shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "table"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
              title="Table view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <SkeletonTable />
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-gray-500">
          <Car className="mb-3 h-10 w-10" />
          <p className="text-lg font-medium">No vehicles found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : viewMode === "table" ? (
        <TableView
          vehicles={vehicles}
          isAdmin={user?.role === "ADMIN"}
          onDelete={handleDelete}
        />
      ) : (
        <GridView
          vehicles={vehicles}
          isAdmin={user?.role === "ADMIN"}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Showing page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => setPage(pagination.currentPage - 1)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => setPage(pagination.currentPage + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- sub-components ----------

function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClasses[status]
      )}
    >
      {status}
    </span>
  );
}

interface ViewProps {
  vehicles: Vehicle[];
  isAdmin: boolean;
  onDelete: (vehicle: Vehicle) => void;
}

function TableView({ vehicles, isAdmin, onDelete }: ViewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Make / Brand / Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Year
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              VIN
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Fuel Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {vehicles.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {v.make} {v.brand} {v.model}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {v.year}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-600">
                {v.vin}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {v.fuelType}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {formatPrice(v.price)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <StatusBadge status={v.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/vehicles/${v.id}`}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/vehicles/${v.id}/edit`}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(v)}
                      className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GridView({ vehicles, isAdmin, onDelete }: ViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((v) => (
        <div
          key={v.id}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          {/* Image placeholder */}
          <div className="flex h-40 items-center justify-center bg-gray-100">
            <Car className="h-12 w-12 text-gray-300" />
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 leading-tight">
                {v.make} {v.brand} {v.model}
              </h3>
              <StatusBadge status={v.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-600">
              <span>Year: {v.year}</span>
              <span>{v.fuelType}</span>
              <span>{v.transmission}</span>
              <span>{v.mileage.toLocaleString()} km</span>
            </div>

            <p className="text-lg font-bold text-gray-900">
              {formatPrice(v.price)}
            </p>

            <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
              <Link
                to={`/vehicles/${v.id}`}
                className="flex-1 rounded-md bg-gray-100 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                View
              </Link>
              <Link
                to={`/vehicles/${v.id}/edit`}
                className="flex-1 rounded-md bg-blue-50 py-1.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Edit
              </Link>
              {isAdmin && (
                <button
                  onClick={() => onDelete(v)}
                  className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <div className="bg-gray-50 px-4 py-3">
        <div className="h-4 w-full rounded bg-gray-200" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-t border-gray-200 px-4 py-3"
        >
          <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
