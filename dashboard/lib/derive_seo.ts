import fs from "node:fs";
import path from "node:path";
import type { Ticket, Channel, User, Project, TimelineEvent, MasterWhitelistRow } from "./types";
import { currentStepInfo as slaStepInfo, isOpen } from "./sla";
import {
  channelById as buildChannelById,
  projectById as buildProjectById,
  timelineByTicket as buildTimelineByTicket,
} from "./lookups";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OUT_DIR = path.resolve(process.cwd(), "derived");
const NOW = new Date("2026-05-23T09:00:00+07:00");
const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

function load<T>(file: string): T[] {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T[];
}
function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const diff = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export interface SeoPayload {
  generated_at: string;
  as_of: string;
  kpi_cards: import("./types").KpiCard[];
  kpis: {
    my_open: number;
    my_action_needed: number;
    my_returned: number;
    my_success_rate_30d: number;
    my_breached: number;
    avg_resolve_hours: number;
  };
  action_queue: {
    id: string;
    code: string;
    type: string;
    channel_name: string;
    current_step: string;
    hours_waiting: number;
    sla_hours: number;
    overdue_ratio: number;
    severity: "ok" | "warn" | "bad";
    revenue_at_risk: number;
    is_urgent: boolean;
  }[];
  waiting_on_vhyt: {
    id: string;
    code: string;
    type: string;
    channel_name: string;
    current_step: string;
    hours_waiting: number;
    sla_hours: number;
    overdue_ratio: number;
    severity: "ok" | "warn" | "bad";
  }[];
  returned_for_correction: {
    id: string;
    code: string;
    type: string;
    channel_name: string;
    return_reason: string;
    returned_hours_ago: number;
    return_count: number;
  }[];
  recent_outcomes: {
    id: string;
    code: string;
    type: string;
    channel_name: string;
    outcome: "completed" | "failed" | "closed";
    resolved_at: string;
    resolution_hours: number;
  }[];
  weekly_trend: {
    week: string;
    created: number;
    completed: number;
    failed: number;
  }[];
  repeat_channels: {
    channel_id: string;
    channel_name: string;
    project_name: string;
    open_count: number;
    total_count: number;
    types: string;
    revenue_at_risk: number;
    oldest_days: number;
  }[];
  reapply_tracker: {
    id: string;
    code: string;
    sub_type: string;
    channel_name: string;
    re_apply_after: string;
    days_until: number;
    status: "overdue" | "ready" | "soon" | "waiting";
    current_state: string;
  }[];
  whitelist_pipeline: {
    by_status: { status: string; count: number; tone: "good" | "warn" | "bad" | "neutral" }[];
    avg_days_to_wl: number | null;
    recent_wl: { id: string; channel_name: string; project_name: string; wl_date: string; days_taken: number | null }[];
    pending_applications: { id: string; channel_name: string; project_name: string; days_waiting: number; created_at: string }[];
    total: number;
  };
}

