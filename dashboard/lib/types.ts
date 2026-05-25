export type TicketType = "CLAIM" | "WHITELIST" | "GBQ" | "GCD" | "TKT_BKT" | "DIE";
export type TicketState =
  | "draft"
  | "sent"
  | "processing"
  | "paused"
  | "completed"
  | "closed"
  | "failed";

export interface Ticket {
  id: string;
  type: TicketType;
  code: string;
  created_by_user_id: string;
  channel_id: string;
  video_id?: string | null;
  project_id: string;
  network_id: string;
  company_id: string;
  department_id: string;
  created_at: string;
  updated_at: string;
  current_state: TicketState;
  claim_type?: string;
  claimer?: string;
  label_id?: string;
  video_status?: string;
  is_urgent?: boolean;
  resource_kind?: string;
  resolution_plan?: string;
  template_id?: string;
  closed_at?: string;
  completed_at?: string;
  affected_revenue_vnd?: number;
  strike_type?: string;
  gay_category?: string;
  net_whitelist_id?: string;
  kho_whitelist_id?: string;
  resolution_direction?: string;
  sub_type?: string;
  re_apply_after?: string;
  re_apply_wait_days?: number;
  cooldown_days?: number;
  youtube_decision_date?: string;
}

export interface Channel {
  id: string;
  name: string;
  project_id: string;
  network_id: string;
  owner_seo_user_id: string;
  subscribers: number;
  monthly_revenue_vnd: number;
  whitelist_status: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  department_id: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Network {
  id: string;
  name: string;
}

export interface TimelineEvent {
  id: string;
  ticket_id: string;
  actor_user_id?: string;
  actor_role?: string;
  action: string;
  from_state?: string | null;
  to_state?: string;
  timestamp: string;
}

export interface SlaEvent {
  id: string;
  ticket_id: string;
  event_type: "reminder_24h" | "breach_48h" | "auto_pause_24h" | "auto_close_30d";
  timestamp: string;
}

export interface MasterWhitelistRow {
  id: string;
  channel_id: string;
  kho_whitelist_id: string;
  net_whitelist_id: string;
  trang_thai_wl: string;
  ngay_dk_wl?: string | null;
  ngay_wl_thanh_cong?: string | null;
  ghi_chu?: string | null;
  source_ticket_id?: string | null;
  source?: string;
  created_at?: string;
}

export interface KpiCard {
  key: string;
  label: string;
  value: number;
  unit: "count" | "vnd" | "pct" | "hours";
  delta_pct: number | null;
  delta_label: string;
  sparkline: number[];
  tone: "neutral" | "warn" | "bad" | "good";
}

export interface OperationsPayload {
  generated_at: string;
  as_of: string;
  ops_kpis: KpiCard[];
  queue: { key: string; label: string; value: number; tone: "neutral" | "warn" | "bad" | "good" }[];
  sla: {
    within: number;
    near: number;
    breached: number;
    pct_within: number;
    breach_by_owner: { owner: string; count: number }[];
  };
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
  assignee_workload: {
    user_id: string;
    user_name: string;
    role: string;
    open: number;
    critical: number;
    breached: number;
    load_pct: number;
  }[];
  assignee_perf: {
    user_id: string;
    user_name: string;
    role: string;
    avg_resolution_hours: number;
    success_rate: number;
    volume: number;
  }[];
  handoff_latency: { pair: string; median_hours: number; sample_size: number }[];
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
    revenue_at_risk: number;
  }[];
  pause_reopen: { week: string; paused: number; reopened: number }[];
  aging: { bucket: string; count: number; tone: "good" | "warn" | "bad" }[];
  waiting_split: { side: string; count: number; owner: string }[];
  totals: { total_tickets: number; open_tickets: number };
}

export interface DerivedPayload {
  generated_at: string;
  as_of: string;
  kpis: KpiCard[];
  revenue: {
    at_risk_now: number;
    recovered_mtd: number;
    realized_loss_ytd: number;
    weekly: { week: string; at_risk: number; recovered: number; lost: number }[];
    by_project: { project_id: string; project_name: string; at_risk: number; share_pct: number }[];
  };
  volume_trend: { week: string; CLAIM: number; WHITELIST: number; GBQ: number; GCD: number; TKT_BKT: number; DIE: number }[];
  outcome_trend: { week: string; completed: number; failed: number; open: number; success_rate: number }[];
  type_risk: { type: TicketType; count: number; median_revenue: number; score: number }[];
  project_type_heatmap: { project_id: string; project_name: string; cells: Record<TicketType, number> }[];
  funnel: { step: string; count: number; median_dwell_hours: number }[];
  aging: { bucket: string; count: number; tone: "good" | "warn" | "bad" }[];
  waiting_split: { side: string; count: number }[];
  channels_top: {
    channel_id: string;
    channel_name: string;
    project_name: string;
    open_count: number;
    critical_count: number;
    revenue_at_risk: number;
    monthly_revenue: number;
    days_unresolved: number;
    whitelist_status: string;
    no_whitelist_flag: boolean;
    severity: "low" | "medium" | "high" | "critical";
    composite_score: number;
  }[];
  anomalies: {
    id: string;
    title: string;
    detail: string;
    direction: "up" | "down";
    magnitude_pct: number;
    severity: "info" | "warn" | "bad";
  }[];
  totals: {
    total_tickets: number;
    open_tickets: number;
    completed_tickets: number;
  };
}
