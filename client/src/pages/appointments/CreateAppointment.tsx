import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCustomersApi } from "../../api/customers";
import { getVehiclesApi } from "../../api/vehicles";
import { createAppointmentApi } from "../../api/appointments";
import type { Customer, Vehicle } from "../../types";

// ---------- validation schema ----------

const appointmentSchema = z.object({
  type: z.enum(["TEST_DRIVE", "CONSULTATION"], {
    required_error: "Type is required",
  }),
  customerId: z.coerce.number().min(1, "Customer is required"),
  vehicleId: z.coerce.number().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

// ---------- component ----------

export default function CreateAppointment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customersData } = useQuery({
    queryKey: ["customers", { limit: 1000 }],
    queryFn: () => getCustomersApi({ limit: 1000 }),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ["vehicles", { limit: 1000 }],
    queryFn: () => getVehiclesApi({ limit: 1000 }),
  });

  const customers: Customer[] = customersData?.data ?? [];
  const vehicles: Vehicle[] = vehiclesData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "TEST_DRIVE",
      customerId: 0,
      vehicleId: undefined,
      dateTime: "",
      notes: "",
    },
  });

  const selectedType = watch("type");

  const createMutation = useMutation({
    mutationFn: (data: AppointmentFormData) => {
      const payload: Record<string, unknown> = {
        type: data.type,
        customerId: data.customerId,
        dateTime: new Date(data.dateTime).toISOString(),
        notes: data.notes,
      };
      if (data.vehicleId && data.vehicleId > 0) {
        payload.vehicleId = data.vehicleId;
      }
      return createAppointmentApi(payload as Parameters<typeof createAppointmentApi>[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      navigate("/appointments");
    },
  });

  const isSubmitting = createMutation.isPending;

  const onSubmit = (data: AppointmentFormData) => {
    createMutation.mutate(data);
  };

  const selectClassName =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50";
  const inputClassName =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50";
  const labelClassName = "mb-1 block text-sm font-medium text-gray-700";
  const errorClassName = "mt-1 text-xs text-red-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/appointments"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Schedule Appointment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details to schedule a new appointment.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {createMutation.isError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Type */}
            <div>
              <label htmlFor="type" className={labelClassName}>
                Appointment Type
              </label>
              <select
                id="type"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("type")}
              >
                <option value="TEST_DRIVE">Test Drive</option>
                <option value="CONSULTATION">Consultation</option>
              </select>
              {errors.type && (
                <p className={errorClassName}>{errors.type.message}</p>
              )}
            </div>

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

            {/* Vehicle (optional for consultation) */}
            <div>
              <label htmlFor="vehicleId" className={labelClassName}>
                Vehicle{selectedType === "CONSULTATION" ? " (Optional)" : ""}
              </label>
              <select
                id="vehicleId"
                disabled={isSubmitting}
                className={selectClassName}
                {...register("vehicleId")}
              >
                <option value={0}>
                  {selectedType === "CONSULTATION"
                    ? "None"
                    : "Select a vehicle..."}
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.year})
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className={errorClassName}>{errors.vehicleId.message}</p>
              )}
            </div>

            {/* Date & Time */}
            <div>
              <label htmlFor="dateTime" className={labelClassName}>
                Date & Time
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("dateTime")}
              />
              {errors.dateTime && (
                <p className={errorClassName}>{errors.dateTime.message}</p>
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
                placeholder="Optional notes..."
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
              Schedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
