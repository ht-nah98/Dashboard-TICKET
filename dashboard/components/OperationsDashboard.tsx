"use client";

import { useState, useMemo } from "react";
import { QueueCards } from "@/components/QueueCards";
import { SlaGauge } from "@/components/SlaGauge";
import { NearBreachRadar } from "@/components/NearBreachRadar";
import { AssigneeWorkload } from "@/components/AssigneeWorkload";
import { AssigneePerformance } from "@/components/AssigneePerformance";
import { HandoffLatency } from "@/components/HandoffLatency";
import { EscalationBoard } from "@/components/EscalationBoard";
import { PauseReopen } from "@/components/PauseReopen";
import { OpsAgingWaiting } from "@/components/OpsAgingWaiting";
import { TicketDetailPanel, type TicketDetail } from "@/components/TicketDetailPanel";
import { useFilters } from "@/components/FilterContext";
import { makeOperationsMatcher } from "@/lib/matchFilters";
import type { OperationsPayload } from "@/lib/types";

export function OperationsDashboard({
  data,
  detailMap,
}: {
  data: OperationsPayload;
  detailMap: Record<string, any>;
}) {
  const { filters } = useFilters();
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);

  // Operations is an "action now" view: dateRange is intentionally IGNORED
  // here. Severity uses the ops "warn"/"bad" tone mapping (see matchFilters).
  const matchItem = useMemo(() => makeOperationsMatcher(filters), [filters]);

  const filteredNearBreach = useMemo(() => data.near_breach.filter(matchItem), [data.near_breach, matchItem]);
  const filteredEscalation = useMemo(() => data.escalation_board.filter(matchItem), [data.escalation_board, matchItem]);

  function openDetail(item: any) {
    const full = detailMap[item.id];
    if (full) {
      setSelectedTicket({
        id: full.id,
        code: full.code,
        type: full.type,
        current_state: full.current_state,
        channel_name: full.channel_name,
        project_name: full.project_name,
        network_name: full.network_name,
        created_at: full.created_at,
        affected_revenue_vnd: full.affected_revenue_vnd,
        is_urgent: full.is_urgent,
        claim_type: full.claim_type,
        claimer: full.claimer,
        current_step: full.current_step,
        current_owner: full.current_owner,
        hours_in_current_step: full.hours_in_current_step,
        sla_hours: full.sla_hours,
        overdue_ratio: full.overdue_ratio,
        days_open: full.days_open,
        resolution_direction: full.resolution_direction,
        timeline: full.timeline,
        sla_steps: full.sla_steps,
      });
    } else {
      setSelectedTicket({
        id: item.id,
        code: item.code,
        type: item.type,
        current_state: item.current_state ?? "processing",
        channel_name: item.channel_name,
        project_name: item.project_name ?? "—",
        created_at: item.created_at ?? new Date().toISOString(),
        affected_revenue_vnd: item.revenue_at_risk ?? 0,
        is_urgent: item.is_urgent ?? false,
        current_step: item.waiting_side ?? item.current_step,
        hours_in_current_step: item.hours_open,
        days_open: item.days_open,
      });
    }
  }

  const activeFilterNote = filters.types.length > 0 || filters.channelId
    ? ` · lọc: ${[filters.types.join(", "), filters.channelId ? `kênh ${filters.channelName}` : ""].filter(Boolean).join(", ")}`
    : "";

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-gink">Kiểm soát Vận hành</h1>
          <p className="text-[13px] text-gmuted">
            Cho Manager / VH Lead · {data.totals.open_tickets} ticket đang mở ·{" "}
            {data.sla.pct_within}% còn trong SLA{activeFilterNote}
          </p>
        </div>
        <div className="text-[12px] text-gmuted">
          Bộ lọc thời gian không áp dụng trên trang này
        </div>
      </div>

      {/* Row 1 — Queue summary */}
      <section>
        <QueueCards data={data.queue} />
      </section>

      {/* Row 2 — SLA + Near breach */}
      <section className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-4 flex">
          <SlaGauge data={data.sla} />
        </div>
        <div className="col-span-8 flex">
          <NearBreachRadar data={filteredNearBreach} onRowClick={openDetail} />
        </div>
      </section>

      {/* Row 2.5 — Aging + Waiting split */}
      <section>
        <OpsAgingWaiting aging={data.aging} waiting={data.waiting_split} />
      </section>

      {/* Row 3 — Workload + Performance */}
      <section className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-6 flex">
          <AssigneeWorkload data={data.assignee_workload} />
        </div>
        <div className="col-span-6 flex">
          <AssigneePerformance data={data.assignee_perf} />
        </div>
      </section>

      {/* Row 4 — Handoff + Pause/Reopen */}
      <section className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-7 flex">
          <HandoffLatency data={data.handoff_latency} />
        </div>
        <div className="col-span-5 flex">
          <PauseReopen data={data.pause_reopen} />
        </div>
      </section>

      {/* Row 5 — Escalation board */}
      <section>
        <EscalationBoard data={filteredEscalation} onRowClick={openDetail} />
      </section>

      <footer className="text-[11px] text-gmuted text-center py-6">
        QLK Ticket Dashboard · dữ liệu tổng hợp lúc {new Date(data.generated_at).toLocaleString("vi-VN")} · Trang Vận hành
      </footer>

      <TicketDetailPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
}
