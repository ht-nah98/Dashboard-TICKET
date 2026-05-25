"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { formatVnd } from "@/lib/format";
import type { DerivedPayload } from "@/lib/types";

export function RevenueStrip({ data }: { data: DerivedPayload["revenue"] }) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="gcard p-5 col-span-7">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[14px] font-medium text-gink">Tác động doanh thu</div>
            <div className="text-[12px] text-gmuted">Rủi ro hiện tại · Đã cứu trong tháng · Thiệt hại đã ghi nhận năm</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <MoneyStat label="Đang rủi ro" value={data.at_risk_now} color="#F9AB00" tone="warn" series={data.weekly.map((w) => w.at_risk)} />
          <MoneyStat label="Đã cứu (tháng)" value={data.recovered_mtd} color="#1E8E3E" tone="good" series={data.weekly.map((w) => w.recovered)} />
          <MoneyStat label="Thiệt hại đã ghi nhận" value={data.realized_loss_ytd} color="#D93025" tone="bad" series={data.weekly.map((w) => w.lost)} />
        </div>
      </div>

      <div className="gcard p-5 col-span-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[14px] font-medium text-gink">Doanh thu rủi ro theo Project</div>
            <div className="text-[12px] text-gmuted">Rủi ro đang tập trung ở đâu</div>
          </div>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_project} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatVnd(v)} stroke="#5F6368" fontSize={11} />
              <YAxis type="category" dataKey="project_name" stroke="#5F6368" fontSize={12} width={120} />
              <Tooltip
                formatter={(v: number) => [formatVnd(v) + " ₫", "Rủi ro"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }}
              />
              <Bar dataKey="at_risk" radius={[0, 4, 4, 0]}>
                {data.by_project.map((_, i) => (
                  <Cell key={i} fill={["#1A73E8", "#1E8E3E", "#F9AB00", "#9334E6", "#129EAF"][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MoneyStat({
  label,
  value,
  color,
  tone,
  series,
}: {
  label: string;
  value: number;
  color: string;
  tone: "warn" | "good" | "bad";
  series: number[];
}) {
  return (
    <div className="border border-gborder rounded-gcard p-3">
      <div className="text-[12px] text-gmuted font-medium">{label}</div>
      <div className="kpi-num text-[28px] leading-[36px] font-medium mt-1" style={{ color }}>
        {formatVnd(value)} ₫
      </div>
      <div className="h-12 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-gmuted mt-1">12 tuần gần nhất</div>
    </div>
  );
}
