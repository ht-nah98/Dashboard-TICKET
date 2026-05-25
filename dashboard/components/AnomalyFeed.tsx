"use client";

import clsx from "clsx";

const SEVERITY: Record<string, { chip: string; icon: string }> = {
  bad: { chip: "chip-bad", icon: "priority_high" },
  warn: { chip: "chip-warn", icon: "warning" },
  info: { chip: "chip-info", icon: "info" },
};

export function AnomalyFeed({ data }: { data: { id: string; title: string; detail: string; direction: "up" | "down"; magnitude_pct: number; severity: "info" | "warn" | "bad" }[] }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-medium text-gink">Cảnh báo bất thường</div>
          <div className="text-[12px] text-gmuted">Phát hiện tự động theo tuần · top 5</div>
        </div>
        <span className="chip chip-info">{data.length} tín hiệu</span>
      </div>
      {data.length === 0 ? (
        <div className="text-[12px] text-gmuted py-8 text-center">Không phát hiện bất thường nào tuần này.</div>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <div key={a.id} className="flex gap-3 items-start py-2 border-b border-gborder/60 last:border-b-0">
              <div className={clsx("w-7 h-7 rounded-full flex items-center justify-center shrink-0", `chip ${SEVERITY[a.severity].chip}`)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{SEVERITY[a.severity].icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gink leading-tight">{a.title}</div>
                <div className="text-[11.5px] text-gmuted mt-0.5">{a.detail}</div>
              </div>
              <span className={clsx("chip text-[11px]", a.direction === "up" ? "chip-bad" : "chip-good")}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                  {a.direction === "up" ? "trending_up" : "trending_down"}
                </span>
                {a.magnitude_pct > 0 ? "+" : ""}
                {a.magnitude_pct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
