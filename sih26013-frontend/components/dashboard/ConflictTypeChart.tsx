"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CONFLICT_TYPE_LABEL } from "@/lib/utils";

const COLORS = ["#B5502D", "#A9812E", "#2C4A63", "#6B4C9A"];

export function ConflictTypeChart({ data }: { data: { type: string; count: number }[] }) {
  const chartData = data.map((d) => ({ name: CONFLICT_TYPE_LABEL[d.type] || d.type, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#F7F5EF" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 3, borderColor: "#DCD6C7", fontSize: 12.5 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#4A5262" }} iconType="square" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
