import { formatHours } from "@/lib/format";

export function HandoffLatency({ data }: { data: { pair: string; median_hours: number; sample_size: number }[] }) {
  const max = Math.max(...data.map((d) => d.median_hours), 1);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3">
        <div className="text-[14px] font-medium text-gink">Độ trễ chuyển bước</div>
        <div className="text-[12px] text-gmuted">Thời gian trung vị giữa hai vai trò liên tiếp · top 8</div>
      </div>
      <div className="space-y-2">
        {data.map((h) => (
          <div key={h.pair} className="flex items-center gap-3 text-[12px]">
            <div className="w-36 text-gink font-medium">{h.pair}</div>
            <div className="flex-1 h-2 bg-gbg rounded-full overflow-hidden">
              <div
                className="h-full bg-gblue rounded-full"
                style={{ width: `${(h.median_hours / max) * 100}%` }}
              />
            </div>
            <div className="w-20 text-right tabular-nums text-gink">{formatHours(h.median_hours)}</div>
            <div className="w-16 text-right tabular-nums text-gmuted">{h.sample_size} mẫu</div>
          </div>
        ))}
      </div>
    </div>
  );
}
