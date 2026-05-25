"use client";

import clsx from "clsx";
import { formatHours } from "@/lib/format";

type WaitItem = {
  id: string;
  code: string;
  type: string;
  channel_name: string;
  current_step: string;
  hours_waiting: number;
  sla_hours: number;
  overdue_ratio: number;
  severity: "ok" | "warn" | "bad";
};

const SEV_COLOR: Record<string, string> = { bad: "#D93025", warn: "#F9AB00", ok: "#1E8E3E" };

export function SeoWaitingVhyt({ data, onRowClick }: { data: WaitItem[]; onRowClick?: (item: WaitItem) => void }) {
  const bad = data.filter((d) => d.severity === "bad").length;
  const warn = data.filter((d) => d.severity === "warn").length;
  const ok = data.filter((d) => d.severity === "ok").length;

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Đang chờ VHYT xử lý</div>
        <div className="text-[12px] text-gmuted">Ticket SEO đã gửi — đang trong tay VHYT</div>
      </div>

      <div className="flex gap-2 mb-3 shrink-0">
        <div className="flex-1 rounded-lg bg-gbg p-2 text-center">
          <div className="text-[18px] font-medium text-gred tabular-nums">{bad}</div>
          <div className="text-[10px] text-gmuted">Trễ SLA</div>
        </div>
        <div className="flex-1 rounded-lg bg-gbg p-2 text-center">
          <div className="text-[18px] font-medium text-gamber tabular-nums">{warn}</div>
          <div className="text-[10px] text-gmuted">Sắp trễ</div>
        </div>
        <div className="flex-1 rounded-lg bg-gbg p-2 text-center">
          <div className="text-[18px] font-medium text-ggreen tabular-nums">{ok}</div>
          <div className="text-[10px] text-gmuted">Đúng hạn</div>
        </div>
      </div>

      <div className="flex-1 scroll-body" style={{ maxHeight: 240 }}>
        {data.length === 0 ? (
          <div className="text-[12px] text-gmuted py-6 text-center">Không có ticket nào đang chờ VHYT.</div>
        ) : (
          <div className="space-y-1.5">
            {data.map((item) => {
              const pct = Math.min(item.overdue_ratio * 100, 100);
              const color = SEV_COLOR[item.severity];
              return (
                <div
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={clsx(
                    "flex items-center gap-2 py-1.5 border-b border-gborder/50 last:border-0",
                    onRowClick && "cursor-pointer hover:bg-gbg rounded-md px-1 transition"
                  )}
                >
                  <div className="w-[90px] text-[11px] font-medium text-gblue truncate shrink-0">{item.code}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gink truncate">{item.channel_name}</div>
                    <div className="w-full h-1.5 bg-gbg rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <div className="text-[11px] text-gmuted tabular-nums shrink-0 w-14 text-right">
                    {formatHours(item.hours_waiting)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted">
        {data.length} ticket đang chờ · thanh màu = % SLA đã dùng
      </div>
    </div>
  );
}
