# User Story — Trang "Ưu tiên triển khai" (`/priority`)

> Tài liệu này viết cho **mọi người đọc đều hiểu** — không cần biết kỹ thuật.
> Mỗi câu chuyện trả lời 3 câu: **Tôi là ai? Tôi muốn gì? Để được gì?**

---

## Thuộc Epic nào?

| | |
|---|---|
| **Epic gốc** | [`EPIC-TICKET` — Hệ thống Quản lý & Điều phối Ticket](./EPIC_TICKET_MANAGEMENT.md) |
| **Label nhóm story** | `priority` |
| **Số story trong nhóm** | 6 (US-01 → US-06) |

> 6 user story dưới đây **không phải một Epic riêng** — chúng là **một nhóm story
> (label `priority`)** nằm trong Epic gốc. Mọi story ticket khác cũng đẩy vào cùng Epic đó.

**Tóm tắt nhóm `priority`:** xây trang `/priority` xếp hạng việc cần làm theo **mức trễ SLA
× độ nghiêm trọng × tuổi ticket** (không dùng doanh thu), phục vụ TP + Leader (khu Điều hành)
và Vận hành (khu Vận hành) trên **cùng một bộ số**.

```
EPIC-TICKET (gốc)
└─ [label: priority]  Bảng ưu tiên xử lý ticket theo SLA
   ├─ Khu Điều hành chung (TP + Leader)
   │   ├─ US-01  5 thẻ sức khỏe tổng
   │   ├─ US-02  Xu hướng 12 tuần
   │   ├─ US-03  Top kênh rủi ro
   │   └─ US-04  Tuổi + phễu quy trình
   └─ Khu Vận hành
       ├─ US-05  SLA + danh sách sắp trễ
       └─ US-06  Bảng can thiệp gấp
```

---

## Bối cảnh (đọc 30 giây là nắm)

Mỗi ngày đội nhận rất nhiều "ticket" (yêu cầu xử lý) cho các kênh YouTube: kháng
bản quyền (CLAIM), đăng ký whitelist, xử lý gậy bản quyền (GBQ)… Mỗi ticket đi qua
nhiều bước, có nhiều người tham gia (SEO, VHYT, VHWL), và **có hạn xử lý (SLA)**.

Vấn đề: việc thì nhiều, người thì có hạn. Ai cũng cần biết **"việc nào làm trước"**.
Trước đây có thể xếp theo *số tiền rủi ro*, nhưng **hiện tại chưa có dữ liệu doanh thu**.
Vì vậy trang này xếp ưu tiên theo những gì hệ thống **tự biết**:

> **Ticket càng trễ hạn, càng nghiêm trọng, càng để lâu → càng ưu tiên.**

Trang có **2 khu vực**, phục vụ 2 nhóm người dùng nhưng **dùng chung một bộ số**:

| Khu vực | Dành cho | Mục đích |
|---------|----------|----------|
| **Điều hành chung** | Trưởng phòng (TP) + Leader | Nhìn bức tranh tổng & điểm nóng |
| **Vận hành** | Đội vận hành | Biết hôm nay làm gì trước |

---

## NHÓM 1 — Trưởng phòng & Leader (khu "Điều hành chung")

### US-01 — Xem sức khỏe tổng thể trong một cái liếc
> **Là** Trưởng phòng / Leader,
> **tôi muốn** thấy ngay 5 con số quan trọng nhất (số ticket đang mở, số ca nghiêm trọng,
> số ca trễ hạn, tỷ lệ làm thành công trong tháng, thời gian xử lý trung bình),
> **để** biết tình hình đội đang tốt hay đang căng mà không phải mở nhiều báo cáo.

**Khi nào coi là làm xong (đọc là hiểu):**
- Có đúng 5 thẻ số ở đầu trang.
- Mỗi thẻ cho thấy **tăng hay giảm** so với kỳ trước (mũi tên + %).
- Thẻ "Trễ SLA" hiển thị **đúng cùng con số** mà đội vận hành nhìn thấy.

---

### US-02 — Biết xu hướng đang đi lên hay đi xuống
> **Là** Trưởng phòng / Leader,
> **tôi muốn** xem biểu đồ khối lượng ticket và tỷ lệ thành công theo 12 tuần,
> **để** biết tháng này đội đang tiến bộ hay tụt lùi, và loại việc nào đang tăng đột biến.

**Khi nào coi là làm xong:**
- Một biểu đồ cho thấy **số ticket mới mỗi tuần** chia theo loại.
- Một biểu đồ cho thấy **bao nhiêu hoàn thành / thất bại / còn dở** mỗi tuần,
  kèm đường **tỷ lệ thành công**.

---

### US-03 — Tìm ra "điểm nóng" nằm ở kênh nào
> **Là** Trưởng phòng / Leader,
> **tôi muốn** một bảng xếp hạng các kênh đang rủi ro nhất,
> **để** giao đúng người tập trung vào đúng kênh cần cứu trước.

