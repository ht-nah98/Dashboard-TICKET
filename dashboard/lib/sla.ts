// Single source of truth for per-step SLA classification.
// Used by derive.ts, derive_ops.ts, derive_seo.ts, derive_detail.ts.

import type { Ticket, TimelineEvent } from "./types";

export interface SlaRule {
  match: RegExp;
  hours: number;
  owner: string;
  step: string;
}

export const STEP_SLA: SlaRule[] = [
  { match: /VHYT tiếp nhận \(SLA 2h\)/, hours: 2, owner: "VHYT", step: "VHYT tiếp nhận" },
  { match: /SEO thực hiện kháng \(SLA 1h\)/, hours: 1, owner: "SEO", step: "SEO thực hiện kháng" },
  { match: /^VHYT tiếp nhận/, hours: 2, owner: "VHYT", step: "VHYT tiếp nhận" },
  { match: /^VHYT (liên hệ|chọn|trigger|cập nhật|soạn|tạo|gửi)/, hours: 12, owner: "VHYT", step: "VHYT xử lý" },
  { match: /^VHDA/, hours: 12, owner: "VHDA", step: "VHDA xử lý" },
  { match: /^VHWL bắt đầu/, hours: 24, owner: "VHWL", step: "VHWL xử lý" },
  { match: /^VHWL hoàn thành/, hours: 8, owner: "SEO", step: "Chờ SEO xác nhận" },
  { match: /^SEO gửi ticket/, hours: 24, owner: "VHYT", step: "Chờ VHYT tiếp nhận" },
  { match: /^SEO (gửi lại|đã thực hiện|nộp|Cut|submit)/, hours: 24, owner: "VHYT", step: "Chờ VHYT xử lý" },
  { match: /^SEO tạo ticket/, hours: 48, owner: "SEO", step: "SEO hoàn thiện & gửi" },
  { match: /dịch vụ ngoài/, hours: 168, owner: "External", step: "Chờ dịch vụ ngoài" },
  { match: /Tự động Tạm dừng/, hours: 24, owner: "SEO", step: "Tạm dừng — chờ mở lại" },
];

export const DEFAULT_SLA: SlaRule = {
  match: /.*/,
  hours: 48,
  owner: "—",
  step: "Khác",
};

const MS_HOUR = 3_600_000;

export function classifyStep(action: string | undefined | null): SlaRule {
  if (!action) return DEFAULT_SLA;
  return STEP_SLA.find((r) => r.match.test(action)) ?? DEFAULT_SLA;
}

export interface CurrentStepInfo {
  step: string;
  owner: string;
  slaHours: number;
  dwellHours: number;
  overdueRatio: number;
}

export function currentStepInfo(
  ticket: Ticket,
  timeline: TimelineEvent[],
  now: Date
): CurrentStepInfo {
  const last = timeline[timeline.length - 1];
  if (!last) {
    const dwell = (+now - +new Date(ticket.created_at)) / MS_HOUR;
    return {
      step: "Chưa có timeline",
      owner: DEFAULT_SLA.owner,
      slaHours: DEFAULT_SLA.hours,
      dwellHours: dwell,
      overdueRatio: dwell / DEFAULT_SLA.hours,
    };
  }
  const rule = classifyStep(last.action);
  const dwell = (+now - +new Date(last.timestamp)) / MS_HOUR;
  return {
    step: rule.step,
    owner: rule.owner,
    slaHours: rule.hours,
    dwellHours: dwell,
    overdueRatio: dwell / rule.hours,
  };
}

export function isOpen(t: Ticket): boolean {
  return !["completed", "closed", "failed"].includes(t.current_state);
}
