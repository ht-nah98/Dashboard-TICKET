"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const TYPE_COLORS: Record<string, string> = {
  CLAIM: "#1A73E8",
  WHITELIST: "#1E8E3E",
  GBQ: "#D93025",
  GCD: "#9334E6",
  TKT_BKT: "#F9AB00",
  DIE: "#5F6368",
};

export function VolumeTrend({ data }: { data: any[] }) {
  const keys = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"];
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-medium text-gink">Xu hướng khối lượng ticket</div>
          <div className="text-[12px] text-gmuted">12 tuần, theo loại — số ticket được tạo mỗi tuần</div>
        </div>
        <a className="text-[12px] text-gblue font-medium cursor-pointer">Xem theo ngày →</a>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              {keys.map((k) => (
                <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TYPE_COLORS[k]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={TYPE_COLORS[k]} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
            <XAxis dataKey="week" stroke="#5F6368" fontSize={11} tickFormatter={(s: string) => s.slice(5)} />
            <YAxis stroke="#5F6368" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map((k) => (
              <Area
                key={k}
                type="monotone"
                stackId="1"
                dataKey={k}
                stroke={TYPE_COLORS[k]}
                fill={`url(#g-${k})`}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
