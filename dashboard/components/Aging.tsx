"use client";

const TONE: Record<string, string> = {
  good: "#1E8E3E",
  warn: "#F9AB00",
  bad: "#D93025",
};

export function Aging({ data }: { data: { bucket: string; count: number; tone: "good" | "warn" | "bad" }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[14px] font-medium text-gink">Tuổi ticket đang mở</div>
          <div className="text-[12px] text-gmuted">{total} đang mở · phân theo nhóm tuổi</div>
        </div>
      </div>
      <div className="flex items-end gap-3 flex-1" style={{ minHeight: 180 }}>
        {data.map((d) => {
          const h = Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0);
          return (
            <div key={d.bucket} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-[12px] font-medium tabular-nums mb-1">{d.count}</div>
              <div className="w-full bg-gbg rounded-md relative" style={{ height: "calc(100% - 40px)" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-md transition-all"
                  style={{ height: `${h}%`, background: TONE[d.tone] }}
                />
              </div>
              <div className="text-[11px] text-gmuted mt-1.5">{d.bucket}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
