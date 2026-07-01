# User Stories (chi tiết) — Nhóm `priority`

> Bản **chi tiết để đưa vào sprint planning**. Mỗi story có: mô tả, acceptance criteria
> (Given/When/Then), business rule, nguồn dữ liệu, component, edge case, ưu tiên & ước lượng.
>
> **Epic gốc:** [`EPIC-TICKET`](./EPIC_TICKET_MANAGEMENT.md) · **Label:** `priority`
> **Bản dễ đọc (không kỹ thuật):** [`PRIORITY_USER_STORIES.md`](./PRIORITY_USER_STORIES.md)
> **Tài liệu kỹ thuật:** [`PRIORITY_DASHBOARD.md`](./PRIORITY_DASHBOARD.md)

---

## Thuật ngữ & quy ước dùng chung (đọc một lần)

| Thuật ngữ | Định nghĩa chính xác |
|-----------|----------------------|
| **Ticket đang mở** | `current_state` ∉ {completed, closed, failed} |
| **overdue_ratio** | `thời_gian_dừng_bước_hiện_tại / SLA_giờ_của_bước` (theo `lib/sla.ts`) |
| **within / near / breached** | `ratio < 0.75` / `0.75 ≤ ratio < 1` / `ratio ≥ 1` |
| **type_weight** | GBQ/DIE = 3 · urgent hoặc claim_lao = 2.5 · WHITELIST/TKT_BKT = 1.5 · còn lại = 1 |
| **age_factor** | `1 + (số_ngày_mở / 7)` |
| **priority_score** | `overdue_ratio × type_weight × age_factor` |
| **Critical** | ticket mở thuộc breach_48h, hoặc urgent, hoặc GBQ/DIE, hoặc claim_lao + video public |
| **NOW (mốc snapshot)** | `2026-05-23T09:00:00+07:00` (dữ liệu mẫu) |

**Định nghĩa Done chung cho mọi story trong nhóm:**
- [ ] Render đúng trên trang `/priority`, không lỗi console.
- [ ] Mọi con số phái sinh từ `derived/priority.json` (không hardcode).
- [ ] Không sử dụng bất kỳ trường doanh thu nào (`affected_revenue_vnd`, `monthly_revenue`…).
- [ ] `npx tsc --noEmit` sạch lỗi.

---

# KHU A — Điều hành chung (TP + Leader)

## US-01 — KPI strip sức khỏe vận hành

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** xem 5 chỉ số sức khỏe ở đầu trang, **để** nắm tình hình đội trong một cái liếc. |
| **Ưu tiên** | Must have (P0) |
| **Ước lượng** | 2 điểm |
| **Component** | `KpiCard` × 5 |
| **Nguồn dữ liệu** | `priority.json → kpis[]` |

**Nội dung 5 thẻ (đúng thứ tự):**

| # | key | Nhãn | Đơn vị | "Tốt" là chiều nào |
|---|-----|------|--------|--------------------|
| 1 | `open` | Ticket đang mở | count | giảm |
| 2 | `critical` | Critical đang mở | count | giảm |
| 3 | `breached` | Trễ SLA | count | giảm |
| 4 | `success_rate` | Tỷ lệ thành công (tháng) | % | tăng |
| 5 | `mttr` | Thời gian xử lý trung vị | giờ | giảm |

**Acceptance Criteria**

```
AC1 — Hiển thị đủ 5 thẻ
  Given tôi mở trang /priority
  When phần đầu trang render
  Then tôi thấy đúng 5 thẻ KPI theo thứ tự: open, critical, breached, success_rate, mttr
  And KHÔNG có thẻ nào liên quan doanh thu.

AC2 — Mỗi thẻ có delta + sparkline
  Given một thẻ KPI
  Then thẻ hiển thị giá trị, % thay đổi so kỳ trước (mũi tên lên/xuống), và sparkline 14 ngày.

AC3 — Màu delta theo chiều "tốt"
  Given thẻ "Trễ SLA" (breached) — chiều tốt là GIẢM
  When delta là số âm (giảm)
  Then chip delta hiển thị màu xanh (tốt); khi tăng thì màu đỏ (xấu).

AC4 — Nhất quán với khu Vận hành
  Given giá trị thẻ "Trễ SLA" ở US-01
  Then nó BẰNG đúng `sla.breached` mà US-05 dùng (cùng nguồn lib/sla.ts).
```

