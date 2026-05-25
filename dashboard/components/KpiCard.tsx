import { Sparkline } from "./Sparkline";
import { formatKpi, formatDelta } from "@/lib/format";
import type { KpiCard as KpiCardType } from "@/lib/types";
import clsx from "clsx";

const toneRing: Record<KpiCardType["tone"], string> = {
  neutral: "border-gborder",
  good: "border-gborder",
  warn: "border-gborder",
  bad: "border-gborder",
};

const sparkColor: Record<KpiCardType["tone"], string> = {
  neutral: "#1A73E8",
  good: "#1E8E3E",
  warn: "#F9AB00",
  bad: "#D93025",
};

export function KpiCard({ kpi }: { kpi: KpiCardType }) {
  const delta = kpi.delta_pct;
  // For MTTR + Breached, "down" is good; for everything else, "up" is good.
  const inverse = kpi.key === "mttr" || kpi.key === "breached" || kpi.key === "critical" || kpi.key === "revenue_risk" || kpi.key === "open";
  const isPos = delta !== null && delta > 0;
  const goodDir = inverse ? !isPos : isPos;
  const deltaTone = delta === null ? "neutral" : goodDir ? "good" : "bad";

  return (
    <div className={clsx("gcard p-4 flex flex-col gap-2", toneRing[kpi.tone])}>
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-gmuted font-medium">{kpi.label}</div>
        <span
          className={clsx(
            "chip",
            deltaTone === "good" && "chip-good",
            deltaTone === "bad" && "chip-bad",
            deltaTone === "neutral" && "chip-neutral"
          )}
          title={kpi.delta_label}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {delta === null ? "horizontal_rule" : isPos ? "arrow_drop_up" : "arrow_drop_down"}
          </span>
          {formatDelta(delta)}
        </span>
      </div>
      <div className="kpi-num text-[34px] leading-[40px] font-medium">
        {formatKpi(kpi.value, kpi.unit)}
      </div>
      <div className="text-[11px] text-gmuted -mt-1">{kpi.delta_label}</div>
      <div className="mt-1">
        <Sparkline data={kpi.sparkline} color={sparkColor[kpi.tone]} />
      </div>
    </div>
  );
}
