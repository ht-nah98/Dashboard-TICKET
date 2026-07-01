# EPIC — Hệ thống Quản lý & Điều phối Ticket (QLK Ticket Management)

> **Đây là Epic gốc.** Mọi user story liên quan đến ticket — hiện tại và tương lai —
> đều thuộc về Epic này. Mỗi story phân biệt bằng **label theo màn** (xem mục "Cách gắn story").
>
> **Mã Epic:** `EPIC-TICKET` · **Trạng thái:** Đang triển khai · **Chủ sở hữu:** PO

---

## 1. Phát biểu Epic

> **Là** một tổ chức vận hành ticket trên nhiều kênh,
> **chúng tôi cần** một hệ thống dashboard giúp toàn đội — từ Lãnh đạo, Trưởng phòng,
> Leader đến Vận hành và SEO — **theo dõi, ưu tiên, xử lý và phân tích** toàn bộ vòng đời
> ticket (CLAIM, WHITELIST, GBQ, GCD, TKT_BKT, DIE),
> **để** giảm trễ SLA, tăng tỷ lệ xử lý thành công, rút ngắn thời gian xử lý, và giúp mọi
> vai trò ra quyết định trên **cùng một nguồn dữ liệu thống nhất**.

---

## 2. Bối cảnh & vấn đề

Mỗi ngày đội tiếp nhận nhiều ticket cho các kênh YouTube (kháng bản quyền, whitelist,
xử lý gậy…). Mỗi ticket đi qua nhiều bước, nhiều vai trò (SEO ↔ VHYT / VHDA / VHWL) và
có hạn xử lý (SLA). Các vấn đề lặp lại:

- **Không biết việc nào làm trước** khi khối lượng vượt nhân lực.
- **Trễ SLA âm thầm** — phát hiện khi đã muộn.
- **Mỗi vai trò nhìn một kiểu số** → tranh luận khi họp, mất niềm tin vào báo cáo.
- **Không truy được nguyên nhân gốc** → lỗi lặp lại ở cùng kênh / cùng bước.

Epic này gom mọi nỗ lực giải quyết các vấn đề trên thành **một sản phẩm dashboard nhất quán**.

---

## 3. Mục tiêu & kết quả mong đợi (Outcome)

| Mục tiêu | Đo bằng |
|----------|---------|
| Giảm trễ SLA | % ticket trong SLA tăng lên theo thời gian |
| Tăng chất lượng xử lý | Tỷ lệ xử lý thành công (success rate) tăng |
| Xử lý nhanh hơn | Thời gian xử lý trung vị (MTTR) giảm |
| Thống nhất số liệu | Mọi vai trò nhìn **cùng định nghĩa** SLA / trạng thái / mức ưu tiên |
| Phòng ngừa lặp lại | Số kênh / bước vi phạm lặp lại giảm dần |

> **Lưu ý:** Mục tiêu liên quan **doanh thu** tạm để ngoài phạm vi cho tới khi có dữ liệu
> đo đạc. Khi có, sẽ bổ sung story mới vào chính Epic này.

---

## 4. Đối tượng người dùng

| Vai trò | Quan tâm chính |
|---------|----------------|
| **Lãnh đạo (C-Level)** | Sức khỏe tổng thể, rủi ro, xu hướng |
| **Trưởng phòng (TP)** | Điểm nóng, phân bổ nguồn lực |
| **Leader** | Giám sát đội, tiến độ, nút thắt |
| **Vận hành** | Việc cần làm trước, ca sắp/đã trễ |
| **SEO** | Phần việc của cá nhân, ca bị trả về |

---

## 5. Phạm vi Epic — cách tổ chức story

Cấu trúc **phẳng**: tất cả story gắn trực tiếp vào `EPIC-TICKET`, phân biệt bằng **label**.

```
EPIC-TICKET: Hệ thống Quản lý & Điều phối Ticket
│
├─ [label: priority]    Bảng ưu tiên xử lý ticket theo SLA   ← đang triển khai
├─ [label: executive]   Tổng quan điều hành
├─ [label: operations]  Kiểm soát vận hành
├─ [label: seo]         Việc của tôi (SEO)
├─ [label: root]        Nguyên nhân gốc & phòng ngừa
└─ [label: ...]         (story mới trong tương lai đẩy vào đây)
```

### Cách gắn một story mới vào Epic
1. Tạo story với mã `US-xxx`.
2. Gắn **Epic Link** = `EPIC-TICKET`.
3. Gắn **label** tương ứng màn (`priority`, `executive`, `operations`, `seo`, `root`…).
4. Nếu là năng lực hoàn toàn mới (vd: doanh thu, thông báo), thêm label mới — **vẫn cùng Epic**.

---

## 6. Danh mục story theo label

| Label | Phạm vi | Tài liệu chi tiết | Trạng thái |
|-------|---------|-------------------|------------|
| `priority` | Bảng ưu tiên theo SLA (6 story US-01→US-06) | [`PRIORITY_USER_STORIES.md`](./PRIORITY_USER_STORIES.md) | ✅ Đã có |
| `executive` | Tổng quan điều hành | _(chưa viết)_ | ⬜ |
| `operations` | Kiểm soát vận hành | _(chưa viết)_ | ⬜ |
| `seo` | Việc của tôi (SEO) | _(chưa viết)_ | ⬜ |
| `root` | Nguyên nhân gốc & phòng ngừa | _(chưa viết)_ | ⬜ |

> Khi viết thêm bộ story cho màn khác, thêm một dòng vào bảng này và link tới file tài liệu.

---

## 7. Tiêu chí hoàn thành Epic (Definition of Done — cấp Epic)

Epic là dài hạn, không "đóng" một lần. Coi là **đạt cột mốc** khi:

- [ ] Mỗi vai trò người dùng có ít nhất một màn phục vụ đúng nhu cầu.
- [ ] Mọi màn dùng **chung định nghĩa** SLA / trạng thái ticket (một nguồn sự thật).
- [ ] Chỉ số SLA / success rate / MTTR đo được và theo dõi theo thời gian.
- [ ] Mọi story liên quan ticket đều được gắn vào `EPIC-TICKET` (không story ticket nào "mồ côi").

---

## 8. Ngoài phạm vi (hiện tại)

- Mọi tính năng liên quan **doanh thu** (chờ có dữ liệu đo đạc).
- Phân quyền / xác thực người dùng theo danh tính thật.
- Thông báo chủ động (email / push) khi ticket sắp trễ.
- Ứng dụng mobile.

> Các mục trên **không bị loại bỏ** — chúng sẽ thành story mới đẩy vào Epic này khi tới lượt.
