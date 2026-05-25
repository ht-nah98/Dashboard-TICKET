"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type WeekRow = { week: string; created: number; completed: number; failed: number; return_count: number };

function shortWeek(w: string) {
  const d = new Date(w);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

export function RootWeeklyFail({ data }: { data: WeekRow[] }) {
  const display = data.slice(-8);
  const totalFailed = data.reduce((s, d) => s + d.failed, 0);
  const totalReturns = data.reduce((s, d) => s + d.return_count, 0);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Xu hướng thất bại & trả về hàng tuần</div>
        <div className="text-[12px] text-gmuted">Thất bại + yêu cầu bổ sung theo tuần · 8 tuần gần nhất</div>
      </div>

      <div className="flex gap-4 mb-3 shrink-0">
        <div className="text-center">
          <div className="text-[18px] font-medium text-gred tabular-nums">{totalFailed}</div>
          <div className="text-[10px] text-gmuted">Thất bại (12 tuần)</div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-medium text-gamber tabular-nums">{totalReturns}</div>
          <div className="text-[10px] text-gmuted">Trả về bổ sung</div>
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
            <Bar dataKey="completed" name="Hoàn thành" fill="#1E8E3E" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="failed" name="Thất bại" fill="#D93025" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Line dataKey="return_count" name="Trả về bổ sung" stroke="#F9AB00" strokeWidth={2} dot={{ r: 3, fill: "#F9AB00" }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
