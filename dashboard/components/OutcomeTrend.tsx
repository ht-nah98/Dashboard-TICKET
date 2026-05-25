"use client";

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

type Row = {
  week: string;
  completed: number;
  failed: number;
  open: number;
  success_rate: number;
};

function fmtWeek(w: string) {
  const d = new Date(w);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function OutcomeTrend({ data }: { data: Row[] }) {
  const chartData = data.map((d) => ({ ...d, label: fmtWeek(d.week) }));
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const trendArrow = latest && prev
    ? latest.success_rate >= prev.success_rate ? "↑" : "↓"
    : "";
  const trendColor = latest && prev
    ? latest.success_rate >= prev.success_rate ? "text-ggreen" : "text-gred"
    : "text-gmuted";

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0 flex items-end justify-between">
        <div>
          <div className="text-[14px] font-medium text-gink">Xu hướng kết quả xử lý</div>
          <div className="text-[12px] text-gmuted">12 tuần · hoàn thành / thất bại / còn mở + tỷ lệ thành công</div>
        </div>
        {latest && (
          <div className="text-right">
            <div className={`text-[18px] font-medium tabular-nums ${trendColor}`}>
              {trendArrow} {latest.success_rate}%
            </div>
            <div className="text-[11px] text-gmuted">Tỷ lệ thành công tuần này</div>
          </div>
        )}
      </div>

      <div className="flex-1" style={{ minHeight: 240 }}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#5F6368" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#5F6368" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: "#5F6368" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8EAED" }}
              labelStyle={{ color: "#5F6368", fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" />
            <Bar yAxisId="left" dataKey="completed" stackId="a" fill="#1E8E3E" name="Hoàn thành" />
            <Bar yAxisId="left" dataKey="failed" stackId="a" fill="#D93025" name="Thất bại" />
            <Bar yAxisId="left" dataKey="open" stackId="a" fill="#1A73E8" fillOpacity={0.35} name="Còn mở" />
            <Line yAxisId="right" type="monotone" dataKey="success_rate" stroke="#F9AB00" strokeWidth={2} dot={{ r: 3 }} name="Tỷ lệ thành công (%)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
