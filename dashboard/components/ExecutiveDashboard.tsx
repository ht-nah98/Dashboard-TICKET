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
import { TicketDetailPanel, type TicketDetail } from "@/components/TicketDetailPanel";
import { useFilters } from "@/components/FilterContext";
import type { DerivedPayload } from "@/lib/types";

export function ExecutiveDashboard({ data }: { data: DerivedPayload }) {
  const { filters, toggleType, setChannel } = useFilters();
  const [detailTicket, setDetailTicket] = useState<TicketDetail | null>(null);

  // Project name lookup from projectId
  const PROJECT_NAMES: Record<string, string> = {
    "PRJ-0001": "Âm Nhạc Việt",
    "PRJ-0002": "Giải Trí 24h",
    "PRJ-0003": "Vlog Cuộc Sống",
    "PRJ-0004": "Phim Hoạt Hình",
    "PRJ-0005": "Học Tập Online",
  };

  // Filter channels_top by active filters
  const filteredChannels = useMemo(() => {
    return data.channels_top.filter((ch) => {
      if (filters.channelId && ch.channel_id !== filters.channelId) return false;
      if (filters.projectId) {
        const projName = PROJECT_NAMES[filters.projectId];
        if (projName && ch.project_name !== projName) return false;
      }
      if (filters.severity && ch.severity !== filters.severity) return false;
      return true;
    });
  }, [data.channels_top, filters]);

  // Filter type risk and volume trend by type filter
  const filteredTypeRisk = useMemo(() => {
    if (filters.types.length === 0) return data.type_risk;
    return data.type_risk.filter((t) => filters.types.includes(t.type as any));
  }, [data.type_risk, filters.types]);

  const filteredVolumeTrend = useMemo(() => {
    if (filters.types.length === 0) return data.volume_trend;
    return data.volume_trend.map((row) => {
      const filtered: any = { week: row.week };
      for (const ty of filters.types) {
        filtered[ty] = (row as any)[ty] ?? 0;
      }
      return filtered;
    });
  }, [data.volume_trend, filters.types]);

  // KPI tile click → open drill-down with representative ticket detail
  function handleKpiClick(key: string) {
    // Map KPI key to a mock representative ticket for now
    // In production this would open a filtered list panel
    const mockTicket: TicketDetail = {
      id: key,
      code: `KPI: ${key}`,
      type: "CLAIM",
      current_state: "processing",
      channel_name: "Xem chi tiết",
      project_name: "Tất cả project",
      created_at: data.as_of,
      affected_revenue_vnd: 0,
      is_urgent: false,
      current_step: "Xem danh sách đầy đủ trong trang Vận hành",
    };
    setDetailTicket(mockTicket);
  }

  // Channel row click → filter by channel
  function handleChannelClick(channelId: string, channelName: string) {
    if (filters.channelId === channelId) {
      setChannel(null, null); // toggle off
    } else {
      setChannel(channelId, channelName);
    }
  }

  // Type chip click → toggle type filter
  function handleTypeClick(type: string) {
    toggleType(type as any);
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
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-gmuted">
            <span className="chip chip-good">Trực tiếp</span>
            Tự động cập nhật mỗi 5 phút
          </div>
        </div>

        {/* Row 1 — KPI strip (clickable → drill down) */}
        <section>
          <div className="grid grid-cols-6 gap-4">
            {data.kpis.map((k) => (
              <div
                key={k.key}
                onClick={() => handleKpiClick(k.key)}
                className="cursor-pointer rounded-xl transition hover:scale-[1.02] hover:shadow-md"
                title="Click để xem chi tiết"
              >
                <KpiCard kpi={k} />
              </div>
            ))}
          </div>
        </section>

        {/* Row 2 — Revenue */}
        <section>
          <RevenueStrip data={data.revenue} />
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
            <WaitingSplit data={data.waiting_split} onTypeClick={handleTypeClick} />
          </div>
        </section>

        {/* Row 5 — Channels (filtered + clickable) + anomaly */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-8 flex">
            <ChannelLeaderboard
              data={filteredChannels}
              activeChannelId={filters.channelId}
              onChannelClick={handleChannelClick}
              onTypeClick={handleTypeClick}
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

      {/* Ticket detail side panel */}
      <TicketDetailPanel ticket={detailTicket} onClose={() => setDetailTicket(null)} />
    </>
  );
}
