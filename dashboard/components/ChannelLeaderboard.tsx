"use client";

import { formatVnd } from "@/lib/format";
import clsx from "clsx";

const SEVERITY: Record<string, { label: string; chip: string }> = {
  critical: { label: "Nguy cấp", chip: "chip-bad" },
  high: { label: "Cao", chip: "chip-warn" },
  medium: { label: "Trung bình", chip: "chip-info" },
  low: { label: "Thấp", chip: "chip-neutral" },
};

export function ChannelLeaderboard({
  data,
  activeChannelId,
  onChannelClick,
  onTypeClick,
}: {
  data: any[];
  activeChannelId?: string | null;
  onChannelClick?: (channelId: string, channelName: string) => void;
  onTypeClick?: (type: string) => void;
}) {
  const max = Math.max(...data.map((d) => d.revenue_at_risk), 1);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <div className="text-[14px] font-medium text-gink">Top 10 kênh rủi ro cao</div>
          <div className="text-[12px] text-gmuted">Click vào hàng để lọc theo kênh · Click mức độ để lọc severity</div>
        </div>
        <a className="text-[12px] text-gblue font-medium cursor-pointer">Tất cả kênh →</a>
      </div>
      <div className="flex-1 scroll-body" style={{ maxHeight: 380 }}>
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-gmuted text-left border-b border-gborder">
              <th className="font-medium py-2 pr-2">#</th>
              <th className="font-medium py-2 pr-2">Kênh</th>
              <th className="font-medium py-2 pr-2">Project</th>
              <th className="font-medium py-2 pr-2 text-right">Đang mở</th>
              <th className="font-medium py-2 pr-2 text-right">Critical</th>
              <th className="font-medium py-2 pr-2">Mức độ</th>
              <th className="font-medium py-2 pr-2 text-right">Doanh thu rủi ro</th>
              <th className="font-medium py-2 pr-2 text-right">Cũ nhất</th>
              <th className="font-medium py-2 pr-2">WL</th>
              <th className="font-medium py-2 text-right">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => {
              const isActive = activeChannelId === c.channel_id;
              return (
                <tr
                  key={c.channel_id}
                  onClick={() => onChannelClick?.(c.channel_id, c.channel_name)}
                  className={clsx(
                    "border-b border-gborder/60 cursor-pointer transition",
                    isActive ? "bg-[#E8F0FE]" : "row-hover"
                  )}
                  title="Click để lọc theo kênh này"
                >
                  <td className="py-2 pr-2 text-gmuted">{i + 1}</td>
                  <td className="py-2 pr-2 font-medium text-gink">
                    <div className="flex items-center gap-1">
                      {isActive && <span className="material-symbols-outlined text-gblue" style={{ fontSize: 14 }}>filter_alt</span>}
                      {c.channel_name}
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-gmuted">{c.project_name}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{c.open_count}</td>
                  <td className="py-2 pr-2 text-right tabular-nums font-medium">
                    {c.critical_count > 0 ? <span className="text-gred">{c.critical_count}</span> : <span className="text-gmuted">0</span>}
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onTypeClick?.(c.severity); }}
                      className="hover:opacity-80 transition"
                      title="Click để lọc theo mức độ này"
                    >
                      <span className={clsx("chip", SEVERITY[c.severity]?.chip)}>{SEVERITY[c.severity]?.label}</span>
                    </button>
                  </td>
                  <td className="py-2 pr-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-gbg rounded-full overflow-hidden">
                        <div className="h-full bg-gblue rounded-full" style={{ width: `${(c.revenue_at_risk / max) * 100}%` }} />
                      </div>
                      <span className="tabular-nums text-gink w-14 text-right">{formatVnd(c.revenue_at_risk)} ₫</span>
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums text-gmuted">{c.days_unresolved} ngày</td>
                  <td className="py-2 pr-2">
                    {c.no_whitelist_flag ? (
                      <span className="chip chip-bad">Chưa WL</span>
                    ) : (
                      <span className="chip chip-good">Đã WL</span>
                    )}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium">{c.composite_score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {activeChannelId && (
        <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gblue flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>filter_alt</span>
          Đang lọc theo kênh · Click lại để bỏ lọc
        </div>
      )}
    </div>
  );
}