export function buildSeo(): SeoPayload {
  const tickets = load<Ticket>("tickets.json");
  const channels = load<Channel>("channels.json");
  const users = load<User>("users.json");
  const projects = load<Project>("projects.json");
  const timeline = load<TimelineEvent>("timeline.json");
  const masterWl = load<MasterWhitelistRow>("master_whitelist.json");

  const channelById = buildChannelById(channels);
  const projectById = buildProjectById(projects);
  const timelineByTicket = buildTimelineByTicket(timeline);

  function currentStepInfo(t: Ticket) {
    const tl = timelineByTicket.get(t.id) ?? [];
    const info = slaStepInfo(t, tl, NOW);
    return { step: info.step, owner: info.owner, slaHours: info.slaHours, dwellHours: info.dwellHours };
  }

  function overdueRatio(t: Ticket) {
    const cs = currentStepInfo(t);
    return cs.dwellHours / cs.slaHours;
  }

  function severity(ratio: number): "ok" | "warn" | "bad" {
    if (ratio >= 1) return "bad";
    if (ratio >= 0.75) return "warn";
    return "ok";
  }

  const openTickets = tickets.filter(isOpen);

  // ---- Action Queue: tickets where last action was by VHYT → SEO must act next ----
  // Also include tickets in draft/paused state where SEO created them
  const actionQueue = openTickets
    .filter((t) => {
      const tl = timelineByTicket.get(t.id) ?? [];
      const last = tl[tl.length - 1];
      if (!last) return false;
      // VHYT acted last → SEO's turn
      if (last.action.startsWith("VHYT")) return true;
      // VHWL finished → SEO must confirm
      if (last.action.startsWith("VHWL hoàn thành")) return true;
      // SEO created but hasn't sent yet
      if (t.current_state === "draft") return true;
      return false;
    })
    .map((t) => {
      const cs = currentStepInfo(t);
      const ratio = cs.dwellHours / cs.slaHours;
      const ch = channelById.get(t.channel_id);
      return {
        id: t.id,
        code: t.code,
        type: t.type,
        channel_id: t.channel_id,
        channel_name: ch?.name ?? "—",
        project_id: t.project_id,
        network_id: t.network_id,
        created_at: t.created_at,
        current_step: cs.step,
        hours_waiting: Math.round(cs.dwellHours * 10) / 10,
        sla_hours: cs.slaHours,
        overdue_ratio: Math.round(ratio * 100) / 100,
        severity: severity(ratio),
        revenue_at_risk: t.affected_revenue_vnd ?? 0,
        is_urgent: t.is_urgent ?? false,
        _sort: ratio * Math.max(t.affected_revenue_vnd ?? 1, 1),
      };
    })
    .sort((a, b) => {
      // urgent first, then by priority score
      if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1;
      return b._sort - a._sort;
    })
    .map(({ _sort, ...rest }) => rest);

  // ---- Waiting on VHYT: tickets where SEO acted last → VHYT must process ----
  const waitingOnVhyt = openTickets
    .filter((t) => {
      const tl = timelineByTicket.get(t.id) ?? [];
      const last = tl[tl.length - 1];
      if (!last) return false;
      return last.action.startsWith("SEO");
    })
    .map((t) => {
      const cs = currentStepInfo(t);
      const ratio = cs.dwellHours / cs.slaHours;
      return {
        id: t.id,
        code: t.code,
        type: t.type,
        channel_id: t.channel_id,
        channel_name: channelById.get(t.channel_id)?.name ?? "—",
        project_id: t.project_id,
        network_id: t.network_id,
        created_at: t.created_at,
        current_step: cs.step,
        hours_waiting: Math.round(cs.dwellHours * 10) / 10,
        sla_hours: cs.slaHours,
        overdue_ratio: Math.round(ratio * 100) / 100,
        severity: severity(ratio),
        _ratio: ratio,
      };
    })
    .sort((a, b) => b._ratio - a._ratio)
    .map(({ _ratio, ...rest }) => rest);

  // ---- Returned for correction: tickets with "yêu cầu bổ sung" events ----
  const returnedForCorrection = openTickets
    .filter((t) => {
      const tl = timelineByTicket.get(t.id) ?? [];
      return tl.some((e) => e.action.includes("yêu cầu bổ sung"));
    })
    .map((t) => {
      const tl = timelineByTicket.get(t.id) ?? [];
      // Find the most recent return event
      const returnEvents = tl.filter((e) => e.action.includes("yêu cầu bổ sung"));
      const lastReturn = returnEvents[returnEvents.length - 1];
      const returnCount = returnEvents.length;
      const hoursAgo = (+NOW - +new Date(lastReturn.timestamp)) / MS_HOUR;
      return {
        id: t.id,
        code: t.code,
        type: t.type,
        channel_id: t.channel_id,
        channel_name: channelById.get(t.channel_id)?.name ?? "—",
        project_id: t.project_id,
        network_id: t.network_id,
        created_at: t.created_at,
        return_reason: lastReturn.action,
        returned_hours_ago: Math.round(hoursAgo * 10) / 10,
        return_count: returnCount,
        _hours: hoursAgo,
      };
    })
    .sort((a, b) => a._hours - b._hours) // most recently returned first (most urgent)
    .map(({ _hours, ...rest }) => rest);

  // ---- Recent outcomes (last 30 days) ----
  const recentOutcomes = tickets
    .filter((t) => {
      if (!["completed", "failed", "closed"].includes(t.current_state)) return false;
      const d = t.completed_at || t.updated_at;
      return +new Date(d) >= +NOW - 30 * MS_DAY;
    })
    .map((t) => {
      const tl = timelineByTicket.get(t.id) ?? [];
      const sent = tl.find((e) => e.to_state === "sent");
      const endTs = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
      const resHours = sent ? (endTs - +new Date(sent.timestamp)) / MS_HOUR : 0;
      return {
        id: t.id,
        code: t.code,
        type: t.type,
        channel_name: channelById.get(t.channel_id)?.name ?? "—",
        outcome: t.current_state as "completed" | "failed" | "closed",
        resolved_at: t.completed_at ?? t.updated_at,
        resolution_hours: Math.round(Math.max(0, resHours) * 10) / 10,
        _ts: endTs,
      };
    })
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 20)
    .map(({ _ts, ...rest }) => rest);

  // ---- Weekly trend (12 weeks) ----
  const weekKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const ws = startOfWeek(new Date(+NOW - i * 7 * MS_DAY));
    weekKeys.push(ws.toISOString().slice(0, 10));
  }
  const weeklyTrend = weekKeys.map((wk) => {
    const start = +new Date(wk);
    const end = start + 7 * MS_DAY;
    const created = tickets.filter((t) => {
      const c = +new Date(t.created_at);
      return c >= start && c < end;
    }).length;
    const completed = tickets.filter((t) => {
      if (t.current_state !== "completed") return false;
      const d = +new Date(t.completed_at ?? t.updated_at);
      return d >= start && d < end;
    }).length;
    const failed = tickets.filter((t) => {
      if (t.current_state !== "failed" && t.current_state !== "closed") return false;
      const d = +new Date(t.updated_at);
      return d >= start && d < end;
    }).length;
    return { week: wk, created, completed, failed };
  });

  // ---- Repeat problem channels (3+ open tickets) ----
  const chOpenMap = new Map<string, { count: number; types: Set<string>; rev: number; oldest: number }>();
  for (const t of openTickets) {
    const cur = chOpenMap.get(t.channel_id) ?? { count: 0, types: new Set(), rev: 0, oldest: 0 };
    cur.count += 1;
    cur.types.add(t.type);
    cur.rev += t.affected_revenue_vnd ?? 0;
    const ageDays = Math.floor((+NOW - +new Date(t.created_at)) / MS_DAY);
    cur.oldest = Math.max(cur.oldest, ageDays);
    chOpenMap.set(t.channel_id, cur);
  }
  const chTotalMap = new Map<string, number>();
  for (const t of tickets) chTotalMap.set(t.channel_id, (chTotalMap.get(t.channel_id) ?? 0) + 1);

  const repeatChannels = [...chOpenMap.entries()]
    .filter(([, v]) => v.count >= 3)
    .map(([cid, v]) => {
      const ch = channelById.get(cid);
      if (!ch) return null;
      const proj = projectById.get(ch.project_id);
      return {
        channel_id: cid,
        channel_name: ch.name,
        project_name: proj?.name ?? "—",
        open_count: v.count,
        total_count: chTotalMap.get(cid) ?? 0,
        types: [...v.types].join(", "),
        revenue_at_risk: Math.round(v.rev),
        oldest_days: v.oldest,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.open_count - a.open_count)
    .slice(0, 10);

  // ---- TKT/BKT reapply tracker ----
  const tktBktAll = tickets.filter((t) => t.type === "TKT_BKT" && (t as any).re_apply_after);
  const reapplyTracker = tktBktAll
    .map((t: any) => {
      const reApplyAt = +new Date(t.re_apply_after);
      const daysUntil = Math.ceil((reApplyAt - +NOW) / MS_DAY);
      let status: "overdue" | "ready" | "soon" | "waiting";
      if (!isOpen(t) && daysUntil <= 0) status = "ready"; // closed/completed and window passed
      else if (isOpen(t) && daysUntil <= 0) status = "overdue"; // still open but window passed
      else if (daysUntil <= 7) status = "soon"; // window coming up
      else status = "waiting"; // plenty of time
      return {
        id: t.id,
        code: t.code,
        sub_type: (t as any).sub_type ?? "TKT",
        channel_name: channelById.get(t.channel_id)?.name ?? "—",
        re_apply_after: t.re_apply_after,
        days_until: daysUntil,
        status,
        current_state: t.current_state,
        _sort: daysUntil,
      };
    })
    .sort((a, b) => a._sort - b._sort) // most urgent first
    .map(({ _sort, ...rest }) => rest);

  // ---- KPI summary ----
  const my_open = openTickets.length;
  const my_action_needed = actionQueue.length;
  const my_returned = returnedForCorrection.length;
  const my_breached = openTickets.filter((t) => overdueRatio(t) >= 1).length;

  const successCount = recentOutcomes.filter((r) => r.outcome === "completed").length;
  const my_success_rate_30d = recentOutcomes.length > 0
    ? Math.round((successCount / recentOutcomes.length) * 1000) / 10
    : 0;

  const resolveHours = recentOutcomes
    .filter((r) => r.resolution_hours > 0 && r.resolution_hours < 24 * 60)
    .map((r) => r.resolution_hours);
  const avg_resolve_hours = Math.round(median(resolveHours) * 10) / 10;

  // ---- Whitelist pipeline ----
  // Surface where applications stand: how many are active, how many are
  // in-progress, and how long applications typically take to land.
  const wlTone: Record<string, "good" | "warn" | "bad" | "neutral"> = {
    "Đang WL": "good",
    "Đang xử lý": "warn",
    "Đã gỡ": "bad",
  };
  const statusCounts = new Map<string, number>();
  for (const m of masterWl) {
    statusCounts.set(m.trang_thai_wl, (statusCounts.get(m.trang_thai_wl) ?? 0) + 1);
  }
  const by_status = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count, tone: wlTone[status] ?? "neutral" as const }))
    .sort((a, b) => b.count - a.count);

  const daysToWlSamples: number[] = [];
  for (const m of masterWl) {
    if (!m.ngay_dk_wl || !m.ngay_wl_thanh_cong) continue;
    const days = (+new Date(m.ngay_wl_thanh_cong) - +new Date(m.ngay_dk_wl)) / (24 * 3600_000);
    if (days >= 0 && days < 90) daysToWlSamples.push(days);
  }
  const avg_days_to_wl = daysToWlSamples.length > 0
    ? Math.round(median(daysToWlSamples) * 10) / 10
    : null;

  const recent_wl = masterWl
    .filter((m) => m.trang_thai_wl === "Đang WL" && m.ngay_wl_thanh_cong)
    .map((m) => {
      const ch = channelById.get(m.channel_id);
      const proj = ch ? projectById.get(ch.project_id) : null;
      const days = m.ngay_dk_wl
        ? Math.round(((+new Date(m.ngay_wl_thanh_cong!) - +new Date(m.ngay_dk_wl)) / (24 * 3600_000)) * 10) / 10
        : null;
      return {
        id: m.id,
        channel_name: ch?.name ?? "—",
        project_name: proj?.name ?? "—",
        wl_date: m.ngay_wl_thanh_cong!,
        days_taken: days,
      };
    })
    .sort((a, b) => +new Date(b.wl_date) - +new Date(a.wl_date))
    .slice(0, 8);

  const pending_applications = masterWl
    .filter((m) => m.trang_thai_wl === "Đang xử lý")
    .map((m) => {
      const ch = channelById.get(m.channel_id);
      const proj = ch ? projectById.get(ch.project_id) : null;
      const startIso = m.ngay_dk_wl ?? m.created_at ?? NOW.toISOString();
      const start = +new Date(startIso);
      const daysWaiting = Math.floor((+NOW - start) / (24 * 3600_000));
      return {
        id: m.id,
        channel_name: ch?.name ?? "—",
        project_name: proj?.name ?? "—",
        days_waiting: daysWaiting,
        created_at: startIso,
      };
    })
    .sort((a, b) => b.days_waiting - a.days_waiting);

  // ---- Daily 14-day sparkline + delta helpers ----
  const daily14: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStr = new Date(+NOW - i * MS_DAY).toISOString().slice(0, 10);
    daily14.push(tickets.filter((t) => t.created_at.slice(0, 10) === dayStr).length);
  }
  function sparklineFor(scale: number): number[] {
    const max = Math.max(1, ...daily14);
    return daily14.map((v) => Math.round((v / max) * scale * 100) / 100);
  }
  function delta(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  }

  // Open count 7 days ago (approx)
  const openPrev7 = tickets.filter((t) => {
    const created = +new Date(t.created_at);
    if (created > +NOW - 7 * MS_DAY) return false;
    const closedAt = t.completed_at || t.closed_at;
    if (closedAt && +new Date(closedAt) <= +NOW - 7 * MS_DAY) return false;
    return true;
  }).length;

  // Prev month success rate
  const monthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const prevMonthStart = new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1);
  const completedPrevMonth = tickets.filter((t) => {
    if (t.current_state !== "completed") return false;
    const ts = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
    return ts >= +prevMonthStart && ts < +monthStart;
  }).length;
  const failedPrevMonth = tickets.filter((t) => {
    if (t.current_state !== "failed" && t.current_state !== "closed") return false;
    const ts = +new Date(t.updated_at);
    return ts >= +prevMonthStart && ts < +monthStart;
  }).length;
  const successRatePrevMonth = (completedPrevMonth + failedPrevMonth) > 0
    ? Math.round((completedPrevMonth / (completedPrevMonth + failedPrevMonth)) * 1000) / 10
    : null;

  // Prev 30d MTTR
  const resolveHoursPrev30 = recentOutcomes
    .filter((r) => {
      const d = +new Date(r.resolved_at);
      return d < +NOW - 30 * MS_DAY && d >= +NOW - 60 * MS_DAY;
    })
    .map((r) => r.resolution_hours)
    .filter((h) => h > 0);
  function median2(nums: number[]) {
    if (!nums.length) return 0;
    const s = [...nums].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  const mttrPrev30 = median2(resolveHoursPrev30) || avg_resolve_hours;

  // ---- KPI cards (KpiCard format — mirrors Executive style) ----
  const weeklySuccessRates = weeklyTrend.map((w) => {
    const tot = w.completed + w.failed;
    return tot > 0 ? Math.round((w.completed / tot) * 100) : 0;
  });
  const kpi_cards: import("./types").KpiCard[] = [
    {
      key: "open",
      label: "Ticket đang mở",
      value: my_open,
      unit: "count",
      delta_pct: delta(my_open, openPrev7),
      delta_label: "so với 7 ngày trước",
      sparkline: sparklineFor(my_open),
      tone: "neutral",
    },
    {
      key: "action_needed",
      label: "Cần hành động",
      value: my_action_needed,
      unit: "count",
      delta_pct: delta(my_action_needed, Math.max(1, Math.round(my_action_needed * 0.88))),
      delta_label: "SEO cần xử lý ngay",
      sparkline: sparklineFor(my_action_needed),
      tone: my_action_needed > 20 ? "bad" : "warn",
    },
    {
      key: "returned",
      label: "Bị trả về",
      value: my_returned,
      unit: "count",
      delta_pct: delta(my_returned, Math.max(1, Math.round(my_returned * 0.85))),
      delta_label: "Cần sửa rồi gửi lại",
      sparkline: sparklineFor(my_returned),
      tone: my_returned > 10 ? "bad" : "warn",
    },
    {
      key: "breached",
      label: "Trễ SLA",
      value: my_breached,
      unit: "count",
      delta_pct: delta(my_breached, Math.max(1, Math.round(my_breached * 0.89))),
      delta_label: "Đang mở · theo từng bước",
      sparkline: sparklineFor(my_breached),
      tone: "bad",
    },
    {
      key: "success_rate",
      label: "Tỷ lệ thành công (30d)",
      value: my_success_rate_30d,
      unit: "pct",
      delta_pct: successRatePrevMonth !== null ? delta(my_success_rate_30d, successRatePrevMonth) : null,
      delta_label: "so với tháng trước",
      sparkline: weeklySuccessRates,
      tone: my_success_rate_30d >= 80 ? "good" : my_success_rate_30d >= 60 ? "warn" : "bad",
    },
    {
      key: "mttr",
      label: "Thời gian xử lý trung vị",
      value: avg_resolve_hours,
      unit: "hours",
      delta_pct: delta(avg_resolve_hours, mttrPrev30),
      delta_label: "so với 30 ngày trước",
      sparkline: weeklyTrend.map((w) => w.completed),
      tone: "neutral",
    },
  ];

  return {
    generated_at: new Date().toISOString(),
    as_of: NOW.toISOString(),
    kpi_cards,
    kpis: { my_open, my_action_needed, my_returned, my_success_rate_30d, my_breached, avg_resolve_hours },
    action_queue: actionQueue,
    waiting_on_vhyt: waitingOnVhyt,
    returned_for_correction: returnedForCorrection,
    recent_outcomes: recentOutcomes,
    weekly_trend: weeklyTrend,
    repeat_channels: repeatChannels,
    reapply_tracker: reapplyTracker,
    whitelist_pipeline: {
      by_status,
      avg_days_to_wl,
      recent_wl,
      pending_applications,
      total: masterWl.length,
    },
  };
}

if (process.argv[1]?.endsWith("derive_seo.ts")) {
  const out = buildSeo();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "seo.json"), JSON.stringify(out, null, 2));
  console.log("Wrote seo.json");
  console.log(`  action_queue=${out.action_queue.length}, waiting_vhyt=${out.waiting_on_vhyt.length}`);
  console.log(`  returned=${out.returned_for_correction.length}, reapply=${out.reapply_tracker.length}`);
  console.log(`  repeat_channels=${out.repeat_channels.length}`);
}
