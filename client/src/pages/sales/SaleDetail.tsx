import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, FileText } from "lucide-react";
import { cn } from "../../lib/utils";
import { getSaleByIdApi, updateSaleStatusApi } from "../../api/sales";
import type { Sale, SaleStatus } from "../../types";

function formatPrice(price: number): string {
  return `Rs ${Number(price).toLocaleString()}`;
}

const saleStatusClasses: Record<SaleStatus, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  NEGOTIATION: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusSteps: SaleStatus[] = ["PENDING", "NEGOTIATION", "COMPLETED"];

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: sale,
    isLoading,
    isError,
  } = useQuery<Sale>({
    queryKey: ["sales", id],
    queryFn: () => getSaleByIdApi(Number(id)),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: SaleStatus) =>
      updateSaleStatusApi(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", id] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <DollarSign className="mb-4 h-16 w-16" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Sale Not Found
        </h2>
        <p className="mb-6 text-sm">
          The sale you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/sales"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales
        </Link>
      </div>
    );
  }

  const isCancelled = sale.status === "CANCELLED";
  const currentStepIdx = statusSteps.indexOf(sale.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/sales"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales
        </Link>
      </div>

      {/* Status Progression */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
          Status
        </h2>
        {isCancelled ? (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            CANCELLED
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {statusSteps.map((step, idx) => {
              const isActive = idx <= currentStepIdx;
              return (
                <div key={step} className="flex items-center gap-2">
                  {idx > 0 && (
                    <div
                      className={cn(
                        "h-0.5 w-8",
                        isActive ? "bg-blue-500" : "bg-gray-200",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      isActive
                        ? saleStatusClasses[step]
                        : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className={cn("grid gap-6 md:grid-cols-2", isCancelled && "opacity-60")}>
        {/* Vehicle Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
            Vehicle
          </h2>
          {sale.vehicle ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {sale.vehicle.make} {sale.vehicle.brand} {sale.vehicle.model}
              </p>
              <p className="text-gray-600">Year: {sale.vehicle.year}</p>
              <p className="text-gray-600">VIN: {sale.vehicle.vin}</p>
              <p className="text-gray-600">
                Listed Price: {formatPrice(sale.vehicle.price)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Vehicle #{sale.vehicleId}</p>
          )}
        </div>

        {/* Customer Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
            Customer
          </h2>
          {sale.customer ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {sale.customer.firstName} {sale.customer.lastName}
              </p>
              <p className="text-gray-600">{sale.customer.email || "-"}</p>
              <p className="text-gray-600">{sale.customer.phone}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Customer #{sale.customerId}</p>
          )}
        </div>
      </div>

      {/* Sale Details */}
      <div className={cn("rounded-lg border border-gray-200 bg-white p-6 shadow-sm", isCancelled && "opacity-60")}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
          Sale Details
        </h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Sale Price
            </dt>
            <dd className="mt-1 text-lg font-bold text-gray-900">
              {formatPrice(sale.salePrice)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Payment Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {sale.paymentMethod.replace("_", " ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Sale Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(sale.saleDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Agent
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {sale.agent
                ? `${sale.agent.firstName} ${sale.agent.lastName}`
                : `Agent #${sale.agentId}`}
            </dd>
          </div>
          {sale.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Notes
              </dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {sale.notes}
              </dd>
            </div>
          )}
        </div>
      </div>

      {/* Invoice (for completed sales) */}
      {sale.status === "COMPLETED" && sale.invoice && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
              Invoice
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatPrice(sale.invoice.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Tax
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatPrice(sale.invoice.tax)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
              </dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">
                {formatPrice(sale.invoice.total)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Payment Status
              </dt>
              <dd className="mt-1 text-sm">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    sale.invoice.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : sale.invoice.paymentStatus === "PARTIAL"
                        ? "bg-amber-100 text-amber-800"
                        : sale.invoice.paymentStatus === "OVERDUE"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800",
                  )}
                >
                  {sale.invoice.paymentStatus}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Issued Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(sale.invoice.issuedDate).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isCancelled && sale.status !== "COMPLETED" && (
        <div className="flex items-center gap-3">
          {sale.status === "PENDING" && (
            <>
              <button
                onClick={() => statusMutation.mutate("NEGOTIATION")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                Move to Negotiation
              </button>
              <button
                onClick={() => statusMutation.mutate("CANCELLED")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          {sale.status === "NEGOTIATION" && (
            <>
              <button
                onClick={() => statusMutation.mutate("COMPLETED")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Complete Sale
              </button>
              <button
                onClick={() => statusMutation.mutate("CANCELLED")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
