"use client";

import clsx from "clsx";

type ReapplyItem = {
  id: string;
  code: string;
  sub_type: string;
  channel_name: string;
  re_apply_after: string;
  days_until: number;
  status: "overdue" | "ready" | "soon" | "waiting";
  current_state: string;
};

const STATUS_CONFIG: Record<string, { chip: string; label: string; icon: string }> = {
  overdue: { chip: "chip-bad", label: "Quá hạn nộp lại", icon: "warning" },
  ready: { chip: "chip-good", label: "Sẵn sàng nộp", icon: "check_circle" },
  soon: { chip: "chip-warn", label: "Sắp đến hạn", icon: "schedule" },
  waiting: { chip: "chip-neutral", label: "Đang chờ", icon: "hourglass_empty" },
};

import { STATE_LABEL } from "@/lib/labels";

export function SeoReapplyTracker({ data }: { data: ReapplyItem[] }) {
  const counts = {
    overdue: data.filter((d) => d.status === "overdue").length,
    ready: data.filter((d) => d.status === "ready").length,
    soon: data.filter((d) => d.status === "soon").length,
    waiting: data.filter((d) => d.status === "waiting").length,
  };

  // Show actionable first: overdue + ready + soon, then waiting
  const priority = data.filter((d) => d.status !== "waiting");
  const waiting = data.filter((d) => d.status === "waiting");
  const display = [...priority, ...waiting];

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Theo dõi nộp lại TKT/BKT</div>
        <div className="text-[12px] text-gmuted">Cooldown đã hết · sắp hết · đang chờ</div>
      </div>

      {/* Summary bar */}
      <div className="flex gap-2 mb-3 shrink-0">
        <div className="flex-1 rounded-lg bg-[#FCE8E6] p-2 text-center">
          <div className="text-[16px] font-medium text-gred tabular-nums">{counts.overdue}</div>
          <div className="text-[10px] text-gred">Quá hạn</div>
        </div>
        <div className="flex-1 rounded-lg bg-[#E6F4EA] p-2 text-center">
          <div className="text-[16px] font-medium text-ggreen tabular-nums">{counts.ready}</div>
          <div className="text-[10px] text-ggreen">Sẵn sàng</div>
        </div>
        <div className="flex-1 rounded-lg bg-[#FEF7E0] p-2 text-center">
          <div className="text-[16px] font-medium text-gamber tabular-nums">{counts.soon}</div>
          <div className="text-[10px] text-gamber">Sắp đến</div>
        </div>
        <div className="flex-1 rounded-lg bg-gbg p-2 text-center">
          <div className="text-[16px] font-medium text-gmuted tabular-nums">{counts.waiting}</div>
          <div className="text-[10px] text-gmuted">Đang chờ</div>
        </div>
      </div>

      <div className="flex-1 scroll-body" style={{ maxHeight: 260 }}>
        <div className="space-y-2">
          {display.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const dateStr = new Date(item.re_apply_after).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
            });
            return (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gborder/50 last:border-0">
                <span className={clsx("material-symbols-outlined shrink-0", {
                  "text-gred": item.status === "overdue",
                  "text-ggreen": item.status === "ready",
                  "text-gamber": item.status === "soon",
                  "text-gmuted": item.status === "waiting",
                })} style={{ fontSize: 18 }}>
                  {cfg.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-medium text-gblue">{item.code}</span>
                    <span className="chip chip-neutral text-[11px]">{item.sub_type}</span>
                    <span className={clsx("chip text-[11px]", cfg.chip)}>{cfg.label}</span>
                  </div>
                  <div className="text-[11px] text-gink truncate mt-0.5">{item.channel_name}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[11px] text-gmuted">{dateStr}</div>
                  <div className="text-[11px] font-medium tabular-nums" style={{
                    color: item.days_until < 0 ? "#D93025" : item.days_until <= 7 ? "#F9AB00" : "#5F6368"
                  }}>
                    {item.days_until < 0 ? `${Math.abs(item.days_until)}d quá hạn` : item.days_until === 0 ? "Hôm nay" : `${item.days_until}d nữa`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted">
        {data.length} ticket TKT/BKT tổng cộng
      </div>
    </div>
  );
}
