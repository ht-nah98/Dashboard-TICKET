"use client";

import { formatHours } from "@/lib/format";

const STEP_COLORS = ["#1A73E8", "#4285F4", "#669DF6", "#F9AB00", "#1E8E3E"];

export function WorkflowFunnel({ data }: { data: { step: string; count: number; median_dwell_hours: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Phễu workflow</div>
        <div className="text-[12px] text-gmuted">Số ticket mỗi bước + thời gian dừng trung vị</div>
      </div>
      <div className="flex-1 flex flex-col justify-around gap-2">
        {data.map((d, i) => {
          const widthPct = (d.count / max) * 100;
          return (
            <div key={d.step} className="flex items-center gap-3">
              <div className="w-24 text-[12px] text-gmuted">{d.step}</div>
              <div className="flex-1 h-9 bg-gbg rounded-md relative overflow-hidden">
                <div
                  className="h-full flex items-center px-3 text-white text-[12px] font-medium"
                  style={{ width: `${widthPct}%`, background: STEP_COLORS[i % STEP_COLORS.length], minWidth: 28 }}
                >
                  {d.count}
                </div>
              </div>
              <div className="w-20 text-right text-[12px] text-gmuted tabular-nums">
                {d.median_dwell_hours > 0 ? formatHours(d.median_dwell_hours) : "—"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gmuted mt-3 px-1 shrink-0">
        <span>Bước</span>
        <span>Số ticket</span>
        <span>Thời gian dừng</span>
      </div>
    </div>
  );
}
