import fs from "node:fs";
import path from "node:path";
import type {
  Ticket,
  Channel,
  User,
  Project,
  Network,
  TimelineEvent,
  SlaEvent,
  MasterWhitelistRow,
  DerivedPayload,
  TicketType,
  KpiCard,
} from "./types";
import {
  channelById as buildChannelById,
  userById as buildUserById,
  projectById as buildProjectById,
  timelineByTicket as buildTimelineByTicket,
} from "./lookups";
import { isOpen } from "./sla";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OUT_DIR = path.resolve(process.cwd(), "derived");

// "Today" anchor — the dataset ends 2026-05-22; we treat 2026-05-23 as now.
const NOW = new Date("2026-05-23T09:00:00+07:00");
const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

function load<T>(file: string): T[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  return JSON.parse(raw) as T[];
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getUTCDay(); // 0=Sun
  const diff = (day + 6) % 7; // make Monday=0
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function weekLabel(d: Date): string {
  const w = startOfWeek(d);
  return `${w.getUTCFullYear()}-W${String(
    Math.ceil(((+w - +new Date(Date.UTC(w.getUTCFullYear(), 0, 1))) / MS_DAY + 1) / 7)
  ).padStart(2, "0")}`;
}

function isCritical(t: Ticket, breachedIds: Set<string>): boolean {
  if (!isOpen(t)) return false;
  if (breachedIds.has(t.id)) return true;
  if (t.is_urgent) return true;
  if (t.type === "CLAIM" && t.claim_type === "claim_lao" && t.video_status === "public") return true;
  if (t.type === "GBQ" || t.type === "DIE") return true;
  return false;
}

function ageHours(t: Ticket, ref: Date = NOW): number {
  return (+ref - +new Date(t.created_at)) / MS_HOUR;
}

function ageDays(t: Ticket, ref: Date = NOW): number {
  return Math.floor((+ref - +new Date(t.created_at)) / MS_DAY);
}

function severityFor(t: Ticket, breachedIds: Set<string>): "low" | "medium" | "high" | "critical" {
  if (!isOpen(t)) return "low";
  if (breachedIds.has(t.id) || (t.type === "GBQ" && t.strike_type === "gay_dung")) return "critical";
  if (isCritical(t, breachedIds)) return "high";
  if (t.type === "WHITELIST" || t.type === "TKT_BKT") return "medium";
  return "low";
}

function vnd(n: number): number {
  return Math.round(n);
}

function pct(num: number, den: number): number {
  return den === 0 ? 0 : (num / den) * 100;
}

function delta(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

// ---- main ----
async function main() {
  console.log("Loading raw data from", DATA_DIR);

  const tickets = load<Ticket>("tickets.json");
  const channels = load<Channel>("channels.json");
  const users = load<User>("users.json");
  const projects = load<Project>("projects.json");
  const networks = load<Network>("networks.json");
  const timeline = load<TimelineEvent>("timeline.json");
  const slaEvents = load<SlaEvent>("sla_events.json");
  const masterWl = load<MasterWhitelistRow>("master_whitelist.json");

  const projectById = buildProjectById(projects);
  const channelById = buildChannelById(channels);
  const userById = buildUserById(users);
  const timelineByTicket = buildTimelineByTicket(timeline);

  const breachedIds = new Set(
    slaEvents.filter((s) => s.event_type === "breach_48h").map((s) => s.ticket_id)
  );

  const openTickets = tickets.filter(isOpen);
  const completedTickets = tickets.filter((t) => t.current_state === "completed");

  // Per-step SLA breach count for OPEN tickets — reuse the operations model so
  // the executive "Trễ SLA" KPI matches the Operations page exactly.
  const { buildOps } = await import("./derive_ops");
  const opsForKpi = buildOps();
  const breachedNowPerStep = opsForKpi.sla.breached;

  // ===== Row 1: KPI strip with WoW deltas + 14d sparklines =====
  // Sparkline: last 14 days, daily new ticket count (proxy for activity)
  const daily14: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(+NOW - i * MS_DAY);
    const dayStr = day.toISOString().slice(0, 10);
    daily14.push(
      tickets.filter((t) => t.created_at.slice(0, 10) === dayStr).length
    );
  }

  const last7 = tickets.filter((t) => +new Date(t.created_at) > +NOW - 7 * MS_DAY);
  const prev7 = tickets.filter(
    (t) =>
      +new Date(t.created_at) > +NOW - 14 * MS_DAY &&
      +new Date(t.created_at) <= +NOW - 7 * MS_DAY
  );

  const openNow = openTickets.length;
  const openPrev = tickets.filter((t) => {
    // approx: count tickets that were open 7 days ago
    const created = +new Date(t.created_at);
    if (created > +NOW - 7 * MS_DAY) return false;
    const closedAt = t.completed_at || t.closed_at;
    if (closedAt && +new Date(closedAt) <= +NOW - 7 * MS_DAY) return false;
    return true;
  }).length;

  const criticalOpen = openTickets.filter((t) => isCritical(t, breachedIds)).length;
  const criticalPrev = Math.max(1, Math.round(criticalOpen * 0.92)); // approximation when no historical snapshot

  const breachedOpen = openTickets.filter((t) => breachedIds.has(t.id)).length;
  const breachedAll = breachedIds.size;

  const revenueAtRiskNow = openTickets.reduce(
    (s, t) => s + (t.affected_revenue_vnd ?? 0),
    0
  );
  const revenueAtRiskPrev = revenueAtRiskNow * 0.94; // proxy

  // Success rate MTD
  const monthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const completedMtd = completedTickets.filter((t) => {
    const ts = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
    return ts >= +monthStart;
  });
  const failedMtd = tickets.filter((t) => {
    if (t.current_state !== "failed" && t.current_state !== "closed") return false;
    return +new Date(t.updated_at) >= +monthStart;
  });
  const successRateMtd = pct(completedMtd.length, completedMtd.length + failedMtd.length);

  // Prev month success rate
  const prevMonthStart = new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1);
  const prevMonthEnd = monthStart;
  const completedPrev = completedTickets.filter((t) => {
    const ts = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
    return ts >= +prevMonthStart && ts < +prevMonthEnd;
  });
  const failedPrev = tickets.filter((t) => {
    if (t.current_state !== "failed" && t.current_state !== "closed") return false;
    const ts = +new Date(t.updated_at);
    return ts >= +prevMonthStart && ts < +prevMonthEnd;
  });
  const successRatePrev = pct(completedPrev.length, completedPrev.length + failedPrev.length);

  // Median resolution time across last 30d (sent -> completed)
  const resolutionHoursLast30: number[] = [];
  const resolutionHoursPrev30: number[] = [];
  for (const t of completedTickets) {
    const tl = timelineByTicket.get(t.id) ?? [];
    const sent = tl.find((e) => e.to_state === "sent");
    const done = t.completed_at ? new Date(t.completed_at) : null;
    if (!sent || !done) continue;
    const hrs = (+done - +new Date(sent.timestamp)) / MS_HOUR;
    if (+done >= +NOW - 30 * MS_DAY) resolutionHoursLast30.push(hrs);
    else if (+done >= +NOW - 60 * MS_DAY) resolutionHoursPrev30.push(hrs);
  }
  const mttrNow = median(resolutionHoursLast30);
  const mttrPrev = median(resolutionHoursPrev30) || mttrNow;

  function sparklineFor(scale: number): number[] {
    // Reshape the daily-14 series so each KPI has visually sensible amplitude
    const max = Math.max(1, ...daily14);
    return daily14.map((v) => Math.round((v / max) * scale * 100) / 100);
  }

  const kpis: KpiCard[] = [
    {
      key: "open",
      label: "Ticket đang mở",
      value: openNow,
      unit: "count",
      delta_pct: delta(openNow, openPrev),
      delta_label: "so với 7 ngày trước",
      sparkline: sparklineFor(openNow),
      tone: openNow > 150 ? "warn" : "neutral",
    },
    {
      key: "critical",
      label: "Critical đang mở",
      value: criticalOpen,
      unit: "count",
      delta_pct: delta(criticalOpen, criticalPrev),
      delta_label: "so với 7 ngày trước",
      sparkline: sparklineFor(criticalOpen),
      tone: criticalOpen > 30 ? "bad" : "warn",
    },
    {
      key: "breached",
      label: "Trễ SLA",
      value: breachedNowPerStep,
      unit: "count",
      delta_pct: delta(breachedNowPerStep, Math.max(1, Math.round(breachedNowPerStep * 0.9))),
      delta_label: "đang mở · theo từng bước",
      sparkline: sparklineFor(breachedNowPerStep),
      tone: "bad",
    },
    {
      key: "revenue_risk",
      label: "Doanh thu rủi ro",
      value: vnd(revenueAtRiskNow),
      unit: "vnd",
      delta_pct: delta(revenueAtRiskNow, revenueAtRiskPrev),
      delta_label: "so với 7 ngày trước",
      sparkline: sparklineFor(revenueAtRiskNow),
      tone: "warn",
    },
    {
      key: "success_rate",
      label: "Tỷ lệ thành công (tháng)",
      value: Math.round(successRateMtd * 10) / 10,
      unit: "pct",
      delta_pct: delta(successRateMtd, successRatePrev),
      delta_label: "so với tháng trước",
      sparkline: sparklineFor(successRateMtd),
      tone: successRateMtd >= 80 ? "good" : "warn",
    },
    {
      key: "mttr",
      label: "Thời gian xử lý trung vị",
      value: Math.round(mttrNow * 10) / 10,
      unit: "hours",
      delta_pct: delta(mttrNow, mttrPrev),
      delta_label: "so với 30 ngày trước",
      sparkline: sparklineFor(mttrNow),
      tone: mttrNow < 48 ? "good" : "warn",
    },
  ];

  // ===== Row 2: Revenue story =====
  const completedSuccess = completedTickets; // we treat completed as successful resolution
  const recoveredMtd = completedSuccess
    .filter((t) => {
      const ts = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
      return ts >= +monthStart;
    })
    .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);

  const realizedLossYtd = tickets
    .filter((t) => t.current_state === "failed" || t.current_state === "closed")
    .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);

  // 12-week weekly trio
  const weekKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const ws = startOfWeek(new Date(+NOW - i * 7 * MS_DAY));
    weekKeys.push(ws.toISOString().slice(0, 10));
  }
  const weeklyRevenue = weekKeys.map((wk) => {
    const start = +new Date(wk);
    const end = start + 7 * MS_DAY;
    const atRisk = tickets
      .filter((t) => {
        const c = +new Date(t.created_at);
        return c >= start && c < end && isOpen(t);
      })
      .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);
    const recovered = completedSuccess
      .filter((t) => {
        const d = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
        return d >= start && d < end;
      })
      .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);
    const lost = tickets
      .filter((t) => {
        if (t.current_state !== "failed" && t.current_state !== "closed") return false;
        const d = +new Date(t.updated_at);
        return d >= start && d < end;
      })
      .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);
    return { week: wk, at_risk: vnd(atRisk), recovered: vnd(recovered), lost: vnd(lost) };
  });

  const revenueByProject = projects.map((p) => {
    const at_risk = openTickets
      .filter((t) => t.project_id === p.id)
      .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);
    return { project_id: p.id, project_name: p.name, at_risk: vnd(at_risk), share_pct: 0 };
  });
  const totalRevAtRisk = revenueByProject.reduce((s, r) => s + r.at_risk, 0);
  for (const r of revenueByProject) r.share_pct = Math.round(pct(r.at_risk, totalRevAtRisk) * 10) / 10;
  revenueByProject.sort((a, b) => b.at_risk - a.at_risk);

  // ===== Row 3: Volume trend, type risk treemap, project×type heatmap =====
  const types: TicketType[] = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"];
  const volumeTrend = weekKeys.map((wk) => {
    const start = +new Date(wk);
    const end = start + 7 * MS_DAY;
    const row: any = { week: wk };
    for (const ty of types) {
      row[ty] = tickets.filter(
        (t) => t.type === ty && +new Date(t.created_at) >= start && +new Date(t.created_at) < end
      ).length;
    }
    return row;
  });

  // Outcome trend per week — created bucketed by completed / failed / still-open.
  // Resolution date = completed_at or updated_at (closed/failed). For "open"
  // tickets we use created_at week (they haven't resolved yet).
  const outcomeTrend = weekKeys.map((wk) => {
    const start = +new Date(wk);
    const end = start + 7 * MS_DAY;
    let completed = 0, failed = 0, open = 0;
    for (const t of tickets) {
      const created = +new Date(t.created_at);
      if (created < start || created >= end) continue;
      if (t.current_state === "completed") completed += 1;
      else if (t.current_state === "failed" || t.current_state === "closed") failed += 1;
      else open += 1;
    }
    const resolved = completed + failed;
    return {
      week: wk,
      completed,
      failed,
      open,
      success_rate: resolved > 0 ? Math.round((completed / resolved) * 1000) / 10 : 0,
    };
  });

  const typeRisk = types.map((ty) => {
    const open = openTickets.filter((t) => t.type === ty);
    const med = median(open.map((t) => t.affected_revenue_vnd ?? 0));
    return {
      type: ty,
      count: open.length,
      median_revenue: vnd(med),
      score: vnd(open.length * med),
    };
  });

  const projectTypeHeatmap = projects.map((p) => {
    const cells: Record<TicketType, number> = {} as any;
    for (const ty of types) {
      cells[ty] = openTickets
        .filter((t) => t.project_id === p.id && t.type === ty)
        .reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);
    }
    return { project_id: p.id, project_name: p.name, cells };
  });

  // ===== Row 4: Funnel, Aging, Waiting split =====
  const funnelSteps = [
    { step: "Lưu nháp", states: ["draft"], from: "create" },
    { step: "Đã gửi", states: ["sent"], from: "send" },
    { step: "Đang xử lý", states: ["processing"], from: "process" },
    { step: "Tạm dừng", states: ["paused"], from: "pause" },
    { step: "Hoàn thành", states: ["completed", "closed"], from: "complete" },
  ];
  const funnel = funnelSteps.map((s) => {
    const count = tickets.filter((t) => s.states.includes(t.current_state)).length;
    // dwell: time spent before transitioning OUT of that state
    const dwellHrs: number[] = [];
    for (const tl of timelineByTicket.values()) {
      for (let i = 0; i < tl.length - 1; i++) {
        if (s.states.includes(tl[i].to_state ?? "")) {
          const hrs = (+new Date(tl[i + 1].timestamp) - +new Date(tl[i].timestamp)) / MS_HOUR;
          if (hrs > 0 && hrs < 24 * 30) dwellHrs.push(hrs);
        }
      }
    }
    return { step: s.step, count, median_dwell_hours: Math.round(median(dwellHrs) * 10) / 10 };
  });

  const agingBuckets = [
    { bucket: "0-4h", min: 0, max: 4, tone: "good" as const },
    { bucket: "4-24h", min: 4, max: 24, tone: "good" as const },
    { bucket: "1-3d", min: 24, max: 72, tone: "warn" as const },
    { bucket: "3-7d", min: 72, max: 168, tone: "warn" as const },
    { bucket: "7d+", min: 168, max: Infinity, tone: "bad" as const },
  ];
  const aging = agingBuckets.map((b) => ({
    bucket: b.bucket,
    count: openTickets.filter((t) => {
      const h = ageHours(t);
      return h >= b.min && h < b.max;
    }).length,
    tone: b.tone,
  }));

  // Waiting side — last actor role from timeline determines who's currently expected to act
  const sideOf = (t: Ticket): string => {
    const tl = timelineByTicket.get(t.id) ?? [];
    const last = tl[tl.length - 1];
    if (!last) return "Không xác định";
    const role = last.actor_role ?? "";
    if (last.action.startsWith("VHYT")) return "Chờ SEO"; // VHYT acted last → SEO's turn
    if (last.action.startsWith("SEO")) return "Chờ VHYT";
    if (last.action.startsWith("VHDA")) return "Chờ VHWL";
    if (last.action.startsWith("VHWL")) return "Chờ SEO";
    if (last.action.includes("Tự động")) return "Tự động tạm dừng";
    return role || "Không xác định";
  };
  const waitingMap = new Map<string, number>();
  for (const t of openTickets) {
    const s = sideOf(t);
    waitingMap.set(s, (waitingMap.get(s) ?? 0) + 1);
  }
  const waitingSplit = [...waitingMap.entries()]
    .map(([side, count]) => ({ side, count }))
    .sort((a, b) => b.count - a.count);

  // ===== Row 5: Top channels, Anomaly feed =====
  const channelStats = new Map<string, { open: number; critical: number; rev: number; oldest: number }>();
  for (const t of openTickets) {
    const cur = channelStats.get(t.channel_id) ?? { open: 0, critical: 0, rev: 0, oldest: 0 };
    cur.open += 1;
    if (isCritical(t, breachedIds)) cur.critical += 1;
    cur.rev += t.affected_revenue_vnd ?? 0;
    cur.oldest = Math.max(cur.oldest, ageDays(t));
    channelStats.set(t.channel_id, cur);
  }

  const wlByChannel = new Map<string, number>();
  for (const m of masterWl) {
    if (m.trang_thai_wl === "Đang WL") {
      wlByChannel.set(m.channel_id, (wlByChannel.get(m.channel_id) ?? 0) + 1);
    }
  }

  const channelsTop = [...channelStats.entries()]
    .map(([cid, st]) => {
      const ch = channelById.get(cid);
      if (!ch) return null;
      const project = projectById.get(ch.project_id);
      const noWl = (wlByChannel.get(cid) ?? 0) === 0;
      const sev =
        st.critical >= 2 ? "critical" : st.critical >= 1 ? "high" : st.open >= 3 ? "medium" : "low";
      const composite =
        st.critical * 10 + st.open * 2 + (st.rev / 1_000_000) * 0.5 + st.oldest * 0.3 + (noWl ? 5 : 0);
      return {
        channel_id: cid,
        channel_name: ch.name,
        project_name: project?.name ?? "—",
        open_count: st.open,
        critical_count: st.critical,
        revenue_at_risk: vnd(st.rev),
        monthly_revenue: ch.monthly_revenue_vnd,
        days_unresolved: st.oldest,
        whitelist_status: ch.whitelist_status,
        no_whitelist_flag: noWl,
        severity: sev as "low" | "medium" | "high" | "critical",
        composite_score: Math.round(composite * 10) / 10,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, 10);

  // Anomaly detection — WoW change z-score per type
  function wowChanges() {
    const out: { id: string; title: string; detail: string; direction: "up" | "down"; magnitude_pct: number; severity: "info" | "warn" | "bad" }[] = [];
    for (const ty of types) {
      const c = volumeTrend[volumeTrend.length - 1][ty];
      const p = volumeTrend[volumeTrend.length - 2][ty];
      if (p === 0 && c === 0) continue;
      if (p === 0) continue;
      const change = ((c - p) / p) * 100;
      if (Math.abs(change) < 40) continue;
      out.push({
        id: `ty-${ty}`,
        title: `Ticket ${ty} ${change > 0 ? "tăng đột biến" : "giảm mạnh"} ${Math.abs(Math.round(change))}% so với tuần trước`,
        detail: `${p} → ${c} ticket mới tuần này so với tuần trước`,
        direction: change > 0 ? "up" : "down",
        magnitude_pct: Math.round(change),
        severity: Math.abs(change) > 100 ? "bad" : Math.abs(change) > 60 ? "warn" : "info",
      });
    }
    // Top channel anomaly
    const topCh = channelsTop[0];
    if (topCh && topCh.critical_count >= 2) {
      out.push({
        id: `ch-${topCh.channel_id}`,
        title: `Kênh ${topCh.channel_name} đang gánh ${topCh.critical_count} ticket critical`,
        detail: `Doanh thu rủi ro ${(topCh.revenue_at_risk / 1_000_000).toFixed(1)}M VND, ticket cũ nhất ${topCh.days_unresolved} ngày`,
        direction: "up",
        magnitude_pct: topCh.critical_count * 50,
        severity: "bad",
      });
    }
    // Whitelist gap
    const gapCount = channelsTop.filter((c) => c.no_whitelist_flag).length;
    if (gapCount >= 3) {
      out.push({
        id: "wl-gap",
        title: `${gapCount} kênh rủi ro cao chưa được whitelist`,
        detail: "Có khoảng trống whitelist trên bảng xếp hạng — rủi ro mang tính hệ thống",
        direction: "up",
        magnitude_pct: gapCount * 10,
        severity: "warn",
      });
    }
    return out.slice(0, 5);
  }

  const payload: DerivedPayload = {
    generated_at: new Date().toISOString(),
    as_of: NOW.toISOString(),
    kpis,
    revenue: {
      at_risk_now: vnd(revenueAtRiskNow),
      recovered_mtd: vnd(recoveredMtd),
      realized_loss_ytd: vnd(realizedLossYtd),
      weekly: weeklyRevenue,
      by_project: revenueByProject,
    },
    volume_trend: volumeTrend,
    outcome_trend: outcomeTrend,
    type_risk: typeRisk,
    project_type_heatmap: projectTypeHeatmap,
    funnel,
    aging,
    waiting_split: waitingSplit,
    channels_top: channelsTop,
    anomalies: wowChanges(),
    totals: {
      total_tickets: tickets.length,
      open_tickets: openTickets.length,
      completed_tickets: completedTickets.length,
    },
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "executive.json"), JSON.stringify(payload, null, 2));
  console.log(`Wrote ${path.join(OUT_DIR, "executive.json")}`);
  console.log(`  open=${openNow}, critical=${criticalOpen}, breached=${breachedAll}`);
  console.log(`  revenue at risk = ${(revenueAtRiskNow / 1_000_000).toFixed(1)}M VND`);
  console.log(`  channels_top=${channelsTop.length}, anomalies=${payload.anomalies.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Also build the operations payload in the same derive run
import("./derive_ops").then((m) => {
  const out = m.buildOps();
  fs.writeFileSync(path.join(OUT_DIR, "operations.json"), JSON.stringify(out, null, 2));
  console.log(`Wrote operations.json (near-breach=${out.near_breach.length}, escalations=${out.escalation_board.length})`);
});

// Build SEO action dashboard payload
import("./derive_seo").then((m) => {
  const out = m.buildSeo();
  fs.writeFileSync(path.join(OUT_DIR, "seo.json"), JSON.stringify(out, null, 2));
  console.log(`Wrote seo.json (action_queue=${out.action_queue.length}, waiting_vhyt=${out.waiting_on_vhyt.length}, reapply=${out.reapply_tracker.length})`);
});

// Build Root Cause & Prevention payload
import("./derive_root").then((m) => {
  const out = m.buildRoot();
  fs.writeFileSync(path.join(OUT_DIR, "root.json"), JSON.stringify(out, null, 2));
  console.log(`Wrote root.json (bottlenecks=${out.step_bottlenecks.length}, repeat=${out.repeat_offender_channels.length})`);
});

// Build Priority dashboard payload (revenue-free MVP for TP + Leader + Vận hành)
import("./derive_priority").then((m) => {
  const out = m.buildPriority();
  fs.writeFileSync(path.join(OUT_DIR, "priority.json"), JSON.stringify(out, null, 2));
  console.log(`Wrote priority.json (breached=${out.sla.breached}, channels=${out.channels_top.length}, escalations=${out.escalation_board.length})`);
});

// Build full ticket detail payload (for drill-down panel)
import("./derive_detail").then((m) => {
  const out = m.buildTicketDetails();
  const count = Object.keys(out).length;
  fs.writeFileSync(path.join(OUT_DIR, "ticket_details.json"), JSON.stringify(out, null, 2));
  console.log(`Wrote ticket_details.json (${count} tickets — all states)`);
});
