"use client";

import clsx from "clsx";
import { formatHours } from "@/lib/format";

type Outcome = {
  id: string;
  code: string;
  type: string;
  channel_name: string;
  outcome: "completed" | "failed" | "closed";
  resolved_at: string;
  resolution_hours: number;
};

const OUTCOME_CFG = {
  completed: { chip: "chip-good", label: "Thành công", icon: "check_circle" },
  failed: { chip: "chip-bad", label: "Thất bại", icon: "cancel" },
  closed: { chip: "chip-neutral", label: "Đã đóng", icon: "do_not_disturb_on" },
};

export function SeoRecentOutcomes({ data }: { data: Outcome[] }) {
  const completed = data.filter((d) => d.outcome === "completed").length;
  const failed = data.filter((d) => d.outcome === "failed" || d.outcome === "closed").length;
  const rate = data.length > 0 ? Math.round((completed / data.length) * 100) : 0;

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Kết quả gần đây (30 ngày)</div>
        <div className="text-[12px] text-gmuted">Ticket đã xử lý xong · thành công / thất bại</div>
      </div>

      {/* Rate summary */}
      <div className="flex items-center gap-4 mb-3 shrink-0">
        <div className="flex-1 h-2 bg-gbg rounded-full overflow-hidden">
          <div className="h-full bg-ggreen rounded-full" style={{ width: `${rate}%` }} />
        </div>
        <div className="text-[13px] font-medium tabular-nums text-ggreen">{rate}%</div>
        <div className="text-[12px] text-gmuted">{completed} thành công / {failed} thất bại</div>
      </div>

      <div className="flex-1 scroll-body" style={{ maxHeight: 280 }}>
        {data.length === 0 ? (
          <div className="text-[12px] text-gmuted py-6 text-center">Không có dữ liệu trong 30 ngày qua.</div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gmuted text-left border-b border-gborder">
                <th className="font-medium py-2 pr-2">Mã</th>
                <th className="font-medium py-2 pr-2">Loại</th>
                <th className="font-medium py-2 pr-2">Kênh</th>
                <th className="font-medium py-2 pr-2">Kết quả</th>
                <th className="font-medium py-2 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const cfg = OUTCOME_CFG[item.outcome];
                return (
                  <tr key={item.id} className="row-hover border-b border-gborder/60 last:border-b-0">
                    <td className="py-2 pr-2 font-medium text-gblue">{item.code}</td>
                    <td className="py-2 pr-2 text-gmuted">{item.type}</td>
                    <td className="py-2 pr-2 text-gink max-w-[110px] truncate">{item.channel_name}</td>
                    <td className="py-2 pr-2">
                      <span className={clsx("chip", cfg.chip)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-gmuted">
                      {item.resolution_hours > 0 ? formatHours(item.resolution_hours) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
