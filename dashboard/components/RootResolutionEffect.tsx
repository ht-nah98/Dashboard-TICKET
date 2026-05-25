"use client";

import clsx from "clsx";

type ResolutionRow = {
  direction: string;
  label: string;
  completed: number;
  failed: number;
  open: number;
  total: number;
  success_rate: number;
};

export function RootResolutionEffect({ data }: { data: ResolutionRow[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Hiệu quả hướng xử lý</div>
        <div className="text-[12px] text-gmuted">Tỷ lệ thành công theo từng phương án giải quyết</div>
      </div>

      <div className="flex-1 space-y-3 scroll-body" style={{ maxHeight: 300 }}>
        {data.map((d) => {
          const successPct = d.completed + d.failed > 0
            ? Math.round((d.completed / (d.completed + d.failed)) * 100)
            : null;
          const tone = successPct === null ? "neutral" : successPct >= 80 ? "good" : successPct >= 60 ? "warn" : "bad";
          const TONE_COLOR = { good: "#1E8E3E", warn: "#F9AB00", bad: "#D93025", neutral: "#5F6368" };

          return (
            <div key={d.direction} className="border-b border-gborder/50 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[12px] font-medium text-gink">{d.label}</div>
                <div className="text-[12px] font-medium tabular-nums" style={{ color: TONE_COLOR[tone] }}>
                  {successPct !== null ? `${successPct}%` : "—"}
                </div>
              </div>
              {/* Stacked bar: completed / failed / open */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-gbg flex">
                <div className="h-full bg-ggreen" style={{ width: `${(d.completed / Math.max(d.total, 1)) * 100}%` }} />
                <div className="h-full bg-gred" style={{ width: `${(d.failed / Math.max(d.total, 1)) * 100}%` }} />
                <div className="h-full bg-gblue opacity-30" style={{ width: `${(d.open / Math.max(d.total, 1)) * 100}%` }} />
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-gmuted">
                <span><span className="text-ggreen font-medium">{d.completed}</span> thành công</span>
                <span><span className="text-gred font-medium">{d.failed}</span> thất bại</span>
                <span><span className="text-gblue font-medium">{d.open}</span> đang mở</span>
                <span className="ml-auto">n={d.total}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