**Edge case**
- Khi `breached` = 0 → thẻ vẫn hiển thị "0", tone `bad` giữ nguyên (chủ ý cảnh báo).
- Snapshot hiện tại: open=178, critical=99, breached=173, success_rate=94.2%, mttr=88h.

---

## US-02 — Xu hướng khối lượng & kết quả (12 tuần)

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** xem khối lượng ticket theo loại và tỷ lệ thành công 12 tuần, **để** biết đội đang tiến bộ hay tụt lùi. |
| **Ưu tiên** | Must have (P0) |
| **Ước lượng** | 2 điểm |
| **Component** | `VolumeTrend` + `OutcomeTrend` |
| **Nguồn dữ liệu** | `priority.json → volume_trend[]`, `outcome_trend[]` |

**Acceptance Criteria**

```
AC1 — Volume theo loại
  Given biểu đồ khối lượng
  Then mỗi tuần hiển thị số ticket TẠO MỚI, tách theo 6 loại
       (CLAIM, WHITELIST, GBQ, GCD, TKT_BKT, DIE) dạng area xếp chồng.

AC2 — Outcome + success rate
  Given biểu đồ kết quả
  Then mỗi tuần hiển thị cột completed / failed / open
  And một đường tỷ lệ thành công (%) trên trục phải [0–100].

AC3 — Mốc thời gian
  Given cả 2 biểu đồ
  Then trục hoành có đúng 12 mốc tuần, tuần mới nhất nằm bên phải.

AC4 — Chỉ báo xu hướng
  Given OutcomeTrend
  Then góc phải hiển thị mũi tên ↑/↓ + tỷ lệ thành công tuần mới nhất so tuần trước.
```

**Edge case**
- Tuần không có ticket → giá trị 0, biểu đồ không vỡ trục.
- `success_rate` của tuần chưa có ca resolved = 0 (không chia cho 0).

---

## US-03 — Bảng top kênh rủi ro theo điểm ưu tiên

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** bảng xếp hạng kênh rủi ro nhất, **để** giao người tập trung vào đúng kênh cần cứu trước. |
| **Ưu tiên** | Must have (P0) |
| **Ước lượng** | 3 điểm |
| **Component** | `PriorityChannels` |
| **Nguồn dữ liệu** | `priority.json → channels_top[]` (top 10) |

**Business rule**
- Xếp hạng theo `priority_score` (tổng điểm của các ticket mở thuộc kênh), GIẢM dần.
- `priority_score` **không** dùng doanh thu.
- **Whitelist là cờ cảnh báo**, KHÔNG cộng vào điểm: kênh không có WL "Đang WL" → cờ "Chưa WL".
- Mức độ (severity): critical nếu ≥2 ca critical · high nếu ≥1 · medium nếu ≥3 ca mở · còn lại low.

**Acceptance Criteria**

```
AC1 — Cột bảng
  Given bảng top kênh
  Then mỗi dòng có: tên kênh, dự án, số mở, số critical, ticket cũ nhất (ngày),
       cờ WL, mức độ, và Điểm ưu tiên (có thanh bar).
  And KHÔNG có cột doanh thu.

AC2 — Sắp xếp
  Given danh sách
  Then sắp theo Điểm ưu tiên giảm dần; tối đa 10 kênh.

AC3 — Cờ whitelist
  Given một kênh không có bản ghi WL trạng thái "Đang WL"
  Then hiển thị chip "Chưa WL" màu cảnh báo; ngược lại chip "Đang WL" màu xanh.

AC4 — Bar chuẩn hóa
  Given cột Điểm ưu tiên
  Then độ dài bar = score / max(score trong bảng), kênh đầu bảng bar dài nhất.
```

**Edge case**
- Kênh không tra được tên (channelById miss) → loại khỏi bảng (không hiện dòng rỗng).
- Số critical = 0 → in màu xám (không nhấn đỏ).

---

## US-04 — Tuổi ticket & phễu quy trình

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** thấy ticket tồn đọng bao lâu và kẹt ở bước nào, **để** biết tháo gỡ ở khâu nào. |
| **Ưu tiên** | Should have (P1) |
| **Ước lượng** | 2 điểm |
| **Component** | `Aging` + `WorkflowFunnel` |
| **Nguồn dữ liệu** | `priority.json → aging[]`, `funnel[]` |

