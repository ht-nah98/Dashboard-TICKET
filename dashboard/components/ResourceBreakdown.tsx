"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatVnd } from "@/lib/format";

type Summary = {
  resource: string;
  total: number;
  open: number;
  completed: number;
  failed: number;
  fail_rate: number;
  revenue_at_risk: number;
  by_subtype: { subtype: string; count: number }[];
};

type TrendRow = {
  week: string;
  image: number;
  audio: number;
  footage: number;
  thumb: number;
};

const RES_LABEL: Record<string, string> = {
  image: "Hình ảnh",
  audio: "Âm thanh",
  footage: "Footage",
  thumb: "Thumbnail",
};

const RES_COLOR: Record<string, string> = {
  image: "#1A73E8",
  audio: "#F9AB00",
  footage: "#D93025",
  thumb: "#1E8E3E",
};

const SUBTYPE_LABEL: Record<string, string> = {
  claim_dung: "Claim đúng",
  claim_lao: "Claim lao",
  gay_dung: "Gậy đúng",
  gay_lao: "Gậy lao",
};

export function ResourceBreakdown({
  summary,
  trend,
}: {
  summary: Summary[];
  trend: TrendRow[];
}) {
  const maxTotal = Math.max(1, ...summary.map((s) => s.total));

  const trendData = useMemo(
    () =>
      trend.map((r) => ({
        ...r,
        week: r.week.slice(5), // "MM-DD"
      })),
    [trend]
  );

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-4 shrink-0">
        <div className="text-[14px] font-medium text-gink">Phân tích tài nguyên vi phạm</div>
        <div className="text-[12px] text-gmuted">
          Loại tài nguyên nào bị claim / gậy nhiều nhất · hình ảnh, âm thanh, footage, thumbnail
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left: summary bars */}
        <div className="col-span-5 space-y-3">
          {summary.map((s) => {
            const barPct = (s.total / maxTotal) * 100;
            const color = RES_COLOR[s.resource] ?? "#5F6368";
            return (
              <div key={s.resource}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-[12px] font-medium text-gink">
                      {RES_LABEL[s.resource] ?? s.resource}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] tabular-nums">
                    <span className="text-gink font-medium">{s.total}</span>
                    <span
                      className="chip text-[10px]"
                      style={{
                        background: s.fail_rate > 15 ? "#FCE8E6" : s.fail_rate > 8 ? "#FEF7E0" : "#E6F4EA",
                        color: s.fail_rate > 15 ? "#D93025" : s.fail_rate > 8 ? "#F9AB00" : "#1E8E3E",
                      }}
                    >
                      {s.fail_rate}% fail
                    </span>
                  </div>
                </div>
                {/* Stacked bar: open + completed + failed */}
                <div className="h-5 rounded-md overflow-hidden flex bg-gbg">
                  {s.open > 0 && (
                    <div
                      title={`Đang mở: ${s.open}`}
                      className="h-full"
                      style={{ width: `${(s.open / s.total) * barPct}%`, background: color, opacity: 0.55 }}
                    />
                  )}
                  {s.completed > 0 && (
                    <div
                      title={`Hoàn thành: ${s.completed}`}
                      className="h-full"
                      style={{ width: `${(s.completed / s.total) * barPct}%`, background: color }}
                    />
                  )}
                  {s.failed > 0 && (
                    <div
                      title={`Thất bại: ${s.failed}`}
                      className="h-full bg-gred"
                      style={{ width: `${(s.failed / s.total) * barPct}%` }}
                    />
                  )}
                </div>
                {/* Sub-type chips */}
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {s.by_subtype.map((sub) => (
                    <span key={sub.subtype} className="text-[10px] text-gmuted bg-gbg rounded px-1.5 py-0.5">
                      {SUBTYPE_LABEL[sub.subtype] ?? sub.subtype}: {sub.count}
                    </span>
                  ))}
                  {s.revenue_at_risk > 0 && (
                    <span className="text-[10px] text-gred bg-gred/10 rounded px-1.5 py-0.5">
                      {formatVnd(s.revenue_at_risk)} ₫ rủi ro
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {/* Legend */}
          <div className="flex gap-3 mt-2 text-[10px] text-gmuted">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-gblue/50" />Đang mở</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-gblue" />Hoàn thành</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-gred" />Thất bại</span>
          </div>
        </div>

        {/* Right: 12-week trend */}
        <div className="col-span-7">
          <div className="text-[12px] text-gmuted mb-2">Xu hướng 12 tuần — ticket mới theo loại tài nguyên</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#5F6368" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#5F6368" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, border: "1px solid #DADCE0", borderRadius: 8 }}
                formatter={(val: number, name: string) => [val, RES_LABEL[name] ?? name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                formatter={(name) => RES_LABEL[name] ?? name}
              />
              <Bar dataKey="image" stackId="a" fill={RES_COLOR.image} radius={[0, 0, 0, 0]} />
              <Bar dataKey="audio" stackId="a" fill={RES_COLOR.audio} />
              <Bar dataKey="footage" stackId="a" fill={RES_COLOR.footage} />
              <Bar dataKey="thumb" stackId="a" fill={RES_COLOR.thumb} radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
