"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type TicketType = "CLAIM" | "WHITELIST" | "GBQ" | "GCD" | "TKT_BKT" | "DIE";
export type Severity = "critical" | "high" | "medium" | "low";
export type DateRange = "7d" | "30d" | "90d" | "all";

export interface FilterState {
  dateRange: DateRange;
  types: TicketType[];
  projectId: string | null;
  networkId: string | null;
  severity: Severity | null;
  channelId: string | null;
  channelName: string | null;
}

interface FilterContextValue {
  filters: FilterState;
  setDateRange: (v: DateRange) => void;
  toggleType: (v: TicketType) => void;
  setProjectId: (v: string | null) => void;
  setNetworkId: (v: string | null) => void;
  setSeverity: (v: Severity | null) => void;
  setChannel: (id: string | null, name: string | null) => void;
  clearAll: () => void;
  activeCount: number;
}

const DEFAULT: FilterState = {
  dateRange: "30d",
  types: [],
  projectId: null,
  networkId: null,
  severity: null,
  channelId: null,
  channelName: null,
};

const FilterContext = createContext<FilterContextValue | null>(null);

const VALID_DATE: DateRange[] = ["7d", "30d", "90d", "all"];
const VALID_SEV: Severity[] = ["critical", "high", "medium", "low"];
const VALID_TYPES: TicketType[] = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"];

function parseFromSearchParams(sp: URLSearchParams): FilterState {
  const dr = sp.get("dateRange");
  const types = (sp.get("types") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is TicketType => VALID_TYPES.includes(t as TicketType));
  const sev = sp.get("severity");
  return {
    dateRange: VALID_DATE.includes(dr as DateRange) ? (dr as DateRange) : "30d",
    types,
    projectId: sp.get("project") || null,
    networkId: sp.get("network") || null,
    severity: VALID_SEV.includes(sev as Severity) ? (sev as Severity) : null,
    channelId: sp.get("channel") || null,
    channelName: sp.get("channelName") || null,
  };
}

function toSearchParams(f: FilterState): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.dateRange !== "30d") sp.set("dateRange", f.dateRange);
  if (f.types.length > 0) sp.set("types", f.types.join(","));
  if (f.projectId) sp.set("project", f.projectId);
  if (f.networkId) sp.set("network", f.networkId);
  if (f.severity) sp.set("severity", f.severity);
  if (f.channelId) sp.set("channel", f.channelId);
  if (f.channelName) sp.set("channelName", f.channelName);
  return sp;
}

function FilterProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL on first render
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFromSearchParams(new URLSearchParams(searchParams.toString()))
  );

  // Push state → URL whenever filters change. Use replace (not push) so the
  // back button still navigates between pages, not between filter edits.
  useEffect(() => {
    const sp = toSearchParams(filters);
    const qs = sp.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (next !== current) router.replace(next, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  // On navigation (pathname change) the URL may have its own filter state;
  // sync it into our context. Only re-parse when the searchParams string changes.
  useEffect(() => {
    const fromUrl = parseFromSearchParams(new URLSearchParams(searchParams.toString()));
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(fromUrl) ? prev : fromUrl
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const setDateRange = useCallback((v: DateRange) => setFilters((f) => ({ ...f, dateRange: v })), []);
  const toggleType = useCallback((v: TicketType) =>
    setFilters((f) => ({
      ...f,
      types: f.types.includes(v) ? f.types.filter((t) => t !== v) : [...f.types, v],
    })), []);
  const setProjectId = useCallback((v: string | null) => setFilters((f) => ({ ...f, projectId: v })), []);
  const setNetworkId = useCallback((v: string | null) => setFilters((f) => ({ ...f, networkId: v })), []);
  const setSeverity = useCallback((v: Severity | null) => setFilters((f) => ({ ...f, severity: v })), []);
  const setChannel = useCallback((id: string | null, name: string | null) =>
    setFilters((f) => ({ ...f, channelId: id, channelName: name })), []);
  const clearAll = useCallback(() => setFilters(DEFAULT), []);

  const activeCount =
    (filters.dateRange !== "30d" ? 1 : 0) +
    filters.types.length +
    (filters.projectId ? 1 : 0) +
    (filters.networkId ? 1 : 0) +
    (filters.severity ? 1 : 0) +
    (filters.channelId ? 1 : 0);

  return (
    <FilterContext.Provider value={{
      filters, setDateRange, toggleType, setProjectId, setNetworkId,
      setSeverity, setChannel, clearAll, activeCount,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  // useSearchParams requires a Suspense boundary in app router
  return (
    <Suspense fallback={<FilterProviderFallback>{children}</FilterProviderFallback>}>
      <FilterProviderInner>{children}</FilterProviderInner>
    </Suspense>
  );
}

// During the suspended render (no URL yet) provide DEFAULT filters so the
// children can still mount; the real provider takes over once searchParams is
// available.
function FilterProviderFallback({ children }: { children: React.ReactNode }) {
  const value: FilterContextValue = {
    filters: DEFAULT,
    setDateRange: () => {},
    toggleType: () => {},
    setProjectId: () => {},
    setNetworkId: () => {},
    setSeverity: () => {},
    setChannel: () => {},
    clearAll: () => {},
    activeCount: 0,
  };
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}

// Helper: test if a ticket matches current filters (kept for backward compat).
export function matchesFilters(
  ticket: {
    type: string;
    project_id?: string;
    network_id?: string;
    channel_id?: string;
    severity?: string;
    created_at?: string;
  },
  filters: FilterState,
  nowMs: number = Date.now()
): boolean {
  if (filters.types.length > 0 && !filters.types.includes(ticket.type as TicketType)) return false;
  if (filters.projectId && ticket.project_id !== filters.projectId) return false;
  if (filters.networkId && ticket.network_id !== filters.networkId) return false;
  if (filters.channelId && ticket.channel_id !== filters.channelId) return false;
  if (filters.severity && ticket.severity !== filters.severity) return false;
  if (filters.dateRange !== "all" && ticket.created_at) {
    const days = filters.dateRange === "7d" ? 7 : filters.dateRange === "30d" ? 30 : 90;
    if (nowMs - new Date(ticket.created_at).getTime() > days * 86400000) return false;
  }
  return true;
}
