"use client";

import { formatHours } from "@/lib/format";

type ComplexityRow = { bucket: string; count: number; avg_resolution_hours: number };

const BAR_COLORS = ["#1E8E3E", "#1A73E8", "#F9AB00", "#D93025"];

export function RootProcessComplexity({ data }: { data: ComplexityRow[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const maxHours = Math.max(...data.map((d) => d.avg_resolution_hours), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Độ phức tạp quy trình</div>
        <div className="text-[12px] text-gmuted">Số lần bàn giao → thời gian xử lý trung vị</div>
      </div>

      <div className="flex-1 flex flex-col justify-around gap-3">
        {data.map((d, i) => {
          const color = BAR_COLORS[i % BAR_COLORS.length];
          const countPct = (d.count / maxCount) * 100;
          const hoursPct = maxHours > 0 ? (d.avg_resolution_hours / maxHours) * 100 : 0;
          return (
            <div key={d.bucket} className="flex items-center gap-3">
              <div className="w-24 text-[11px] text-gmuted shrink-0">{d.bucket}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gbg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${countPct}%`, background: color }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-gink w-8 text-right shrink-0">{d.count}</span>
                  <span className="text-[10px] text-gmuted shrink-0">ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gbg rounded-full overflow-hidden">
                    <div className="h-full rounded-full opacity-50" style={{ width: `${hoursPct}%`, background: color }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-gmuted w-8 text-right shrink-0">
                    {d.avg_resolution_hours > 0 ? formatHours(d.avg_resolution_hours) : "—"}
                  </span>
                  <span className="text-[10px] text-gmuted shrink-0">trung vị</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 pt-2 mt-2 border-t border-gborder/60 text-[11px] text-gmuted">
        Nhiều bàn giao hơn → thời gian xử lý tăng đáng kể
      </div>
    </div>
  );
}
