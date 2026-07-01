"use client";

import clsx from "clsx";

const SEV_STYLE: Record<string, string> = {
  critical: "chip-bad",
  high: "chip-bad",
  medium: "chip-warn",
  low: "chip-neutral",
};
const SEV_LABEL: Record<string, string> = {
  critical: "Nghiêm trọng",
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

// Top channels ranked by priority_score (SLA × type × age). Whitelist is shown
// only as a warning flag — it does NOT contribute to the ranking.
export function PriorityChannels({ data, onRowClick }: { data: any[]; onRowClick?: (item: any) => void }) {
  const maxScore = Math.max(...data.map((c) => c.priority_score), 1);
  return (
    <div className="gcard p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-medium text-gink">Top kênh rủi ro</div>
          <div className="text-[12px] text-gmuted">Xếp theo điểm ưu tiên (mức trễ × loại × tuổi) · WL chỉ là cờ cảnh báo</div>
        </div>
        <span className="chip chip-neutral">{data.length} kênh</span>
      </div>
      <div className="scroll-body" style={{ maxHeight: 380 }}>
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-gmuted text-left border-b border-gborder">
              <th className="font-medium py-2 pr-2">Kênh</th>
              <th className="font-medium py-2 pr-2">Dự án</th>
              <th className="font-medium py-2 pr-2 text-right">Mở</th>
              <th className="font-medium py-2 pr-2 text-right">Critical</th>
              <th className="font-medium py-2 pr-2 text-right">Cũ nhất</th>
              <th className="font-medium py-2 pr-2">WL</th>
              <th className="font-medium py-2 pr-2">Mức độ</th>
              <th className="font-medium py-2 text-right">Điểm ưu tiên</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr
                key={c.channel_id}
                onClick={() => onRowClick?.(c)}
                className="row-hover border-b border-gborder/60 cursor-pointer"
              >
                <td className="py-2 pr-2 font-medium text-gink truncate max-w-[180px]">{c.channel_name}</td>
                <td className="py-2 pr-2 text-gmuted truncate max-w-[120px]">{c.project_name}</td>
                <td className="py-2 pr-2 text-right tabular-nums text-gink">{c.open_count}</td>
                <td className="py-2 pr-2 text-right tabular-nums">
                  <span className={c.critical_count > 0 ? "text-gred font-medium" : "text-gmuted"}>
                    {c.critical_count}
                  </span>
                </td>
                <td className="py-2 pr-2 text-right tabular-nums text-gmuted">{c.days_unresolved}d</td>
                <td className="py-2 pr-2">
                  {c.no_whitelist_flag ? (
                    <span className="chip chip-warn" title="Kênh chưa có whitelist đang hoạt động">Chưa WL</span>
                  ) : (
                    <span className="chip chip-good">Đang WL</span>
                  )}
                </td>
                <td className="py-2 pr-2">
                  <span className={clsx("chip", SEV_STYLE[c.severity])}>{SEV_LABEL[c.severity]}</span>
                </td>
                <td className="py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-gbg rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-gblue rounded-full"
                        style={{ width: `${(c.priority_score / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className="tabular-nums font-medium text-gink w-10 text-right">{c.priority_score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-gmuted pt-2 mt-2 border-t border-gborder">
        Hiển thị {data.length} kênh ưu tiên cao nhất
      </div>
    </div>
  );
}
