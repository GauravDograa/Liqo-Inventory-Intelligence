"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { DeadstockItem } from "@/types/deadstock.types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  data: DeadstockItem[];
}

export default function DeadstockAgingDonut({ data }: Props) {
  const buckets = {
    "0-60": 0,
    "60-90": 0,
    "90-120": 0,
    "120+": 0,
  };

  data.forEach((item) => {
    if (item.stockAgeDays <= 60) buckets["0-60"]++;
    else if (item.stockAgeDays <= 90) buckets["60-90"]++;
    else if (item.stockAgeDays <= 120) buckets["90-120"]++;
    else buckets["120+"]++;
  });

  const chartData = [
    { name: "0-60 Days", value: buckets["0-60"] },
    { name: "60-90 Days", value: buckets["60-90"] },
    { name: "90-120 Days", value: buckets["90-120"] },
    { name: "120+ Days", value: buckets["120+"] },
  ];

  const total = data.length;
  const criticalPercent = Math.round(
    ((buckets["120+"] + buckets["90-120"]) / (total || 1)) * 100
  );
  const colors = ["#22c55e", "#facc15", "#fb923c", "#f97316"];

  return (
    <SurfaceCard
      title="Aging Distribution"
      subtitle="See how inventory is spreading across aging buckets and how much of the portfolio is already in the critical zone."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative flex items-center justify-center">
          <div className="h-[320px] w-full max-w-[340px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={4}
                  cornerRadius={8}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value ?? 0)} SKUs`, "Count"]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #fed7aa",
                    boxShadow: "0 18px 45px -24px rgba(15,23,42,0.35)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute text-center">
            <div className="text-5xl font-bold tracking-tight text-orange-500">
              {criticalPercent}%
            </div>
            <p className="mt-1 text-sm text-slate-500">Critical Aging</p>
          </div>
        </div>

        <div className="space-y-3">
          {chartData.map((item, index) => (
            <LegendDot
              key={item.name}
              color={colors[index]}
              label={item.name}
              value={item.value}
              total={total}
            />
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

function LegendDot({
  color,
  label,
  value,
  total,
}: {
  color: string;
  label: string;
  value: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">
          {Math.round((value / (total || 1)) * 100)}%
        </div>
      </div>
    </div>
  );
}
