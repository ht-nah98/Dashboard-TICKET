import fs from "node:fs";
import path from "node:path";
import type {
  Ticket,
  Channel,
  User,
  Project,
  TimelineEvent,
  SlaEvent,
  OperationsPayload,
} from "./types";

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
function isOpen(t: Ticket): boolean {
  return !["completed", "closed", "failed"].includes(t.current_state);
}
function ageHours(t: Ticket): number {
  return (+NOW - +new Date(t.created_at)) / MS_HOUR;
}

export function buildOps(): OperationsPayload {
  const tickets = load<Ticket>("tickets.json");
  const channels = load<Channel>("channels.json");
  const users = load<User>("users.json");
  const projects = load<Project>("projects.json");
  const timeline = load<TimelineEvent>("timeline.json");
  const slaEvents = load<SlaEvent>("sla_events.json");

  const channelById = new Map(channels.map((c) => [c.id, c]));
  const userById = new Map(users.map((u) => [u.id, u]));

  const timelineByTicket = new Map<string, TimelineEvent[]>();
  for (const e of timeline) {
    const arr = timelineByTicket.get(e.ticket_id) ?? [];
    arr.push(e);
    timelineByTicket.set(e.ticket_id, arr);
  }
  for (const arr of timelineByTicket.values()) {
    arr.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  }

  const breachedIds = new Set(
    slaEvents.filter((s) => s.event_type === "breach_48h").map((s) => s.ticket_id)
  );

  const openTickets = tickets.filter(isOpen);

  // ---- Side helper (last actor) ----
  function sideOf(t: Ticket): string {
    const tl = timelineByTicket.get(t.id) ?? [];
    const last = tl[tl.length - 1];
    if (!last) return "Không xác định";
    if (last.action.startsWith("VHYT")) return "Chờ SEO";
    if (last.action.startsWith("SEO")) return "Chờ VHYT";
    if (last.action.startsWith("VHDA")) return "Chờ VHWL";
    if (last.action.startsWith("VHWL")) return "Chờ SEO";
    if (last.action.includes("Tự động")) return "Tự động tạm dừng";
    return last.actor_role ?? "Không xác định";
  }

  function lastAssignee(t: Ticket): string | null {
    const tl = timelineByTicket.get(t.id) ?? [];
    for (let i = tl.length - 1; i >= 0; i--) {
      if (tl[i].actor_role && tl[i].actor_role !== "SEO") return tl[i].actor_user_id ?? null;
    }
    return tl[tl.length - 1]?.actor_user_id ?? null;
  }

  // ---- Per-step SLA model ----
  // SLA is measured PER STEP, not by total ticket age. Each "current step" (the
  // ticket's last timeline action) implies who must act next and how many hours
  // they are allowed. Breach = hours_in_current_step > step_sla_hours.
  // The matcher is ordered: first matching rule wins.
  const STEP_SLA: { match: RegExp; hours: number; owner: string; step: string }[] = [
    // Explicit SLA in the action name (authoritative)
    { match: /VHYT tiếp nhận \(SLA 2h\)/, hours: 2, owner: "VHYT", step: "VHYT tiếp nhận" },
    { match: /SEO thực hiện kháng \(SLA 1h\)/, hours: 1, owner: "SEO", step: "SEO thực hiện kháng" },
    // VHYT/VHDA/VHWL holding the ticket → operational steps
    { match: /^VHYT tiếp nhận/, hours: 2, owner: "VHYT", step: "VHYT tiếp nhận" },
    { match: /^VHYT (liên hệ|chọn|trigger|cập nhật|soạn|tạo|gửi)/, hours: 12, owner: "VHYT", step: "VHYT xử lý" },
    { match: /^VHDA/, hours: 12, owner: "VHDA", step: "VHDA xử lý" },
    { match: /^VHWL bắt đầu/, hours: 24, owner: "VHWL", step: "VHWL xử lý" },
    { match: /^VHWL hoàn thành/, hours: 8, owner: "SEO", step: "Chờ SEO xác nhận" },
    // SEO holding the ticket
    { match: /^SEO gửi ticket/, hours: 24, owner: "VHYT", step: "Chờ VHYT tiếp nhận" },
    { match: /^SEO (gửi lại|đã thực hiện|nộp|Cut|submit)/, hours: 24, owner: "VHYT", step: "Chờ VHYT xử lý" },
    { match: /^SEO tạo ticket/, hours: 48, owner: "SEO", step: "SEO hoàn thiện & gửi" },
    // External + abandon
    { match: /dịch vụ ngoài/, hours: 168, owner: "External", step: "Chờ dịch vụ ngoài" },
    { match: /Tự động Tạm dừng/, hours: 24, owner: "SEO", step: "Tạm dừng — chờ mở lại" },
  ];
  const DEFAULT_SLA = { hours: 48, owner: "—", step: "Khác" };

  function currentStep(t: Ticket): { step: string; owner: string; slaHours: number; dwellHours: number } {
    const tl = timelineByTicket.get(t.id) ?? [];
    const last = tl[tl.length - 1];
    if (!last) return { step: "Chưa có timeline", owner: "—", slaHours: DEFAULT_SLA.hours, dwellHours: ageHours(t) };
    const dwellHours = (+NOW - +new Date(last.timestamp)) / MS_HOUR;
    const rule = STEP_SLA.find((r) => r.match.test(last.action)) ?? DEFAULT_SLA as any;
    return {
      step: rule.step ?? DEFAULT_SLA.step,
      owner: rule.owner ?? DEFAULT_SLA.owner,
      slaHours: rule.hours ?? DEFAULT_SLA.hours,
      dwellHours,
    };
  }

  // SLA classification per open ticket, based on current-step dwell vs step SLA.
  // overdueRatio lets us GRADE breaches so a manager can still prioritize when
  // many tickets are technically breached (e.g. frozen seed data): a ticket 8×
  // past its step SLA outranks one 1.2× past.
  function slaClass(t: Ticket): {
    state: "within" | "near" | "breached";
    overdueRatio: number;
    cs: ReturnType<typeof currentStep>;
  } {
    const cs = currentStep(t);
    const ratio = cs.dwellHours / cs.slaHours;
    if (ratio >= 1) return { state: "breached", overdueRatio: ratio, cs };
    if (ratio >= 0.75) return { state: "near", overdueRatio: ratio, cs };
    return { state: "within", overdueRatio: ratio, cs };
  }

  // ---- Queue summary ----
  const todayStart = new Date(NOW);
  todayStart.setHours(0, 0, 0, 0);
  const newToday = tickets.filter((t) => +new Date(t.created_at) >= +todayStart).length;
  const inProgress = openTickets.filter((t) => t.current_state === "processing").length;
  const waitingSeo = openTickets.filter((t) => sideOf(t) === "Chờ SEO").length;
  const waitingVhyt = openTickets.filter((t) => sideOf(t) === "Chờ VHYT").length;
  const paused = openTickets.filter((t) => t.current_state === "paused").length;
  const draft = openTickets.filter((t) => t.current_state === "draft").length;

  // Near-breach + breach lists, computed from per-step dwell vs step SLA.
  // Order: still-savable "near" cases first (sorted by least time left), then
  // breached cases by how far past SLA — that is the manager's action order.
  const nearBreachList = openTickets
    .map((t) => ({ t, c: slaClass(t) }))
    .filter(({ c }) => c.state === "near" || c.state === "breached")
    .map(({ t, c }) => {
      const hoursToBreach = Math.round((c.cs.slaHours - c.cs.dwellHours) * 10) / 10;
      return {
        id: t.id,
        code: t.code,
        type: t.type,
        channel_name: channelById.get(t.channel_id)?.name ?? "—",
        owner_name: userById.get(t.created_by_user_id)?.name ?? "—",
        waiting_side: c.cs.step + " · " + c.cs.owner,
        hours_to_breach: hoursToBreach,
        severity: (c.state === "breached" ? "bad" : "warn") as "warn" | "bad",
        _state: c.state,
        _overdue: c.overdueRatio,
      };
    })
    .sort((a, b) => {
      // near (savable) before breached
      if (a._state !== b._state) return a._state === "near" ? -1 : 1;
      if (a._state === "near") return a.hours_to_breach - b.hours_to_breach; // least time left first
      return b._overdue - a._overdue; // most overdue first
    })
    .slice(0, 12)
    .map(({ _state, _overdue, ...rest }) => rest);

  // ---- SLA compliance (per-step) ----
  let within = 0,
    near = 0,
    breached = 0;
  for (const t of openTickets) {
    const s = slaClass(t).state;
    if (s === "within") within += 1;
    else if (s === "near") near += 1;
    else breached += 1;
  }
  // Breach concentration by responsible party — fills the gauge card height
  // with an actionable secondary read: "who is sitting on the breaches".
  const breachByOwner = new Map<string, number>();
  for (const t of openTickets) {
    const c = slaClass(t);
    if (c.state !== "breached") continue;
    breachByOwner.set(c.cs.owner, (breachByOwner.get(c.cs.owner) ?? 0) + 1);
  }
  const breach_by_owner = [...breachByOwner.entries()]
    .map(([owner, count]) => ({ owner, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sla = {
    within,
    near,
    breached,
    pct_within: Math.round((within / Math.max(1, within + near + breached)) * 1000) / 10,
    breach_by_owner,
  };

  const queue = [
    { key: "new_today", label: "Mới hôm nay", value: newToday, tone: "neutral" as const },
    { key: "in_progress", label: "Đang xử lý", value: inProgress, tone: "neutral" as const },
    { key: "wait_seo", label: "Chờ SEO", value: waitingSeo, tone: "warn" as const },
    { key: "wait_vhyt", label: "Chờ VHYT", value: waitingVhyt, tone: "warn" as const },
    { key: "paused", label: "Tạm dừng", value: paused, tone: "warn" as const },
    { key: "near_breach", label: "Sắp / đã trễ SLA", value: near + breached, tone: "bad" as const },
  ];

  // ---- Assignee workload ----
  const workloadMap = new Map<string, { open: number; critical: number; breached: number }>();
  for (const t of openTickets) {
    const uid = lastAssignee(t);
    if (!uid) continue;
    const u = userById.get(uid);
    if (!u || !["VHYT", "VHDA", "VHWL", "VH_LEADER"].includes(u.role)) continue;
    const cur = workloadMap.get(uid) ?? { open: 0, critical: 0, breached: 0 };
    cur.open += 1;
    if (breachedIds.has(t.id)) cur.breached += 1;
    if (t.is_urgent || breachedIds.has(t.id)) cur.critical += 1;
    workloadMap.set(uid, cur);
  }
  const maxLoad = Math.max(1, ...Array.from(workloadMap.values()).map((v) => v.open));
  const assigneeWorkload = Array.from(workloadMap.entries())
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
    .sort((a, b) => b.open - a.open);

  // ---- Assignee performance (resolution + success) ----
  const perfAcc = new Map<string, { sumHours: number; n: number; success: number; total: number }>();
  for (const t of tickets) {
    if (t.current_state !== "completed" && t.current_state !== "failed" && t.current_state !== "closed") continue;
    const tl = timelineByTicket.get(t.id) ?? [];
    const owner = tl.find((e) => e.actor_role === "VHYT" || e.actor_role === "VHDA" || e.actor_role === "VHWL");
    if (!owner?.actor_user_id) continue;
    const sent = tl.find((e) => e.to_state === "sent");
    if (!sent) continue;
    const end = t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at);
    const hrs = (+end - +new Date(sent.timestamp)) / MS_HOUR;
    if (hrs <= 0 || hrs > 24 * 60) continue;
    const acc = perfAcc.get(owner.actor_user_id) ?? { sumHours: 0, n: 0, success: 0, total: 0 };
    acc.sumHours += hrs;
    acc.n += 1;
    acc.total += 1;
    if (t.current_state === "completed") acc.success += 1;
    perfAcc.set(owner.actor_user_id, acc);
  }
  const assigneePerf = Array.from(perfAcc.entries())
    .map(([uid, acc]) => {
      const u = userById.get(uid);
      if (!u) return null;
      return {
        user_id: uid,
        user_name: u.name,
        role: u.role,
        avg_resolution_hours: Math.round((acc.sumHours / acc.n) * 10) / 10,
        success_rate: Math.round((acc.success / Math.max(1, acc.total)) * 1000) / 10,
        volume: acc.total,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.volume - a.volume);

  // ---- Handoff latency by pair ----
  const pairs: Record<string, number[]> = {};
  for (const tl of timelineByTicket.values()) {
    for (let i = 0; i < tl.length - 1; i++) {
      const a = tl[i].actor_role ?? "";
      const b = tl[i + 1].actor_role ?? "";
      if (!a || !b || a === b) continue;
      const hrs = (+new Date(tl[i + 1].timestamp) - +new Date(tl[i].timestamp)) / MS_HOUR;
      if (hrs <= 0 || hrs > 24 * 30) continue;
      const k = `${a} → ${b}`;
      (pairs[k] ??= []).push(hrs);
    }
  }
  const handoffLatency = Object.entries(pairs)
    .map(([pair, arr]) => ({
      pair,
      median_hours: Math.round(median(arr) * 10) / 10,
      sample_size: arr.length,
    }))
    .filter((p) => p.sample_size >= 5)
    .sort((a, b) => b.median_hours - a.median_hours)
    .slice(0, 8);

  // ---- Escalation board (per-step SLA breach drives escalation) ----
  // Priority = how far past SLA × revenue at stake, so the worst + most valuable
  // breaches surface first even when many tickets are technically breached.
  const escalation = openTickets
    .map((t) => ({ t, c: slaClass(t) }))
    .filter(({ t, c }) => c.state === "breached" || t.is_urgent)
    .map(({ t, c }) => {
      const days = Math.floor((+NOW - +new Date(t.created_at)) / MS_DAY);
      const isBreach = c.state === "breached";
      const rev = t.affected_revenue_vnd ?? 0;
      return {
        id: t.id,
        code: t.code,
        type: t.type,
        channel_name: channelById.get(t.channel_id)?.name ?? "—",
        owner_name: userById.get(t.created_by_user_id)?.name ?? "—",
        waiting_side: c.cs.step + " · " + c.cs.owner,
        days_open: days,
        breach_risk: (isBreach ? "breached" : "near") as "near" | "breached",
        severity: (isBreach ? "bad" : "warn") as "warn" | "bad",
        revenue_at_risk: rev,
        _priority: c.overdueRatio * Math.max(rev, 1),
      };
    })
    .sort((a, b) => b._priority - a._priority)
    .slice(0, 15)
    .map(({ _priority, ...rest }) => rest);

  // ---- Pause/Reopen weekly trend ----
  function startOfWeek(d: Date): Date {
    const x = new Date(d);
    const day = x.getUTCDay();
    const diff = (day + 6) % 7;
    x.setUTCDate(x.getUTCDate() - diff);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }
  const weekKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const ws = startOfWeek(new Date(+NOW - i * 7 * MS_DAY));
    weekKeys.push(ws.toISOString().slice(0, 10));
  }
  const pauseReopen = weekKeys.map((wk) => {
    const start = +new Date(wk);
    const end = start + 7 * MS_DAY;
    let paused = 0,
      reopened = 0;
    for (const tl of timelineByTicket.values()) {
      for (const e of tl) {
        const ts = +new Date(e.timestamp);
        if (ts < start || ts >= end) continue;
        if (e.to_state === "paused") paused += 1;
        if (e.from_state === "paused" && e.to_state === "processing") reopened += 1;
      }
    }
    return { week: wk, paused, reopened };
  });

  return {
    generated_at: new Date().toISOString(),
    as_of: NOW.toISOString(),
    queue,
    sla,
    near_breach: nearBreachList,
    assignee_workload: assigneeWorkload,
    assignee_perf: assigneePerf,
    handoff_latency: handoffLatency,
    escalation_board: escalation,
    pause_reopen: pauseReopen,
    totals: { total_tickets: tickets.length, open_tickets: openTickets.length },
  };
}

if (process.argv[1]?.endsWith("derive_ops.ts")) {
  const out = buildOps();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "operations.json"), JSON.stringify(out, null, 2));
  console.log("Wrote operations.json");
  console.log(`  near-breach=${out.near_breach.length}, escalations=${out.escalation_board.length}`);
  console.log(`  SLA within=${out.sla.pct_within}%`);
  console.log(`  assignees=${out.assignee_workload.length}, perf=${out.assignee_perf.length}`);
}
