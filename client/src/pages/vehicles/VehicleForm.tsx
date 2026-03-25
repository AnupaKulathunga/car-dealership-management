import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getVehicleByIdApi,
  createVehicleApi,
  updateVehicleApi,
} from "../../api/vehicles";
import type { Vehicle } from "../../types";

// ---------- validation schema ----------

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  vin: z.string().min(1, "VIN is required"),
  colour: z.string().min(1, "Colour is required"),
  mileage: z.coerce.number().int().min(0, "Mileage must be 0 or more"),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"], {
    required_error: "Fuel type is required",
  }),
  transmission: z.enum(["Manual", "Automatic"], {
    required_error: "Transmission is required",
  }),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  status: z.enum(["Available", "Reserved", "Sold"], {
    required_error: "Status is required",
  }),
  description: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

// ---------- component ----------

export default function VehicleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Fetch existing vehicle for edit mode
  const { data: existingVehicle, isLoading: isFetching } = useQuery<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicleByIdApi(Number(id)),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      colour: "",
      mileage: 0,
      fuelType: "Petrol",
      transmission: "Manual",
      price: 0,
      status: "Available",
      description: "",
    },
  });

  // Prefill form when vehicle data arrives
  useEffect(() => {
    if (existingVehicle) {
      reset({
        make: existingVehicle.make,
        brand: existingVehicle.brand,
        model: existingVehicle.model,
        year: existingVehicle.year,
        vin: existingVehicle.vin,
        colour: existingVehicle.colour,
        mileage: existingVehicle.mileage,
        fuelType: existingVehicle.fuelType,
        transmission: existingVehicle.transmission,
        price: existingVehicle.price,
        status: existingVehicle.status,
        description: existingVehicle.description ?? "",
      });
    }
  }, [existingVehicle, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createVehicleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      navigate("/vehicles");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: VehicleFormData) =>
      updateVehicleApi(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      navigate("/vehicles");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: VehicleFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // ---------- loading (edit mode) ----------

  if (isEdit && isFetching) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------- render ----------

  const inputClassName =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50";
  const selectClassName =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50";
  const labelClassName = "mb-1 block text-sm font-medium text-gray-700";
  const errorClassName = "mt-1 text-xs text-red-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vehicles
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update the vehicle information below."
              : "Fill in the details to add a new vehicle to the inventory."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Error banner */}
          {(createMutation.isError || updateMutation.isError) && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Make */}
            <div>
              <label htmlFor="make" className={labelClassName}>
                Make
              </label>
              <input
                id="make"
                type="text"
                placeholder="e.g. Toyota"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("make")}
              />
              {errors.make && (
                <p className={errorClassName}>{errors.make.message}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className={labelClassName}>
                Brand
              </label>
              <input
                id="brand"
                type="text"
                placeholder="e.g. Toyota"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("brand")}
              />
              {errors.brand && (
                <p className={errorClassName}>{errors.brand.message}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className={labelClassName}>
                Model
              </label>
              <input
                id="model"
                type="text"
                placeholder="e.g. Camry"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("model")}
              />
              {errors.model && (
                <p className={errorClassName}>{errors.model.message}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className={labelClassName}>
                Year
              </label>
              <input
                id="year"
                type="number"
                placeholder="e.g. 2024"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("year")}
              />
              {errors.year && (
                <p className={errorClassName}>{errors.year.message}</p>
              )}
            </div>

            {/* VIN */}
            <div>
              <label htmlFor="vin" className={labelClassName}>
                VIN
              </label>
              <input
                id="vin"
                type="text"
                placeholder="Vehicle Identification Number"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("vin")}
              />
              {errors.vin && (
                <p className={errorClassName}>{errors.vin.message}</p>
              )}
            </div>

            {/* Colour */}
            <div>
              <label htmlFor="colour" className={labelClassName}>
                Colour
              </label>
              <input
                id="colour"
                type="text"
                placeholder="e.g. White"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("colour")}
              />
              {errors.colour && (
                <p className={errorClassName}>{errors.colour.message}</p>
              )}
            </div>

            {/* Mileage */}
            <div>
              <label htmlFor="mileage" className={labelClassName}>
                Mileage (km)
              </label>
              <input
                id="mileage"
                type="number"
                placeholder="e.g. 15000"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("mileage")}
              />
              {errors.mileage && (
                <p className={errorClassName}>{errors.mileage.message}</p>
              )}
            </div>

            {/* Fuel Type */}
            <div>
              <label htmlFor="fuelType" className={labelClassName}>
                Fuel Type
              </label>
              <select
                id="fuelType"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("fuelType")}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
              {errors.fuelType && (
                <p className={errorClassName}>{errors.fuelType.message}</p>
              )}
            </div>

            {/* Transmission */}
            <div>
              <label htmlFor="transmission" className={labelClassName}>
                Transmission
              </label>
              <select
                id="transmission"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("transmission")}
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
              {errors.transmission && (
                <p className={errorClassName}>
                  {errors.transmission.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className={labelClassName}>
                Price (Rs)
              </label>
              <input
                id="price"
                type="number"
                placeholder="e.g. 5000000"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("price")}
              />
              {errors.price && (
                <p className={errorClassName}>{errors.price.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className={labelClassName}>
                Status
              </label>
              <select
                id="status"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("status")}
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
              {errors.status && (
                <p className={errorClassName}>{errors.status.message}</p>
              )}
            </div>

            {/* Description - full width */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Optional vehicle description..."
                disabled={isSubmitting}
                className={inputClassName}
                {...register("description")}
              />
              {errors.description && (
                <p className={errorClassName}>{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Update Vehicle" : "Create Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
