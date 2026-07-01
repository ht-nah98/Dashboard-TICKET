# Tài liệu — Trang "Ưu tiên triển khai" (`/priority`)

> Bản MVP gom **6 đầu mục** đầu tiên cho **TP, Leader và Vận hành**, xây dựng trên
> dữ liệu hệ thống tự sinh — **không phụ thuộc bất kỳ số liệu doanh thu nào**.

---

## 1. Mục tiêu & phạm vi

### Bài toán
Đội cần một màn duy nhất trả lời được:
- **Sức khỏe vận hành đang ở đâu?** (TP + Leader)
- **Hôm nay xử lý gì trước, ai là nút thắt?** (Vận hành)

…trong khi **chưa có dữ liệu đo đạc doanh thu**. Vì vậy mọi logic xếp hạng được
xây quanh trục thay thế: **mức trễ SLA × độ nghiêm trọng theo loại × tuổi ticket**.

### Đối tượng & nguyên tắc "cùng điểm view"
| Đối tượng | Vùng trên trang | Nhìn gì |
|-----------|-----------------|---------|
| **TP + Leader** | *Điều hành chung* | Cùng một bộ KPI gốc + xu hướng + top kênh |
| **Vận hành** | *Vận hành* | Hành động trên **cùng con số SLA & điểm ưu tiên** đó |

Điểm mấu chốt: con số **"Trễ SLA"** ở KPI strip và **breach** ở SLA gauge lấy từ
**cùng một nguồn** (`lib/sla.ts`), nên TP/Leader và Vận hành không bao giờ "lệch số".

---

## 2. Công thức ưu tiên (thay cho doanh thu)

```
priority_score = overdue_ratio × type_weight × age_factor
```

| Thành phần | Định nghĩa | Nguồn |
|------------|-----------|-------|
| `overdue_ratio` | `dwell_giờ_bước_hiện_tại / SLA_giờ_của_bước` | `lib/sla.ts` (per-step, dùng chung với Operations) |
| `type_weight` | GBQ/DIE = **3** · urgent/claim_lao = **2.5** · WHITELIST/TKT_BKT = **1.5** · còn lại = **1** | `derive_priority.ts → typeWeight()` |
| `age_factor` | `1 + (days_open / 7)` — mỗi tuần tồn đọng +1 bậc | `derive_priority.ts → ageFactor()` |

> **Whitelist KHÔNG vào công thức** (theo chốt của nghiệp vụ). Nó chỉ hiển thị như
> một **cờ cảnh báo** ("Chưa WL") trên thẻ kênh.

Mọi input đều là dữ liệu hệ thống tự sinh — **không cần ai nhập tay**.

---

## 3. Sáu đầu mục

### Vùng A — Điều hành chung (TP + Leader)

| # | Đầu mục | Component | Câu hỏi trả lời |
|---|---------|-----------|-----------------|
| **1** | **KPI strip** (5 thẻ): Ticket mở · Critical · **Trễ SLA** · Tỷ lệ thành công (tháng) · MTTR | `KpiCard` | "Sức khỏe vận hành ngay lúc này?" |
| **2** | **Volume trend** + **Outcome trend** (12 tuần) | `VolumeTrend`, `OutcomeTrend` | "Khối lượng & tỷ lệ thành công đang lên hay xuống?" |
| **3** | **Top kênh rủi ro** (xếp theo `priority_score`) | `PriorityChannels` | "Điểm nóng ở kênh nào, làm đâu trước?" |
| **4** | **Aging** (tuổi ticket) + **Funnel** (5 bước) | `Aging`, `WorkflowFunnel` | "Ticket tắc ở khâu nào, tồn đọng bao lâu?" |

### Vùng B — Vận hành

| # | Đầu mục | Component | Câu hỏi trả lời |
|---|---------|-----------|-----------------|
| **5** | **SLA gauge** (% within/near/breached + ai ôm breach) + **Near-breach list** | `SlaGauge`, `NearBreachRadar` | "Ticket nào sắp trễ còn cứu được?" |
| **6** | **Escalation board** (xếp theo `priority_score`) | `PriorityEscalation` | "Việc nào leo thang ngay?" |

#### Chi tiết từng mục

**[1] KPI strip** — 5 thẻ có delta so kỳ trước + sparkline 14 ngày. Thẻ "Trễ SLA"
đếm số ticket mở có `overdue_ratio ≥ 1` theo từng bước. *(Đã bỏ thẻ "Doanh thu rủi ro".)*

**[2] Volume + Outcome** — Volume: số ticket tạo mỗi tuần theo 6 loại (area xếp chồng).
Outcome: completed/failed/open mỗi tuần + đường tỷ lệ thành công.

**[3] Top kênh rủi ro** — Top 10 kênh theo tổng `priority_score` của ticket mở.
Cột: Mở · Critical · Cũ nhất (ngày) · cờ WL · Mức độ · **Điểm ưu tiên** (có thanh bar).

