import fs from "node:fs";
import path from "node:path";
import type { Ticket, Channel, User, Project, TimelineEvent } from "./types";
import { currentStepInfo } from "./sla";
import {
  channelById as buildChannelById,
  userById as buildUserById,
  projectById as buildProjectById,
  networkById as buildNetworkById,
  timelineByTicket as buildTimelineByTicket,
  groupBy,
} from "./lookups";

const DATA_DIR = path.resolve(process.cwd(), "data");
const NOW = new Date("2026-05-23T09:00:00+07:00");
const MS_HOUR = 3_600_000;

function load<T>(file: string): T[] {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T[];
}

export interface TicketTimelineStep {
  timestamp: string;
  actor_role: string;
  actor_name: string;
  action: string;
  to_state: string | null;
  dwell_hours: number; // hours since previous step
}

export interface TicketDetailFull {
  id: string;
  code: string;
  type: string;
  current_state: string;
  channel_name: string;
  channel_id: string;
  project_name: string;
  network_name: string;
  created_at: string;
  updated_at: string;
  affected_revenue_vnd: number;
  is_urgent: boolean;
  claim_type?: string;
  claimer?: string;
  resolution_direction?: string;
  current_step: string;
  current_owner: string;
  hours_in_current_step: number;
  sla_hours: number;
  overdue_ratio: number;
  days_open: number;
  timeline: TicketTimelineStep[];
  sla_steps: {
    step_name: string;
    actor_role: string;
    expected_hours: number;
    actual_hours: number | null;
    status: string;
  }[];
}

interface SlaStepRaw {
  id: string;
  ticket_id: string;
  step_name: string;
  actor_role: string;
  expected_hours: number;
  started_at: string;
  completed_at: string | null;
  status: string;
}

export function buildTicketDetails(): Record<string, TicketDetailFull> {
  const tickets = load<Ticket>("tickets.json");
  const channels = load<Channel>("channels.json");
  const users = load<User>("users.json");
  const projects = load<Project>("projects.json");
  const networks = load<any>("networks.json");
  const timeline = load<TimelineEvent>("timeline.json");
  const slaSteps = load<SlaStepRaw>("sla_steps.json");

  const channelById = buildChannelById(channels);
  const userById = buildUserById(users);
  const projectById = buildProjectById(projects);
  const networkById = buildNetworkById(networks);
  const timelineByTicket = buildTimelineByTicket(timeline);
  const slaStepsByTicket = groupBy(slaSteps, (s) => s.ticket_id);

  const result: Record<string, TicketDetailFull> = {};

  // Build detail for EVERY ticket — completed/failed/closed rows are also
  // drilled into from "Recent outcomes" on the SEO page.
  for (const t of tickets) {
    const ch = channelById.get(t.channel_id);
    const proj = projectById.get(t.project_id);
    const net = networkById.get(t.network_id);
    const tl = timelineByTicket.get(t.id) ?? [];
    const steps = slaStepsByTicket.get(t.id) ?? [];

    // Current step & SLA — shared classifier from lib/sla.ts
    const info = currentStepInfo(t, tl, NOW);
    const dwellHours = info.dwellHours;
    const overdueRatio = info.overdueRatio;
    const daysOpen = Math.floor((+NOW - +new Date(t.created_at)) / (MS_HOUR * 24));

    // Build timeline steps with dwell
    const timelineSteps: TicketTimelineStep[] = tl.map((e, i) => {
      const prev = i > 0 ? tl[i - 1] : null;
      const dwellH = prev ? (+new Date(e.timestamp) - +new Date(prev.timestamp)) / MS_HOUR : 0;
      const actor = userById.get(e.actor_user_id ?? "");
      return {
        timestamp: e.timestamp,
        actor_role: e.actor_role ?? "SYSTEM",
        actor_name: actor?.name ?? e.actor_role ?? "Hệ thống",
        action: e.action,
        to_state: e.to_state ?? null,
        dwell_hours: Math.round(dwellH * 10) / 10,
      };
    });

    // Build SLA steps
    const slaStepDetail = steps.map((s) => ({
      step_name: s.step_name,
      actor_role: s.actor_role,
      expected_hours: s.expected_hours,
      actual_hours: s.completed_at
        ? Math.round(((+new Date(s.completed_at)) - (+new Date(s.started_at))) / MS_HOUR * 10) / 10
        : null,
      status: s.status,
    }));

    result[t.id] = {
      id: t.id,
      code: t.code,
      type: t.type,
      current_state: t.current_state,
      channel_name: ch?.name ?? "—",
      channel_id: t.channel_id,
      project_name: proj?.name ?? "—",
      network_name: net?.name ?? "—",
      created_at: t.created_at,
      updated_at: t.updated_at,
      affected_revenue_vnd: t.affected_revenue_vnd ?? 0,
      is_urgent: t.is_urgent ?? false,
      claim_type: t.claim_type,
      claimer: (t as any).claimer,
      resolution_direction: t.resolution_direction,
      current_step: info.step,
      current_owner: info.owner,
      hours_in_current_step: Math.round(dwellHours * 10) / 10,
      sla_hours: info.slaHours,
      overdue_ratio: Math.round(overdueRatio * 100) / 100,
      days_open: daysOpen,
      timeline: timelineSteps,
      sla_steps: slaStepDetail,
    };
  }

  return result;
}

if (process.argv[1]?.endsWith("derive_detail.ts")) {
  const OUT_DIR = path.resolve(process.cwd(), "derived");
  const out = buildTicketDetails();
  const count = Object.keys(out).length;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "ticket_details.json"), JSON.stringify(out, null, 2));
  console.log(`Wrote ticket_details.json (${count} tickets — all states)`);
}
