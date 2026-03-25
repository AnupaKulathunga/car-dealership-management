import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2, Car } from "lucide-react";
import { cn } from "../../lib/utils";
import { getVehicleByIdApi, deleteVehicleApi } from "../../api/vehicles";
import { useAuth } from "../../context/AuthContext";
import type { Vehicle, VehicleStatus } from "../../types";

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

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: vehicle,
    isLoading,
    isError,
  } = useQuery<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicleByIdApi(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      navigate("/vehicles");
    },
  });

  const handleDelete = () => {
    if (!vehicle) return;
    if (
      window.confirm(
        `Are you sure you want to delete "${vehicle.make} ${vehicle.model}"?`
      )
    ) {
      deleteMutation.mutate(vehicle.id);
    }
  };

  // ---------- loading ----------

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="h-72 w-full animate-pulse rounded-lg bg-gray-200 lg:w-1/2" />
          <div className="flex-1 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- 404 ----------

  if (isError || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Car className="mb-4 h-16 w-16" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Vehicle Not Found
        </h2>
        <p className="mb-6 text-sm">
          The vehicle you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vehicles
        </Link>
      </div>
    );
  }

  // ---------- detail ----------

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Make", value: vehicle.make },
    { label: "Brand", value: vehicle.brand },
    { label: "Model", value: vehicle.model },
    { label: "Year", value: vehicle.year },
    { label: "VIN", value: <span className="font-mono">{vehicle.vin}</span> },
    { label: "Colour", value: vehicle.colour },
    {
      label: "Mileage",
      value: `${vehicle.mileage.toLocaleString()} km`,
    },
    { label: "Fuel Type", value: vehicle.fuelType },
    { label: "Transmission", value: vehicle.transmission },
    {
      label: "Price",
      value: (
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(vehicle.price)}
        </span>
      ),
    },
    {
      label: "Status",
      value: (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusClasses[vehicle.status]
          )}
        >
          {vehicle.status}
        </span>
      ),
    },
    {
      label: "Added",
      value: new Date(vehicle.createdAt).toLocaleDateString(),
    },
    {
      label: "Last Updated",
      value: new Date(vehicle.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vehicles
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/vehicles/${vehicle.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          {user?.role === "ADMIN" && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 lg:flex-row">
          {/* Image placeholder */}
          <div className="flex h-72 w-full items-center justify-center rounded-lg bg-gray-100 lg:w-1/2">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <Car className="h-20 w-20 text-gray-300" />
            )}
          </div>

          {/* Vehicle info grid */}
          <div className="flex-1">
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              {vehicle.make} {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mb-6 text-sm text-gray-500">{vehicle.year}</p>

            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{f.value}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <div className="border-t border-gray-200 px-6 py-5">
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {vehicle.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