**Acceptance Criteria**

```
AC1 — Aging buckets
  Given biểu đồ tuổi ticket
  Then có đúng 5 nhóm: 0-4h, 4-24h, 1-3d, 3-7d, 7d+
  And tô màu theo tone: 0-24h xanh (good), 1-7d vàng (warn), 7d+ đỏ (bad)
  And tuổi tính theo created_at → NOW.

AC2 — Funnel 5 bước
  Given phễu workflow
  Then liệt kê 5 bước: Lưu nháp, Đã gửi, Đang xử lý, Tạm dừng, Hoàn thành
  And mỗi bước hiện số ticket + thời gian dừng trung vị.

AC3 — Độ rộng thanh phễu
  Given mỗi bước
  Then độ rộng thanh tỷ lệ với số ticket / bước đông nhất.
```

**Edge case**
- Bước không có dữ liệu dwell → hiển thị "—" thay vì "0h".
- Tổng aging có thể < số ticket mở nếu một số ticket thiếu created_at hợp lệ (chấp nhận, ghi log).

---

# KHU B — Vận hành

## US-05 — Đồng hồ SLA & danh sách sắp trễ

| | |
|---|---|
| **Story** | **Là** Vận hành, **tôi muốn** đồng hồ tuân thủ SLA + danh sách ca sắp trễ (còn cứu được trước), **để** dồn sức cứu ca còn kịp. |
| **Ưu tiên** | Must have (P0) |
| **Ước lượng** | 3 điểm |
| **Component** | `SlaGauge` + `NearBreachRadar` |
| **Nguồn dữ liệu** | `priority.json → sla{}`, `near_breach[]` (top 12) |

**Business rule**
- Phân loại theo overdue_ratio: within / near / breached (ngưỡng 0.75 và 1.0).
- `breach_by_owner`: đếm ca breached theo bên chịu trách nhiệm của bước hiện tại, top 5.
- Thứ tự near_breach: **near trước breached**; trong near → ít giờ còn lại lên trước;
  trong breached → ratio cao (trễ nặng) lên trước.

**Acceptance Criteria**

```
AC1 — Gauge 3 phần
  Given đồng hồ SLA
  Then hiển thị % within (trong SLA) ở giữa, và 3 phân khúc within/near/breached kèm số đếm.

AC2 — Breach theo bên chịu trách nhiệm
  Given có ca breached
  Then liệt kê tối đa 5 bên (owner) đang giữ nhiều ca trễ nhất, dạng bar.

AC3 — Thứ tự danh sách near-breach
  Given danh sách ca sắp/đã trễ
  Then ca "sắp trễ" (còn cứu được) xếp TRƯỚC ca "đã trễ"
  And trong nhóm sắp trễ, ca còn ít giờ nhất lên đầu.

AC4 — Nhãn thời gian
  Given một dòng near-breach
  Then hiển thị số giờ còn lại tới breach; nếu đã trễ hiển thị "trễ".
```

**Edge case (QUAN TRỌNG — dữ liệu mẫu)**
- Với snapshot hiện tại: within=5, near=0, breached=173, pct_within=2.8%.
  Đây là hệ quả **seed data đông cứng** (NOW cố định) khiến gần như mọi ticket quá SLA.
  → Khi `near=0`, danh sách near-breach chỉ gồm ca breached; **đây không phải lỗi**.
- Khi không có ca trễ nào → hiển thị "Không có ticket nào sắp/đã trễ SLA".

---

## US-06 — Bảng ticket cần can thiệp gấp (escalation)

| | |
|---|---|
| **Story** | **Là** Vận hành / quản lý, **tôi muốn** bảng ticket cần can thiệp xếp theo độ ưu tiên, **để** xử lý/báo cấp trên đúng thứ tự, không sót ca quan trọng. |
| **Ưu tiên** | Must have (P0) |
| **Ước lượng** | 3 điểm |
| **Component** | `PriorityEscalation` |
| **Nguồn dữ liệu** | `priority.json → escalation_board[]` (top 15) |

**Business rule**
- Lọc: chỉ ticket **đã breached HOẶC urgent**.
- Xếp theo `priority_score` giảm dần; tối đa 15 dòng.
- Trạng thái: "Đã trễ" (breached) hoặc "Sắp trễ" (urgent chưa breach).

