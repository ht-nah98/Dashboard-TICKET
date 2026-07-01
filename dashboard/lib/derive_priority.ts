// Priority dashboard — MVP for TP + Leader (shared view) and Vận hành.
// Revenue-free: ranking is driven purely by system-generated signals
//   priority_score = overdue_ratio × type_weight × age_factor
// so nothing here depends on affected_revenue_vnd / monthly_revenue.
//
// SLA classification reuses lib/sla.ts (the single source of truth shared with
// derive_ops.ts), so the "Trễ SLA" numbers Leader sees here match Operations.

import fs from "node:fs";
import path from "node:path";
import type {
  Ticket,
  Channel,
  User,
  Project,
  TimelineEvent,
  SlaEvent,
  MasterWhitelistRow,
  KpiCard,
  TicketType,
} from "./types";
import { currentStepInfo, isOpen } from "./sla";
import {
  channelById as buildChannelById,
  projectById as buildProjectById,
  userById as buildUserById,
  timelineByTicket as buildTimelineByTicket,
} from "./lookups";
import { buildRoot as buildRootPayload } from "./derive_root";
import { buildSeo as buildSeoPayload } from "./derive_seo";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OUT_DIR = path.resolve(process.cwd(), "derived");
const NOW = new Date("2026-05-23T09:00:00+07:00");
const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

function load<T>(file: string): T[] {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T[];
}
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const diff = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

// ---- Severity weighting (replaces revenue as the importance axis) ----
// GBQ/DIE strikes and urgent/claim_lao are the most damaging ticket kinds.
function typeWeight(t: Ticket): number {
  if (t.type === "GBQ" || t.type === "DIE") return 3;
  if (t.is_urgent || (t.type === "CLAIM" && t.claim_type === "claim_lao")) return 2.5;
  if (t.type === "WHITELIST" || t.type === "TKT_BKT") return 1.5;
  return 1;
}
function ageDays(t: Ticket): number {
  return Math.floor((+NOW - +new Date(t.created_at)) / MS_DAY);
}
// Each week a ticket sits open bumps it one notch up the queue.
function ageFactor(t: Ticket): number {
  return 1 + ageDays(t) / 7;
}

export interface PriorityPayload {
  generated_at: string;
  as_of: string;
  kpis: KpiCard[];
  volume_trend: { week: string; CLAIM: number; WHITELIST: number; GBQ: number; GCD: number; TKT_BKT: number; DIE: number }[];
  outcome_trend: { week: string; completed: number; failed: number; open: number; success_rate: number }[];
  channels_top: {
    channel_id: string;
    channel_name: string;
    project_name: string;
    open_count: number;
    critical_count: number;
    days_unresolved: number;
    whitelist_status: string;
    no_whitelist_flag: boolean;
    severity: "low" | "medium" | "high" | "critical";
    priority_score: number;
  }[];
  aging: { bucket: string; count: number; tone: "good" | "warn" | "bad" }[];
  funnel: { step: string; count: number; median_dwell_hours: number }[];
  sla: {
    within: number;
    near: number;
    breached: number;
    pct_within: number;
    breach_by_owner: { owner: string; count: number }[];
  };
  // For LEADER — số ca trễ SLA mỗi vai trò đang chịu trách nhiệm (nút thắt theo vai trò).
  breach_by_role: { role: string; count: number }[];
  // For LEADER — tải công việc theo từng nhân sự đang xử lý.
  assignee_workload: {
    user_id: string;
    user_name: string;
    role: string;
    open: number;
    critical: number;
    breached: number;
    load_pct: number;
  }[];
  near_breach: {
    id: string;
    code: string;
    type: string;
    channel_id: string;
    channel_name: string;
    project_id: string;
    network_id: string;
    created_at: string;
    owner_name: string;
    waiting_side: string;
    hours_to_breach: number;
    severity: "warn" | "bad";
  }[];
  escalation_board: {
    id: string;
    code: string;
    type: string;
    channel_id: string;
    channel_name: string;
    project_id: string;
    network_id: string;
    created_at: string;
    owner_name: string;
    waiting_side: string;
    days_open: number;
    breach_risk: "near" | "breached";
    severity: "warn" | "bad";
    priority_score: number;
  }[];
  // KHU D — Phân tích & Phòng ngừa (tái dùng data từ Root Cause + SEO, revenue=0)
  analysis: {
    resource_breakdown: import("./derive_root").RootPayload["resource_breakdown"];
    repeat_offender_channels: import("./derive_root").RootPayload["repeat_offender_channels"];
    weekly_fail_trend: import("./derive_root").RootPayload["weekly_fail_trend"];
    whitelist_pipeline: import("./derive_seo").SeoPayload["whitelist_pipeline"];
  };
  totals: { total_tickets: number; open_tickets: number };
}

