"use client";

import { formatVnd } from "@/lib/format";

type Row = {
  channel_id: string;
  channel_name: string;
  project_name: string;
  monthly_revenue: number;
  open_critical: number;
  whitelist_status: string;
  no_whitelist: boolean;
  risk_score: number;
  risk_factors: string[];
};

export function RiskyAssets({ data }: { data: Row[] }) {
  const maxScore = Math.max(1, ...data.map((d) => d.risk_score));

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Tài sản có rủi ro cao</div>
        <div className="text-[12px] text-gmuted">
          Kênh doanh thu cao + ticket critical đang mở · cần ưu tiên bảo vệ
        </div>
      </div>

      <div className="flex-1 scroll-body" style={{ maxHeight: 360 }}>
        {data.length === 0 ? (
          <div className="text-[12px] text-gmuted italic py-4">Hiện không có tài sản rủi ro cao.</div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gmuted text-left border-b border-gborder">
                <th className="font-medium py-1.5 pr-2">#</th>
                <th className="font-medium py-1.5 pr-2">Kênh</th>
                <th className="font-medium py-1.5 pr-2">Project</th>
                <th className="font-medium py-1.5 pr-2 text-right">DT/tháng</th>
                <th className="font-medium py-1.5 pr-2 text-right">Critical</th>
                <th className="font-medium py-1.5 pr-2">WL</th>
                <th className="font-medium py-1.5 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const barPct = (r.risk_score / maxScore) * 100;
                const tone = r.risk_score >= 100 ? "#D93025" : r.risk_score >= 50 ? "#F9AB00" : "#1A73E8";
                return (
                  <tr key={r.channel_id} className="border-b border-gborder/60 last:border-b-0 align-top">
                    <td className="py-2 pr-2 text-gmuted">{i + 1}</td>
                    <td className="py-2 pr-2">
                      <div className="font-medium text-gink max-w-[120px] truncate" title={r.channel_name}>
                        {r.channel_name}
                      </div>
                      {r.risk_factors.length > 0 && (
                        <div className="text-[10px] text-gmuted mt-0.5 truncate" title={r.risk_factors.join(" · ")}>
                          {r.risk_factors.join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-gmuted">{r.project_name}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-gink">
                      {formatVnd(r.monthly_revenue)}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums" style={{ color: r.open_critical > 0 ? "#D93025" : "#5F6368" }}>
                      {r.open_critical}
                    </td>
                    <td className="py-2 pr-2">
                      <span className={r.no_whitelist ? "chip chip-bad text-[10px]" : "chip chip-good text-[10px]"}>
                        {r.no_whitelist ? "Chưa" : "Có"}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium" style={{ color: tone }}>
                      {r.risk_score}
                      <div className="w-full h-1 bg-gbg rounded-full overflow-hidden mt-0.5">
                        <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: tone }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
