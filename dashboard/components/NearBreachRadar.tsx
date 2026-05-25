"use client";

import clsx from "clsx";

export function NearBreachRadar({ data, onRowClick }: { data: any[]; onRowClick?: (item: any) => void }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <div className="text-[14px] font-medium text-gink">Ticket cần can thiệp SLA</div>
          <div className="text-[12px] text-gmuted">Sắp trễ (còn cứu được) trước, rồi đến đã trễ nặng nhất</div>
        </div>
        <span className="chip chip-bad">{data.length}</span>
      </div>
      {data.length === 0 ? (
        <div className="text-[12px] text-gmuted py-6 text-center flex-1">Không có ticket nào sắp/đã trễ SLA.</div>
      ) : (
        <>
          <div className="scroll-body flex-1 -mr-2 pr-2 space-y-2" style={{ maxHeight: 340 }}>
            {data.map((b) => (
              <div
                key={b.id}
                onClick={() => onRowClick?.(b)}
                className="flex items-center gap-3 p-2 rounded-md row-hover cursor-pointer border-l-4"
                style={{ borderLeftColor: b.severity === "bad" ? "#D93025" : "#F9AB00" }}
              >
                <span
                  className={clsx("chip", b.severity === "bad" ? "chip-bad" : "chip-warn")}
                  style={{ minWidth: 56, justifyContent: "center" }}
                >
                  {b.hours_to_breach > 0 ? `${b.hours_to_breach}h` : "trễ"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-gink truncate">
                    {b.code} · {b.channel_name}
                  </div>
                  <div className="text-[11px] text-gmuted truncate">
                    {b.type} · SEO {b.owner_name} · {b.waiting_side}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-gmuted pt-2 mt-1 border-t border-gborder shrink-0">
            Hiển thị {data.length} ticket ưu tiên cao nhất
          </div>
        </>
      )}
    </div>
  );
}
