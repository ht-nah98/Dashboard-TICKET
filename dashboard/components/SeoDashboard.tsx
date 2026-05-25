"use client";

import { useState, useMemo } from "react";
import { SeoActionQueue } from "@/components/SeoActionQueue";
import { SeoWaitingVhyt } from "@/components/SeoWaitingVhyt";
import { SeoReturnedCorrection } from "@/components/SeoReturnedCorrection";
import { SeoWeeklyTrend } from "@/components/SeoWeeklyTrend";
import { SeoRepeatChannels } from "@/components/SeoRepeatChannels";
import { SeoReapplyTracker } from "@/components/SeoReapplyTracker";
import { SeoRecentOutcomes } from "@/components/SeoRecentOutcomes";
import { TicketDetailPanel, type TicketDetail } from "@/components/TicketDetailPanel";
import { useFilters } from "@/components/FilterContext";
import { formatHours } from "@/lib/format";
import type { SeoPayload } from "@/lib/derive_seo";

export function SeoDashboard({ data, detailMap = {} }: { data: SeoPayload; detailMap?: Record<string, any> }) {
  const { filters, toggleType, setChannel } = useFilters();
  const [detailTicket, setDetailTicket] = useState<TicketDetail | null>(null);
  const { kpis, action_queue, waiting_on_vhyt, returned_for_correction, recent_outcomes, weekly_trend, repeat_channels, reapply_tracker } = data;

  const NOW_MS = new Date("2026-05-23T09:00:00+07:00").getTime();

  function matchItem(item: { type: string; channel_id?: string; project_id?: string; network_id?: string; created_at?: string }) {
    if (filters.types.length > 0 && !filters.types.includes(item.type as any)) return false;
    if (filters.channelId && item.channel_id !== filters.channelId) return false;
    if (filters.projectId && item.project_id !== filters.projectId) return false;
    if (filters.networkId && item.network_id !== filters.networkId) return false;
    if (filters.dateRange !== "all" && item.created_at) {
      const days = filters.dateRange === "7d" ? 7 : filters.dateRange === "30d" ? 30 : 90;
      if (NOW_MS - new Date(item.created_at).getTime() > days * 86400000) return false;
    }
    return true;
  }

  const filteredActionQueue = useMemo(() => action_queue.filter(matchItem),
    [action_queue, filters]);
  const filteredWaitingVhyt = useMemo(() => waiting_on_vhyt.filter(matchItem),
    [waiting_on_vhyt, filters]);
  const filteredReturned = useMemo(() => returned_for_correction.filter(matchItem),
    [returned_for_correction, filters]);
  const filteredOutcomes = useMemo(() => recent_outcomes.filter(matchItem),
    [recent_outcomes, filters]);
  const filteredRepeatChannels = useMemo(() =>
    repeat_channels.filter((ch) => !filters.channelId || ch.channel_id === filters.channelId),
    [repeat_channels, filters.channelId]
  );

  function openDetail(item: any) {
    const full = detailMap[item.id];
    if (full) {
      setDetailTicket({
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
      setDetailTicket({
        id: item.id,
        code: item.code,
        type: item.type,
        current_state: item.current_state ?? "processing",
        channel_name: item.channel_name,
        project_name: item.project_name ?? "—",
        created_at: item.created_at ?? data.as_of,
        affected_revenue_vnd: item.revenue_at_risk ?? 0,
        is_urgent: item.is_urgent ?? false,
        current_step: item.current_step,
        hours_in_current_step: item.hours_waiting,
        sla_hours: item.sla_hours,
        overdue_ratio: item.overdue_ratio,
      });
    }
  }

  function handleRepeatChannelClick(channelId: string, channelName: string) {
    if (filters.channelId === channelId) setChannel(null, null);
    else setChannel(channelId, channelName);
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-medium text-gink">Việc của tôi (SEO)</h1>
            <p className="text-[13px] text-gmuted">
              {filteredActionQueue.length} cần hành động · {filteredWaitingVhyt.length} đang chờ VHYT · {filteredReturned.length} bị trả về
              {filters.types.length > 0 && <span className="text-gblue ml-2">· loại: {filters.types.join(", ")}</span>}
              {filters.channelId && <span className="text-gblue ml-2">· kênh: {filters.channelName}</span>}
            </p>
          </div>
        </div>

        {/* Row 1 — KPI strip */}
        <section className="grid grid-cols-6 gap-4">
          <KpiTile label="Ticket đang mở" value={kpis.my_open} tone="neutral" icon="inbox" />
          <KpiTile label="Cần hành động" value={filteredActionQueue.length} tone="bad" icon="priority_high" />
          <KpiTile label="Bị trả về" value={filteredReturned.length} tone="warn" icon="assignment_return" />
          <KpiTile label="Trễ SLA" value={kpis.my_breached} tone="bad" icon="timer_off" />
          <KpiTile label="Tỷ lệ thành công (30d)" value={kpis.my_success_rate_30d} tone="good" icon="verified" unit="%" />
          <KpiTile label="Thời gian xử lý trung vị" value={kpis.avg_resolve_hours} tone="neutral" icon="hourglass_top" unit="h" />
        </section>

        {/* Row 2 — Action queue + Waiting VHYT */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-7 flex">
            <SeoActionQueue data={filteredActionQueue} onRowClick={openDetail} />
          </div>
          <div className="col-span-5 flex">
            <SeoWaitingVhyt data={filteredWaitingVhyt} onRowClick={openDetail} />
          </div>
        </section>

        {/* Row 3 — Returned + Recent outcomes */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-4 flex">
            <SeoReturnedCorrection data={filteredReturned} onRowClick={openDetail} />
          </div>
          <div className="col-span-8 flex">
            <SeoRecentOutcomes data={filteredOutcomes} onRowClick={openDetail} />
          </div>
        </section>

        {/* Row 4 — Weekly trend + Repeat channels */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-6 flex">
            <SeoWeeklyTrend data={weekly_trend} />
          </div>
          <div className="col-span-6 flex">
            <SeoRepeatChannels
              data={filteredRepeatChannels}
              onChannelClick={handleRepeatChannelClick}
              activeChannelId={filters.channelId}
            />
          </div>
        </section>

        {/* Row 5 — Reapply tracker */}
        <section>
          <SeoReapplyTracker data={reapply_tracker} />
        </section>
      </div>

      <TicketDetailPanel ticket={detailTicket} onClose={() => setDetailTicket(null)} />
    </>
  );
}

function KpiTile({ label, value, tone, icon, unit }: { label: string; value: number; tone: string; icon: string; unit?: string }) {
  const TONE_COLOR: Record<string, string> = { neutral: "#1A73E8", good: "#1E8E3E", warn: "#F9AB00", bad: "#D93025" };
  const TONE_BG: Record<string, string> = { neutral: "#E8F0FE", good: "#E6F4EA", warn: "#FEF7E0", bad: "#FCE8E6" };
  const color = TONE_COLOR[tone] ?? "#1A73E8";
  const bg = TONE_BG[tone] ?? "#E8F0FE";
  const displayValue = unit === "%" ? `${value}%` : unit === "h" ? formatHours(value) : value.toString();
  return (
    <div className="gcard p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>{icon}</span>
        </div>
        <div className="text-[12px] text-gmuted leading-tight">{label}</div>
      </div>
      <div className="text-[24px] font-medium tabular-nums leading-none" style={{ color }}>{displayValue}</div>
    </div>
  );
}
