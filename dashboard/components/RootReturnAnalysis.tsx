"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type ReturnAnalysis = {
  total_returned: number;
  multi_returned: number;
  by_type: { type: string; count: number; pct: number }[];
  top_return_steps: { step: string; count: number }[];
};

const TYPE_COLOR: Record<string, string> = {
  CLAIM: "#1A73E8",
  GBQ: "#D93025",
  WHITELIST: "#1E8E3E",
  GCD: "#9334E6",
  TKT_BKT: "#F9AB00",
  DIE: "#5F6368",
};

export function RootReturnAnalysis({ data }: { data: ReturnAnalysis }) {
  const maxStep = Math.max(...data.top_return_steps.map((s) => s.count), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Phân tích trả về bổ sung</div>
        <div className="text-[12px] text-gmuted">Hồ sơ không đủ · nguyên nhân & phân bố</div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-3 mb-4 shrink-0">
        <div className="flex-1 rounded-lg bg-gbg p-3 text-center">
          <div className="text-[22px] font-medium tabular-nums text-gred">{data.total_returned}</div>
          <div className="text-[10px] text-gmuted">Ticket bị trả về</div>
        </div>
        <div className="flex-1 rounded-lg bg-gbg p-3 text-center">
          <div className="text-[22px] font-medium tabular-nums text-gamber">{data.multi_returned}</div>
          <div className="text-[10px] text-gmuted">Bị trả về nhiều lần</div>
        </div>
        <div className="flex-1 rounded-lg bg-gbg p-3 text-center">
          <div className="text-[22px] font-medium tabular-nums text-gblue">
            {data.total_returned > 0 ? Math.round((data.multi_returned / data.total_returned) * 100) : 0}%
          </div>
          <div className="text-[10px] text-gmuted">Tỷ lệ tái phạm</div>
        </div>
      </div>

      {/* Pie + legend */}
      <div className="flex items-center gap-4 shrink-0 mb-4">
        <div className="w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.by_type} dataKey="count" nameKey="type" innerRadius={35} outerRadius={55} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
                {data.by_type.map((d) => <Cell key={d.type} fill={TYPE_COLOR[d.type] ?? "#5F6368"} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.by_type.map((d) => (
            <div key={d.type} className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR[d.type] ?? "#5F6368" }} />
              <span className="flex-1 text-gink">{d.type}</span>
              <span className="tabular-nums text-gmuted">{d.count}</span>
              <span className="tabular-nums text-gmuted w-8 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top return steps */}
      <div className="flex-1 scroll-body" style={{ maxHeight: 160 }}>
        <div className="text-[11px] text-gmuted font-medium mb-2">Lý do trả về phổ biến nhất</div>
        <div className="space-y-2">
          {data.top_return_steps.map((s) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex-1 text-[11px] text-gink truncate">{s.step}</div>
              <div className="w-20 h-1.5 bg-gbg rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-gamber rounded-full" style={{ width: `${(s.count / maxStep) * 100}%` }} />
              </div>
              <div className="text-[11px] tabular-nums text-gmuted w-6 text-right shrink-0">{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
