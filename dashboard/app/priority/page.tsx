import { AppShell } from "@/components/AppShell";
import { KpiCard } from "@/components/KpiCard";
import { VolumeTrend } from "@/components/VolumeTrend";
import { OutcomeTrend } from "@/components/OutcomeTrend";
import { Aging } from "@/components/Aging";
import { WorkflowFunnel } from "@/components/WorkflowFunnel";
import { SlaGauge } from "@/components/SlaGauge";
import { NearBreachRadar } from "@/components/NearBreachRadar";
import { PriorityChannels } from "@/components/PriorityChannels";
import { PriorityEscalation } from "@/components/PriorityEscalation";
import { BreachByRole } from "@/components/BreachByRole";
import { AssigneeLoad } from "@/components/AssigneeLoad";
import { ResourceBreakdown } from "@/components/ResourceBreakdown";
import { RootRepeatChannels } from "@/components/RootRepeatChannels";
import { RootWeeklyFail } from "@/components/RootWeeklyFail";
import { WhitelistPipeline } from "@/components/WhitelistPipeline";
import type { PriorityPayload } from "@/lib/derive_priority";
import priorityData from "@/derived/priority.json";

const data = priorityData as unknown as PriorityPayload;

function SectionLabel({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mt-2 mb-1">
      <span className="material-symbols-outlined text-gblue" style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div className="text-[15px] font-medium text-gink">{title}</div>
        <div className="text-[12px] text-gmuted">{subtitle}</div>
      </div>
    </div>
  );
}

export default function PriorityPage() {
  return (
    <AppShell asOf={data.as_of} activePage="priority" pageTitle="Ưu tiên triển khai">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* ===== Điều hành chung — TP + Leader cùng điểm view ===== */}
        <SectionLabel
          title="Điều hành chung — TP & Leader"
          subtitle="Cùng một bộ chỉ số gốc: trễ SLA, critical, tỷ lệ thành công"
          icon="groups"
        />

        {/* [1] KPI strip (5 thẻ, không doanh thu) */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.kpis.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
        </section>

        {/* [2] Volume + Outcome trend */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-12 lg:col-span-6 flex">
            <VolumeTrend data={data.volume_trend} />
          </div>
          <div className="col-span-12 lg:col-span-6 flex">
            <OutcomeTrend data={data.outcome_trend} />
          </div>
        </section>

        {/* [4] Aging + Funnel */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-12 lg:col-span-5 flex">
            <Aging data={data.aging} />
          </div>
          <div className="col-span-12 lg:col-span-7 flex">
            <WorkflowFunnel data={data.funnel} />
          </div>
        </section>

        {/* [3] Top kênh rủi ro theo điểm ưu tiên */}
        <section>
          <PriorityChannels data={data.channels_top} />
        </section>

        {/* ===== Giám sát đội — chỉ dành cho Leader ===== */}
        <SectionLabel
          title="Giám sát đội — dành riêng cho Leader"
          subtitle="Hai biểu đồ dưới đây phục vụ Leader: tìm nút thắt theo vai trò và cân tải nhân sự"
          icon="supervisor_account"
        />

        <section className="grid grid-cols-12 gap-4 items-stretch">
          {/* Biểu đồ Leader #1 — Trễ SLA theo vai trò */}
          <div className="col-span-12 lg:col-span-5 flex">
            <BreachByRole data={data.breach_by_role} />
          </div>
          {/* Biểu đồ Leader #2 — Tải công việc theo nhân sự */}
          <div className="col-span-12 lg:col-span-7 flex">
            <AssigneeLoad data={data.assignee_workload} />
          </div>
        </section>

        {/* ===== Vận hành — màn hành động ===== */}
        <SectionLabel
          title="Vận hành — hành động hằng ngày"
          subtitle="Cùng định nghĩa SLA & điểm ưu tiên với điều hành ở trên"
          icon="manage_search"
        />

        {/* [5] SLA gauge + Near-breach */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-12 lg:col-span-5 flex">
            <SlaGauge data={data.sla} />
          </div>
          <div className="col-span-12 lg:col-span-7 flex">
            <NearBreachRadar data={data.near_breach} />
          </div>
        </section>

        {/* [6] Escalation board */}
        <section>
          <PriorityEscalation data={data.escalation_board} />
        </section>

        {/* ===== Phân tích & Phòng ngừa — dài hạn ===== */}
        <SectionLabel
          title="Phân tích & Phòng ngừa"
          subtitle="Góc nhìn dài hạn: vì sao vi phạm & ngăn lặp lại — không phải hành động tức thời. (Lưu ý: các thẻ này không hiển thị doanh thu)"
          icon="insights"
        />

        {/* [7] Tài nguyên vi phạm (full width) */}
        <section>
          <ResourceBreakdown
            summary={data.analysis.resource_breakdown.summary}
            trend={data.analysis.resource_breakdown.trend}
          />
        </section>

        {/* [8] Xu hướng thất bại/trả về + Pipeline Whitelist */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-12 lg:col-span-7 flex">
            <RootWeeklyFail data={data.analysis.weekly_fail_trend} />
          </div>
          <div className="col-span-12 lg:col-span-5 flex">
            <WhitelistPipeline
              by_status={data.analysis.whitelist_pipeline.by_status}
              avg_days_to_wl={data.analysis.whitelist_pipeline.avg_days_to_wl}
              recent_wl={data.analysis.whitelist_pipeline.recent_wl}
              pending_applications={data.analysis.whitelist_pipeline.pending_applications}
              total={data.analysis.whitelist_pipeline.total}
            />
          </div>
        </section>

        {/* [9] Kênh vi phạm lặp lại (full width) */}
        <section>
          <RootRepeatChannels data={data.analysis.repeat_offender_channels} />
        </section>

      </div>
    </AppShell>
  );
}