**Acceptance Criteria**

```
AC1 — Điều kiện vào bảng
  Given một ticket mở
  When ticket đã trễ SLA (ratio ≥ 1) HOẶC is_urgent = true
  Then ticket xuất hiện trong bảng escalation.

AC2 — Cột bảng
  Given bảng escalation
  Then mỗi dòng có: mã, loại, kênh, người phụ trách (SEO), bước hiện tại,
       số ngày mở, trạng thái, và Điểm ưu tiên (có bar).
  And cột cuối là "Điểm ưu tiên", KHÔNG phải "Doanh thu rủi ro".

AC3 — Sắp xếp & giới hạn
  Given danh sách
  Then sắp theo Điểm ưu tiên giảm dần, hiển thị tối đa 15 ticket.

AC4 — Chip trạng thái
  Given một dòng
  Then breached → chip "Đã trễ" (đỏ); urgent-chưa-breach → chip "Sắp trễ" (vàng).
```

**Edge case**
- Không có ticket nào breached/urgent → bảng rỗng + chip đếm "0 cần can thiệp".
- Hai ticket cùng score → giữ thứ tự ổn định theo dữ liệu nguồn.

---

# KHU C — Giám sát đội (DÀNH RIÊNG CHO LEADER)

> ⚠️ **Hai story dưới đây chỉ phục vụ Leader**, không phải TP hay Vận hành.
> Mục tiêu: giúp Leader tìm **nút thắt theo vai trò** và **cân tải nhân sự** trong đội mình.
> Trên giao diện, mỗi biểu đồ có nhãn `👤 Leader` và nằm trong khu "Giám sát đội — dành riêng cho Leader".

## US-07 — Biểu đồ Trễ SLA theo vai trò *(chỉ cho Leader)*

| | |
|---|---|
| **Story** | **Là** Leader, **tôi muốn** thấy mỗi vai trò (VHYT/SEO/VHWL/VHDA/Dịch vụ ngoài) đang giữ bao nhiêu ca **đã trễ SLA**, **để** biết nút thắt nằm ở vai trò nào mà tập trung gỡ trước. |
| **Đối tượng** | **Chỉ Leader** (không hiển thị như chỉ số chính cho TP/Vận hành) |
| **Ưu tiên** | Should have (P1) |
| **Ước lượng** | 2 điểm |
| **Component** | `BreachByRole` |
| **Nguồn dữ liệu** | `priority.json → breach_by_role[]` |

**Business rule**
- Đếm ca **breached** (overdue_ratio ≥ 1) theo **vai trò chịu trách nhiệm của bước hiện tại**
  (`owner` lấy từ `lib/sla.ts`), không phải người tạo ticket.
- Sắp xếp giảm dần theo số ca trễ.
- Dùng chung nguồn với `sla.breach_by_owner` (US-05) — đảm bảo không lệch số.

**Acceptance Criteria**

```
AC1 — Nhãn đối tượng rõ ràng
  Given biểu đồ Trễ SLA theo vai trò
  Then card hiển thị nhãn "👤 Leader"
  And nằm trong khu "Giám sát đội — dành riêng cho Leader".

AC2 — Bar theo vai trò
  Given có ca trễ
  Then mỗi vai trò là một thanh ngang, độ dài tỷ lệ với số ca trễ
  And hiển thị số ca + % trên tổng số ca trễ.

AC3 — Sắp xếp
  Given danh sách vai trò
  Then vai trò giữ nhiều ca trễ nhất nằm trên cùng.

AC4 — Nhất quán số liệu
  Given tổng số ca trễ ở US-07
  Then bằng đúng `sla.breached` ở US-05 (cùng định nghĩa per-step).
```

**Edge case**
- Không có ca trễ → hiển thị "Không có ca trễ SLA."
- Vai trò "—" (chưa xác định) → nhãn "Chưa xác định".
- Snapshot hiện tại: VHYT=113, SEO=57, Dịch vụ ngoài=3.

---

## US-08 — Biểu đồ Tải công việc theo nhân sự *(chỉ cho Leader)*

| | |
|---|---|
| **Story** | **Là** Leader, **tôi muốn** thấy mỗi nhân sự đang ôm bao nhiêu ticket mở (kèm số critical/đã trễ), **để** phát hiện người quá tải và san việc cho hợp lý. |
| **Đối tượng** | **Chỉ Leader** |
| **Ưu tiên** | Should have (P1) |
| **Ước lượng** | 3 điểm |
| **Component** | `AssigneeLoad` |
| **Nguồn dữ liệu** | `priority.json → assignee_workload[]` (top 12) |

