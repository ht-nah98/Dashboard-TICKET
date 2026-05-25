// Single source of truth for Vietnamese label maps and chip class mappings.
// Used by all dashboard components — never duplicate these in component files.

export const STATE_LABEL: Record<string, string> = {
  draft: "Nháp",
  sent: "Đã gửi",
  processing: "Đang xử lý",
  paused: "Tạm dừng",
  completed: "Hoàn thành",
  closed: "Đã đóng",
  failed: "Thất bại",
};

export const STATE_CHIP: Record<string, string> = {
  draft: "chip-neutral",
  sent: "chip-info",
  processing: "chip-info",
  paused: "chip-warn",
  completed: "chip-good",
  closed: "chip-neutral",
  failed: "chip-bad",
};

export const TYPE_CHIP: Record<string, string> = {
  CLAIM: "chip-bad",
  GBQ: "chip-bad",
  DIE: "chip-bad",
  WHITELIST: "chip-info",
  TKT_BKT: "chip-info",
  GCD: "chip-neutral",
};

export const SLA_STATUS_LABEL: Record<string, string> = {
  completed: "Xong",
  in_progress: "Đang chạy",
  breached: "Trễ",
  pending: "Chờ",
};

export const SLA_STATUS_CHIP: Record<string, string> = {
  completed: "chip-good",
  in_progress: "chip-info",
  breached: "chip-bad",
  pending: "chip-neutral",
};

export const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

export const SEVERITY_CHIP: Record<string, string> = {
  critical: "chip-bad",
  high: "chip-warn",
  medium: "chip-info",
  low: "chip-neutral",
};

// Tone chips used by SeoActionQueue, WaitingSplit, etc.
export const TONE_CHIP: Record<string, string> = {
  bad: "chip-bad",
  warn: "chip-warn",
  ok: "chip-good",
  good: "chip-good",
  info: "chip-info",
  neutral: "chip-neutral",
};

export function labelState(state: string | undefined | null): string {
  if (!state) return "—";
  return STATE_LABEL[state] ?? state;
}

export function chipForState(state: string | undefined | null): string {
  if (!state) return "chip-neutral";
  return STATE_CHIP[state] ?? "chip-neutral";
}

export function chipForType(type: string | undefined | null): string {
  if (!type) return "chip-neutral";
  return TYPE_CHIP[type] ?? "chip-neutral";
}
