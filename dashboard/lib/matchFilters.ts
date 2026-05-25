// Composable predicates for filtering ticket-like rows by FilterContext state.
// Replaces ad-hoc `matchItem`/`matchAction`/`matchHistory` duplication in
// OperationsDashboard, SeoDashboard, ExecutiveDashboard.

import type { FilterState } from "@/components/FilterContext";

const MS_DAY = 86_400_000;

export interface FilterableRow {
  type?: string;
  channel_id?: string;
  project_id?: string;
  network_id?: string;
  severity?: string;
  created_at?: string;
  resolved_at?: string;
}

export function matchType(row: FilterableRow, f: FilterState): boolean {
  if (f.types.length === 0) return true;
  return !!row.type && f.types.includes(row.type as any);
}

export function matchChannel(row: FilterableRow, f: FilterState): boolean {
  if (!f.channelId) return true;
  return row.channel_id === f.channelId;
}

export function matchProject(row: FilterableRow, f: FilterState): boolean {
  if (!f.projectId) return true;
  return row.project_id === f.projectId;
}

export function matchNetwork(row: FilterableRow, f: FilterState): boolean {
  if (!f.networkId) return true;
  return row.network_id === f.networkId;
}

// Date range check using row.resolved_at first (for outcomes), then created_at.
export function matchDateRange(
  row: FilterableRow,
  f: FilterState,
  nowMs: number
): boolean {
  if (f.dateRange === "all") return true;
  const ts = row.resolved_at ?? row.created_at;
  if (!ts) return true;
  const days = f.dateRange === "7d" ? 7 : f.dateRange === "30d" ? 30 : 90;
  return nowMs - new Date(ts).getTime() <= days * MS_DAY;
}

// Severity match with row-level severity string (e.g. "critical"/"high"/...).
export function matchSeverity(row: FilterableRow, f: FilterState): boolean {
  if (!f.severity) return true;
  return row.severity === f.severity;
}

// Operations-specific severity match: rows use "warn"/"bad" tone, not the
// 4-level severity. Filter "critical"→bad, "high"→warn, others never match.
export function matchOperationsSeverity(row: FilterableRow, f: FilterState): boolean {
  if (!f.severity) return true;
  const wanted =
    f.severity === "critical" ? "bad" :
    f.severity === "high"     ? "warn" :
    null;
  if (wanted === null) return false;
  return row.severity === wanted;
}

// Composable predicates per dashboard.

// "Action now" matcher: ignores dateRange (action queues are time-agnostic).
export function makeActionMatcher(f: FilterState) {
  return (row: FilterableRow) =>
    matchType(row, f) &&
    matchChannel(row, f) &&
    matchProject(row, f) &&
    matchNetwork(row, f);
}

// Historical matcher: action filters + dateRange window.
export function makeHistoryMatcher(f: FilterState, nowMs: number) {
  return (row: FilterableRow) =>
    matchType(row, f) &&
    matchChannel(row, f) &&
    matchProject(row, f) &&
    matchNetwork(row, f) &&
    matchDateRange(row, f, nowMs);
}

// Operations matcher: action filters + ops-flavored severity mapping.
export function makeOperationsMatcher(f: FilterState) {
  return (row: FilterableRow) =>
    matchType(row, f) &&
    matchChannel(row, f) &&
    matchProject(row, f) &&
    matchNetwork(row, f) &&
    matchOperationsSeverity(row, f);
}

// Full matcher (Executive): action filters + dateRange + standard severity.
export function makeFullMatcher(f: FilterState, nowMs: number) {
  return (row: FilterableRow) =>
    matchType(row, f) &&
    matchChannel(row, f) &&
    matchProject(row, f) &&
    matchNetwork(row, f) &&
    matchSeverity(row, f) &&
    matchDateRange(row, f, nowMs);
}
