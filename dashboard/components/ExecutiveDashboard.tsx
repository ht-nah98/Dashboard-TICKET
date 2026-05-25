"use client";

import { useState, useMemo } from "react";
import { KpiCard } from "@/components/KpiCard";
import { RevenueStrip } from "@/components/RevenueStrip";
import { VolumeTrend } from "@/components/VolumeTrend";
import { TypeRiskTreemap } from "@/components/TypeRiskTreemap";
import { ProjectHeatmap } from "@/components/ProjectHeatmap";
import { WorkflowFunnel } from "@/components/WorkflowFunnel";
import { Aging } from "@/components/Aging";
import { WaitingSplit } from "@/components/WaitingSplit";
import { ChannelLeaderboard } from "@/components/ChannelLeaderboard";
import { AnomalyFeed } from "@/components/AnomalyFeed";
import { OutcomeTrend } from "@/components/OutcomeTrend";
import { TicketDetailPanel, type TicketDetail } from "@/components/TicketDetailPanel";
import { TicketListPanel, type ListRow, detailToListRow, listRowToDetail } from "@/components/TicketListPanel";
import { useFilters } from "@/components/FilterContext";
import type { DerivedPayload } from "@/lib/types";

// Number of weeks to keep based on dateRange filter
function weeksForRange(dr: string): number {
  if (dr === "7d") return 1;
  if (dr === "30d") return 4;
  if (dr === "90d") return 12;
  return 12; // "all"
}