**[4] Aging + Funnel** — Aging: phân bố tuổi ticket (0-4h → 7d+). Funnel: số ticket
mỗi bước (draft→sent→processing→paused→completed) + thời gian dừng trung vị.

**[5] SLA gauge + Near-breach** — Gauge: tỷ lệ trong/sắp/đã trễ SLA + breach theo
bên chịu trách nhiệm. Near-breach: ưu tiên "sắp trễ còn cứu được" trước, rồi "đã trễ nặng nhất".

**[6] Escalation board** — Ticket đã breach hoặc urgent, xếp theo `priority_score`.
Cột "Điểm ưu tiên" thay cho "Doanh thu rủi ro".

---

## 4. Luồng dữ liệu

```
data/*.json  ──►  lib/derive_priority.ts  ──►  derived/priority.json  ──►  app/priority/page.tsx
   (raw)            buildPriority()              (snapshot tĩnh)            (server component)
                          │
                          └── lib/sla.ts (currentStepInfo)  ◄── DÙNG CHUNG với derive_ops.ts
```

- **Mốc thời gian:** `NOW = 2026-05-23T09:00:00+07:00` (dataset kết thúc 2026-05-22).
- **Cách build:** `priority.json` được sinh trong `npm run derive` (đã wire ở `derive.ts`),
  hoặc chạy độc lập: `npx tsx lib/derive_priority.ts`.
- Trang **import tĩnh** `@/derived/priority.json` ⇒ phải `derive` trước khi `dev`/`build`
  (script `predev`/`prebuild` đã tự lo việc này).

---

## 5. Danh sách file

### Mới tạo
| File | Vai trò |
|------|---------|
| `lib/derive_priority.ts` | Logic derive revenue-free + `PriorityPayload` |
| `components/PriorityChannels.tsx` | Bảng top kênh theo điểm ưu tiên |
| `components/PriorityEscalation.tsx` | Escalation board theo điểm ưu tiên |
| `app/priority/page.tsx` | Trang gom 6 mục, 2 vùng |
| `docs/PRIORITY_DASHBOARD.md` | Tài liệu này |

### Tái sử dụng (không sửa logic)
`KpiCard`, `VolumeTrend`, `OutcomeTrend`, `Aging`, `WorkflowFunnel`, `SlaGauge`, `NearBreachRadar`

### Đã sửa
| File | Thay đổi |
|------|----------|
| `lib/derive.ts` | Wire build `priority.json` |
| `components/AppShell.tsx` | Thêm nav 🚩 + type `priority` + `PAGE_ROLES` |
| `components/FilterBar.tsx` | Thêm type + case filter cho `priority` |

---

## 6. Cách chạy & kiểm thử

```bash
cd dashboard

# 1) Sinh lại priority.json (cùng tất cả payload khác)
npm run derive

# 2) Chạy dev (tự derive trước nhờ predev)
npm run dev
#    → mở http://localhost:3000/priority

# 3) Kiểm tra type
npx tsc --noEmit          # kỳ vọng: No errors found

# Build độc lập chỉ priority (debug nhanh)
npx tsx lib/derive_priority.ts
```

### Kết quả verify (snapshot hiện tại)
- `open=178`, `breached=173`, `channels=10`, `near_breach=12`, `escalations=15`
- `tsc --noEmit` → **No errors**
- `GET /priority` → **HTTP 200**

---

## 7. Lưu ý quan trọng về dữ liệu

`breached` chiếm ~173/178 ticket mở vì **seed data đông cứng**: mốc `NOW` cố định ở
2026-05-23 nên gần như mọi ticket đã vượt SLA per-step. Đây **không phải lỗi logic** —
con số này **khớp với màn Operations** (cùng `lib/sla.ts`), đúng yêu cầu "cùng số".

Khi chạy với **dữ liệu thật** (NOW = thời điểm hiện tại), tỷ lệ breach sẽ về mức thực.
Dù vậy `priority_score` vẫn phân tách thứ tự ưu tiên tốt nhờ nhân thêm `type_weight × age_factor`.

---

## 8. Hướng mở rộng (đợt sau)

| Hạng mục | Mô tả |
|----------|-------|
| **Nối filter động** | Hiện trang đọc snapshot tĩnh (như `/root`). Có thể nối `FilterContext` để lọc theo loại/dự án/network client-side. |
| **Drill-down panel** | `onRowClick` đã sẵn ở Escalation/Channels/Near-breach — nối `TicketDetailPanel` để xem chi tiết ticket. |
| **Thêm trục Whitelist** | Nếu nghiệp vụ muốn, có thể đưa WL vào `priority_score` thay vì chỉ làm cờ. |
| **Khi có data doanh thu** | Thêm lại thành phần `× revenue_weight` vào công thức và 1 thẻ KPI doanh thu. |
