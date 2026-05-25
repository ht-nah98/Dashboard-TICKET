import clsx from "clsx";
import { formatNumber } from "@/lib/format";

const TONE: Record<string, string> = {
  neutral: "border-gborder",
  warn: "border-l-4 border-l-gamber",
  bad: "border-l-4 border-l-gred",
  good: "border-l-4 border-l-ggreen",
};

const ICON: Record<string, string> = {
  new_today: "inbox",
  in_progress: "play_circle",
  wait_seo: "schedule",
  wait_vhyt: "schedule",
  paused: "pause_circle",
  near_breach: "warning",
};

export function QueueCards({ data }: { data: { key: string; label: string; value: number; tone: string }[] }) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {data.map((q) => (
        <div key={q.key} className={clsx("gcard p-3 flex items-center gap-3", TONE[q.tone])}>
          <span className="material-symbols-outlined text-gmuted" style={{ fontSize: 22 }}>
            {ICON[q.key] ?? "circle"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-gmuted">{q.label}</div>
            <div className="kpi-num text-[22px] leading-[28px] font-medium">{formatNumber(q.value)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
