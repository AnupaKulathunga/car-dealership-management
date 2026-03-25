import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCustomersApi } from "../../api/customers";
import { getVehiclesApi } from "../../api/vehicles";
import { createSaleApi } from "../../api/sales";
import { VehicleStatus } from "../../types";
import type { Customer, Vehicle } from "../../types";

// ---------- validation schema ----------

const saleSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  salePrice: z.coerce.number().min(1, "Sale price is required"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "FINANCE", "CHEQUE"], {
    required_error: "Payment method is required",
  }),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

// ---------- component ----------

export default function CreateSale() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch customers and available vehicles
  const { data: customersData } = useQuery({
    queryKey: ["customers", { limit: 1000 }],
    queryFn: () => getCustomersApi({ limit: 1000 }),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ["vehicles", { status: VehicleStatus.AVAILABLE, limit: 1000 }],
    queryFn: () =>
      getVehiclesApi({ status: VehicleStatus.AVAILABLE, limit: 1000 }),
  });

  const customers: Customer[] = customersData?.data ?? [];
  const vehicles: Vehicle[] = vehiclesData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: 0,
      vehicleId: 0,
      salePrice: 0,
      paymentMethod: "CASH",
      notes: "",
    },
  });

  // Pre-fill sale price from selected vehicle
  const selectedVehicleId = watch("vehicleId");
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === Number(selectedVehicleId));
      if (vehicle) {
        setValue("salePrice", vehicle.price);
      }
    }
  }, [selectedVehicleId, vehicles, setValue]);

  const createMutation = useMutation({
    mutationFn: createSaleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      navigate("/sales");
    },
  });

  const isSubmitting = createMutation.isPending;

  const onSubmit = (data: SaleFormData) => {
    createMutation.mutate(data);
  };

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
          to="/sales"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Create New Sale</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details to create a new sale record.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {createMutation.isError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Customer */}
            <div>
              <label htmlFor="customerId" className={labelClassName}>
                Customer
              </label>
              <select
                id="customerId"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("customerId")}
              >
                <option value={0}>Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} - {c.phone}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className={errorClassName}>{errors.customerId.message}</p>
              )}
            </div>

            {/* Vehicle */}
            <div>
              <label htmlFor="vehicleId" className={labelClassName}>
                Vehicle (Available Only)
              </label>
              <select
                id="vehicleId"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("vehicleId")}
              >
                <option value={0}>Select a vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.year}) - Rs{" "}
                    {Number(v.price).toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className={errorClassName}>{errors.vehicleId.message}</p>
              )}
            </div>

            {/* Sale Price */}
            <div>
              <label htmlFor="salePrice" className={labelClassName}>
                Sale Price (Rs)
              </label>
              <input
                id="salePrice"
                type="number"
                placeholder="e.g. 5000000"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("salePrice")}
              />
              {errors.salePrice && (
                <p className={errorClassName}>{errors.salePrice.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className={labelClassName}>
                Payment Method
              </label>
              <select
                id="paymentMethod"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("paymentMethod")}
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="FINANCE">Finance</option>
                <option value="CHEQUE">Cheque</option>
              </select>
              {errors.paymentMethod && (
                <p className={errorClassName}>{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label htmlFor="notes" className={labelClassName}>
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Optional notes about this sale..."
                disabled={isSubmitting}
                className={inputClassName}
                {...register("notes")}
              />
              {errors.notes && (
                <p className={errorClassName}>{errors.notes.message}</p>
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
              Create Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
