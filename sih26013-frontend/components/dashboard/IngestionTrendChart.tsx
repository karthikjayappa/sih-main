"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function IngestionTrendChart({ data }: { data: { date: string; records: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="ingestFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2C4A63" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#2C4A63" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCD6C7" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#4A5262" }} axisLine={{ stroke: "#DCD6C7" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#4A5262" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 3, borderColor: "#DCD6C7", fontSize: 12.5 }} />
        <Area type="monotone" dataKey="records" stroke="#2C4A63" strokeWidth={2} fill="url(#ingestFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