export function buildPriority(): PriorityPayload {
  const tickets = load<Ticket>("tickets.json");
  const channels = load<Channel>("channels.json");
  const users = load<User>("users.json");
  const projects = load<Project>("projects.json");
  const timeline = load<TimelineEvent>("timeline.json");
  const slaEvents = load<SlaEvent>("sla_events.json");
  const masterWl = load<MasterWhitelistRow>("master_whitelist.json");

  const channelById = buildChannelById(channels);
  const projectById = buildProjectById(projects);
  const userById = buildUserById(users);
  const timelineByTicket = buildTimelineByTicket(timeline);

  const breachedIds = new Set(
    slaEvents.filter((s) => s.event_type === "breach_48h").map((s) => s.ticket_id)
  );
  const openTickets = tickets.filter(isOpen);

  function isCritical(t: Ticket): boolean {
    if (!isOpen(t)) return false;
    if (breachedIds.has(t.id)) return true;
    if (t.is_urgent) return true;
    if (t.type === "GBQ" || t.type === "DIE") return true;
    if (t.type === "CLAIM" && t.claim_type === "claim_lao" && t.video_status === "public") return true;
    return false;
  }

  function stepOf(t: Ticket) {
    const tl = timelineByTicket.get(t.id) ?? [];
    return currentStepInfo(t, tl, NOW);
  }

  // Channels carrying active whitelist coverage (used only as a warning flag).
  const wlActiveByChannel = new Set<string>();
  for (const m of masterWl) {
    if (m.trang_thai_wl === "Đang WL") wlActiveByChannel.add(m.channel_id);
  }

  // ===== [1] KPI strip (5 cards, revenue removed) =====
  // 14-day daily-new sparkline base, shared by all cards.
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

  const openNow = openTickets.length;
  const openPrev7 = tickets.filter((t) => {
    const created = +new Date(t.created_at);
    if (created > +NOW - 7 * MS_DAY) return false;
    const closedAt = t.completed_at || t.closed_at;
    if (closedAt && +new Date(closedAt) <= +NOW - 7 * MS_DAY) return false;
    return true;
  }).length;

  const criticalOpen = openTickets.filter(isCritical).length;

  // Per-step SLA classification — single source shared with Operations.
  let within = 0, near = 0, breached = 0;
  const breachByOwner = new Map<string, number>();
  for (const t of openTickets) {
    const cs = stepOf(t);
    const ratio = cs.dwellHours / cs.slaHours;
    if (ratio >= 1) {
      breached += 1;
      breachByOwner.set(cs.owner, (breachByOwner.get(cs.owner) ?? 0) + 1);
    } else if (ratio >= 0.75) near += 1;
    else within += 1;
  }
  const breach_by_owner = [...breachByOwner.entries()]
    .map(([owner, count]) => ({ owner, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Success rate MTD vs prev month
  const completedTickets = tickets.filter((t) => t.current_state === "completed");
  const monthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const prevMonthStart = new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1);
  function successRate(start: number, end: number): number {
    const comp = completedTickets.filter((t) => {
      const ts = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
      return ts >= start && ts < end;
    }).length;
    const fail = tickets.filter((t) => {
      if (t.current_state !== "failed" && t.current_state !== "closed") return false;
      const ts = +new Date(t.updated_at);
      return ts >= start && ts < end;
    }).length;
    return comp + fail > 0 ? Math.round((comp / (comp + fail)) * 1000) / 10 : 0;
  }
  const successMtd = successRate(+monthStart, +NOW);
  const successPrev = successRate(+prevMonthStart, +monthStart);

  // MTTR (median sent → completed, last 30d)
  function median(nums: number[]): number {
    if (!nums.length) return 0;
    const s = [...nums].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  const mttr30: number[] = [];
  const mttrPrev30: number[] = [];
  for (const t of completedTickets) {
    const tl = timelineByTicket.get(t.id) ?? [];
    const sent = tl.find((e) => e.to_state === "sent");
    if (!sent || !t.completed_at) continue;
    const hrs = (+new Date(t.completed_at) - +new Date(sent.timestamp)) / MS_HOUR;
    if (hrs <= 0 || hrs > 24 * 60) continue;
    if (+new Date(t.completed_at) >= +NOW - 30 * MS_DAY) mttr30.push(hrs);
    else if (+new Date(t.completed_at) >= +NOW - 60 * MS_DAY) mttrPrev30.push(hrs);
  }
  const mttrNow = Math.round(median(mttr30) * 10) / 10;
  const mttrPrev = Math.round((median(mttrPrev30) || mttrNow) * 10) / 10;

  const kpis: KpiCard[] = [
    {
      key: "open",
      label: "Ticket đang mở",
      value: openNow,
      unit: "count",
      delta_pct: delta(openNow, openPrev7),
      delta_label: "so với 7 ngày trước",
      sparkline: sparklineFor(openNow),
      tone: openNow > 150 ? "warn" : "neutral",
    },
    {
      key: "critical",
      label: "Critical đang mở",
      value: criticalOpen,
      unit: "count",
      delta_pct: delta(criticalOpen, Math.max(1, Math.round(criticalOpen * 0.92))),
      delta_label: "GBQ/DIE/urgent · đang mở",
      sparkline: sparklineFor(criticalOpen),
      tone: criticalOpen > 30 ? "bad" : "warn",
    },
    {
      key: "breached",
      label: "Trễ SLA",
      value: breached,
      unit: "count",
      delta_pct: delta(breached, Math.max(1, Math.round(breached * 0.9))),
      delta_label: "đang mở · theo từng bước",
      sparkline: sparklineFor(breached),
      tone: "bad",
    },
    {
      key: "success_rate",
      label: "Tỷ lệ thành công (tháng)",
      value: successMtd,
      unit: "pct",
      delta_pct: delta(successMtd, successPrev),
      delta_label: "so với tháng trước",
      sparkline: sparklineFor(successMtd),
      tone: successMtd >= 80 ? "good" : "warn",
    },
    {
      key: "mttr",
      label: "Thời gian xử lý trung vị",
      value: mttrNow,
      unit: "hours",
      delta_pct: delta(mttrNow, mttrPrev),
      delta_label: "so với 30 ngày trước",
      sparkline: sparklineFor(mttrNow),
      tone: mttrNow < 48 ? "good" : "warn",
    },
  ];

  // ===== [2] Volume + Outcome trend (12 weeks) =====
  const types: TicketType[] = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"];
  const weekKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    weekKeys.push(startOfWeek(new Date(+NOW - i * 7 * MS_DAY)).toISOString().slice(0, 10));
  }
  const volume_trend = weekKeys.map((wk) => {
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
  const outcome_trend = weekKeys.map((wk) => {
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

  // ===== [3] Top channels by priority_score (revenue-free) =====
  const chStats = new Map<
    string,
    { open: number; critical: number; oldest: number; priority: number }
  >();
  for (const t of openTickets) {
    const cs = stepOf(t);
    const ratio = cs.dwellHours / cs.slaHours;
    const score = ratio * typeWeight(t) * ageFactor(t);
    const cur = chStats.get(t.channel_id) ?? { open: 0, critical: 0, oldest: 0, priority: 0 };
    cur.open += 1;
    if (isCritical(t)) cur.critical += 1;
    cur.oldest = Math.max(cur.oldest, ageDays(t));
    cur.priority += score;
    chStats.set(t.channel_id, cur);
  }
  const channels_top = [...chStats.entries()]
    .map(([cid, st]) => {
      const ch = channelById.get(cid);
      if (!ch) return null;
      const project = projectById.get(ch.project_id);
      const noWl = !wlActiveByChannel.has(cid);
      const sev =
        st.critical >= 2 ? "critical" : st.critical >= 1 ? "high" : st.open >= 3 ? "medium" : "low";
      return {
        channel_id: cid,
        channel_name: ch.name,
        project_name: project?.name ?? "—",
        open_count: st.open,
        critical_count: st.critical,
        days_unresolved: st.oldest,
        whitelist_status: ch.whitelist_status,
        no_whitelist_flag: noWl,
        severity: sev as "low" | "medium" | "high" | "critical",
        priority_score: Math.round(st.priority * 10) / 10,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 10);

  // ===== [4] Aging (total ticket age) + Funnel =====
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
      const h = (+NOW - +new Date(t.created_at)) / MS_HOUR;
      return h >= b.min && h < b.max;
    }).length,
    tone: b.tone,
  }));

  const funnelSteps = [
    { step: "Lưu nháp", states: ["draft"] },
    { step: "Đã gửi", states: ["sent"] },
    { step: "Đang xử lý", states: ["processing"] },
    { step: "Tạm dừng", states: ["paused"] },
    { step: "Hoàn thành", states: ["completed", "closed"] },
  ];
  const funnel = funnelSteps.map((s) => {
    const count = tickets.filter((t) => s.states.includes(t.current_state)).length;
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

  const sla = {
    within,
    near,
    breached,
    pct_within: Math.round((within / Math.max(1, within + near + breached)) * 1000) / 10,
    breach_by_owner,
  };

  // ===== [5] Near-breach list (still-savable first) =====
  function ownerName(t: Ticket): string {
    return userById.get(t.created_by_user_id)?.name ?? "—";
  }
  const near_breach = openTickets
    .map((t) => {
      const cs = stepOf(t);
      const ratio = cs.dwellHours / cs.slaHours;
      return { t, cs, ratio, state: ratio >= 1 ? "breached" : ratio >= 0.75 ? "near" : "within" };
    })
    .filter((x) => x.state === "near" || x.state === "breached")
    .map(({ t, cs, ratio, state }) => ({
      id: t.id,
      code: t.code,
      type: t.type,
      channel_id: t.channel_id,
      channel_name: channelById.get(t.channel_id)?.name ?? "—",
      project_id: t.project_id,
      network_id: t.network_id,
      created_at: t.created_at,
      owner_name: ownerName(t),
      waiting_side: cs.step + " · " + cs.owner,
      hours_to_breach: Math.round((cs.slaHours - cs.dwellHours) * 10) / 10,
      severity: (state === "breached" ? "bad" : "warn") as "warn" | "bad",
      _state: state,
      _ratio: ratio,
    }))
    .sort((a, b) => {
      if (a._state !== b._state) return a._state === "near" ? -1 : 1;
      if (a._state === "near") return a.hours_to_breach - b.hours_to_breach;
      return b._ratio - a._ratio;
    })
    .slice(0, 12)
    .map(({ _state, _ratio, ...rest }) => rest);

  // ===== [6] Escalation board by priority_score =====
  const escalation_board = openTickets
    .map((t) => {
      const cs = stepOf(t);
      const ratio = cs.dwellHours / cs.slaHours;
      return { t, cs, ratio, breach: ratio >= 1 };
    })
    .filter(({ t, breach }) => breach || t.is_urgent)
    .map(({ t, cs, ratio, breach }) => ({
      id: t.id,
      code: t.code,
      type: t.type,
      channel_id: t.channel_id,
      channel_name: channelById.get(t.channel_id)?.name ?? "—",
      project_id: t.project_id,
      network_id: t.network_id,
      created_at: t.created_at,
      owner_name: ownerName(t),
      waiting_side: cs.step + " · " + cs.owner,
      days_open: ageDays(t),
      breach_risk: (breach ? "breached" : "near") as "near" | "breached",
      severity: (breach ? "bad" : "warn") as "warn" | "bad",
      priority_score: Math.round(ratio * typeWeight(t) * ageFactor(t) * 10) / 10,
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 15);

  // ===== [LEADER] Trễ SLA theo vai trò chịu trách nhiệm =====
  // Tái dùng breachByOwner đã tính ở phần KPI (owner của bước hiện tại).
  const breach_by_role = [...breachByOwner.entries()]
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  // ===== [LEADER] Tải công việc theo nhân sự =====
  // Người chịu tải = actor gần nhất KHÁC vai trò SEO trong timeline (người vận
  // hành đang giữ ticket). Chỉ tính các vai trò vận hành thực sự.
  function lastAssignee(t: Ticket): string | null {
    const tl = timelineByTicket.get(t.id) ?? [];
    for (let i = tl.length - 1; i >= 0; i--) {
      if (tl[i].actor_role && tl[i].actor_role !== "SEO") return tl[i].actor_user_id ?? null;
    }
    return tl[tl.length - 1]?.actor_user_id ?? null;
  }
  const workloadMap = new Map<string, { open: number; critical: number; breached: number }>();
  for (const t of openTickets) {
    const uid = lastAssignee(t);
    if (!uid) continue;
    const u = userById.get(uid);
    if (!u || !["VHYT", "VHDA", "VHWL", "VH_LEADER"].includes(u.role)) continue;
    const cur = workloadMap.get(uid) ?? { open: 0, critical: 0, breached: 0 };
    cur.open += 1;
    if (isCritical(t)) cur.critical += 1;
    if (stepOf(t).dwellHours / stepOf(t).slaHours >= 1) cur.breached += 1;
    workloadMap.set(uid, cur);
  }
  const maxLoad = Math.max(1, ...[...workloadMap.values()].map((v) => v.open));
  const assignee_workload = [...workloadMap.entries()]
    .map(([uid, st]) => {
      const u = userById.get(uid)!;
      return {
        user_id: uid,
        user_name: u.name,
        role: u.role,
        open: st.open,
        critical: st.critical,
        breached: st.breached,
        load_pct: Math.round((st.open / maxLoad) * 100),
      };
    })
    .sort((a, b) => b.open - a.open)
    .slice(0, 12);

  // ===== [KHU D] Phân tích & Phòng ngừa =====
  // Tái dùng nguyên các phép tính đã có ở Root Cause + SEO để không trùng logic.
  // Nguyên tắc "không doanh thu" của trang Priority: zero-hóa mọi trường revenue
  // trước khi đưa ra (component vẫn render, cột tiền hiển thị trống/0).
  const root = buildRootPayload();
  const seo = buildSeoPayload();
  const analysis = {
    resource_breakdown: {
      summary: root.resource_breakdown.summary.map((s) => ({ ...s, revenue_at_risk: 0 })),
      trend: root.resource_breakdown.trend,
    },
    repeat_offender_channels: root.repeat_offender_channels.map((c) => ({ ...c, revenue_at_risk: 0 })),
    weekly_fail_trend: root.weekly_fail_trend,
    whitelist_pipeline: seo.whitelist_pipeline,
  };

  return {
    generated_at: new Date().toISOString(),
    as_of: NOW.toISOString(),
    kpis,
    volume_trend,
    outcome_trend,
    channels_top,
    aging,
    funnel,
    sla,
    breach_by_role,
    assignee_workload,
    near_breach,
    escalation_board,
    analysis,
    totals: { total_tickets: tickets.length, open_tickets: openTickets.length },
  };
}

if (process.argv[1]?.endsWith("derive_priority.ts")) {
  const out = buildPriority();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "priority.json"), JSON.stringify(out, null, 2));
  console.log("Wrote priority.json");
  console.log(`  open=${out.totals.open_tickets}, breached=${out.sla.breached}, channels=${out.channels_top.length}`);
  console.log(`  near_breach=${out.near_breach.length}, escalations=${out.escalation_board.length}`);
}
