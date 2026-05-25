"use client";

import clsx from "clsx";
import { formatHours } from "@/lib/format";

type QueueItem = {
  id: string;
  code: string;
  type: string;
  channel_name: string;
  current_step: string;
  hours_waiting: number;
  sla_hours: number;
  overdue_ratio: number;
  severity: "ok" | "warn" | "bad";
  revenue_at_risk: number;
  is_urgent: boolean;
};

const SEV_CHIP: Record<string, string> = {
  bad: "chip-bad",
  warn: "chip-warn",
  ok: "chip-good",
};
const TYPE_CHIP: Record<string, string> = {
  CLAIM: "chip-bad",
  GBQ: "chip-bad",
  DIE: "chip-bad",
  WHITELIST: "chip-info",
  TKT_BKT: "chip-info",
  GCD: "chip-neutral",
};

export function SeoActionQueue({ data, onRowClick }: { data: QueueItem[]; onRowClick?: (item: QueueItem) => void }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[14px] font-medium text-gink">Hàng chờ hành động của tôi</div>
          <div className="text-[12px] text-gmuted">Ticket đang chờ SEO xử lý · ưu tiên theo mức độ</div>
        </div>
        <span className="chip chip-bad">{data.length} việc cần làm</span>
      </div>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[12px] text-gmuted py-8">
          Không có ticket nào cần xử lý.
        </div>
      ) : (
        <div className="flex-1 scroll-body" style={{ maxHeight: 340 }}>
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gmuted text-left border-b border-gborder">
                <th className="font-medium py-2 pr-2">Mã</th>
                <th className="font-medium py-2 pr-2">Loại</th>
                <th className="font-medium py-2 pr-2">Kênh</th>
                <th className="font-medium py-2 pr-2">Bước hiện tại</th>
                <th className="font-medium py-2 pr-2 text-right">Đã chờ</th>
                <th className="font-medium py-2 pr-2 text-right">SLA</th>
                <th className="font-medium py-2 text-right">Mức độ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} onClick={() => onRowClick?.(item)} className="row-hover border-b border-gborder/60 last:border-b-0 cursor-pointer">
                  <td className="py-2 pr-2 font-medium text-gblue">
                    <div className="flex items-center gap-1">
                      {item.is_urgent && (
                        <span className="material-symbols-outlined text-gred" style={{ fontSize: 14 }}>priority_high</span>
                      )}
                      {item.code}
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <span className={clsx("chip", TYPE_CHIP[item.type] ?? "chip-neutral")}>{item.type}</span>
                  </td>
                  <td className="py-2 pr-2 text-gink max-w-[120px] truncate">{item.channel_name}</td>
                  <td className="py-2 pr-2 text-gmuted max-w-[140px] truncate">{item.current_step}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-gink">{formatHours(item.hours_waiting)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-gmuted">{item.sla_hours}h</td>
                  <td className="py-2 text-right">
                    <span className={clsx("chip", SEV_CHIP[item.severity])}>
                      {item.severity === "bad" ? "Trễ" : item.severity === "warn" ? "Sắp trễ" : "Đúng hạn"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted flex gap-4">
        <span>{data.filter((d) => d.severity === "bad").length} trễ SLA</span>
        <span>{data.filter((d) => d.severity === "warn").length} sắp trễ</span>
        <span>{data.filter((d) => d.is_urgent).length} khẩn cấp</span>
      </div>
    </div>
  );
}
