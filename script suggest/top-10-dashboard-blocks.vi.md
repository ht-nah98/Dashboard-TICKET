# Top 10 Dashboard Blocks — Phase 1 / MVP

> **Project**: QLK Ticket Dashboard  
> **Audience**: C-Level, Manager, VHYT Lead, SEO  
> **Version**: 2.0  
> **Updated**: 2026-05-06

---

## 1. Mục đích tài liệu

Tài liệu này xác định **10 khối thông tin quan trọng nhất** nên triển khai đầu tiên cho dashboard ticket.

Mục tiêu của tài liệu:

- chốt phạm vi **MVP / Phase 1**
- ưu tiên đúng các biểu đồ và bảng có giá trị quản trị cao nhất
- đảm bảo dashboard vừa dùng được cho **C-Level**, **Manager**, vừa có giá trị thực tế với **SEO**
- mô tả luôn các **filter**, **sort**, và hành vi cơ bản cần có ngay từ đợt đầu

> **Lưu ý quan trọng**: Tài liệu này không giới hạn vào “10 chart” thuần túy. Trong thực tế dashboard tốt phải bao gồm cả `KPI card`, `table`, `chart`. Vì vậy thuật ngữ đúng trong tài liệu này là **dashboard blocks**.

### Cập nhật ở version 2

Version 2 điều chỉnh lại ưu tiên của phase đầu:

- **không ưu tiên `Root Cause Pareto`** ở MVP vì dữ liệu root cause hiện tại khó chuẩn hóa và khó đo tin cậy
- **bổ sung mạnh hơn nhóm Whitelist**, vì đây là nhóm có dữ liệu trạng thái rõ hơn và tạo insight quản trị trực tiếp hơn
- ưu tiên các block trả lời được câu hỏi:
  - kênh nào đang được whitelist ở đâu
  - kho / network nào đang gánh nhiều whitelist nhất
  - kênh nào đang có claim nhưng chưa được whitelist
  - pipeline whitelist đang nghẽn ở đâu

---

## 2. Tiêu chí chọn Top 10

Một block chỉ được đưa vào Top 10 nếu đạt phần lớn các tiêu chí sau:

1. Trả lời được một câu hỏi quan trọng của business hoặc vận hành
2. Có thể dẫn tới hành động ngay
3. Dùng được cho ít nhất 2 nhóm vai trò
4. Bao phủ được một góc nhìn quan trọng:
   - risk
   - SLA
   - workload
   - SEO action
   - root cause
5. Có thể triển khai với dữ liệu khả thi trong giai đoạn đầu

---

## 3. Danh sách Top 10 Block nên triển khai đầu tiên

## Block 1 — KPI Summary Cards

### Mục đích
Đây là lớp thông tin đầu tiên cho mọi người dùng. Chỉ cần nhìn 5–10 giây là phải biết hệ thống đang căng đến mức nào.

### Câu hỏi trả lời
- Hiện tại có bao nhiêu ticket đang mở? ( Các trạng thái khác nhau của mỗi ticket)
- Có bao nhiêu ticket đang trễ SLA?
- Bao nhiêu ticket đang cần tôi action?
- Success rate hiện tại là bao nhiêu?

### Chỉ số đề xuất
- Open Tickets
- Critical Open Tickets
- Need My Action
- Breached SLA
- Success Rate MTD

### Vai trò dùng
- C-Level
- Manager
- SEO

### Giá trị
- Tóm tắt toàn hệ thống trong một hàng
- Là điểm vào bắt buộc cho mọi dashboard page

---

## Block 2 — Ticket Volume Trend by Type

### Dạng visual
- Line chart hoặc stacked column theo ngày / tuần / tháng

### Câu hỏi trả lời
- Ticket đang tăng hay giảm?
- Loại ticket nào đang bùng lên bất thường?
- Có dấu hiệu bất thường theo thời gian không?

### Dimension chính
- Time
- Ticket type

### Vai trò dùng
- C-Level
- Manager

### Giá trị
- Giúp phát hiện sớm trend xấu
- Tốt cho theo dõi theo tuần / tháng

---

## Block 3 — Open Ticket by Status

### Dạng visual
- Horizontal bar chart theo trạng thái

