"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function SlaGauge({
  data,
}: {
  data: { within: number; near: number; breached: number; pct_within: number; breach_by_owner: { owner: string; count: number }[] };
}) {
  const total = data.within + data.near + data.breached;
  const segments = [
    { name: "Trong SLA", value: data.within, color: "#1E8E3E" },
    { name: "Sắp trễ", value: data.near, color: "#F9AB00" },
    { name: "Đã trễ", value: data.breached, color: "#D93025" },
  ];
  const maxOwner = Math.max(...data.breach_by_owner.map((o) => o.count), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-2 shrink-0">
        <div className="text-[14px] font-medium text-gink">Tuân thủ SLA</div>
        <div className="text-[12px] text-gmuted">Theo SLA của từng bước · ticket đang mở</div>
      </div>

      {/* Gauge + legend */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="relative w-[140px] h-[90px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                startAngle={180}
                endAngle={0}
                cy="100%"
                innerRadius={48}
                outerRadius={66}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {segments.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0 pointer-events-none">
            <div
              className="text-[26px] font-medium tabular-nums leading-none"
              style={{ color: data.pct_within >= 70 ? "#1E8E3E" : data.pct_within >= 40 ? "#F9AB00" : "#D93025" }}
            >
              {data.pct_within}%
            </div>
            <div className="text-[10px] text-gmuted mt-0.5">trong SLA</div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {segments.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-[12px]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="flex-1 text-gink">{s.name}</span>
              <span className="text-gmuted tabular-nums">{s.value}</span>
              <span className="text-gmuted tabular-nums w-10 text-right">
                {total ? Math.round((s.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Breach concentration — fills remaining height */}
      <div className="mt-4 pt-3 border-t border-gborder flex-1 flex flex-col min-h-0">
        <div className="text-[12px] font-medium text-gink mb-2 shrink-0">Đã trễ theo bên chịu trách nhiệm</div>
        {data.breach_by_owner.length === 0 ? (
          <div className="text-[12px] text-gmuted flex-1 flex items-center justify-center">Không có ticket trễ.</div>
        ) : (
          <div className="space-y-2 flex-1">
            {data.breach_by_owner.map((o) => (
              <div key={o.owner} className="flex items-center gap-2 text-[12px]">
                <span className="w-16 text-gink font-medium">{o.owner}</span>
                <div className="flex-1 h-2.5 bg-gbg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gred rounded-full"
                    style={{ width: `${(o.count / maxOwner) * 100}%` }}
                  />
                </div>
                <span className="tabular-nums text-gmuted w-8 text-right">{o.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
