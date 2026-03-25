import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";
import { getCustomerByIdApi, deleteCustomerApi } from "../../api/customers";
import { getSalesApi } from "../../api/sales";
import { getAppointmentsApi } from "../../api/appointments";
import { useAuth } from "../../context/AuthContext";
import type { Customer, Sale, Appointment } from "../../types";

function formatPrice(price: number): string {
  return `Rs ${Number(price).toLocaleString()}`;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: () => getCustomerByIdApi(Number(id)),
    enabled: !!id,
  });

  const { data: salesData } = useQuery({
    queryKey: ["sales", { customerId: Number(id) }],
    queryFn: () => getSalesApi({ customerId: Number(id), limit: 100 }),
    enabled: !!id,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ["appointments", { customerId: Number(id) }],
    queryFn: () => getAppointmentsApi({ customerId: Number(id), limit: 100 }),
    enabled: !!id,
  });

  const sales: Sale[] = salesData?.data ?? [];
  const appointments: Appointment[] = appointmentsData?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
  });

  const handleDelete = () => {
    if (!customer) return;
    if (
      window.confirm(
        `Are you sure you want to delete "${customer.firstName} ${customer.lastName}"?`,
      )
    ) {
      deleteMutation.mutate(customer.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="flex-1 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Users className="mb-4 h-16 w-16" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Customer Not Found
        </h2>
        <p className="mb-6 text-sm">
          The customer you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>
    );
  }

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "First Name", value: customer.firstName },
    { label: "Last Name", value: customer.lastName },
    { label: "Email", value: customer.email || "-" },
    { label: "Phone", value: customer.phone },
    { label: "Address", value: customer.address || "-" },
    { label: "Notes", value: customer.notes || "-" },
    {
      label: "Created",
      value: new Date(customer.createdAt).toLocaleDateString(),
    },
    {
      label: "Last Updated",
      value: new Date(customer.updatedAt).toLocaleDateString(),
    },
  ];

  const saleStatusClasses: Record<string, string> = {
    PENDING: "bg-blue-100 text-blue-800",
    NEGOTIATION: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const apptStatusClasses: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/customers/${customer.id}/edit`}
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

      {/* Customer Info */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
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

      {/* Sales History */}
      {sales.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sale Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      <Link
                        to={`/sales/${s.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {s.vehicle
                          ? `${s.vehicle.make} ${s.vehicle.model}`
                          : `Vehicle #${s.vehicleId}`}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {formatPrice(s.salePrice)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${saleStatusClasses[s.status] ?? ""}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {new Date(s.saleDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointments */}
      {appointments.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date/Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {new Date(a.dateTime).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {a.type.replace("_", " ")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {a.vehicle
                        ? `${a.vehicle.make} ${a.vehicle.model}`
                        : a.vehicleId
                          ? `Vehicle #${a.vehicleId}`
                          : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${apptStatusClasses[a.status] ?? ""}`}
                      >
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
