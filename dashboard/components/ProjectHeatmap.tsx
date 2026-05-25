"use client";

import { formatVnd } from "@/lib/format";

const TYPES = ["CLAIM", "WHITELIST", "GBQ", "GCD", "TKT_BKT", "DIE"];

export function ProjectHeatmap({ data }: { data: { project_id: string; project_name: string; cells: Record<string, number> }[] }) {
  const max = Math.max(
    1,
    ...data.flatMap((row) => TYPES.map((t) => row.cells[t] ?? 0))
  );

  function bg(v: number) {
    if (v === 0) return "#F8F9FA";
    const intensity = Math.min(1, v / max);
    // Material blue ramp
    const lightness = 95 - intensity * 60; // 95→35
    return `hsl(213, 85%, ${lightness}%)`;
  }
  function fg(v: number) {
    const intensity = Math.min(1, v / max);
    return intensity > 0.55 ? "#fff" : "#202124";
  }

  return (
    <div className="gcard p-5">
      <div className="mb-3">
        <div className="text-[14px] font-medium text-gink">Project × Loại ticket — Doanh thu rủi ro</div>
        <div className="text-[12px] text-gmuted">Màu = VND rủi ro. Click vào ô để xem chi tiết.</div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[12px] w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gmuted font-medium p-2 sticky left-0 bg-white">Project</th>
              {TYPES.map((t) => (
                <th key={t} className="text-center text-gmuted font-medium p-2">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.project_id}>
                <td className="p-2 sticky left-0 bg-white font-medium text-gink whitespace-nowrap">
                  {row.project_name}
                </td>
                {TYPES.map((t) => {
                  const v = row.cells[t] ?? 0;
                  return (
                    <td
                      key={t}
                      className="text-center p-0"
                    >
                      <div
                        className="h-12 flex items-center justify-center rounded-md mx-1 cursor-pointer hover:ring-2 hover:ring-gblue/50 transition"
                        style={{ background: bg(v), color: fg(v) }}
                        title={`${row.project_name} · ${t}: ${formatVnd(v)} ₫`}
                      >
                        {v > 0 ? formatVnd(v) : "–"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
