"use client";

import { DeadstockItem } from "@/types/deadstock.types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

  const COLORS = ["#22c55e", "#facc15", "#fb923c", "#f97316"]; // green → yellow → orange → dark orange

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Aging Distribution
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          SKU distribution across aging buckets
        </p>
      </div>

      <div className="relative flex items-center justify-center">

        {/* Chart */}
        <div className="w-[320px] h-[320px]">
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
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center Text */}
        <div className="absolute text-center">
          <div className="text-5xl font-bold text-orange-500">
            {criticalPercent}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Critical Aging
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <LegendDot color="#22c55e" label="0-60 Days" />
        <LegendDot color="#facc15" label="60-90 Days" />
        <LegendDot color="#fb923c" label="90-120 Days" />
        <LegendDot color="#f97316" label="120+ Days" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}