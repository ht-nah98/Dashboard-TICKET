"use client";

import clsx from "clsx";

type Bottleneck = {
  step_name: string;
  actor_role: string;
  expected_hours: number;
  median_actual_hours: number;
  breach_rate: number;
  sample_size: number;
  slowdown_ratio: number;
};

const ROLE_COLOR: Record<string, string> = {
  VHDA: "#9334E6",
  VHYT: "#1A73E8",
  VHWL: "#129EAF",
  SEO: "#F9AB00",
};

export function RootBottleneck({ data }: { data: Bottleneck[] }) {
  const maxBreach = Math.max(...data.map((d) => d.breach_rate), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Điểm nghẽn quy trình</div>
        <div className="text-[12px] text-gmuted">Bước có tỷ lệ trễ SLA cao nhất · dựa trên dữ liệu thực</div>
      </div>

      <div className="flex-1 scroll-body" style={{ maxHeight: 340 }}>
        <div className="space-y-2.5">
          {data.map((d) => {
            const barPct = (d.breach_rate / maxBreach) * 100;
            const tone = d.breach_rate >= 40 ? "#D93025" : d.breach_rate >= 25 ? "#F9AB00" : "#1E8E3E";
            const roleColor = ROLE_COLOR[d.actor_role] ?? "#5F6368";
            return (
              <div key={d.step_name} className="border-b border-gborder/50 last:border-0 pb-2.5 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-gink truncate">{d.step_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: roleColor + "22", color: roleColor }}>
                        {d.actor_role}
                      </span>
                      <span className="text-[10px] text-gmuted">SLA: {d.expected_hours}h</span>
                      <span className="text-[10px] text-gmuted">Thực tế: {d.median_actual_hours}h</span>
                      <span className="text-[10px] text-gmuted">n={d.sample_size}</span>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium tabular-nums shrink-0" style={{ color: tone }}>
                    {d.breach_rate}%
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gbg rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: tone }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted">
        {data.length} bước phân tích · thanh = % trễ SLA
      </div>
    </div>
  );
}
