import fs from "node:fs";
import path from "node:path";
import type { Ticket, Channel, User, Project, TimelineEvent } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "..", "data");
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

interface SlaStep {
  id: string;
  ticket_id: string;
  ticket_type: string;
  step_index: number;
  step_name: string;
  actor_role: string;
  expected_hours: number;
  started_at: string;
  completed_at: string | null;
  status: string;
}

export interface RootPayload {
  generated_at: string;
  as_of: string;
  pareto: {
    type: string;
    total: number;
    open: number;
    completed: number;
    failed: number;
    revenue_vnd: number;
    fail_rate: number;
  }[];
  step_bottlenecks: {
    step_name: string;
    actor_role: string;
    expected_hours: number;
    median_actual_hours: number;
    breach_rate: number;
    sample_size: number;
    slowdown_ratio: number;
  }[];
  repeat_offender_channels: {
    channel_id: string;
    channel_name: string;
    project_name: string;
    total_tickets: number;
    open_tickets: number;
    failed_tickets: number;
    claim_count: number;
    gbq_count: number;
    revenue_at_risk: number;
  }[];
  return_analysis: {
    total_returned: number;
    multi_returned: number;
    by_type: { type: string; count: number; pct: number }[];
    top_return_steps: { step: string; count: number }[];
  };
  resolution_effectiveness: {
    direction: string;
    label: string;
    completed: number;
    failed: number;
    open: number;
    total: number;
    success_rate: number;
  }[];
  pause_reasons: {
    reason: string;
    count: number;
    pct: number;
  }[];
  weekly_fail_trend: {
    week: string;
    created: number;
    completed: number;
    failed: number;
    return_count: number;
  }[];
  process_complexity: {
    bucket: string;
    count: number;
    avg_resolution_hours: number;
  }[];
}

