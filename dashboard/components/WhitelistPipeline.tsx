"use client";

type StatusRow = { status: string; count: number; tone: "good" | "warn" | "bad" | "neutral" };
type RecentRow = { id: string; channel_name: string; project_name: string; wl_date: string; days_taken: number | null };
type PendingRow = { id: string; channel_name: string; project_name: string; days_waiting: number; created_at: string };

const TONE_BG: Record<StatusRow["tone"], string> = {
  good: "bg-ggreen",
  warn: "bg-gamber",
  bad: "bg-gred",
  neutral: "bg-gink/40",
};
const TONE_TXT: Record<StatusRow["tone"], string> = {
  good: "text-ggreen",
  warn: "text-gamber",
  bad: "text-gred",
  neutral: "text-gmuted",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function WhitelistPipeline({
  by_status,
  avg_days_to_wl,
  recent_wl,
  pending_applications,
  total,
}: {
  by_status: StatusRow[];
  avg_days_to_wl: number | null;
  recent_wl: RecentRow[];
  pending_applications: PendingRow[];
  total: number;
}) {
  const max = Math.max(1, ...by_status.map((s) => s.count));

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0 flex items-end justify-between">
        <div>
          <div className="text-[14px] font-medium text-gink">Pipeline Whitelist</div>
          <div className="text-[12px] text-gmuted">
            {total} kênh trong hệ thống · {avg_days_to_wl !== null ? `trung vị ${avg_days_to_wl} ngày để WL` : "chưa có dữ liệu chu kỳ"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-medium text-ggreen tabular-nums">
            {by_status.find((s) => s.status === "Đang WL")?.count ?? 0}
          </div>
          <div className="text-[11px] text-gmuted">Đang WL</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1">
        {/* Status distribution */}
        <div className="flex flex-col min-w-0">
          <div className="text-[12px] font-medium text-gink mb-2">Trạng thái</div>
          <div className="space-y-2">
            {by_status.map((s) => {
              const pct = (s.count / max) * 100;
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gink truncate">{s.status}</span>
                    <span className={`text-[11px] font-medium tabular-nums ${TONE_TXT[s.tone]}`}>{s.count}</span>
                  </div>
                  <div className="h-2 bg-gbg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${TONE_BG[s.tone]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending applications */}
        <div className="flex flex-col min-w-0 border-l border-gborder pl-5">
          <div className="text-[12px] font-medium text-gink mb-2">
            Đang xử lý ({pending_applications.length})
          </div>
          <div className="space-y-1.5 overflow-y-auto scroll-body" style={{ maxHeight: 200 }}>
            {pending_applications.length === 0 && (
              <div className="text-[11px] text-gmuted italic">Không có đơn nào đang xử lý.</div>
            )}
            {pending_applications.slice(0, 8).map((p) => {
              const tone = p.days_waiting >= 7 ? "text-gred" : p.days_waiting >= 3 ? "text-gamber" : "text-gmuted";
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="min-w-0 flex-1">
                    <div className="text-gink truncate">{p.channel_name}</div>
                    <div className="text-gmuted truncate text-[10px]">{p.project_name}</div>
                  </div>
                  <div className={`tabular-nums shrink-0 ${tone}`}>{p.days_waiting}d</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently whitelisted */}
        <div className="flex flex-col min-w-0 border-l border-gborder pl-5">
          <div className="text-[12px] font-medium text-gink mb-2">
            Vừa WL gần đây
          </div>
          <div className="space-y-1.5 overflow-y-auto scroll-body" style={{ maxHeight: 200 }}>
            {recent_wl.length === 0 && (
              <div className="text-[11px] text-gmuted italic">Chưa có lần WL nào ghi nhận.</div>
            )}
            {recent_wl.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-[11px]">
                <div className="min-w-0 flex-1">
                  <div className="text-gink truncate">{r.channel_name}</div>
                  <div className="text-gmuted truncate text-[10px]">{r.project_name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-gmuted tabular-nums text-[10px]">{fmtDate(r.wl_date)}</div>
                  {r.days_taken !== null && (
                    <div className="text-ggreen tabular-nums text-[10px]">+{r.days_taken}d</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
