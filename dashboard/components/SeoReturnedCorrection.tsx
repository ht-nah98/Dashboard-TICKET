"use client";

import clsx from "clsx";
import { formatHours } from "@/lib/format";

type ReturnItem = {
  id: string;
  code: string;
  type: string;
  channel_name: string;
  return_reason: string;
  returned_hours_ago: number;
  return_count: number;
};

export function SeoReturnedCorrection({ data, onRowClick }: { data: ReturnItem[]; onRowClick?: (item: ReturnItem) => void }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[14px] font-medium text-gink">Trả về để bổ sung</div>
          <div className="text-[12px] text-gmuted">VHYT yêu cầu bổ sung hồ sơ · cần xử lý lại</div>
        </div>
        {data.length > 0 && (
          <span className="chip chip-warn">{data.length} ticket</span>
        )}
      </div>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[12px] text-gmuted py-6">
          Không có ticket nào bị trả về.
        </div>
      ) : (
        <div className="flex-1 scroll-body" style={{ maxHeight: 260 }}>
          <div className="space-y-2">
            {data.map((item) => (
              <div
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className="rounded-lg border border-gborder bg-gbg/50 p-3 cursor-pointer hover:bg-gbg transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-medium text-gblue">{item.code}</span>
                      <span className="chip chip-neutral text-[11px]">{item.type}</span>
                      {item.return_count > 1 && (
                        <span className="chip chip-warn text-[11px]">
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>repeat</span>
                          {item.return_count}× trả về
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gink mt-0.5 truncate">{item.channel_name}</div>
                    <div className="text-[11px] text-gmuted mt-0.5 truncate">{item.return_reason}</div>
                  </div>
                  <div className="text-[11px] text-gmuted tabular-nums shrink-0 text-right">
                    <div>{formatHours(item.returned_hours_ago)}</div>
                    <div className="text-[10px]">trước</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted">
        {data.filter((d) => d.return_count > 1).length} ticket bị trả về nhiều lần
      </div>
    </div>
  );
}