### Câu hỏi trả lời
- Ticket đang nằm ở đâu trong workflow?
- Hệ thống đang nghẽn ở bước nào?
- Có quá nhiều ticket paused hay waiting không?

### Dimension chính
- Status
- Có thể drill xuống sub-status

### Vai trò dùng
- Manager
- SEO
- C-Level

### Giá trị
- Đây là visual quan trọng nhất để hiểu queue đang bị nghẽn ở đâu

---

## Block 4 — SLA Compliance + Aging

### Dạng visual
- Stacked bar `within SLA / near breach / breached`
- hoặc thêm aging buckets

### Câu hỏi trả lời
- Bao nhiêu ticket đang đúng hạn?
- Bao nhiêu ticket sắp trễ?
- Ticket nào đang quá già?

### Metric chính
- within SLA
- near breach
- breached
- aging bucket

### Vai trò dùng
- Manager
- VHYT Lead
- SEO

### Giá trị
- Nếu thiếu block này thì manager gần như mất khả năng kiểm soát vận hành

---

## Block 5 — Waiting Responsibility Split

### Dạng visual
- Stacked bar hoặc donut

### Câu hỏi trả lời
- Ticket đang chờ SEO hay chờ VHYT hay chờ external?
- Delay hiện tại đang đến từ bên nào?

### Nhóm dữ liệu
- waiting on SEO
- waiting on VHYT
- waiting on external
- waiting on approval

### Vai trò dùng
- Manager
- SEO
- C-Level

### Giá trị
- Giúp chốt accountability
- Giảm tranh luận cảm tính giữa các bên

---

## Block 6 — My Action Queue

### Dạng visual
- Priority table

### Câu hỏi trả lời
- Tôi cần làm gì ngay bây giờ?
- Ticket nào sắp đến hạn?
- Ticket nào cần tôi bổ sung / xác nhận / submit?

### Cột nên có
- Ticket ID
- Ticket Type
- Channel
- Current Step
- Next Action
- Due Time
- SLA Risk

### Vai trò dùng
- SEO

### Giá trị
- Đây là block quan trọng nhất cho SEO
- Nếu không có block này, SEO dashboard sẽ thiếu giá trị thực tế

---

## Block 7 — Assignee Workload

### Dạng visual
- Horizontal bar chart theo assignee

### Câu hỏi trả lời
- Ai đang quá tải?
- Ai đang giữ nhiều ticket critical?
- Workload đang phân bổ đều hay lệch?

### Metric chính
- open tickets
- critical tickets
- breached tickets

### Vai trò dùng
- Manager
- VHYT Lead

### Giá trị
- Dùng để chia việc lại, tránh bottleneck do nhân sự

---

## Block 8 — Assignee Performance

### Dạng visual
- Scatter plot hoặc paired bar chart

### Câu hỏi trả lời
- Ai xử lý nhanh?
- Ai có success rate tốt?
- Ai đang chậm hoặc chất lượng thấp?

### Metric chính
- avg resolution time
- success rate
- ticket volume handled

### Vai trò dùng
- Manager
- C-Level

### Giá trị
- Phân biệt rõ workload với performance
- Hỗ trợ đánh giá năng lực vận hành

---

## Block 9 — Top Risk Channels

### Dạng visual
- Ranked table

### Câu hỏi trả lời
- Channel nào nguy hiểm nhất lúc này?
- Channel nào đang kéo nhiều open ticket hoặc revenue risk nhất?
- Channel nào có repeated issue nhiều nhất?

### Cột nên có
- Channel
- Project
- Open Ticket Count
- Highest Severity
- Revenue at Risk
- Days Unresolved
- Repeat Issue Count

### Vai trò dùng
- C-Level
- Manager
- SEO Lead

### Giá trị
- Giúp ưu tiên cứu đúng channel, không chỉ nhìn số lượng ticket tổng

---

## Block 10 — Claim Exposure Without Whitelist

### Dạng visual
- Ranked table hoặc horizontal bar chart

### Câu hỏi trả lời
- Kênh nào đang bị claim nhưng chưa được whitelist?
- Nhóm kênh nào đang có exposure cao vì thiếu whitelist?
- Ticket whitelist đang giúp giảm risk đến đâu?

