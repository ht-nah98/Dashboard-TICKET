"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatVnd } from "@/lib/format";

const TYPE_COLORS: Record<string, string> = {
  CLAIM: "#1A73E8",
  WHITELIST: "#1E8E3E",
  GBQ: "#D93025",
  GCD: "#9334E6",
  TKT_BKT: "#F9AB00",
  DIE: "#5F6368",
};

export function TypeRiskTreemap({
  data,
  onTypeClick,
}: {
  data: { type: string; count: number; median_revenue: number; score: number }[];
  onTypeClick?: (type: string) => void;
}) {
  const tree = data
    .filter((d) => d.score > 0)
    .map((d) => ({
      name: d.type,
      size: Math.max(d.score, 1_000_000),
      count: d.count,
      median_revenue: d.median_revenue,
      score: d.score,
    }));

  const TileWithClick = (props: any) => <Tile {...props} onTypeClick={onTypeClick} />;

  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Rủi ro theo loại ticket</div>
        <div className="text-[12px] text-gmuted">Diện tích = count × doanh thu trung vị · Click ô để lọc</div>
      </div>
      <div className="flex-1" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={tree}
            dataKey="size"
            stroke="#fff"
            content={<TileWithClick /> as any}
            isAnimationActive={false}
          >
            <Tooltip
              content={({ active, payload }) =>
                active && payload && payload[0] ? (
                  <div className="bg-white border border-gborder rounded-lg p-2 text-[12px] shadow-md">
                    <div className="font-medium">{payload[0].payload.name}</div>
                    <div className="text-gmuted">Đang mở: {payload[0].payload.count}</div>
                    <div className="text-gmuted">Doanh thu trung vị: {formatVnd(payload[0].payload.median_revenue)} ₫</div>
                  </div>
                ) : null
              }
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
      {onTypeClick && (
        <div className="shrink-0 mt-2 flex flex-wrap gap-1.5">
          {data.map((d) => (
            <button
              key={d.type}
              onClick={() => onTypeClick(d.type)}
              className="chip chip-neutral text-[11px] hover:opacity-80 transition"
              style={{ borderLeft: `3px solid ${TYPE_COLORS[d.type] ?? "#5F6368"}` }}
            >
              {d.type} ({d.count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Tile(props: any) {
  const { x, y, width, height, name, count, onTypeClick } = props;
  if (!name) return null;
  return (
    <g
      onClick={() => onTypeClick?.(name)}
      style={{ cursor: onTypeClick ? "pointer" : "default" }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={TYPE_COLORS[name] ?? "#5F6368"}
        stroke="#fff"
        strokeWidth={2}
        rx={6}
      />
      {width > 60 && height > 30 && (
        <>
          <text x={x + 8} y={y + 18} fill="#fff" fontSize={12} fontWeight={500}>
            {name}
          </text>
          <text x={x + 8} y={y + 34} fill="rgba(255,255,255,.8)" fontSize={11}>
            {count} đang mở
          </text>
        </>
      )}
    </g>
  );
}
