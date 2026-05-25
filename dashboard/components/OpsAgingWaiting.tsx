"use client";

type AgingRow = { bucket: string; count: number; tone: "good" | "warn" | "bad" };
type WaitingRow = { side: string; count: number; owner: string };

const TONE_BG: Record<AgingRow["tone"], string> = {
  good: "bg-ggreen",
  warn: "bg-gamber",
  bad: "bg-gred",
};
const TONE_TXT: Record<AgingRow["tone"], string> = {
  good: "text-ggreen",
  warn: "text-gamber",
  bad: "text-gred",
};

export function OpsAgingWaiting({
  aging,
  waiting,
}: {
  aging: AgingRow[];
  waiting: WaitingRow[];
}) {
  const maxAging = Math.max(1, ...aging.map((a) => a.count));
  const maxWait = Math.max(1, ...waiting.map((w) => w.count));
  const totalOpen = aging.reduce((s, a) => s + a.count, 0);

  return (
    <div className="gcard gcard-fill w-full p-5 grid grid-cols-2 gap-5">
      {/* Aging by current-step dwell */}
      <div className="flex flex-col min-w-0">
        <div className="mb-3 shrink-0">
          <div className="text-[14px] font-medium text-gink">Tuổi của bước hiện tại</div>
          <div className="text-[12px] text-gmuted">{totalOpen} ticket đang mở · phân bổ theo thời gian chờ tại bước</div>
        </div>
        <div className="space-y-2 flex-1">
          {aging.map((a) => {
            const pct = (a.count / maxAging) * 100;
            return (
              <div key={a.bucket} className="flex items-center gap-2">
                <div className="w-14 text-[11px] text-gmuted tabular-nums shrink-0">{a.bucket}</div>
                <div className="flex-1 h-3 bg-gbg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${TONE_BG[a.tone]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className={`w-10 text-right text-[12px] font-medium tabular-nums ${TONE_TXT[a.tone]}`}>
                  {a.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting split (who acts next) */}
      <div className="flex flex-col min-w-0 border-l border-gborder pl-5">
        <div className="mb-3 shrink-0">
          <div className="text-[14px] font-medium text-gink">Đang chờ ai</div>
          <div className="text-[12px] text-gmuted">Bên kế tiếp phải hành động · theo bước hiện tại</div>
        </div>
        <div className="space-y-2 flex-1">
          {waiting.map((w) => {
            const pct = (w.count / maxWait) * 100;
            return (
              <div key={w.side} className="flex items-center gap-2">
                <div className="w-24 text-[11px] text-gink truncate shrink-0" title={w.side}>{w.side}</div>
                <div className="flex-1 h-3 bg-gbg rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gblue" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-10 text-right text-[12px] font-medium tabular-nums text-gink">
                  {w.count}
                </div>
              </div>
            );
          })}
          {waiting.length === 0 && (
            <div className="text-[12px] text-gmuted italic">Không có ticket nào đang chờ.</div>
          )}
        </div>
      </div>
    </div>
  );
}
