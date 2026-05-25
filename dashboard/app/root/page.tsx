import { AppShell } from "@/components/AppShell";
import { RootPareto } from "@/components/RootPareto";
import { RootBottleneck } from "@/components/RootBottleneck";
import { RootReturnAnalysis } from "@/components/RootReturnAnalysis";
import { RootResolutionEffect } from "@/components/RootResolutionEffect";
import { RootRepeatChannels } from "@/components/RootRepeatChannels";
import { RootWeeklyFail } from "@/components/RootWeeklyFail";
import { RootProcessComplexity } from "@/components/RootProcessComplexity";
import type { RootPayload } from "@/lib/derive_root";
import rootData from "@/derived/root.json";

const data = rootData as unknown as RootPayload;

export default function RootPage() {
  const {
    pareto,
    step_bottlenecks,
    repeat_offender_channels,
    return_analysis,
    resolution_effectiveness,
    weekly_fail_trend,
    process_complexity,
  } = data;

  const totalFailed = pareto.reduce((s, d) => s + d.failed, 0);
  const totalTickets = pareto.reduce((s, d) => s + d.total, 0);
  const avgFailRate = totalTickets > 0 ? Math.round((totalFailed / totalTickets) * 1000) / 10 : 0;
  const topBottleneck = step_bottlenecks[0];

  return (
    <AppShell asOf={data.as_of} activePage="root" pageTitle="Nguyên nhân gốc & Phòng ngừa">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* Row 1 — KPI strip (4 tiles) */}
        <section className="grid grid-cols-4 gap-4">
          <SummaryTile
            label="Tỷ lệ thất bại tổng thể"
            value={`${avgFailRate}%`}
            sub={`${totalFailed} / ${totalTickets} ticket`}
            tone="warn"
            icon="cancel"
          />
          <SummaryTile
            label="Bước nghẽn hàng đầu"
            value={topBottleneck ? `${topBottleneck.breach_rate}%` : "—"}
            sub={topBottleneck?.step_name ?? "Không có dữ liệu"}
            tone="bad"
            icon="block"
          />
          <SummaryTile
            label="Ticket bị trả về"
            value={`${return_analysis.total_returned}`}
            sub={`${return_analysis.multi_returned} bị trả nhiều lần`}
            tone="warn"
            icon="assignment_return"
          />
          <SummaryTile
            label="Kênh vi phạm lặp lại"
            value={`${repeat_offender_channels.length}`}
            sub="Kênh có 5+ ticket lịch sử"
            tone="neutral"
            icon="repeat"
          />
        </section>

        {/* Row 2 — Pareto (wide) + Bottleneck */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-7 flex">
            <RootPareto data={pareto} />
          </div>
          <div className="col-span-5 flex">
            <RootBottleneck data={step_bottlenecks} />
          </div>
        </section>

        {/* Row 3 — Return analysis + Resolution effectiveness */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-5 flex">
            <RootReturnAnalysis data={return_analysis} />
          </div>
          <div className="col-span-7 flex">
            <RootResolutionEffect data={resolution_effectiveness} />
          </div>
        </section>

        {/* Row 4 — Weekly fail trend + Process complexity */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-7 flex">
            <RootWeeklyFail data={weekly_fail_trend} />
          </div>
          <div className="col-span-5 flex">
            <RootProcessComplexity data={process_complexity} />
          </div>
        </section>

        {/* Row 5 — Repeat offender channels (full width) */}
        <section>
          <RootRepeatChannels data={repeat_offender_channels} />
        </section>

      </div>
    </AppShell>
  );
}

function SummaryTile({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "neutral" | "good" | "warn" | "bad";
  icon: string;
}) {
  const TONE_COLOR: Record<string, string> = {
    neutral: "#1A73E8",
    good: "#1E8E3E",
    warn: "#F9AB00",
    bad: "#D93025",
  };
  const TONE_BG: Record<string, string> = {
    neutral: "#E8F0FE",
    good: "#E6F4EA",
    warn: "#FEF7E0",
    bad: "#FCE8E6",
  };
  const color = TONE_COLOR[tone];
  const bg = TONE_BG[tone];

  return (
    <div className="gcard p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>{icon}</span>
        </div>
        <div className="text-[12px] text-gmuted leading-tight">{label}</div>
      </div>
      <div className="text-[22px] font-medium tabular-nums leading-none" style={{ color }}>{value}</div>
      <div className="text-[11px] text-gmuted leading-tight truncate">{sub}</div>
    </div>
  );
}
