"use client";

import { useState, useMemo } from "react";
import { SeoActionQueue } from "@/components/SeoActionQueue";
import { SeoWaitingVhyt } from "@/components/SeoWaitingVhyt";
import { SeoReturnedCorrection } from "@/components/SeoReturnedCorrection";
import { SeoWeeklyTrend } from "@/components/SeoWeeklyTrend";
import { SeoRepeatChannels } from "@/components/SeoRepeatChannels";
import { SeoReapplyTracker } from "@/components/SeoReapplyTracker";
import { WhitelistPipeline } from "@/components/WhitelistPipeline";
import { SeoRecentOutcomes } from "@/components/SeoRecentOutcomes";
import { TicketDetailPanel, type TicketDetail } from "@/components/TicketDetailPanel";
import { useFilters } from "@/components/FilterContext";
import { KpiCard } from "@/components/KpiCard";
import { makeActionMatcher, makeHistoryMatcher } from "@/lib/matchFilters";
import type { SeoPayload } from "@/lib/derive_seo";

export function SeoDashboard({ data, detailMap = {} }: { data: SeoPayload; detailMap?: Record<string, any> }) {
  const { filters, toggleType, setChannel } = useFilters();
  const [detailTicket, setDetailTicket] = useState<TicketDetail | null>(null);
  const { kpis, action_queue, waiting_on_vhyt, returned_for_correction, recent_outcomes, weekly_trend, repeat_channels, reapply_tracker, whitelist_pipeline } = data;

  const NOW_MS = new Date("2026-05-23T09:00:00+07:00").getTime();

  // Action queues are time-agnostic (matchAction). Recent outcomes use the
  // history matcher so "last 7d" still makes sense for completed/failed rows.
  const matchAction = useMemo(() => makeActionMatcher(filters), [filters]);
  const matchHistory = useMemo(() => makeHistoryMatcher(filters, NOW_MS), [filters, NOW_MS]);

  const filteredActionQueue = useMemo(() => action_queue.filter(matchAction),
    [action_queue, matchAction]);
  const filteredWaitingVhyt = useMemo(() => waiting_on_vhyt.filter(matchAction),
    [waiting_on_vhyt, matchAction]);
  const filteredReturned = useMemo(() => returned_for_correction.filter(matchAction),
    [returned_for_correction, matchAction]);
  const filteredOutcomes = useMemo(() => recent_outcomes.filter(matchHistory),
    [recent_outcomes, matchHistory]);
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
          {data.kpi_cards.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
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
          <WhitelistPipeline {...whitelist_pipeline} />
        </section>

        <section>
          <SeoReapplyTracker data={reapply_tracker} />
        </section>
      </div>

      <TicketDetailPanel ticket={detailTicket} onClose={() => setDetailTicket(null)} />
    </>
  );
}

