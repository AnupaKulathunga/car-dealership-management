import { useQuery } from "@tanstack/react-query";
import { Car, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { getVehiclesApi } from "../api/vehicles";
import { VehicleStatus } from "../types";
import { cn } from "../lib/utils";

interface StatCard {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  count: number;
}

export default function Dashboard() {
  // Fetch all vehicles (with a large limit) to derive counts
  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", "dashboard"],
    queryFn: () => getVehiclesApi({ limit: 1000 }),
  });

  const vehicles = data?.data ?? [];
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter(
    (v) => v.status === VehicleStatus.AVAILABLE,
  ).length;
  const reservedCount = vehicles.filter(
    (v) => v.status === VehicleStatus.RESERVED,
  ).length;
  const soldCount = vehicles.filter(
    (v) => v.status === VehicleStatus.SOLD,
  ).length;

  const stats: StatCard[] = [
    {
      label: "Total Vehicles",
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
      count: totalCount,
    },
    {
      label: "Available",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      count: availableCount,
    },
    {
      label: "Reserved",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      count: reservedCount,
    },
    {
      label: "Sold",
      icon: XCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      count: soldCount,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              {isLoading ? (
                <div className="flex w-full items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      stat.bgColor,
                    )}
                  >
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
