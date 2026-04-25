"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/app/dashboard/components/ui/Card";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import {
  RevenueRange,
  RevenueTrendPoint,
  useRevenueTrend,
} from "@/hooks/useRevenueTrend";

const ranges: Array<{ label: string; value: RevenueRange }> = [
  { label: "30D", value: "30d" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string, range: RevenueRange) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: range === "30d" ? "2-digit" : undefined,
    month: "short",
    ...(range === "6m" ? { year: "2-digit" as const } : {}),
  });
}

export default function RevenueLineChart() {
  const [range, setRange] = useState<RevenueRange>("30d");
  const overviewQuery = useDashboardOverview();
  const trendQuery = useRevenueTrend(range, range !== "30d");
  const data = useMemo(
    () =>
      range === "30d"
        ? overviewQuery.data?.revenueTrend ?? []
        : trendQuery.data ?? [],
    [overviewQuery.data?.revenueTrend, range, trendQuery.data]
  );
  const isLoading =
    range === "30d" ? overviewQuery.isLoading : trendQuery.isLoading;
  const error = range === "30d" ? overviewQuery.error : trendQuery.error;

  const chartData = useMemo(() => {
    const normalized = normalizeRevenueTrend(data ?? [], range);
    return bucketRevenueTrend(normalized, range);
  }, [data, range]);

  if (isLoading) {
    return <Card className="h-[320px] p-4 sm:h-[400px] sm:p-6 lg:p-8">Loading...</Card>;
  }

  if (error || !data.length) {
    return <Card className="h-[320px] p-4 sm:h-[400px] sm:p-6 lg:p-8">Failed to load</Card>;
  }

  return (
    <Card className="flex h-[320px] flex-col p-4 shadow-2xl sm:h-[400px] sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          Revenue Trend
        </h3>

        <div className="relative flex w-full rounded-full bg-slate-100 p-1 sm:w-auto">
          {ranges.map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`relative z-10 flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${
                range === item.value ? "text-white" : "text-slate-600"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div
            className={`absolute bottom-1 top-1 w-1/3 rounded-full bg-orange-500 transition-all duration-300 ${
              range === "30d" ? "left-1" : range === "3m" ? "left-1/3" : "left-2/3"
            }`}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />

          <XAxis
            dataKey="date"
            minTickGap={range === "30d" ? 18 : 28}
            tickFormatter={(value) => formatDate(value, range)}
            tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
            tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={72}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 500,
            }}
            formatter={(value: number | string | undefined) =>
              formatCurrency(Number(value ?? 0))
            }
            labelFormatter={(label) => formatDate(label, range)}
          />

          <Area
            type={range === "30d" ? "monotone" : "linear"}
            dataKey="revenue"
            stroke="#f97316"
            strokeWidth={3}
            fill="url(#colorRevenue)"
            dot={range === "30d" ? false : { r: 2.5, fill: "#f97316", strokeWidth: 0 }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

function normalizeRevenueTrend(data: RevenueTrendPoint[], range: RevenueRange) {
  if (data.length === 0) {
    return [];
  }

  const byDate = new Map(
    data.map((point) => [toDateKey(new Date(point.date)), point.revenue])
  );

  const latestDate = data.reduce((latest, point) => {
    const current = new Date(point.date);
    return current > latest ? current : latest;
  }, new Date(data[0].date));
  const end = new Date(latestDate);
  const start = new Date(latestDate);

  if (range === "30d") {
    start.setDate(end.getDate() - 29);
  } else if (range === "3m") {
    start.setMonth(end.getMonth() - 3);
    start.setDate(start.getDate() + 1);
  } else {
    start.setMonth(end.getMonth() - 6);
    start.setDate(start.getDate() + 1);
  }

  const points: RevenueTrendPoint[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = toDateKey(cursor);
    points.push({
      date: key,
      revenue: byDate.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

function bucketRevenueTrend(data: RevenueTrendPoint[], range: RevenueRange) {
  if (range === "30d") {
    return data;
  }

  const bucketMap = new Map<string, number>();

  for (const point of data) {
    const date = new Date(point.date);
    const bucketKey =
      range === "3m" ? getWeekBucketKey(date) : getMonthBucketKey(date);

    bucketMap.set(bucketKey, (bucketMap.get(bucketKey) ?? 0) + point.revenue);
  }

  return Array.from(bucketMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

function getWeekBucketKey(value: Date) {
  const start = new Date(value);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return toDateKey(start);
}

function getMonthBucketKey(value: Date) {
  return `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, "0")}-01`;
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
