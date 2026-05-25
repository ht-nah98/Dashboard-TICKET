"use client";

import clsx from "clsx";
import { useFilters, type TicketType, type DateRange, type Severity } from "./FilterContext";

const TICKET_TYPES: TicketType[] = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"];
const TYPE_COLOR: Record<string, string> = {
  CLAIM: "chip-bad", GBQ: "chip-bad", DIE: "chip-bad",
  WHITELIST: "chip-good", TKT_BKT: "chip-info", GCD: "chip-neutral",
};
const DATE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "90 ngày", value: "90d" },
  { label: "Tất cả", value: "all" },
];
const SEVERITY_OPTIONS: { label: string; value: Severity; chip: string }[] = [
  { label: "Critical", value: "critical", chip: "chip-bad" },
  { label: "Cao", value: "high", chip: "chip-warn" },
  { label: "Trung bình", value: "medium", chip: "chip-info" },
  { label: "Thấp", value: "low", chip: "chip-neutral" },
];

const PROJECTS = [
  { id: "PRJ-0001", name: "Âm Nhạc Việt" },
  { id: "PRJ-0002", name: "Giải Trí 24h" },
  { id: "PRJ-0003", name: "Vlog Cuộc Sống" },
  { id: "PRJ-0004", name: "Phim Hoạt Hình" },
  { id: "PRJ-0005", name: "Học Tập Online" },
];
const NETWORKS = [
  { id: "NET-0001", name: "Yeah1 Network" },
  { id: "NET-0002", name: "METUB Network" },
  { id: "NET-0003", name: "POPS Worldwide" },
  { id: "NET-0004", name: "BHMedia" },
];

export function FilterBar() {
  const { filters, setDateRange, toggleType, setProjectId, setNetworkId, setSeverity, setChannel, clearAll, activeCount } = useFilters();

  return (
    <div className="px-6 py-3 bg-white border-b border-gborder space-y-2">
      {/* Row 1: date + type chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date range */}
        <div className="flex items-center bg-gbg rounded-full p-0.5 text-[12px] font-medium shrink-0">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={clsx(
                "px-3 py-1 rounded-full transition",
                filters.dateRange === opt.value ? "bg-white text-gink shadow-sm" : "text-gmuted hover:text-gink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gborder shrink-0" />

        {/* Type chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TICKET_TYPES.map((ty) => (
            <button
              key={ty}
              onClick={() => toggleType(ty)}
              className={clsx(
                "chip text-[11px] transition border",
                filters.types.includes(ty)
                  ? `${TYPE_COLOR[ty]} border-transparent`
                  : "chip-neutral border-gborder bg-white opacity-60 hover:opacity-100"
              )}
            >
              {ty}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Active count + clear */}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[12px] text-gblue font-medium hover:underline shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>filter_alt_off</span>
            Xóa {activeCount} bộ lọc
          </button>
        )}
      </div>

      {/* Row 2: project / network / severity / channel filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Project */}
        <select
          value={filters.projectId ?? ""}
          onChange={(e) => setProjectId(e.target.value || null)}
          className="h-8 px-3 rounded-full border border-gborder bg-white text-[12px] text-gink cursor-pointer hover:bg-gbg"
        >
          <option value="">Tất cả project</option>
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Network */}
        <select
          value={filters.networkId ?? ""}
          onChange={(e) => setNetworkId(e.target.value || null)}
          className="h-8 px-3 rounded-full border border-gborder bg-white text-[12px] text-gink cursor-pointer hover:bg-gbg"
        >
          <option value="">Tất cả network</option>
          {NETWORKS.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>

        {/* Severity */}
        <div className="flex items-center gap-1">
          {SEVERITY_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSeverity(filters.severity === s.value ? null : s.value)}
              className={clsx(
                "chip text-[11px] transition border",
                filters.severity === s.value
                  ? `${s.chip} border-transparent`
                  : "chip-neutral border-gborder bg-white opacity-60 hover:opacity-100"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Active channel filter badge */}
        {filters.channelId && (
          <div className="flex items-center gap-1 chip chip-info text-[11px]">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>hub</span>
            {filters.channelName ?? filters.channelId}
            <button onClick={() => setChannel(null, null)} className="ml-1 hover:text-gred">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
