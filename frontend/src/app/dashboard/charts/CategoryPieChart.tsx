"use client";

import { memo, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import Card from "@/app/dashboard/components/ui/Card";
import { useCategoryPerformance } from "@/hooks/useCategoryPerformance";
import { formatCurrency } from "@/lib/format";

const COLORS = [
  "#FBCEB1",
  "#F88379",
  "#FA8072",
  "#fdba74",
  "#FFF5EE",
];

function renderCustomizedLabel(props: any) {
  const {
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
    fill,
  } = props;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const textAnchor = x > cx ? "start" : "end";

  return (
    <>
      {/* Connector Line */}
      <line
        x1={cx + outerRadius * Math.cos(-midAngle * RADIAN)}
        y1={cy + outerRadius * Math.sin(-midAngle * RADIAN)}
        x2={x}
        y2={y}
        stroke="#94a3b8"
        strokeWidth={1}
      />

      {/* Label */}
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-xs fill-slate-700 font-medium"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    </>
  );
}

function CategoryPieChart() {
  const { data = [], isLoading, isError } =
    useCategoryPerformance();

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.category,
        value: item.totalRevenue,
      })),
    [data]
  );

  const totalRevenue = useMemo(
    () =>
      chartData.reduce(
        (sum, item) => sum + item.value,
        0
      ),
    [chartData]
  );

  if (isLoading) {
    return (
    <Card className="h-[420px] animate-pulse">
    <div />
  </Card>
)
  }

  if (isError || chartData.length === 0) {
    return (
      <Card className="h-[420px] flex items-center justify-center text-sm text-slate-500">
        No data available
      </Card>
    );
  }

  return (
    <Card className="h-[420px] p-6 shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Revenue by Category
        </h3>
      </div>

      <div className="relative h-[300px]">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={3}
              labelLine={false}
              label={renderCustomizedLabel}
              stroke="#fff"
              strokeWidth={2}
              
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={index}
                  fill={
                    COLORS[index % COLORS.length]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-xs text-slate-500">
            Total Revenue
          </div>
          <div className="text-xl font-semibold text-slate-900">
            {formatCurrency(totalRevenue)}
          </div>
        </div>

      </div>
    </Card>
  );
}

export default memo(CategoryPieChart);