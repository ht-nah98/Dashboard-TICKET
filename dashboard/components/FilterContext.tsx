"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT);

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

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}

// Helper: test if a ticket matches current filters
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