export function ExecutiveDashboard({
  data,
  detailMap = {},
}: {
  data: DerivedPayload;
  detailMap?: Record<string, any>;
}) {
  const { filters, toggleType, setChannel, setSeverity } = useFilters();
  const [detailTicket, setDetailTicket] = useState<TicketDetail | null>(null);
  const [listPanel, setListPanel] = useState<{ title: string; subtitle?: string; rows: ListRow[] } | null>(null);

  // ---- Filter channels_top ----
  const filteredChannels = useMemo(() => {
    return data.channels_top.filter((ch) => {
      if (filters.channelId && ch.channel_id !== filters.channelId) return false;
      if (filters.projectId) {
        // Compare by name (channels_top carries project_name not id) — Phase 2 will use id.
        // For now, also keep the row if its project_name is unknown to avoid blanking out.
        // We don't have an id->name map here, so accept any row whose project_name is non-empty.
      }
      if (filters.severity && ch.severity !== filters.severity) return false;
      return true;
    });
  }, [data.channels_top, filters]);

  // ---- type-filtered trend + treemap ----
  const filteredTypeRisk = useMemo(() => {
    if (filters.types.length === 0) return data.type_risk;
    return data.type_risk.filter((t) => filters.types.includes(t.type as any));
  }, [data.type_risk, filters.types]);

  const filteredVolumeTrend = useMemo(() => {
    const slice = filters.dateRange === "all"
      ? data.volume_trend
      : data.volume_trend.slice(-weeksForRange(filters.dateRange));
    if (filters.types.length === 0) return slice;
    return slice.map((row) => {
      const filtered: any = { week: row.week };
      for (const ty of filters.types) {
        filtered[ty] = (row as any)[ty] ?? 0;
      }
      return filtered;
    });
  }, [data.volume_trend, filters.types, filters.dateRange]);

  const filteredRevenue = useMemo(() => {
    const n = weeksForRange(filters.dateRange);
    if (filters.dateRange === "all") return data.revenue;
    return { ...data.revenue, weekly: data.revenue.weekly.slice(-n) };
  }, [data.revenue, filters.dateRange]);

  // ---- KPI drill-down: open a real list of tickets that match the KPI ----
  function handleKpiClick(key: string) {
    const allDetails = Object.values(detailMap);
    let rows: any[] = [];
    let title = "";
    let subtitle = "";

    switch (key) {
      case "open":
        rows = allDetails.filter((d: any) => !["completed", "closed", "failed"].includes(d.current_state));
        title = "Ticket đang mở";
        subtitle = `${rows.length} ticket chưa kết thúc`;
        break;
      case "critical":
        rows = allDetails.filter((d: any) =>
          !["completed", "closed", "failed"].includes(d.current_state) &&
          (d.is_urgent || (d.overdue_ratio ?? 0) >= 1)
        );
        title = "Ticket critical";
        subtitle = "Khẩn cấp hoặc đã trễ SLA";
        break;
      case "breached":
        rows = allDetails.filter((d: any) =>
          !["completed", "closed", "failed"].includes(d.current_state) &&
          (d.overdue_ratio ?? 0) >= 1
        );
        title = "Ticket trễ SLA theo bước";
        subtitle = "Quá thời gian xử lý cho bước hiện tại";
        break;
      case "revenue_risk":
        rows = allDetails
          .filter((d: any) =>
            !["completed", "closed", "failed"].includes(d.current_state) &&
            (d.affected_revenue_vnd ?? 0) > 0
          )
          .sort((a: any, b: any) => (b.affected_revenue_vnd ?? 0) - (a.affected_revenue_vnd ?? 0));
        title = "Ticket có doanh thu rủi ro";
        subtitle = "Sắp xếp theo doanh thu lớn nhất";
        break;
      case "success_rate":
        rows = allDetails.filter((d: any) => d.current_state === "completed");
        title = "Ticket đã hoàn thành (tháng này)";
        subtitle = "Đã giải quyết thành công";
        break;
      case "mttr":
        rows = allDetails
          .filter((d: any) => d.current_state === "completed")
          .slice(0, 50);
        title = "Mẫu ticket dùng để tính MTTR";
        subtitle = "50 ticket hoàn thành gần nhất";
        break;
      default:
        return;
    }

    // Apply current page filters too
    if (filters.types.length > 0) rows = rows.filter((d) => filters.types.includes(d.type));
    if (filters.channelId) rows = rows.filter((d) => d.channel_id === filters.channelId);

    setListPanel({ title, subtitle, rows: rows.map(detailToListRow) });
  }

  // ---- Channel row click → filter by channel (toggle) ----
  function handleChannelClick(channelId: string, channelName: string) {
    if (filters.channelId === channelId) setChannel(null, null);
    else setChannel(channelId, channelName);
  }

  // ---- Severity chip on channel row → set severity filter ----
  function handleSeverityClick(sev: "critical" | "high" | "medium" | "low") {
    setSeverity(filters.severity === sev ? null : sev);
  }

  // ---- Type chip click ----
  function handleTypeClick(type: string) {
    toggleType(type as any);
  }

  // ---- Open detail panel from list panel row ----
  function openDetailFromList(row: ListRow) {
    const full = detailMap[row.id];
    setDetailTicket(full ? {
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
    } : listRowToDetail(row));
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-medium text-gink">Tổng quan Điều hành</h1>
            <p className="text-[13px] text-gmuted">
              {data.totals.total_tickets} tổng · {data.totals.open_tickets} đang mở · {data.totals.completed_tickets} hoàn thành
              {filters.channelId && <span className="text-gblue ml-2">· lọc: {filters.channelName}</span>}
              {filters.types.length > 0 && <span className="text-gblue ml-2">· loại: {filters.types.join(", ")}</span>}
              {filters.severity && <span className="text-gblue ml-2">· mức: {filters.severity}</span>}
            </p>
          </div>
          <div className="text-[12px] text-gmuted">
            Click KPI hoặc ô để xem danh sách
          </div>
        </div>

        {/* Row 1 — KPI strip (clickable → real drill down) */}
        <section>
          <div className="grid grid-cols-6 gap-4">
            {data.kpis.map((k) => (
              <div
                key={k.key}
                onClick={() => handleKpiClick(k.key)}
                className="cursor-pointer rounded-xl transition hover:scale-[1.02] hover:shadow-md"
                title="Click để xem danh sách ticket"
              >
                <KpiCard kpi={k} />
              </div>
            ))}
          </div>
        </section>

        {/* Row 2 — Revenue */}
        <section>
          <RevenueStrip data={filteredRevenue} />
        </section>

        {/* Row 3 — Trend + type risk (type-filtered) */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-7 flex">
            <VolumeTrend data={filteredVolumeTrend} />
          </div>
          <div className="col-span-5 flex">
            <TypeRiskTreemap data={filteredTypeRisk} onTypeClick={handleTypeClick} />
          </div>
        </section>

        {/* Row 3.25 — Outcome trend */}
        <section>
          <OutcomeTrend data={data.outcome_trend} />
        </section>

        {/* Row 3.5 — heatmap */}
        <section>
          <ProjectHeatmap data={data.project_type_heatmap} />
        </section>

        {/* Row 4 — Funnel, aging, waiting */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-5 flex">
            <WorkflowFunnel data={data.funnel} />
          </div>
          <div className="col-span-4 flex">
            <Aging data={data.aging} />
          </div>
          <div className="col-span-3 flex">
            <WaitingSplit data={data.waiting_split} />
          </div>
        </section>

        {/* Row 5 — Channels (filtered + clickable) + anomaly */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-8 flex">
            <ChannelLeaderboard
              data={filteredChannels}
              activeChannelId={filters.channelId}
              onChannelClick={handleChannelClick}
              onSeverityClick={handleSeverityClick}
            />
          </div>
          <div className="col-span-4 flex">
            <AnomalyFeed data={data.anomalies} />
          </div>
        </section>

        <footer className="text-[11px] text-gmuted text-center py-6">
          QLK Ticket Dashboard · {new Date(data.generated_at).toLocaleString("vi-VN")}
        </footer>
      </div>

      {/* Drill-down list panel */}
      {listPanel && (
        <TicketListPanel
          title={listPanel.title}
          subtitle={listPanel.subtitle}
          rows={listPanel.rows}
          onClose={() => setListPanel(null)}
          onRowClick={(row) => { setListPanel(null); openDetailFromList(row); }}
        />
      )}

      {/* Full ticket detail panel */}
      <TicketDetailPanel ticket={detailTicket} onClose={() => setDetailTicket(null)} />
    </>
  );
}
