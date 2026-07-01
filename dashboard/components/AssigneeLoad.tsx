"use client";

// ┌─────────────────────────────────────────────────────────────┐
// │ BIỂU ĐỒ DÀNH CHO LEADER                                       │
// │ Tải công việc theo nhân sự — mỗi người đang ôm bao nhiêu      │
// │ ticket mở, trong đó bao nhiêu critical / đã trễ. Giúp Leader  │
// │ cân tải đội (ai quá tải, ai còn dư địa).                      │
// └─────────────────────────────────────────────────────────────┘

export function AssigneeLoad({
  data,
}: {
  data: { user_id: string; user_name: string; role: string; open: number; critical: number; breached: number; load_pct: number }[];
}) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-medium text-gink">Tải công việc theo nhân sự</div>
            <span className="chip chip-neutral" title="Biểu đồ này phục vụ Leader">👤 Leader</span>
          </div>
          <div className="text-[12px] text-gmuted">Mỗi người đang ôm bao nhiêu ticket mở · critical · đã trễ</div>
        </div>
        <span className="chip chip-neutral">{data.length} người</span>
      </div>

      {data.length === 0 ? (
        <div className="text-[12px] text-gmuted flex-1 flex items-center justify-center">Chưa có dữ liệu tải nhân sự.</div>
      ) : (
        <div className="scroll-body flex-1 -mr-2 pr-2 space-y-2.5" style={{ maxHeight: 320 }}>
          {data.map((u) => (
            <div key={u.user_id} className="flex items-center gap-3">
              <div className="w-28 min-w-0">
                <div className="text-[12px] font-medium text-gink truncate">{u.user_name}</div>
                <div className="text-[10px] text-gmuted">{u.role}</div>
              </div>
              <div className="flex-1 h-6 bg-gbg rounded-md overflow-hidden relative">
                <div
                  className="h-full bg-gblue rounded-md flex items-center px-2 text-white text-[11px] font-medium"
                  style={{ width: `${Math.max(u.load_pct, 8)}%` }}
                >
                  {u.open}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 w-[120px] justify-end">
                {u.critical > 0 && (
                  <span className="chip chip-bad" title="Ticket critical">{u.critical} critical</span>
                )}
                {u.breached > 0 && (
                  <span className="chip chip-warn" title="Ticket đã trễ SLA">{u.breached} trễ</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-gmuted pt-3 mt-2 border-t border-gborder shrink-0">
        Thanh dài = đang ôm nhiều ticket. Người quá tải kèm nhiều "critical/trễ" nên được san việc.
      </div>
    </div>
  );
}