**Business rule**
- "Người chịu tải" = actor gần nhất trong timeline **khác vai trò SEO** (người vận hành đang giữ ticket).
- Chỉ tính nhân sự có vai trò vận hành: VHYT, VHDA, VHWL, VH_LEADER.
- `open` = số ticket mở đang giữ · `critical` = số ca critical · `breached` = số ca đã trễ.
- `load_pct` = open / open-cao-nhất-trong-đội × 100 (chuẩn hóa để vẽ bar).
- Sắp xếp giảm dần theo số ticket mở; tối đa 12 người.

**Acceptance Criteria**

```
AC1 — Nhãn đối tượng rõ ràng
  Given biểu đồ Tải công việc theo nhân sự
  Then card hiển thị nhãn "👤 Leader"
  And nằm trong khu "Giám sát đội — dành riêng cho Leader".

AC2 — Thông tin mỗi người
  Given một dòng nhân sự
  Then hiển thị tên, vai trò, thanh tải (số ticket mở)
  And chip "{n} critical" (đỏ) khi có ca critical, chip "{n} trễ" (vàng) khi có ca trễ.

AC3 — Chuẩn hóa bar
  Given cột tải
  Then người ôm nhiều ticket nhất có thanh dài nhất (load_pct = 100).

AC4 — Lọc vai trò
  Given danh sách
  Then chỉ gồm nhân sự vận hành (VHYT/VHDA/VHWL/VH_LEADER), tối đa 12 người, xếp theo số mở giảm dần.
```

**Edge case**
- Nhân sự không có ca critical/trễ → không hiển thị chip tương ứng (chỉ thanh tải).
- Không tra được user (userById miss) → bỏ qua, không hiện dòng rỗng.
- Snapshot hiện tại: 9 người; quá tải nhất Đỗ Minh Hoa (VHYT) — 19 mở, 16 critical, 19 trễ, load 100%.

---

# KHU D — Phân tích & Phòng ngừa (góc nhìn dài hạn)

> Khác bản chất với A/B/C: đây là **phân tích "vì sao & ngăn lặp lại"**, không phải hành
> động tức thời. Đối tượng chính là **TP + Leader** (lập kế hoạch cải tiến).
> **Mọi thẻ KHU D KHÔNG hiển thị doanh thu** — dữ liệu tái dùng từ Root Cause + SEO, mọi
> trường revenue bị zero-hóa trước khi đưa ra.

## US-09 — Phân tích tài nguyên vi phạm

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** biết loại tài nguyên nào (hình ảnh / âm thanh / footage / thumbnail) hay bị dính ticket nhất và tỷ lệ thất bại ra sao, **để** tập trung phòng ngừa đúng loại tài nguyên rủi ro. |
| **Đối tượng** | TP + Leader |
| **Ưu tiên** | Could have (P2) |
| **Ước lượng** | 2 điểm |
| **Component** | `ResourceBreakdown` (tái dùng từ Root Cause) |
| **Nguồn dữ liệu** | `priority.json → analysis.resource_breakdown` |

**Business rule**
- Tài nguyên lấy từ `resource_kind` (CLAIM) hoặc `gay_category` (GBQ): image / audio / footage / thumb.
- Mỗi loại: tổng ticket, đang mở, hoàn thành, thất bại, **fail_rate** = failed / (completed+failed).
- Có breakdown sub-type (claim_dung/claim_lao/gay_dung/gay_lao) + trend 12 tuần.
- **revenue_at_risk = 0** (zero-hóa theo nguyên tắc trang Priority).

**Acceptance Criteria**

```
AC1 — Bảng theo loại tài nguyên
  Given biểu đồ tài nguyên
  Then liệt kê 4 loại (image/audio/footage/thumb) với tổng, mở, hoàn thành, thất bại, fail_rate
  And KHÔNG hiển thị giá trị doanh thu.

AC2 — Trend theo tuần
  Given phần xu hướng
  Then hiển thị số ticket mỗi loại tài nguyên theo 12 tuần.

AC3 — Sub-type
  Given một loại tài nguyên
  Then hiển thị phân tách sub-type (vd claim_lao vs claim_dung).
```