**Khi nào coi là làm xong:**
- Bảng liệt kê top kênh, **sắp xếp theo "Điểm ưu tiên"** (điểm cao = cần lo trước).
- Mỗi dòng thấy được: số ticket mở, số ca nghiêm trọng, ticket cũ nhất bao nhiêu ngày,
  và **cờ "Chưa WL"** nếu kênh chưa có whitelist.

---

### US-04 — Hiểu ticket đang tắc ở khâu nào
> **Là** Trưởng phòng / Leader,
> **tôi muốn** thấy ticket đang tồn đọng bao lâu và đang kẹt ở bước nào trong quy trình,
> **để** biết nên tháo gỡ ở khâu nào (ví dụ: nhiều ca kẹt ở bước "chờ xử lý").

**Khi nào coi là làm xong:**
- Một biểu đồ **tuổi ticket** (mới → để rất lâu).
- Một biểu đồ **phễu 5 bước** cho thấy mỗi bước có bao nhiêu ticket và **dừng trung bình bao lâu**.

---

## NHÓM 2 — Đội Vận hành (khu "Vận hành")

### US-05 — Biết ngay ca nào "sắp trễ còn cứu được"
> **Là** nhân viên Vận hành,
> **tôi muốn** một danh sách ticket sắp trễ hạn được xếp lên đầu (ca còn kịp cứu trước,
> rồi mới đến ca đã trễ nặng), kèm đồng hồ tuân thủ SLA,
> **để** dồn sức cứu những ca còn kịp thay vì để trễ thêm.

**Khi nào coi là làm xong:**
- Một "đồng hồ SLA" cho biết **% đang trong hạn / sắp trễ / đã trễ**, và **ai đang giữ nhiều ca trễ nhất**.
- Danh sách near-breach xếp **ca sắp trễ (còn cứu được) lên trước**, ca đã trễ nặng xuống dưới.

---

### US-06 — Biết việc nào phải "leo thang" ngay hôm nay
> **Là** nhân viên / quản lý Vận hành,
> **tôi muốn** một bảng các ticket cần can thiệp gấp, xếp theo mức độ ưu tiên,
> **để** xử lý hoặc báo cấp trên đúng thứ tự, không bỏ sót ca quan trọng.

**Khi nào coi là làm xong:**
- Bảng chỉ chứa ticket **đã trễ hoặc khẩn cấp**.
- Sắp xếp theo **"Điểm ưu tiên"** (cao nhất lên đầu).
- Mỗi dòng thấy: mã ticket, loại, kênh, ai phụ trách, bước hiện tại, đã mở bao nhiêu ngày.

---

## NHÓM 3 — Giám sát đội (👤 DÀNH RIÊNG CHO LEADER)

> ⚠️ **Hai câu chuyện này chỉ dành cho Leader** — không phải Trưởng phòng hay Vận hành.
> Trên màn hình, hai biểu đồ này nằm trong khu **"Giám sát đội — dành riêng cho Leader"**
> và có gắn nhãn **👤 Leader** để dễ nhận biết.

### US-07 — Biết nút thắt đang nằm ở vai trò nào *(chỉ Leader)*
> **Là** Leader,
> **tôi muốn** thấy mỗi vai trò (VHYT, SEO, VHWL…) đang giữ bao nhiêu ca đã trễ hạn,
> **để** biết "tắc" ở đội nào mà tập trung gỡ trước.

**Khi nào coi là làm xong:**
- Mỗi vai trò là một thanh ngang, dài hơn = đang ôm nhiều ca trễ hơn.
- Thấy được số ca trễ và tỷ lệ % của từng vai trò.
- Có nhãn **👤 Leader** trên biểu đồ.

### US-08 — Biết ai trong đội đang quá tải *(chỉ Leader)*
> **Là** Leader,
> **tôi muốn** thấy mỗi nhân sự đang ôm bao nhiêu ticket (kèm số ca nghiêm trọng / đã trễ),
> **để** phát hiện người quá tải và san việc cho hợp lý.

**Khi nào coi là làm xong:**
- Mỗi người một thanh tải; người ôm nhiều ticket nhất có thanh dài nhất.
- Hiển thị nhãn cảnh báo "critical" / "trễ" nếu người đó đang có ca như vậy.
- Có nhãn **👤 Leader** trên biểu đồ.

---

## NHÓM 4 — Phân tích & Phòng ngừa (góc nhìn dài hạn)

> 💡 **Khác với các nhóm trên.** Ba nhóm đầu trả lời "làm gì NGAY". Nhóm này trả lời
> **"VÌ SAO vi phạm & làm sao ngăn lặp lại"** — dùng để lập kế hoạch cải tiến, chủ yếu cho
> TP + Leader. Các biểu đồ ở đây **không hiển thị doanh thu**.

### US-09 — Biết loại tài nguyên nào hay bị dính nhất
> **Là** TP/Leader,
> **tôi muốn** biết loại tài nguyên (hình ảnh, âm thanh, footage, thumbnail) nào hay bị
> ticket và tỷ lệ thất bại ra sao,
> **để** tập trung phòng ngừa đúng loại rủi ro.

**Khi nào coi là làm xong:** thấy được mỗi loại tài nguyên có bao nhiêu ticket, tỷ lệ thất
bại, và xu hướng theo tuần.