### Cột / dữ liệu chính
- Channel
- Project
- Open claim count
- Whitelist status
- Number of whitelist kho
- Suggested action

### Vai trò dùng
- C-Level
- Manager
- SEO Lead
- SEO

### Giá trị
- Đây là block đo được bằng dữ liệu chắc chắn hơn root cause
- Kết nối trực tiếp giữa `Claim` và `Whitelist`
- Giúp nhìn rõ chỗ nào đang “hở bảo vệ”

---

## 4. Top 10 theo thứ tự ưu tiên triển khai

Nếu phải xếp theo đúng thứ tự build, tôi đề xuất:

1. KPI Summary Cards
2. My Action Queue
3. SLA Compliance + Aging
4. Open Ticket by Status
5. Ticket Volume Trend by Type
6. Waiting Responsibility Split
7. Top Risk Channels
8. Assignee Workload
9. Assignee Performance
10. Claim Exposure Without Whitelist

### Giải thích logic

- `1–4`: phục vụ vận hành và action tức thời
- `5–7`: bổ sung góc nhìn trend và business risk
- `8–10`: nâng khả năng quản trị team và phòng ngừa bằng dữ liệu đo được ngay

---

## 5. Bộ lọc cần có ngay từ Phase 1

Nếu đã triển khai Top 10 block trên, thì các filter sau là **bắt buộc**:

## 5.1. Bộ lọc toàn cục

- Time range
- Ticket type
- Status
- Project
- Net
- Department
- SEO owner
- VHYT assignee
- Severity / priority
- Waiting responsibility
- Outcome
- Channel
- Whitelist status
- Whitelist kho / network

## 5.2. Bộ lọc mở rộng nếu có data đủ tốt

- Root cause
- Handling option / PA
- External service / third-party involvement
- Approval required / approval status

## 5.3. Giá trị của từng filter

### Time range
Để so sánh theo ngày / tuần / tháng và xem trend.

### Ticket type
Để tách Claim, Whitelist, GCD, GBQ, TKT/BKT xịt, Die kênh.

### Status
Để nhìn ticket mở, đang xử lý, paused, completed, failed.

### Project / Net / Department
Để manager và C-level nhìn ra khu vực có vấn đề.

### SEO owner / VHYT assignee
Để drill theo người chịu trách nhiệm.

### Severity / priority
Để ưu tiên risk cao trước.

### Waiting responsibility
Để nhìn ai đang là bên giữ bóng.

### Outcome
Để lọc success / failure / unresolved.

### Channel
Để tìm nhanh theo kênh rủi ro hoặc channel trọng điểm.

### Whitelist status
Để tách:

- đã whitelist
- chưa whitelist
- đang chờ whitelist
- whitelist thất bại

### Whitelist kho / network
Để trả lời:

- kênh đang nằm trong kho nào
- kho nào đang có nhiều kênh nhất
- kho nào đang tạo backlog hoặc exposure nhiều nhất

---

## 6. Filter mặc định theo vai trò

### SEO
- mặc định: `My tickets`
- các card và table phải ưu tiên ticket cần SEO action

### Manager / VH Lead
- mặc định: `My team / my scope`
- ưu tiên view workload, SLA, bottleneck

### C-Level
- mặc định: `All`
- ưu tiên risk, trend, business impact

---

## 7. Sort quan trọng nhất

## 7.1. Sort áp dụng cho mọi bảng

- Created time DESC
- SLA risk DESC
- Days unresolved DESC

## 7.2. Sort cho My Action Queue

- Need action first
- Due soonest first
- Highest severity first

## 7.3. Sort cho Top Risk Channels

- Revenue at risk DESC
- Open critical tickets DESC
- Repeat issue count DESC

## 7.4. Sort cho Assignee Workload

- Open tickets DESC
- Breached tickets DESC

## 7.5. Sort cho Claim Exposure Without Whitelist

- Open claim count DESC
- Revenue at risk DESC
- Whitelist kho count ASC

---

## 8. Drill-down cần có

Mọi block trong Top 10 đều nên cho phép drill-down về ticket list.

### Ví dụ

- click `Breached SLA` → danh sách ticket breached
- click `Claim` trên trend chart → chỉ hiện ticket Claim
- click một channel trong `Top Risk Channels` → mở detail của channel đó
- click một channel trong `Claim Exposure Without Whitelist` → mở detail của channel đó
- click một whitelist status hoặc kho → filter toàn bộ dashboard theo trạng thái / kho đó

