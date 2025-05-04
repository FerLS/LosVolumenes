"use client";

import * as React from "react";
import { HardDrive, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

// Define colors for the chart
const COLORS = {
  used: "hsl(var(--primary))",
  available: "hsl(var(--muted))",
};

export default function PieGB() {
  const [storageData, setStorageData] = React.useState({
    totalSize: 0,
    maxSize: 30, // Default to 30GB if env var not available
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    // Get max storage size from environment variable
    const maxStorageGB = process.env.NEXT_PUBLIC_MAX_SIZE
      ? Number.parseInt(process.env.NEXT_PUBLIC_MAX_SIZE)
      : 30;

    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/files?stats=true");

        if (!response.ok) {
          throw new Error(`Error fetching statistics: ${response.status}`);
        }

        const data = await response.json();

        // Convert total size from bytes to GB
        const totalSizeGB = data.totalSize / (1024 * 1024 * 1024);

        setStorageData({
          totalSize: totalSizeGB,
          maxSize: maxStorageGB,
        });
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching storage stats:", error);
        setError(error.message);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate storage usage percentage
  const usagePercentage = React.useMemo(() => {
    return Math.min(
      Math.round((storageData.totalSize / storageData.maxSize) * 100),
      100
    );
  }, [storageData]);

  // Prepare data for pie chart
  const chartData = React.useMemo(() => {
    return [
      { name: "Usado", value: storageData.totalSize, fill: COLORS.used },
      {
        name: "Disponible",
        value: Math.max(0, storageData.maxSize - storageData.totalSize),
        fill: COLORS.available,
      },
    ];
  }, [storageData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Almacenamiento</CardTitle>
        <CardDescription>Espacio utilizado vs. disponible</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[250px] text-center">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-destructive">
                Error al cargar datos de almacenamiento
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4 text-sm pt-4">
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : error ? (
          <p className="text-destructive">Error: {error}</p>
        ) : (
          <>
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Usado</span>
                <span className="font-medium">
                  {storageData.totalSize.toFixed(2)} GB de {storageData.maxSize}{" "}
                  GB
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            <div className="flex items-center gap-2 font-medium leading-none">
              <HardDrive size={16} className="text-primary" />
              <span>
                {usagePercentage < 50
                  ? "Tienes bastante espacio disponible"
                  : usagePercentage < 80
                  ? "Espacio utilizado moderadamente"
                  : "¡Estás cerca del límite!"}
              </span>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