export function buildRoot(): RootPayload {
  const tickets = load<Ticket>("tickets.json");
  const channels = load<Channel>("channels.json");
  const users = load<User>("users.json");
  const projects = load<Project>("projects.json");
  const timeline = load<TimelineEvent>("timeline.json");
  const slaSteps = load<SlaStep>("sla_steps.json");

  const channelById = new Map(channels.map((c) => [c.id, c]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const timelineByTicket = new Map<string, TimelineEvent[]>();
  for (const e of timeline) {
    const arr = timelineByTicket.get(e.ticket_id) ?? [];
    arr.push(e);
    timelineByTicket.set(e.ticket_id, arr);
  }
  for (const arr of timelineByTicket.values()) {
    arr.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  }

  function isOpen(t: Ticket) {
    return !["completed", "closed", "failed"].includes(t.current_state);
  }

  // ---- Pareto: ticket types by volume + revenue + fail rate ----
  const types = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"] as const;
  const pareto = types.map((ty) => {
    const tc = tickets.filter((t) => t.type === ty);
    const open = tc.filter(isOpen).length;
    const completed = tc.filter((t) => t.current_state === "completed").length;
    const failed = tc.filter((t) => ["failed", "closed"].includes(t.current_state)).length;
    const revenue = tc.filter(isOpen).reduce((s, t) => s + (t.affected_revenue_vnd ?? 0), 0);
    const resolved = completed + failed;
    return {
      type: ty,
      total: tc.length,
      open,
      completed,
      failed,
      revenue_vnd: Math.round(revenue),
      fail_rate: resolved > 0 ? Math.round((failed / resolved) * 1000) / 10 : 0,
    };
  }).sort((a, b) => b.total - a.total);

  // ---- Step bottlenecks from sla_steps.json ----
  const stepMap = new Map<string, { role: string; expected: number; samples: number[]; breaches: number }>();
  for (const s of slaSteps) {
    if (!s.completed_at || !s.started_at) continue;
    const actual = (+new Date(s.completed_at) - +new Date(s.started_at)) / MS_HOUR;
    if (actual <= 0 || actual > 720) continue;
    const cur = stepMap.get(s.step_name) ?? { role: s.actor_role, expected: s.expected_hours, samples: [], breaches: 0 };
    cur.samples.push(actual);
    if (actual > s.expected_hours) cur.breaches++;
    stepMap.set(s.step_name, cur);
  }
  const stepBottlenecks = [...stepMap.entries()]
    .filter(([, v]) => v.samples.length >= 3)
    .map(([name, v]) => {
      const med = Math.round(median(v.samples) * 10) / 10;
      return {
        step_name: name,
        actor_role: v.role,
        expected_hours: v.expected,
        median_actual_hours: med,
        breach_rate: Math.round((v.breaches / v.samples.length) * 100),
        sample_size: v.samples.length,
        slowdown_ratio: Math.round((med / v.expected) * 100) / 100,
      };
    })
    .sort((a, b) => b.breach_rate - a.breach_rate)
    .slice(0, 12);

  // ---- Repeat offender channels ----
  const chStats = new Map<string, { total: number; open: number; failed: number; claim: number; gbq: number; rev: number }>();
  for (const t of tickets) {
    const cur = chStats.get(t.channel_id) ?? { total: 0, open: 0, failed: 0, claim: 0, gbq: 0, rev: 0 };
    cur.total++;
    if (isOpen(t)) { cur.open++; cur.rev += t.affected_revenue_vnd ?? 0; }
    if (["failed", "closed"].includes(t.current_state)) cur.failed++;
    if (t.type === "CLAIM") cur.claim++;
    if (t.type === "GBQ") cur.gbq++;
    chStats.set(t.channel_id, cur);
  }
  const repeatOffenders = [...chStats.entries()]
    .filter(([, v]) => v.total >= 5)
    .map(([cid, v]) => {
      const ch = channelById.get(cid);
      if (!ch) return null;
      const proj = projectById.get(ch.project_id);
      return {
        channel_id: cid,
        channel_name: ch.name,
        project_name: proj?.name ?? "—",
        total_tickets: v.total,
        open_tickets: v.open,
        failed_tickets: v.failed,
        claim_count: v.claim,
        gbq_count: v.gbq,
        revenue_at_risk: Math.round(v.rev),
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.total_tickets - a.total_tickets)
    .slice(0, 10);

  // ---- Return for correction analysis ----
  const returnedByTicket = new Map<string, number>();
  const returnedByType = new Map<string, number>();
  const returnedByStep = new Map<string, number>();
  for (const e of timeline) {
    if (!e.action.includes("yêu cầu bổ sung")) continue;
    returnedByTicket.set(e.ticket_id, (returnedByTicket.get(e.ticket_id) ?? 0) + 1);
    returnedByStep.set(e.action, (returnedByStep.get(e.action) ?? 0) + 1);
  }
  for (const [tid] of returnedByTicket) {
    const t = tickets.find((x) => x.id === tid);
    if (t) returnedByType.set(t.type, (returnedByType.get(t.type) ?? 0) + 1);
  }
  const totalReturned = returnedByTicket.size;
  const multiReturned = [...returnedByTicket.values()].filter((v) => v > 1).length;
  const byType = [...returnedByType.entries()]
    .map(([type, count]) => ({ type, count, pct: Math.round((count / totalReturned) * 100) }))
    .sort((a, b) => b.count - a.count);
  const topReturnSteps = [...returnedByStep.entries()]
    .map(([step, count]) => ({ step, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ---- Resolution direction effectiveness ----
  const DIR_LABELS: Record<string, string> = {
    PA2_VH_HO_TRO: "PA2 – VH hỗ trợ",
    PA1_DV_NGOAI: "PA1 – Dịch vụ ngoài",
    ABANDON: "Bỏ kháng",
    EXTERNAL_SERVICE: "Thuê ngoài",
    APPEAL_DIRECT: "Kháng trực tiếp",
  };
  const resMap = new Map<string, { comp: number; fail: number; open: number }>();
  for (const t of tickets) {
    if (!t.resolution_direction) continue;
    const cur = resMap.get(t.resolution_direction) ?? { comp: 0, fail: 0, open: 0 };
    if (t.current_state === "completed") cur.comp++;
    else if (["failed", "closed"].includes(t.current_state)) cur.fail++;
    else cur.open++;
    resMap.set(t.resolution_direction, cur);
  }
  const resEffectiveness = [...resMap.entries()]
    .map(([dir, v]) => {
      const resolved = v.comp + v.fail;
      return {
        direction: dir,
        label: DIR_LABELS[dir] ?? dir,
        completed: v.comp,
        failed: v.fail,
        open: v.open,
        total: v.comp + v.fail + v.open,
        success_rate: resolved > 0 ? Math.round((v.comp / resolved) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  // ---- Pause reasons (from timeline to_state=paused) ----
  const pauseReasonMap = new Map<string, number>();
  for (const e of timeline) {
    if (e.to_state !== "paused") continue;
    const reason = e.action.includes("Tự động") ? "Tự động (24h không hành động)"
      : e.action.includes("bổ sung") ? "Chờ bổ sung hồ sơ"
      : e.action.includes("ngoài") ? "Chờ dịch vụ ngoài"
      : "Khác";
    pauseReasonMap.set(reason, (pauseReasonMap.get(reason) ?? 0) + 1);
  }
  const totalPauses = [...pauseReasonMap.values()].reduce((s, v) => s + v, 0);
  const pauseReasons = [...pauseReasonMap.entries()]
    .map(([reason, count]) => ({ reason, count, pct: Math.round((count / Math.max(totalPauses, 1)) * 100) }))
    .sort((a, b) => b.count - a.count);

  // ---- Weekly fail + return trend (12 weeks) ----
  const weekKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const ws = startOfWeek(new Date(+NOW - i * 7 * MS_DAY));
    weekKeys.push(ws.toISOString().slice(0, 10));
  }
  const weeklyFailTrend = weekKeys.map((wk) => {
    const start = +new Date(wk);
    const end = start + 7 * MS_DAY;
    const created = tickets.filter((t) => +new Date(t.created_at) >= start && +new Date(t.created_at) < end).length;
    const completed = tickets.filter((t) => t.current_state === "completed" && +new Date(t.updated_at) >= start && +new Date(t.updated_at) < end).length;
    const failed = tickets.filter((t) => ["failed", "closed"].includes(t.current_state) && +new Date(t.updated_at) >= start && +new Date(t.updated_at) < end).length;
    const returnCount = timeline.filter((e) => e.action.includes("yêu cầu bổ sung") && +new Date(e.timestamp) >= start && +new Date(e.timestamp) < end).length;
    return { week: wk, created, completed, failed, return_count: returnCount };
  });

  // ---- Process complexity: handoff count buckets vs resolution time ----
  const handoffData: { handoffs: number; resHours: number }[] = [];
  for (const t of tickets) {
    if (!["completed", "failed", "closed"].includes(t.current_state)) continue;
    const tl = timelineByTicket.get(t.id) ?? [];
    let handoffs = 0;
    for (let i = 1; i < tl.length; i++) {
      const a = tl[i - 1].actor_role, b = tl[i].actor_role;
      if (a && b && a !== b) handoffs++;
    }
    const sent = tl.find((e) => e.to_state === "sent");
    const end = t.completed_at ? +new Date(t.completed_at) : +new Date(t.updated_at);
    if (!sent) continue;
    const hrs = (end - +new Date(sent.timestamp)) / MS_HOUR;
    if (hrs <= 0 || hrs > 24 * 60) continue;
    handoffData.push({ handoffs, resHours: hrs });
  }
  const buckets = [
    { bucket: "0–1 bàn giao", min: 0, max: 2 },
    { bucket: "2–3 bàn giao", min: 2, max: 4 },
    { bucket: "4–5 bàn giao", min: 4, max: 6 },
    { bucket: "6+ bàn giao", min: 6, max: Infinity },
  ];
  const processComplexity = buckets.map((b) => {
    const rows = handoffData.filter((h) => h.handoffs >= b.min && h.handoffs < b.max);
    return {
      bucket: b.bucket,
      count: rows.length,
      avg_resolution_hours: Math.round(median(rows.map((r) => r.resHours)) * 10) / 10,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    as_of: NOW.toISOString(),
    pareto,
    step_bottlenecks: stepBottlenecks,
    repeat_offender_channels: repeatOffenders,
    return_analysis: { total_returned: totalReturned, multi_returned: multiReturned, by_type: byType, top_return_steps: topReturnSteps },
    resolution_effectiveness: resEffectiveness,
    pause_reasons: pauseReasons,
    weekly_fail_trend: weeklyFailTrend,
    process_complexity: processComplexity,
  };
}

if (process.argv[1]?.endsWith("derive_root.ts")) {
  const out = buildRoot();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "root.json"), JSON.stringify(out, null, 2));
  console.log("Wrote root.json");
  console.log(`  bottlenecks=${out.step_bottlenecks.length}, repeat_channels=${out.repeat_offender_channels.length}`);
  console.log(`  returned=${out.return_analysis.total_returned}, resolutions=${out.resolution_effectiveness.length}`);
}