---

## 9. Nhóm block Whitelist nên ưu tiên song song

Ngoài Top 10 chung của toàn dashboard, phase đầu nên ưu tiên bổ sung một nhóm block riêng cho whitelist vì dữ liệu rõ, đo được và tạo insight thực tế.

## 9.1. Whitelist Coverage Summary

### Câu hỏi trả lời
- Hiện có bao nhiêu kênh đã whitelist?
- Bao nhiêu kênh chưa whitelist?
- Bao nhiêu kênh có claim nhưng chưa whitelist?
- Bao nhiêu request whitelist đang mở?

### Dạng visual
- KPI cards

### Giá trị
- rất phù hợp cho C-level và manager
- phản ánh mức độ coverage bảo vệ hệ thống

## 9.2. Whitelist by Kho / Network

### Câu hỏi trả lời
- Kho / network nào đang có nhiều kênh whitelist nhất?

### Dạng visual
- Horizontal bar chart

### Giá trị
- dễ đọc
- giúp hiểu inventory whitelist toàn hệ thống

## 9.3. Channel Whitelist Matrix

### Câu hỏi trả lời
- Kênh A đang được whitelist ở những kho nào?
- Kho X đang chứa những kênh nào?

### Dạng visual
- Matrix / pivot table / heatmap nhẹ

### Giá trị
- rất mạnh cho SEO và manager
- nếu làm full matrix quá lớn, nên hỗ trợ drill-down theo channel hoặc kho

## 9.4. Whitelist Request Pipeline

### Câu hỏi trả lời
- Ticket whitelist đang kẹt ở đâu?

### Dạng visual
- Funnel hoặc status bar

### Step gợi ý
- Sent
- Received
- Awaiting approval
- Assigned
- Processing
- Completed
- Failed

### Giá trị
- giúp manager kiểm soát vận hành whitelist riêng

## 9.5. My Channel Whitelist Status

### Câu hỏi trả lời
- Kênh của tôi đang whitelist ở đâu?
- Còn thiếu whitelist ở đâu?
- Có open ticket whitelist nào chưa xử lý không?

### Dạng visual
- SEO detail table

### Giá trị
- rất thực dụng cho SEO
- biến whitelist thành công cụ hành động, không chỉ báo cáo inventory

---

## 10. Nếu phải cắt còn 5 block

Nếu nguồn lực phase 1 quá ít, tôi sẽ giữ:

1. KPI Summary Cards
2. Ticket Volume Trend by Type
3. SLA Compliance + Aging
4. My Action Queue
5. Top Risk Channels

### Lý do

5 block này đã đủ để:

- nhìn toàn cảnh hệ thống
- biết cái gì đang trễ
- biết SEO cần làm gì
- biết risk đang nằm ở đâu
- biết channel nào cần ưu tiên cứu

---

## 11. Khuyến nghị triển khai

### Giai đoạn 1
Triển khai đầy đủ:

- 10 block trong tài liệu này
- bộ filter toàn cục
- sort cơ bản
- drill-down vào ticket list

Song song, nếu có thêm sức chứa trong phase đầu, ưu tiên thêm:

- Whitelist Coverage Summary
- Whitelist by Kho / Network
- My Channel Whitelist Status

### Giai đoạn 2
Nâng cấp thêm:

- root cause detail khi data tagging đủ sạch
- handling option effectiveness
- financial impact model sâu hơn
- recurring pattern analysis

---

## 12. Kết luận

Nếu chỉ được chọn 10 block đầu tiên, thì dashboard phase 1 không nên cố gắng “đủ mọi thứ”. Nó phải đủ mạnh để:

- **SEO biết phải làm gì**
- **Manager biết chỗ nào đang nghẽn**
- **C-Level biết risk đang nằm ở đâu**

Đó là lý do Top 10 trong tài liệu này được chọn theo hướng:

- ưu tiên hành động
- ưu tiên accountability
- ưu tiên risk
- ưu tiên dữ liệu đo được thật
- ưu tiên insight thực dụng cho Whitelist
- ưu tiên khả năng mở rộng về sau
