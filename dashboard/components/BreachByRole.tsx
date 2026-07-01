"use client";

// ┌─────────────────────────────────────────────────────────────┐
// │ BIỂU ĐỒ DÀNH CHO LEADER                                       │
// │ Trễ SLA theo vai trò chịu trách nhiệm — để Leader biết nút    │
// │ thắt đang nằm ở vai trò nào (VHYT / SEO / VHWL / VHDA…).      │
// └─────────────────────────────────────────────────────────────┘

const ROLE_LABEL: Record<string, string> = {
  VHYT: "VHYT",
  VHDA: "VHDA",
  VHWL: "VHWL",
  SEO: "SEO",
  External: "Dịch vụ ngoài",
  "—": "Chưa xác định",
};

export function BreachByRole({ data }: { data: { role: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-medium text-gink">Trễ SLA theo vai trò</div>
            <span className="chip chip-neutral" title="Biểu đồ này phục vụ Leader">👤 Leader</span>
          </div>
          <div className="text-[12px] text-gmuted">Mỗi vai trò đang giữ bao nhiêu ca đã trễ — nút thắt nằm ở đâu</div>
        </div>
        <span className="chip chip-bad">{total} ca trễ</span>
      </div>

      {data.length === 0 ? (
        <div className="text-[12px] text-gmuted flex-1 flex items-center justify-center">Không có ca trễ SLA.</div>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-3">
          {data.map((d) => (
            <div key={d.role} className="flex items-center gap-3">
              <div className="w-24 text-[12px] text-gink font-medium truncate">{ROLE_LABEL[d.role] ?? d.role}</div>
              <div className="flex-1 h-6 bg-gbg rounded-md overflow-hidden relative">
                <div
                  className="h-full bg-gred rounded-md flex items-center justify-end px-2 text-white text-[11px] font-medium"
                  style={{ width: `${Math.max((d.count / max) * 100, 8)}%` }}
                >
                  {d.count}
                </div>
              </div>
              <div className="w-12 text-right text-[11px] text-gmuted tabular-nums">
                {total ? Math.round((d.count / total) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-gmuted pt-3 mt-2 border-t border-gborder shrink-0">
        Vai trò có thanh dài nhất là nơi đang tồn đọng nhiều ca trễ nhất — ưu tiên gỡ trước.
      </div>
    </div>
  );
}