**Edge case**
- Loại không có ticket → fail_rate = 0, không chia cho 0.
- Snapshot hiện tại: audio=171 (fail 3.5%), image=135 (fail 6.3%), footage=14 (fail 9.1%), thumb=5 (fail 0%).

---

## US-10 — Kênh vi phạm lặp lại

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** danh sách kênh có nhiều ticket lịch sử (tái phạm), **để** xác định kênh cần audit kỹ thuật hoặc đào tạo lại quy trình. |
| **Đối tượng** | TP + Leader |
| **Ưu tiên** | Could have (P2) |
| **Ước lượng** | 2 điểm |
| **Component** | `RootRepeatChannels` (tái dùng) |
| **Nguồn dữ liệu** | `priority.json → analysis.repeat_offender_channels` (top 10) |

**Business rule**
- Chỉ kênh có **≥ 5 ticket lịch sử** (mọi trạng thái).
- Mỗi kênh: tổng ticket, đang mở, thất bại, số CLAIM, số GBQ.
- Sắp xếp giảm dần theo tổng ticket; tối đa 10 kênh.
- **revenue_at_risk = 0**.

**Acceptance Criteria**

```
AC1 — Điều kiện vào bảng
  Given một kênh
  When kênh có ≥ 5 ticket lịch sử
  Then kênh xuất hiện trong bảng "Kênh vi phạm lặp lại".

AC2 — Cột bảng
  Given bảng
  Then mỗi dòng có: tên kênh, dự án, tổng ticket, đang mở, thất bại, số CLAIM, số GBQ
  And KHÔNG hiển thị doanh thu.

AC3 — Sắp xếp & giới hạn
  Given danh sách
  Then xếp theo tổng ticket giảm dần, tối đa 10 kênh.
```

**Edge case**
- Kênh không tra được tên → loại khỏi bảng.
- Snapshot hiện tại: 10 kênh; dẫn đầu Comedy Hub 27 (16 ticket, 1 GBQ).

---

## US-11 — Xu hướng thất bại & trả về hàng tuần

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** xem số ca thất bại và số lần bị trả về theo tuần, **để** biết chất lượng xử lý đang xấu đi hay tốt lên theo thời gian. |
| **Đối tượng** | TP + Leader |
| **Ưu tiên** | Should have (P1) |
| **Ước lượng** | 2 điểm |
| **Component** | `RootWeeklyFail` (tái dùng) |
| **Nguồn dữ liệu** | `priority.json → analysis.weekly_fail_trend` (12 tuần) |

**Business rule**
- Mỗi tuần: số tạo mới, hoàn thành, thất bại, và **return_count** (sự kiện "yêu cầu bổ sung").
- Component hiển thị 8 tuần gần nhất.

**Acceptance Criteria**

```
AC1 — Trục thời gian
  Given biểu đồ xu hướng
  Then hiển thị các tuần gần nhất theo trục hoành (mới nhất bên phải).

AC2 — Hai chỉ số
  Given mỗi tuần
  Then hiển thị số ca thất bại (cột) và số lần trả về (đường/cột) cùng lúc.

AC3 — Tổng hợp
  Given biểu đồ
  Then hiển thị tổng số thất bại và tổng số lần trả về trong kỳ.
```

**Edge case**
- Tuần không có ca thất bại/trả về → giá trị 0, biểu đồ không vỡ.
- Snapshot hiện tại (3 tuần gần nhất): created 41/31/23, failed 3/0/2, returns 11/7/9.

---

## US-12 — Pipeline Whitelist

| | |
|---|---|
| **Story** | **Là** TP/Leader, **tôi muốn** thấy đơn whitelist đang ở trạng thái nào và mất bao lâu để hoàn tất, **để** theo dõi tiến độ bảo vệ kênh và phát hiện đơn tồn đọng. |
| **Đối tượng** | TP + Leader (liên kết với cờ "Chưa WL" ở US-03) |
| **Ưu tiên** | Should have (P1) |
| **Ước lượng** | 3 điểm |
| **Component** | `WhitelistPipeline` (tái dùng từ SEO) |
| **Nguồn dữ liệu** | `priority.json → analysis.whitelist_pipeline` |

