"use client";

type Row = {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  category: "process" | "asset" | "data";
  affected_count: number;
};

const IMPACT_LABEL: Record<Row["impact"], string> = {
  high: "Cao", medium: "Trung bình", low: "Thấp",
};
const IMPACT_CHIP: Record<Row["impact"], string> = {
  high: "chip-bad", medium: "chip-warn", low: "chip-info",
};
const CATEGORY_LABEL: Record<Row["category"], string> = {
  process: "Quy trình", asset: "Tài sản", data: "Dữ liệu",
};
const CATEGORY_ICON: Record<Row["category"], string> = {
  process: "settings", asset: "domain", data: "database",
};

export function PreventionRecommendations({ data }: { data: Row[] }) {
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Đề xuất phòng ngừa</div>
        <div className="text-[12px] text-gmuted">
          Hành động cụ thể để giảm rủi ro trong tương lai · tạo từ dữ liệu chẩn đoán
        </div>
      </div>

      <div className="flex-1 space-y-2.5 scroll-body" style={{ maxHeight: 360 }}>
        {data.length === 0 ? (
          <div className="text-[12px] text-gmuted italic py-4">
            Không phát hiện vấn đề hệ thống cần phòng ngừa ngay.
          </div>
        ) : (
          data.map((r) => (
            <div key={r.id} className="rounded-lg border border-gborder p-3 hover:border-gblue/40 transition">
              <div className="flex items-start gap-2 mb-1.5">
                <span className="material-symbols-outlined text-gmuted shrink-0 mt-0.5" style={{ fontSize: 16 }}>
                  {CATEGORY_ICON[r.category]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-gink leading-snug">{r.title}</div>
                </div>
                <span className={`chip text-[10px] shrink-0 ${IMPACT_CHIP[r.impact]}`}>
                  {IMPACT_LABEL[r.impact]}
                </span>
              </div>
              <div className="text-[11px] text-gmuted leading-relaxed pl-6">{r.detail}</div>
              <div className="flex items-center gap-2 mt-2 pl-6 text-[10px] text-gmuted">
                <span>{CATEGORY_LABEL[r.category]}</span>
                <span>·</span>
                <span>Ảnh hưởng: {r.affected_count}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
