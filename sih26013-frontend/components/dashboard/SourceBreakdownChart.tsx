"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { SOURCE_COLOR, SOURCE_LABEL } from "@/lib/utils";

export function SourceBreakdownChart({ data }: { data: { source: string; count: number }[] }) {
  const chartData = data.map((d) => ({ name: SOURCE_LABEL[d.source] || d.source, count: d.count, source: d.source }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCD6C7" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#4A5262" }} axisLine={{ stroke: "#DCD6C7" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#4A5262" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(44,74,99,0.06)" }}
          contentStyle={{ borderRadius: 3, borderColor: "#DCD6C7", fontSize: 12.5 }}
        />
        <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={56}>
          {chartData.map((entry) => (
            <Cell key={entry.source} fill={SOURCE_COLOR[entry.source] || "#2C4A63"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
