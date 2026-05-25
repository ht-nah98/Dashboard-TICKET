"use client";

import { useEffect, useMemo } from "react";
import clsx from "clsx";
import { formatVnd, formatHours } from "@/lib/format";
import { STATE_LABEL, STATE_CHIP, TYPE_CHIP } from "@/lib/labels";
import type { TicketDetail } from "./TicketDetailPanel";

export interface ListRow {
  id: string;
  code: string;
  type: string;
  channel_name: string;
  project_name?: string;
  current_state?: string;
  current_step?: string;
  current_owner?: string;
  hours_in_current_step?: number;
  sla_hours?: number;
  overdue_ratio?: number;
  affected_revenue_vnd?: number;
  is_urgent?: boolean;
  days_open?: number;
  created_at?: string;
}

/**
 * Right-side panel showing a list of tickets matching a drill-down query.
 * Click a row to open the full TicketDetailPanel.
 */
export function TicketListPanel({
  title,
  subtitle,
  rows,
  onClose,
  onRowClick,
}: {
  title: string;
  subtitle?: string;
  rows: ListRow[];
  onClose: () => void;
  onRowClick: (row: ListRow) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      // urgent first, then most overdue, then most recent
      if ((a.is_urgent ?? false) !== (b.is_urgent ?? false)) return a.is_urgent ? -1 : 1;
      const ar = a.overdue_ratio ?? 0;
      const br = b.overdue_ratio ?? 0;
      if (ar !== br) return br - ar;
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
  }, [rows]);

  function exportCsv() {
    const headers = [
      "code", "type", "channel_name", "project_name", "current_state",
      "current_step", "current_owner", "hours_in_current_step", "sla_hours",
      "overdue_ratio", "affected_revenue_vnd", "is_urgent", "days_open", "created_at",
    ];
    const escape = (v: unknown): string => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      // CSV escape: wrap in quotes if it contains comma/quote/newline; double-up internal quotes
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(",")];
    for (const r of sorted) {
      lines.push(headers.map((h) => escape((r as any)[h])).join(","));
    }
    // UTF-8 BOM so Excel renders Vietnamese diacritics correctly.
    const csv = "﻿" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().slice(0, 10);
    const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
    a.href = url;
    a.download = `tickets_${safeTitle}_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[560px] bg-white z-50 shadow-2xl flex flex-col border-l border-gborder">
        {/* Header */}
        <div className="p-5 border-b border-gborder shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-gink">{title}</div>
              {subtitle && (
                <div className="text-[12px] text-gmuted mt-0.5">{subtitle}</div>
              )}
              <div className="text-[11px] text-gmuted mt-1">
                {rows.length} ticket · click để xem chi tiết
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={exportCsv}
                disabled={sorted.length === 0}
                title="Tải danh sách dưới dạng CSV"
                className="h-8 px-3 rounded-lg text-[12px] text-gblue hover:bg-gbg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                CSV
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gbg text-gmuted"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-gmuted">
              Không có ticket nào khớp bộ lọc này.
            </div>
          ) : (
            <div className="divide-y divide-gborder/60">
              {sorted.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onRowClick(r)}
                  className="w-full text-left p-4 hover:bg-gbg transition flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={clsx("chip text-[11px]", TYPE_CHIP[r.type] ?? "chip-neutral")}>{r.type}</span>
                      {r.current_state && (
                        <span className={clsx("chip text-[11px]", STATE_CHIP[r.current_state] ?? "chip-neutral")}>
                          {STATE_LABEL[r.current_state] ?? r.current_state}
                        </span>
                      )}
                      {r.is_urgent && <span className="chip chip-bad text-[11px]">Khẩn cấp</span>}
                      <span className="text-[12px] font-medium text-gblue">{r.code}</span>
                    </div>
                    <div className="text-[12px] text-gink truncate">{r.channel_name}{r.project_name ? ` · ${r.project_name}` : ""}</div>
                    {(r.current_step || r.current_owner) && (
                      <div className="text-[11px] text-gmuted truncate mt-0.5">
                        {r.current_step}{r.current_owner ? ` · ${r.current_owner}` : ""}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right space-y-0.5">
                    {r.hours_in_current_step !== undefined && (
                      <div className="text-[11px] text-gmuted tabular-nums">
                        {formatHours(r.hours_in_current_step)}
                        {r.sla_hours ? ` / ${r.sla_hours}h` : ""}
                      </div>
                    )}
                    {(r.affected_revenue_vnd ?? 0) > 0 && (
                      <div className="text-[11px] text-gred tabular-nums">
                        {formatVnd(r.affected_revenue_vnd!)} ₫
                      </div>
                    )}
                    {r.days_open !== undefined && (
                      <div className="text-[10px] text-gmuted">{r.days_open}d</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gborder shrink-0 text-[11px] text-gmuted text-center">
          ESC để đóng
        </div>
      </div>
    </>
  );
}

/** Convert a ticket_details.json row to a ListRow */
export function detailToListRow(d: any): ListRow {
  return {
    id: d.id,
    code: d.code,
    type: d.type,
    channel_name: d.channel_name,
    project_name: d.project_name,
    current_state: d.current_state,
    current_step: d.current_step,
    current_owner: d.current_owner,
    hours_in_current_step: d.hours_in_current_step,
    sla_hours: d.sla_hours,
    overdue_ratio: d.overdue_ratio,
    affected_revenue_vnd: d.affected_revenue_vnd,
    is_urgent: d.is_urgent,
    days_open: d.days_open,
    created_at: d.created_at,
  };
}

/** Convert a ListRow to a TicketDetail (when full detail map missing) */
export function listRowToDetail(r: ListRow): TicketDetail {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    current_state: r.current_state ?? "processing",
    channel_name: r.channel_name,
    project_name: r.project_name ?? "—",
    created_at: r.created_at ?? new Date().toISOString(),
    affected_revenue_vnd: r.affected_revenue_vnd ?? 0,
    is_urgent: r.is_urgent ?? false,
    current_step: r.current_step,
    current_owner: r.current_owner,
    hours_in_current_step: r.hours_in_current_step,
    sla_hours: r.sla_hours,
    overdue_ratio: r.overdue_ratio,
    days_open: r.days_open,
  };
}
