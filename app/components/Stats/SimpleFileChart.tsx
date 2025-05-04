"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SimpleFileChart() {
  const [data, setData] = useState<
    Array<{ date: string; formattedDate: string; count: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/files?stats=true");

        if (!response.ok) {
          throw new Error("No se pudieron cargar las estadísticas");
        }

        const result = await response.json();

        // Transformar los datos para la gráfica
        const chartData = Object.entries(result.dateStats || {})
          .map(([date, stats]) => {
            const typedStats = stats as { count: number };
            return {
              date,
              formattedDate: format(parseISO(date), "d MMM", { locale: es }),
              count: typedStats.count,
            };
          })
          .sort(
            (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
          )
          // Tomar solo los últimos 30 días para que la gráfica sea más legible
          .slice(-30);

        setData(chartData);
      } catch (err: any) {
        console.error("Error al cargar los datos:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Archivos por Fecha</CardTitle>
            <CardDescription>
              Cantidad de archivos añadidos por día
            </CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[200px] bg-muted animate-pulse rounded-md" />
        ) : data.length === 0 ? (
          <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Bar
                  dataKey="count"
                  name="Archivos"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