**Business rule**
- Phân bổ theo trạng thái: "Đang WL" (good) / "Đang xử lý" (warn) / "Đã gỡ" (bad).
- `avg_days_to_wl` = trung vị số ngày từ ngày đăng ký → ngày WL thành công (0–90 ngày).
- Liệt kê đơn gần đây đã WL + đơn đang chờ (pending), xếp theo thời gian chờ.

**Acceptance Criteria**

```
AC1 — Phân bổ trạng thái
  Given pipeline whitelist
  Then hiển thị số lượng theo từng trạng thái với màu tone tương ứng (good/warn/bad).

AC2 — Thời gian trung bình
  Given pipeline
  Then hiển thị số ngày trung vị để một đơn WL hoàn tất.

AC3 — Đơn đang chờ
  Given có đơn "Đang xử lý"
  Then liệt kê đơn đang chờ kèm số ngày đã chờ (lâu nhất lên đầu).

AC4 — Liên kết ngữ cảnh
  Given cờ "Chưa WL" ở bảng top kênh (US-03)
  Then US-12 trả lời được "các đơn WL đang ở đâu" cho cùng tập kênh đó.
```

**Edge case**
- Không có mẫu ngày hợp lệ → `avg_days_to_wl` = null, hiển thị "—".
- Snapshot hiện tại: Đang WL=65, Đã gỡ=8, Đang xử lý=7, tổng=80, trung vị 4.5 ngày, 7 đơn đang chờ.

---

## Bảng tổng hợp & truy vết

| Story | Đối tượng | Ưu tiên | Điểm | Component | Khóa dữ liệu | AC |
|-------|-----------|---------|------|-----------|--------------|----|
| US-01 | TP+Leader | P0 | 2 | `KpiCard`×5 | `kpis` | 4 |
| US-02 | TP+Leader | P0 | 2 | `VolumeTrend`,`OutcomeTrend` | `volume_trend`,`outcome_trend` | 4 |
| US-03 | TP+Leader | P0 | 3 | `PriorityChannels` | `channels_top` | 4 |
| US-04 | TP+Leader | P1 | 2 | `Aging`,`WorkflowFunnel` | `aging`,`funnel` | 3 |
| US-05 | Vận hành | P0 | 3 | `SlaGauge`,`NearBreachRadar` | `sla`,`near_breach` | 4 |
| US-06 | Vận hành | P0 | 3 | `PriorityEscalation` | `escalation_board` | 4 |
| US-07 | **Chỉ Leader** | P1 | 2 | `BreachByRole` | `breach_by_role` | 4 |
| US-08 | **Chỉ Leader** | P1 | 3 | `AssigneeLoad` | `assignee_workload` | 4 |
| US-09 | TP+Leader | P2 | 2 | `ResourceBreakdown` | `analysis.resource_breakdown` | 3 |
| US-10 | TP+Leader | P2 | 2 | `RootRepeatChannels` | `analysis.repeat_offender_channels` | 3 |
| US-11 | TP+Leader | P1 | 2 | `RootWeeklyFail` | `analysis.weekly_fail_trend` | 3 |
| US-12 | TP+Leader | P1 | 3 | `WhitelistPipeline` | `analysis.whitelist_pipeline` | 4 |

**Tổng:** 12 story · 31 điểm · 4×P0 + 6×P1 + 2×P2.

**Phân theo khu:**
- KHU A (Điều hành chung, TP+Leader): US-01→04
- KHU B (Vận hành): US-05, US-06
- KHU C (Giám sát đội, chỉ Leader): US-07, US-08
- KHU D (Phân tích & Phòng ngừa, TP+Leader): US-09→12

---

## Phụ thuộc & rủi ro

| Loại | Nội dung |
|------|----------|
| **Phụ thuộc kỹ thuật** | Mọi story phụ thuộc `derived/priority.json` phải được build trước (`npm run derive`). |
| **Phụ thuộc dữ liệu** | SLA per-step dựa trên `timeline.json` + `lib/sla.ts`; thiếu timeline → ticket rơi vào nhánh DEFAULT_SLA (48h). |
| **Rủi ro dữ liệu mẫu** | NOW cố định ⇒ breach rate cao bất thường (~97%). Cần lưu ý khi demo; không phản ánh production. |
| **Rủi ro phạm vi** | Story doanh thu KHÔNG thuộc nhóm này — nếu phát sinh, tạo story mới gắn Epic gốc với label khác. |
