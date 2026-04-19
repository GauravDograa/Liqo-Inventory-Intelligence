"use client";

import SurfaceCard from "@/components/analytics/SurfaceCard";
import { useInventory } from "@/hooks/useInventory";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function InventoryAgingChart() {
  const { data } = useInventory();
  if (!data || !Array.isArray(data)) return null;

  const buckets = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  };

  data.forEach((item) => {
    if (item.stockAgeDays <= 30) buckets["0-30"]++;
    else if (item.stockAgeDays <= 60) buckets["31-60"]++;
    else if (item.stockAgeDays <= 90) buckets["61-90"]++;
    else buckets["90+"]++;
  });

  const chartData = Object.entries(buckets).map(([name, value]) => ({ name, value }));
  const total = data.length;
  const criticalShare = Math.round(
    ((buckets["90+"] + buckets["61-90"]) / (total || 1)) * 100
  );
  const colors = ["#22c55e", "#facc15", "#f97316", "#ef4444"];

  return (
    <SurfaceCard
      title="Inventory Aging Distribution"
      subtitle="See how quickly inventory is moving from healthy age bands into the zones that need attention."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative flex items-center justify-center">
          <div className="h-[320px] w-full max-w-[340px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={88}
                  outerRadius={128}
                  paddingAngle={4}
                  cornerRadius={8}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} inventory rows`, "Count"]}
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
              {criticalShare}%
            </div>
            <p className="mt-1 text-sm text-slate-500">61+ Days</p>
          </div>
        </div>

        <div className="space-y-3">
          {chartData.map((item, index) => (
            <LegendRow
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

function LegendRow({
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
        <span className="text-sm font-medium text-slate-700">{label} days</span>
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
