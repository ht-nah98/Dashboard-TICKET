"use client";

import { formatVnd } from "@/lib/format";

type RepeatChannel = {
  channel_id: string;
  channel_name: string;
  project_name: string;
  total_tickets: number;
  open_tickets: number;
  failed_tickets: number;
  claim_count: number;
  gbq_count: number;
  revenue_at_risk: number;
};

export function RootRepeatChannels({ data }: { data: RepeatChannel[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total_tickets), 1);

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Kênh vi phạm lặp lại</div>
        <div className="text-[12px] text-gmuted">Kênh có từ 5+ ticket lịch sử · nguy cơ hệ thống</div>
      </div>

      <div className="flex-1 scroll-body" style={{ maxHeight: 320 }}>
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-gmuted text-left border-b border-gborder">
              <th className="font-medium py-1.5 pr-2">#</th>
              <th className="font-medium py-1.5 pr-2">Kênh</th>
              <th className="font-medium py-1.5 pr-2">Project</th>
              <th className="font-medium py-1.5 pr-2 text-right">Tổng</th>
              <th className="font-medium py-1.5 pr-2 text-right">Đang mở</th>
              <th className="font-medium py-1.5 pr-2 text-right">CLAIM</th>
              <th className="font-medium py-1.5 pr-2 text-right">GBQ</th>
              <th className="font-medium py-1.5 text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ch, i) => {
              const barPct = (ch.total_tickets / maxTotal) * 100;
              const riskLevel = ch.gbq_count >= 3 || ch.failed_tickets >= 2 ? "#D93025" : ch.claim_count >= 5 ? "#F9AB00" : "#1A73E8";
              return (
                <tr key={ch.channel_id} className="border-b border-gborder/60 last:border-b-0">
                  <td className="py-1.5 pr-2 text-gmuted">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <div className="font-medium text-gink max-w-[100px] truncate">{ch.channel_name}</div>
                    <div className="w-full h-1 bg-gbg rounded-full overflow-hidden mt-0.5">
                      <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: riskLevel }} />
                    </div>
                  </td>
                  <td className="py-1.5 pr-2 text-gmuted">{ch.project_name}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums font-medium" style={{ color: riskLevel }}>{ch.total_tickets}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums text-gblue">{ch.open_tickets}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums text-gmuted">{ch.claim_count}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums" style={{ color: ch.gbq_count > 0 ? "#D93025" : "#5F6368" }}>
                    {ch.gbq_count}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-gink">{formatVnd(ch.revenue_at_risk)} ₫</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="shrink-0 pt-2 mt-1 border-t border-gborder/60 text-[11px] text-gmuted">
        {data.length} kênh · {data.reduce((s, d) => s + d.total_tickets, 0)} ticket tổng cộng
      </div>
    </div>
  );
}
