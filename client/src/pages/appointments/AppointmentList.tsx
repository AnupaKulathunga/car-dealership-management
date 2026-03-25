import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  getAppointmentsApi,
  updateAppointmentStatusApi,
} from "../../api/appointments";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  AppointmentQuery,
  PaginationMeta,
} from "../../types";

const apptStatusClasses: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

const typeClasses: Record<AppointmentType, string> = {
  TEST_DRIVE: "bg-purple-100 text-purple-800",
  CONSULTATION: "bg-indigo-100 text-indigo-800",
};

export default function AppointmentList() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const statusFilter = (searchParams.get("status") ?? "") as
    | AppointmentStatus
    | "";
  const typeFilter = (searchParams.get("type") ?? "") as AppointmentType | "";

  const query: AppointmentQuery = {
    page,
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { type: typeFilter }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", query],
    queryFn: () => getAppointmentsApi(query),
  });

  const appointments: Appointment[] = data?.data ?? [];
  const pagination: PaginationMeta | undefined = data?.meta;

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: AppointmentStatus;
    }) => updateAppointmentStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <Link
          to="/appointments/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Schedule
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setFilter("status", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setFilter("type", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="TEST_DRIVE">Test Drive</option>
          <option value="CONSULTATION">Consultation</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <SkeletonTable />
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-gray-500">
          <Calendar className="mb-3 h-10 w-10" />
          <p className="text-lg font-medium">No appointments found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Agent
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
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {new Date(a.dateTime).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        typeClasses[a.type],
                      )}
                    >
                      {a.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.customer
                      ? `${a.customer.firstName} ${a.customer.lastName}`
                      : `Customer #${a.customerId}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.vehicle
                      ? `${a.vehicle.make} ${a.vehicle.model}`
                      : a.vehicleId
                        ? `Vehicle #${a.vehicleId}`
                        : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.agent
                      ? `${a.agent.firstName} ${a.agent.lastName}`
                      : `Agent #${a.agentId}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        apptStatusClasses[a.status],
                      )}
                    >
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {a.status === "SCHEDULED" && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            statusMutation.mutate({
                              id: a.id,
                              status: "COMPLETED",
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="rounded p-1.5 text-green-500 hover:bg-green-50 hover:text-green-700 transition-colors"
                          title="Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            statusMutation.mutate({
                              id: a.id,
                              status: "CANCELLED",
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            statusMutation.mutate({
                              id: a.id,
                              status: "NO_SHOW",
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="No Show"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
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
          <div className="h-4 w-1/6 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
