"use client";

import * as React from "react";
import { BatteryMedium, TrendingUp } from "lucide-react";
import {
  Label,
  Legend,
  Pie,
  PieChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Sector,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useEffect } from "react";

const chartConfig = {
  GB: {
    label: "GB",
  },
  images: {
    label: "Images",
    color: "hsl(var(--chart-1))",
  },
  videos: {
    label: "Videos",
    color: "hsl(var(--chart-2))",
  },
  audios: {
    label: "Audios",
    color: "hsl(var(--chart-3))",
  },
  docs: {
    label: "docs",
    color: "hsl(var(--chart-4))",
  },
  empty: {
    label: "Empty",
    color: "hsl(#f0f0f0)",
  },
} satisfies ChartConfig;

export default function PieStats() {
  const [chartData, setChartData] = React.useState([
    { browser: "images", GB: 275, fill: "var(--color-images)" },
    { browser: "videos", GB: 200, fill: "var(--color-videos)" },
    { browser: "audios", GB: 287, fill: "var(--color-audios)" },
    { browser: "docs", GB: 173, fill: "var(--color-docs)" },
    { browser: "empty", GB: 190, fill: "var(--color-empty)" },
  ]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/files?stats=true");
        const data = await response.json();

        console.log("data", data);
        setChartData([
          {
            browser: "images",
            GB: data.typeStats.Image,
            fill: "var(--color-images)",
          },
          {
            browser: "videos",
            GB: data.typeStats.Video,
            fill: "var(--color-videos)",
          },
          {
            browser: "audios",
            GB: data.typeStats.Audio,
            fill: "var(--color-audios)",
          },
          {
            browser: "docs",
            GB: data.typeStats.Other,
            fill: "var(--color-docs)",
          },
          {
            browser: "empty",
            GB:
              !data.typeStats.Other &&
              !data.typeStats.Audio &&
              !data.typeStats.Video &&
              !data.typeStats.Image
                ? 100
                : 0,
            fill: "var(--color-empty)",
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchData();
  }, []);

  const totalGB = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.GB, 0);
  }, []);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Uso del Volumen</CardTitle>
        <CardDescription>
          Actulizado {new Date().toLocaleString("es-ES").split(",")[0]}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="GB"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
          Animo! a ver si lo llenas todo <BatteryMedium size={20} />
        </div>
        <div className="leading-none text-muted-foreground">
          Mucho {chartData.sort((a, b) => b.GB - a.GB)[0].browser} y poco{" "}
          {chartData.sort((a, b) => a.GB - b.GB)[1].browser}
        </div>
      </CardFooter>
    </Card>
  );
}
