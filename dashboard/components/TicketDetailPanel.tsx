"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { formatHours, formatVnd } from "@/lib/format";
import { STATE_LABEL, STATE_CHIP, TYPE_CHIP, SLA_STATUS_CHIP, SLA_STATUS_LABEL } from "@/lib/labels";

export interface TicketTimelineStep {
  timestamp: string;
  actor_role: string;
  actor_name: string;
  action: string;
  to_state: string | null;
  dwell_hours: number;
}

export interface TicketSlaStep {
  step_name: string;
  actor_role: string;
  expected_hours: number;
  actual_hours: number | null;
  status: string;
}

export interface TicketDetail {
  id: string;
  code: string;
  type: string;
  current_state: string;
  channel_name: string;
  project_name: string;
  network_name?: string;
  created_at: string;
  affected_revenue_vnd: number;
  is_urgent: boolean;
  claim_type?: string;
  claimer?: string;
  current_step?: string;
  current_owner?: string;
  hours_waiting?: number;
  hours_in_current_step?: number;
  sla_hours?: number;
  overdue_ratio?: number;
  days_open?: number;
  severity?: string;
  resolution_direction?: string;
  timeline?: TicketTimelineStep[];
  sla_steps?: TicketSlaStep[];
}

export function TicketDetailPanel({
  ticket,
  onClose,
}: {
  ticket: TicketDetail | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!ticket) return null;

  const createdDate = new Date(ticket.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const overdueRatio = ticket.overdue_ratio ?? 0;
  const slaBarPct = Math.min(overdueRatio * 100, 100);
  const slaBarColor = overdueRatio >= 1 ? "#D93025" : overdueRatio >= 0.75 ? "#F9AB00" : "#1E8E3E";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      {/* Side panel */}
      <div className="fixed right-0 top-0 h-full w-[440px] bg-white z-50 shadow-2xl flex flex-col border-l border-gborder">
        {/* Header */}
        <div className="p-5 border-b border-gborder shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={clsx("chip", TYPE_CHIP[ticket.type] ?? "chip-neutral")}>{ticket.type}</span>
                <span className={clsx("chip", STATE_CHIP[ticket.current_state] ?? "chip-neutral")}>
                  {STATE_LABEL[ticket.current_state] ?? ticket.current_state}
                </span>
                {ticket.is_urgent && <span className="chip chip-bad">Khẩn cấp</span>}
              </div>
              <div className="text-[16px] font-semibold text-gblue">{ticket.code}</div>
              <div className="text-[12px] text-gmuted mt-0.5">{ticket.channel_name} · {ticket.project_name}</div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gbg text-gmuted shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Info section */}
          <div className="p-5 space-y-3 border-b border-gborder">
            <div className="grid grid-cols-2 gap-3">
              <InfoCell icon="schedule" label="Tạo lúc" value={createdDate} />
              {ticket.days_open !== undefined && (
                <InfoCell icon="today" label="Đã mở" value={`${ticket.days_open} ngày`} />
              )}
              {ticket.current_owner && (
                <InfoCell icon="person" label="Đang xử lý" value={ticket.current_owner} />
              )}
              {ticket.current_step && (
                <InfoCell icon="arrow_forward" label="Bước hiện tại" value={ticket.current_step} />
              )}
              {(ticket.hours_in_current_step ?? ticket.hours_waiting) !== undefined && (
                <InfoCell
                  icon="hourglass_top"
                  label="Chờ tại bước này"
                  value={formatHours(ticket.hours_in_current_step ?? ticket.hours_waiting ?? 0)}
                />
              )}
              {ticket.sla_hours && (
                <InfoCell icon="timer" label="SLA bước" value={`${ticket.sla_hours}h`} />
              )}
            </div>

            {/* SLA progress bar */}
            {overdueRatio > 0 && (
              <div>
                <div className="flex justify-between text-[11px] text-gmuted mb-1">
                  <span>Tiến độ SLA bước</span>
                  <span style={{ color: slaBarColor }}>{Math.round(overdueRatio * 100)}%</span>
                </div>
                <div className="h-2 bg-gbg rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${slaBarPct}%`, background: slaBarColor }} />
                </div>
              </div>
            )}

            {ticket.affected_revenue_vnd > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <span className="material-symbols-outlined text-gred shrink-0" style={{ fontSize: 16 }}>payments</span>
                <div>
                  <div className="text-[11px] text-gmuted">Doanh thu rủi ro</div>
                  <div className="text-[13px] font-semibold text-gred">{formatVnd(ticket.affected_revenue_vnd)} ₫</div>
                </div>
              </div>
            )}

            {(ticket.claim_type || ticket.resolution_direction || ticket.claimer) && (
              <div className="grid grid-cols-2 gap-3">
                {ticket.claim_type && <InfoCell icon="category" label="Loại claim" value={ticket.claim_type} />}
                {ticket.claimer && <InfoCell icon="manage_accounts" label="Người claim" value={ticket.claimer} />}
                {ticket.resolution_direction && (
                  <div className="col-span-2">
                    <InfoCell icon="alt_route" label="Hướng xử lý" value={ticket.resolution_direction} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SLA Steps */}
          {ticket.sla_steps && ticket.sla_steps.length > 0 && (
            <div className="p-5 border-b border-gborder">
              <div className="text-[12px] font-medium text-gink mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gmuted" style={{ fontSize: 15 }}>timer</span>
                Tiến độ SLA theo bước
              </div>
              <div className="space-y-2">
                {ticket.sla_steps.map((s, i) => {
                  const ratio = s.actual_hours != null ? s.actual_hours / s.expected_hours : null;
                  const barColor = ratio == null ? "#1A73E8" : ratio > 1 ? "#D93025" : ratio > 0.75 ? "#F9AB00" : "#1E8E3E";
                  const barPct = ratio != null ? Math.min(ratio * 100, 100) : 60;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] text-gink truncate">{s.step_name}</span>
                          <span className={clsx("chip text-[10px] shrink-0 ml-2", SLA_STATUS_CHIP[s.status] ?? "chip-neutral")}>
                            {SLA_STATUS_LABEL[s.status] ?? s.status}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gbg rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: barColor }} />
                        </div>
                      </div>
                      <div className="text-[11px] text-gmuted tabular-nums shrink-0 w-20 text-right">
                        {s.actual_hours != null ? `${s.actual_hours}h` : "—"} / {s.expected_hours}h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline */}
          {ticket.timeline && ticket.timeline.length > 0 && (
            <div className="p-5">
              <div className="text-[12px] font-medium text-gink mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gmuted" style={{ fontSize: 15 }}>history</span>
                Lịch sử xử lý ({ticket.timeline.length} bước)
              </div>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gborder" />
                <div className="space-y-4">
                  {ticket.timeline.map((step, i) => {
                    const isLast = i === ticket.timeline!.length - 1;
                    const ts = new Date(step.timestamp).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    });
                    return (
                      <div key={i} className="flex gap-3 relative">
                        <div
                          className={clsx(
                            "w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border-2 z-10",
                            isLast ? "bg-gblue border-gblue" : "bg-white border-gborder"
                          )}
                        />
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] text-gink leading-snug">{step.action}</div>
                              <div className="text-[11px] text-gmuted mt-0.5">
                                {step.actor_name}
                                {step.to_state && (
                                  <span className="ml-1">→ <span className="text-gblue">{STATE_LABEL[step.to_state] ?? step.to_state}</span></span>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-gmuted shrink-0 text-right">
                              <div>{ts}</div>
                              {step.dwell_hours > 0 && (
                                <div className="text-[10px] text-gamber">+{step.dwell_hours}h</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gborder shrink-0 flex gap-2">
          <div className="flex-1 text-[11px] text-gmuted flex items-center">
            ID: <span className="font-mono ml-1 text-gink">{ticket.id}</span>
          </div>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gborder text-[13px] text-gmuted hover:bg-gbg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
}

function InfoCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-outlined text-gmuted shrink-0 mt-0.5" style={{ fontSize: 14 }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] text-gmuted">{label}</div>
        <div className="text-[12px] text-gink mt-0.5 truncate">{value}</div>
      </div>
    </div>
  );
}
