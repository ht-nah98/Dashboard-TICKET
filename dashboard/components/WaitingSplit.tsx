"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const SIDE_COLORS: Record<string, string> = {
  "Chờ SEO": "#F9AB00",
  "Chờ VHYT": "#1A73E8",
  "Chờ VHWL": "#9334E6",
  "Chờ VHDA": "#129EAF",
  "Tự động tạm dừng": "#D93025",
  "Không xác định": "#5F6368",
};

const SIDE_TO_TYPE: Record<string, string> = {
  "Chờ SEO": "SEO",
  "Chờ VHYT": "VHYT",
};

export function WaitingSplit({
  data,
  onTypeClick,
}: {
  data: { side: string; count: number }[];
  onTypeClick?: (type: string) => void;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Bên đang giữ ticket</div>
        <div className="text-[12px] text-gmuted">Ticket hiện đang chờ ai xử lý</div>
      </div>
      <div className="flex items-center gap-4 flex-1">
        <div className="w-[160px] h-[160px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="side"
                innerRadius={50}
                outerRadius={75}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={SIDE_COLORS[d.side] ?? "#5F6368"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[22px] font-medium tabular-nums">{total}</div>
            <div className="text-[10px] text-gmuted">đang mở</div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <button
              key={d.side}
              onClick={() => onTypeClick?.(SIDE_TO_TYPE[d.side] ?? d.side)}
              className="flex items-center gap-2 text-[12px] w-full hover:bg-gbg rounded-md px-1 py-0.5 transition text-left"
              title={onTypeClick ? "Click để lọc" : undefined}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: SIDE_COLORS[d.side] ?? "#5F6368" }}
              />
              <span className="flex-1 text-gink">{d.side}</span>
              <span className="text-gmuted tabular-nums">{d.count}</span>
              <span className="text-gmuted tabular-nums w-12 text-right">
                {Math.round((d.count / total) * 100)}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
