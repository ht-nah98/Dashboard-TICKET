"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type WeekRow = { week: string; created: number; completed: number; failed: number };

function shortWeek(w: string) {
  const d = new Date(w);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

export function SeoWeeklyTrend({ data }: { data: WeekRow[] }) {
  const display = data.slice(-8);
  const totalCreated = data.reduce((s, d) => s + d.created, 0);
  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const totalFailed = data.reduce((s, d) => s + d.failed, 0);
  const successRate = totalCompleted + totalFailed > 0
    ? Math.round((totalCompleted / (totalCompleted + totalFailed)) * 100)
    : 0;

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Xu hướng ticket theo tuần</div>
        <div className="text-[12px] text-gmuted">Tạo mới · Hoàn thành · Thất bại · 8 tuần gần nhất</div>
      </div>
      <div className="flex gap-4 mb-3 shrink-0">
        <div className="text-center">
          <div className="text-[18px] font-medium tabular-nums">{totalCreated}</div>
          <div className="text-[10px] text-gmuted">Tạo mới</div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-medium text-ggreen tabular-nums">{totalCompleted}</div>
          <div className="text-[10px] text-gmuted">Hoàn thành</div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-medium text-gred tabular-nums">{totalFailed}</div>
          <div className="text-[10px] text-gmuted">Thất bại</div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-medium text-gblue tabular-nums">{successRate}%</div>
          <div className="text-[10px] text-gmuted">Tỷ lệ thành công</div>
        </div>
      </div>
      <div className="flex-1" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={display} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" vertical={false} />
            <XAxis dataKey="week" tickFormatter={shortWeek} tick={{ fontSize: 11, fill: "#5F6368" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#5F6368" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }}
              labelFormatter={(v) => `Tuần ${shortWeek(v as string)}`}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
            <Bar dataKey="created" name="Tạo mới" fill="#1A73E8" radius={[3, 3, 0, 0]} opacity={0.7} isAnimationActive={false} />
            <Bar dataKey="completed" name="Hoàn thành" fill="#1E8E3E" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Line dataKey="failed" name="Thất bại" stroke="#D93025" strokeWidth={2} dot={{ r: 3, fill: "#D93025" }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
