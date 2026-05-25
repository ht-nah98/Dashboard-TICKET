import { AppShell } from "@/components/AppShell";
import { KpiCard } from "@/components/KpiCard";
import { RootPareto } from "@/components/RootPareto";
import { RootBottleneck } from "@/components/RootBottleneck";
import { RootReturnAnalysis } from "@/components/RootReturnAnalysis";
import { RootResolutionEffect } from "@/components/RootResolutionEffect";
import { RootRepeatChannels } from "@/components/RootRepeatChannels";
import { RootWeeklyFail } from "@/components/RootWeeklyFail";
import { RootProcessComplexity } from "@/components/RootProcessComplexity";
import { RiskyAssets } from "@/components/RiskyAssets";
import { PreventionRecommendations } from "@/components/PreventionRecommendations";
import { ResourceBreakdown } from "@/components/ResourceBreakdown";
import type { RootPayload } from "@/lib/derive_root";
import rootData from "@/derived/root.json";

const data = rootData as unknown as RootPayload;

export default function RootPage() {
  const {
    root_kpis,
    resource_breakdown,
    pareto,
    step_bottlenecks,
    repeat_offender_channels,
    return_analysis,
    resolution_effectiveness,
    weekly_fail_trend,
    process_complexity,
    risky_assets,
    prevention_recommendations,
  } = data;

  return (
    <AppShell asOf={data.as_of} activePage="root" pageTitle="Nguyên nhân gốc & Phòng ngừa">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* Row 1 — KPI strip (4 tiles) */}
        <section className="grid grid-cols-4 gap-4">
          {root_kpis.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
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

        {/* Row 5 — Resource breakdown (full width) */}
        <section>
          <ResourceBreakdown
            summary={resource_breakdown.summary}
            trend={resource_breakdown.trend}
          />
        </section>

        {/* Row 6 — Repeat offender channels (full width) */}
        <section>
          <RootRepeatChannels data={repeat_offender_channels} />
        </section>

        {/* Row 6 — Risky Assets + Prevention Recommendations */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-7 flex">
            <RiskyAssets data={risky_assets} />
          </div>
          <div className="col-span-5 flex">
            <PreventionRecommendations data={prevention_recommendations} />
          </div>
        </section>

      </div>
    </AppShell>
  );
}

