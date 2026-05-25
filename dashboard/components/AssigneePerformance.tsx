"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ROLE_COLOR: Record<string, string> = {
  VHYT: "#1A73E8",
  VHDA: "#9334E6",
  VHWL: "#129EAF",
  VH_LEADER: "#F9AB00",
};

export function AssigneePerformance({ data }: { data: any[] }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3">
        <div className="text-[14px] font-medium text-gink">Hiệu suất nhân sự</div>
        <div className="text-[12px] text-gmuted">X = thời gian xử lý trung bình (giờ) · Y = tỷ lệ thành công (%) · cỡ = khối lượng</div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
            <XAxis
              type="number"
              dataKey="avg_resolution_hours"
              name="Thời gian"
              stroke="#5F6368"
              fontSize={11}
              label={{ value: "Thời gian xử lý (h)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#5F6368" }}
            />
            <YAxis
              type="number"
              dataKey="success_rate"
              name="Tỷ lệ thành công"
              stroke="#5F6368"
              fontSize={11}
              domain={[0, 100]}
              label={{ value: "Tỷ lệ thành công (%)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#5F6368" }}
            />
            <ZAxis type="number" dataKey="volume" range={[60, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) =>
                active && payload && payload[0] ? (
                  <div className="bg-white border border-gborder rounded-lg p-2 text-[12px] shadow-md1">
                    <div className="font-medium">{payload[0].payload.user_name}</div>
                    <div className="text-gmuted">{payload[0].payload.role} · {payload[0].payload.volume} ticket</div>
                    <div className="text-gmuted">Thời gian: {payload[0].payload.avg_resolution_hours}h</div>
                    <div className="text-gmuted">Thành công: {payload[0].payload.success_rate}%</div>
                  </div>
                ) : null
              }
            />
            {Object.keys(ROLE_COLOR).map((role) => (
              <Scatter
                key={role}
                name={role}
                data={data.filter((d) => d.role === role)}
                fill={ROLE_COLOR[role]}
                isAnimationActive={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gmuted">
        {Object.entries(ROLE_COLOR).map(([role, color]) => (
          <span key={role} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}
