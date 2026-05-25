"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatVnd } from "@/lib/format";

type ParetoRow = {
  type: string;
  total: number;
  open: number;
  completed: number;
  failed: number;
  revenue_vnd: number;
  fail_rate: number;
};

const TYPE_COLOR: Record<string, string> = {
  CLAIM: "#1A73E8",
  GBQ: "#D93025",
  WHITELIST: "#1E8E3E",
  GCD: "#9334E6",
  TKT_BKT: "#F9AB00",
  DIE: "#5F6368",
};

export function RootPareto({ data }: { data: ParetoRow[] }) {
  const totalTickets = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Phân tích Pareto — loại ticket</div>
        <div className="text-[12px] text-gmuted">Khối lượng · doanh thu rủi ro · tỷ lệ thất bại</div>
      </div>

      {/* Bar chart */}
      <div className="flex-1" style={{ minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#5F6368" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#5F6368" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }}
              formatter={(value, name) => [value, name === "total" ? "Tổng số" : name === "open" ? "Đang mở" : "Thất bại"]}
            />
            <Bar dataKey="total" name="total" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.type} fill={TYPE_COLOR[d.type] ?? "#5F6368"} opacity={0.85} />)}
            </Bar>
            <Bar dataKey="open" name="open" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.type} fill={TYPE_COLOR[d.type] ?? "#5F6368"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table breakdown */}
      <div className="shrink-0 mt-3 scroll-body" style={{ maxHeight: 180 }}>
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-white">
            <tr className="text-gmuted text-left border-b border-gborder">
              <th className="font-medium py-1.5 pr-2">Loại</th>
              <th className="font-medium py-1.5 pr-2 text-right">Tổng</th>
              <th className="font-medium py-1.5 pr-2 text-right">Đang mở</th>
              <th className="font-medium py-1.5 pr-2 text-right">Thất bại</th>
              <th className="font-medium py-1.5 pr-2 text-right">% Thất bại</th>
              <th className="font-medium py-1.5 text-right">Doanh thu rủi ro</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.type} className="border-b border-gborder/50 last:border-0">
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR[d.type] ?? "#5F6368" }} />
                    <span className="font-medium text-gink">{d.type}</span>
                  </div>
                </td>
                <td className="py-1.5 pr-2 text-right tabular-nums text-gink">{d.total}</td>
                <td className="py-1.5 pr-2 text-right tabular-nums text-gblue">{d.open}</td>
                <td className="py-1.5 pr-2 text-right tabular-nums text-gred">{d.failed}</td>
                <td className="py-1.5 pr-2 text-right tabular-nums" style={{ color: d.fail_rate > 5 ? "#D93025" : d.fail_rate > 2 ? "#F9AB00" : "#1E8E3E" }}>
                  {d.fail_rate}%
                </td>
                <td className="py-1.5 text-right tabular-nums text-gink">{formatVnd(d.revenue_vnd)} ₫</td>
              </tr>
            ))}
            <tr className="border-t border-gborder">
              <td className="py-1.5 pr-2 font-medium text-gink">Tổng cộng</td>
              <td className="py-1.5 pr-2 text-right font-medium tabular-nums">{totalTickets}</td>
              <td colSpan={4} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
