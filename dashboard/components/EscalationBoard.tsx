"use client";

import { formatVnd } from "@/lib/format";
import clsx from "clsx";

export function EscalationBoard({ data, onRowClick }: { data: any[]; onRowClick?: (item: any) => void }) {
  return (
    <div className="gcard p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-medium text-gink">Bảng ticket cần can thiệp</div>
          <div className="text-[12px] text-gmuted">Trễ SLA theo bước · ưu tiên theo mức trễ × doanh thu</div>
        </div>
        <span className="chip chip-bad">{data.length} cần can thiệp</span>
      </div>
      <div className="scroll-body" style={{ maxHeight: 380 }}>
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-gmuted text-left border-b border-gborder">
              <th className="font-medium py-2 pr-2">Mã</th>
              <th className="font-medium py-2 pr-2">Loại</th>
              <th className="font-medium py-2 pr-2">Kênh</th>
              <th className="font-medium py-2 pr-2">SEO</th>
              <th className="font-medium py-2 pr-2">Bước hiện tại</th>
              <th className="font-medium py-2 pr-2 text-right">Mở</th>
              <th className="font-medium py-2 pr-2">Trạng thái</th>
              <th className="font-medium py-2 text-right">Doanh thu rủi ro</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr
                key={e.id}
                onClick={() => onRowClick?.(e)}
                className="row-hover border-b border-gborder/60 cursor-pointer"
              >
                <td className="py-2 pr-2 font-mono text-[11px] text-gink">{e.code}</td>
                <td className="py-2 pr-2"><span className="chip chip-neutral">{e.type}</span></td>
                <td className="py-2 pr-2 font-medium text-gink truncate max-w-[180px]">{e.channel_name}</td>
                <td className="py-2 pr-2 text-gmuted truncate max-w-[140px]">{e.owner_name}</td>
                <td className="py-2 pr-2 text-gmuted">{e.waiting_side}</td>
                <td className="py-2 pr-2 text-right tabular-nums text-gink">{e.days_open}d</td>
                <td className="py-2 pr-2">
                  <span className={clsx("chip", e.breach_risk === "breached" ? "chip-bad" : "chip-warn")}>
                    {e.breach_risk === "breached" ? "Đã trễ" : "Sắp trễ"}
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums">{formatVnd(e.revenue_at_risk)} ₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-gmuted pt-2 mt-2 border-t border-gborder">
        Hiển thị {data.length} ticket ưu tiên cao nhất
      </div>
    </div>
  );
}