### US-10 — Tìm kênh tái phạm nhiều lần
> **Là** TP/Leader,
> **tôi muốn** danh sách kênh có nhiều ticket lịch sử,
> **để** xác định kênh cần audit kỹ thuật hoặc đào tạo lại.

**Khi nào coi là làm xong:** bảng kênh có từ 5+ ticket, thấy tổng ticket, số đang mở, số
thất bại, số CLAIM/GBQ.

### US-11 — Biết chất lượng xử lý đang tốt lên hay xấu đi
> **Là** TP/Leader,
> **tôi muốn** xem số ca thất bại và số lần bị trả về theo tuần,
> **để** biết xu hướng chất lượng theo thời gian.

**Khi nào coi là làm xong:** biểu đồ theo tuần cho thấy số thất bại + số lần trả về, kèm
tổng hợp trong kỳ.

### US-12 — Theo dõi tiến độ whitelist
> **Là** TP/Leader,
> **tôi muốn** thấy đơn whitelist đang ở trạng thái nào và mất bao lâu để xong,
> **để** theo dõi tiến độ bảo vệ kênh và phát hiện đơn tồn đọng.

**Khi nào coi là làm xong:** thấy số đơn theo từng trạng thái (Đang WL / Đang xử lý / Đã gỡ),
số ngày trung bình để hoàn tất, và danh sách đơn đang chờ. Trả lời được câu hỏi mà cờ
"Chưa WL" ở US-03 đặt ra.

---

## "Điểm ưu tiên" được tính thế nào? (giải thích cho người không kỹ thuật)

Mỗi ticket được chấm điểm dựa trên **3 yếu tố cộng dồn**:

| Yếu tố | Nghĩa đời thường | Ảnh hưởng |
|--------|------------------|-----------|
| **Mức trễ hạn** | Đã quá hạn xử lý gấp mấy lần? | Càng quá hạn → điểm càng cao |
| **Độ nghiêm trọng** | Loại việc có nguy hiểm không? (gậy bản quyền, khẩn cấp…) | Việc nguy hiểm → nhân điểm lên |
| **Tuổi ticket** | Để treo bao lâu rồi? | Mỗi tuần treo → cộng thêm một bậc |

> **Whitelist (WL)** không tính vào điểm — nó chỉ là **cờ cảnh báo** màu cam để nhắc
> "kênh này chưa được bảo vệ".

**Tinh thần chung:** việc **trễ nhất + nguy hiểm nhất + để lâu nhất** sẽ luôn nổi lên đầu.

---

## Vì sao TP/Leader và Vận hành "không bao giờ lệch số"?

Cả 2 khu vực **lấy chung một nguồn tính SLA**. Nghĩa là:

> Con số "Trễ SLA" mà **Leader** thấy ở thẻ tổng quan = con số **breach** mà **Vận hành**
> thấy ở đồng hồ SLA.

Nhờ vậy khi họp, không ai phải tranh luận "số của anh khác số của tôi".

---

## Một lưu ý thật lòng về dữ liệu hiện tại

Đây đang là **dữ liệu mẫu có mốc thời gian cố định** (giả lập "hôm nay" là 23/05/2026).
Vì mốc đứng yên nên **gần như mọi ticket đều bị tính là trễ hạn** (~173/178) — con số này
trông cao bất thường.

**Điều này là bình thường với dữ liệu mẫu** và **không phải lỗi**. Khi cắm dữ liệu thật
(mốc "hôm nay" chạy theo thời gian thực), tỷ lệ trễ hạn sẽ về đúng mức thực tế. Quan trọng
là **thứ tự ưu tiên vẫn đúng** vì còn nhân thêm độ nghiêm trọng và tuổi ticket.

---

## Tóm tắt nhanh cho người bận

| # | Câu chuyện | Ai dùng | Trả lời câu hỏi |
|---|-----------|---------|-----------------|
| US-01 | 5 thẻ sức khỏe tổng | TP + Leader | "Đội đang tốt hay căng?" |
| US-02 | Xu hướng 12 tuần | TP + Leader | "Đang lên hay xuống?" |
| US-03 | Top kênh rủi ro | TP + Leader | "Điểm nóng ở đâu?" |
| US-04 | Tuổi + phễu quy trình | TP + Leader | "Tắc ở khâu nào?" |
| US-05 | SLA + sắp trễ | Vận hành | "Ca nào cứu được?" |
| US-06 | Bảng can thiệp gấp | Vận hành | "Làm gì trước?" |
| US-07 | Trễ SLA theo vai trò | 👤 Chỉ Leader | "Tắc ở vai trò nào?" |
| US-08 | Tải theo nhân sự | 👤 Chỉ Leader | "Ai đang quá tải?" |
| US-09 | Tài nguyên vi phạm | TP + Leader | "Loại nào hay dính?" |
| US-10 | Kênh tái phạm | TP + Leader | "Kênh nào lặp lại?" |
| US-11 | Xu hướng thất bại/trả về | TP + Leader | "Chất lượng lên hay xuống?" |
| US-12 | Pipeline whitelist | TP + Leader | "Đơn WL đang ở đâu?" |
