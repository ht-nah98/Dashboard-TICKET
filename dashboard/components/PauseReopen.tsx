"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export function PauseReopen({ data }: { data: { week: string; paused: number; reopened: number }[] }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3">
        <div className="text-[14px] font-medium text-gink">Tạm dừng & Mở lại theo tuần</div>
        <div className="text-[12px] text-gmuted">Dấu hiệu chất lượng intake và workflow</div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
            <XAxis dataKey="week" tickFormatter={(s: string) => s.slice(5)} stroke="#5F6368" fontSize={11} />
            <YAxis stroke="#5F6368" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8EAED", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="paused" name="Tạm dừng" fill="#F9AB00" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="reopened" name="Mở lại" fill="#1A73E8" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
