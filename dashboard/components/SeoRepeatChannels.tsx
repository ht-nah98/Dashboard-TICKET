"use client";

import { formatVnd } from "@/lib/format";
import clsx from "clsx";

type RepeatChannel = {
  channel_id: string;
  channel_name: string;
  project_name: string;
  open_count: number;
  total_count: number;
  types: string;
  revenue_at_risk: number;
  oldest_days: number;
};

export function SeoRepeatChannels({ data, onChannelClick, activeChannelId }: { data: RepeatChannel[]; onChannelClick?: (id: string, name: string) => void; activeChannelId?: string | null }) {
  const maxOpen = Math.max(...data.map((d) => d.open_count), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Kênh có vấn đề lặp lại</div>
        <div className="text-[12px] text-gmuted">Kênh đang mở từ 3 ticket trở lên</div>
      </div>
      <div className="flex-1 scroll-body" style={{ maxHeight: 300 }}>
        {data.length === 0 ? (
          <div className="text-[12px] text-gmuted py-6 text-center">Không có kênh nào vượt ngưỡng.</div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gmuted text-left border-b border-gborder">
                <th className="font-medium py-2 pr-2">#</th>
                <th className="font-medium py-2 pr-2">Kênh</th>
                <th className="font-medium py-2 pr-2">Project</th>
                <th className="font-medium py-2 pr-2">Loại ticket</th>
                <th className="font-medium py-2 pr-2 text-right">Đang mở</th>
                <th className="font-medium py-2 pr-2 text-right">Cũ nhất</th>
                <th className="font-medium py-2 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ch, i) => {
                const barPct = (ch.open_count / maxOpen) * 100;
                const tone = ch.open_count >= 6 ? "#D93025" : ch.open_count >= 4 ? "#F9AB00" : "#1A73E8";
                return (
                  <tr key={ch.channel_id} onClick={() => onChannelClick?.(ch.channel_id, ch.channel_name)} className={clsx("border-b border-gborder/60 last:border-b-0 cursor-pointer transition", activeChannelId === ch.channel_id ? "bg-[#E8F0FE]" : "row-hover")}>
                    <td className="py-2 pr-2 text-gmuted">{i + 1}</td>
                    <td className="py-2 pr-2 font-medium text-gink max-w-[110px] truncate">{ch.channel_name}</td>
                    <td className="py-2 pr-2 text-gmuted">{ch.project_name}</td>
                    <td className="py-2 pr-2 text-gmuted max-w-[100px] truncate">{ch.types}</td>
                    <td className="py-2 pr-2 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-12 h-1.5 bg-gbg rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: tone }} />
                        </div>
                        <span className="tabular-nums font-medium" style={{ color: tone }}>{ch.open_count}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-gmuted">{ch.oldest_days}d</td>
                    <td className="py-2 text-right tabular-nums text-gink">{formatVnd(ch.revenue_at_risk)} ₫</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted">
        {data.length} kênh · {data.reduce((s, d) => s + d.open_count, 0)} ticket đang mở tổng cộng
      </div>
    </div>
  );
}
