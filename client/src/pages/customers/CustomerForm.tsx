import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getCustomerByIdApi,
  createCustomerApi,
  updateCustomerApi,
} from "../../api/customers";
import type { Customer } from "../../types";

// ---------- validation schema ----------

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

// ---------- component ----------

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existingCustomer, isLoading: isFetching } = useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: () => getCustomerByIdApi(Number(id)),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (existingCustomer) {
      reset({
        firstName: existingCustomer.firstName,
        lastName: existingCustomer.lastName,
        email: existingCustomer.email ?? "",
        phone: existingCustomer.phone,
        address: existingCustomer.address ?? "",
        notes: existingCustomer.notes ?? "",
      });
    }
  }, [existingCustomer, reset]);

  const createMutation = useMutation({
    mutationFn: createCustomerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      updateCustomerApi(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CustomerFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isFetching) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const inputClassName =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50";
  const labelClassName = "mb-1 block text-sm font-medium text-gray-700";
  const errorClassName = "mt-1 text-xs text-red-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update the customer information below."
              : "Fill in the details to add a new customer."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {(createMutation.isError || updateMutation.isError) && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className={labelClassName}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="e.g. John"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className={errorClassName}>{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className={labelClassName}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="e.g. Doe"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className={errorClassName}>{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. john@example.com"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("email")}
              />
              {errors.email && (
                <p className={errorClassName}>{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClassName}>
                Phone
              </label>
              <input
                id="phone"
                type="text"
                placeholder="e.g. 0771234567"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("phone")}
              />
              {errors.phone && (
                <p className={errorClassName}>{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClassName}>
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="Customer address..."
                disabled={isSubmitting}
                className={inputClassName}
                {...register("address")}
              />
              {errors.address && (
                <p className={errorClassName}>{errors.address.message}</p>
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
              {isEdit ? "Update Customer" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
