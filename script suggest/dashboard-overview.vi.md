# Tổng quan Dashboard

> **Project**: QLK Ticket Dashboard  
> **Audience**: C-Level, Manager, VHYT Lead, SEO  
> **Version**: 1.0  
> **Updated**: 2026-05-06

---

## 1. Mục đích

Dashboard Ticket là dashboard quản trị và điều hành cho toàn bộ hệ thống ticket vận hành của QLK. Dashboard này không chỉ để báo cáo số lượng ticket, mà phải tạo ra giá trị quản trị và hỗ trợ hành động thực tế.

Dashboard phải giúp các nhóm người dùng:

- **C-Level** nhìn thấy rủi ro tổng thể, tác động kinh doanh, xu hướng và điểm cần can thiệp
- **Manager / VH Lead** kiểm soát SLA, backlog, workload, bottleneck và hiệu suất team
- **SEO** biết chính xác ticket nào cần hành động, ticket nào đang chờ VHYT, ticket nào có nguy cơ trễ hạn và kết quả cuối của các ticket

Dashboard phải trả lời được 5 câu hỏi lõi:

1. Điều gì đang xảy ra?
2. Tại sao nó đang xảy ra?
3. Ai cần hành động?
4. Việc gì cần escalate ngay?
5. Nếu không xử lý, tác động kinh doanh là gì?

---

## 2. Phạm vi

Dashboard bao phủ toàn bộ các nhóm ticket:

- Claim
- Whitelist
- GCD
- GBQ
- TKT / BKT xịt
- Die kênh

Dashboard phải hỗ trợ ít nhất 3 nhóm vai trò:

- SEO
- VHYT / Manager / VH Leader
- C-Level

---

## 3. Nguyên tắc cốt lõi

### 3.1. Mỗi widget phải trả lời một câu hỏi

Mỗi chart, card, table phải trả lời một câu hỏi quản trị hoặc câu hỏi hành động rõ ràng. Nếu một visual không trả lời được câu hỏi thực tế, nó không nên tồn tại.

### 3.2. Dashboard phải dẫn tới hành động

Dashboard không chỉ để nhìn. Nó phải giúp người dùng biết:

- ticket nào cần xử lý ngay
- ticket nào đang chậm
- ticket nào có rủi ro cao
- xu hướng nào đang xấu đi

### 3.3. Một hệ thống nhưng ưu tiên theo vai trò khác nhau

Không phải mọi vai trò đều nên nhìn cùng một dashboard theo cùng một cách.

- SEO cần action-oriented view
- Manager cần control-oriented view
- C-Level cần risk-oriented view

### 3.4. Drill-down là bắt buộc

Mọi KPI và visual cấp cao phải cho phép drill xuống:

- danh sách ticket
- loại ticket
- project
- channel
- assignee
- trạng thái
- thời gian

---

## 4. Nhóm người dùng chính và câu hỏi họ cần trả lời

## 4.1. Câu hỏi của C-Level

C-Level muốn nhìn nhanh và ra quyết định cấp chiến lược.

Câu hỏi cần được trả lời:

- Hiện tại có bao nhiêu ticket đang mở?
- Có bao nhiêu ticket critical?
- Ticket loại nào đang tăng bất thường?
- Project, net, hoặc channel nào đang gây ra rủi ro lớn nhất?
- Bao nhiêu doanh thu đang bị đe dọa?
- Team có đang xử lý đúng SLA không?
- Loại ticket nào có success rate kém nhất?
- Có vấn đề lặp lại nào cần sửa ở cấp hệ thống không?
- Team nào hoặc nhân sự nào đang quá tải?
- So với tuần trước / tháng trước, tình hình đang tốt lên hay xấu đi?

## 4.2. Câu hỏi của Manager / VH Lead

Manager cần dashboard để kiểm soát vận hành hằng ngày.

Câu hỏi cần được trả lời:

- Hôm nay / tuần này có bao nhiêu ticket mới vào?
- Bao nhiêu ticket đã hoàn thành?
- Ticket nào sắp vi phạm SLA?
- Ticket nào đã vi phạm SLA?
- Workflow step nào gây delay nhiều nhất?
- Ticket nào đang chờ SEO?
- Ticket nào đang chờ VHYT?
- Nhân sự nào đang bị quá tải?
- Nhân sự nào xử lý chậm hoặc success rate thấp?
- Loại ticket nào đang tốn thời gian xử lý nhất?
- Có bao nhiêu ticket paused, reopened, hoặc stuck?

## 4.3. Câu hỏi của SEO

SEO không cần dashboard kiểu báo cáo chung. SEO cần biết mình phải làm gì.

Câu hỏi SEO cần trả lời được:

- Ticket nào của tôi cần action ngay bây giờ?
- Ticket nào đang chờ VHYT?
- Ticket nào đang chờ tôi?
- Ticket nào có nguy cơ trễ SLA?
- Ticket nào đã hoàn thành thành công?
- Ticket nào thất bại, và thất bại vì sao?
- Ticket nào bị trả lại để bổ sung / chỉnh sửa?
- Ticket nào mới nhất, cũ nhất, gấp nhất?
- Channel nào của tôi đang lặp lại cùng một loại vấn đề?
- Với TKT/BKT xịt: khi nào tôi có thể re-apply?
- Với Die kênh: event die nào đang active và event nào đã có ticket?
- Với Claim / GBQ / GCD: bước tiếp theo tôi cần làm là gì?
- Ticket nào đang paused và cần tôi báo VHYT mở lại?

---

## 5. Mục tiêu kinh doanh của Dashboard

Dashboard này phải tạo giá trị ở 5 nhóm mục tiêu:

1. **Giảm reaction time**
   - người dùng biết ngay ticket nào cần action
2. **Giảm SLA breach**
   - manager và SEO nhìn thấy rủi ro trước khi vi phạm
3. **Tăng success rate**
   - thấy được phương án xử lý nào hiệu quả hơn
4. **Tăng khả năng phòng ngừa**
   - lộ ra root cause, channel lặp lại, tài nguyên rủi ro, content model yếu
5. **Tăng accountability**
   - phân biệt rõ delay đang nằm ở SEO, VHYT, external hay approval

---

## 6. Cấu trúc các trang Dashboard

Đề xuất dashboard gồm 4 trang:

1. **Executive Overview**
   - cho C-Level, senior managers
   - trả lời bức tranh rủi ro tổng thể
2. **Operations Control**
   - cho manager, VH lead
   - trả lời nơi nào đang nghẽn, ai cần can thiệp
3. **SEO Action Dashboard**
   - cho SEO
   - trả lời ticket nào tôi cần làm ngay, ticket nào đang chờ ai
4. **Root Cause & Prevention**
   - cho manager, process owner, C-Level
   - trả lời vì sao ticket cứ lặp lại và cần sửa upstream gì

---

## 7. Trang 1 — Tổng quan điều hành

### Mục đích

Trả lời câu hỏi: **Bức tranh rủi ro hiện tại là gì?**

### Câu hỏi chính

- Có bao nhiêu ticket đang mở?
- Có bao nhiêu ticket critical?
- Doanh thu / risk exposure hiện tại là bao nhiêu?
- Ticket loại nào xấu nhất?
- Project hoặc channel nào cần lãnh đạo chú ý?
- Kết quả xử lý đang tốt lên hay xấu đi?

### Widget đề xuất

#### Các thẻ KPI

- Open Tickets
- Critical Open Tickets
- Tickets Breached SLA
- Estimated Revenue at Risk
- Success Rate MTD
- Median Resolution Time

#### Biểu đồ xu hướng

**Câu hỏi**: Ticket volume đang tăng hay giảm?

**Visual**: Line chart theo ngày/tuần/tháng, tách theo ticket type

#### Phân bổ rủi ro theo loại ticket

**Câu hỏi**: Loại ticket nào là nguồn rủi ro chính?

**Visual**: Stacked bar hoặc treemap theo type

#### Rủi ro theo Project hoặc Net

**Câu hỏi**: Project hoặc net nào đang gây burden vận hành lớn nhất?

**Visual**: Heatmap hoặc ranked bar chart

#### Top 10 channel rủi ro cao

**Câu hỏi**: Channel nào cần quản trị can thiệp ngay?

**Visual**: Table gồm channel, project, open ticket count, severity cao nhất, revenue at risk, days unresolved

#### Xu hướng kết quả

**Câu hỏi**: Team đang xử lý hiệu quả hơn hay kém đi?

**Visual**: Monthly success/failure trend by ticket type

---

## 8. Trang 2 — Kiểm soát vận hành

### Mục đích

Trả lời câu hỏi: **Nghẽn ở đâu, và ai cần hành động?**

### Câu hỏi chính

- Ticket nào cần attention khẩn cấp?
- Bước workflow nào chậm nhất?
- Nhân sự nào đang quá tải?
- Ticket nào đang chờ SEO, chờ VHYT, chờ external?
- Ticket nào đang paused hoặc reopened?

### Widget đề xuất

#### Tổng quan hàng đợi

- New today
- In progress
- Waiting on SEO
- Waiting on VHYT
- Paused
- Near SLA breach

#### Tỷ lệ đạt SLA

**Câu hỏi**: Team có đang đạt SLA không?

**Visual**: Gauge hoặc stacked bar: within SLA vs breached SLA

#### Phễu workflow

**Câu hỏi**: Ticket đang nghẽn ở bước nào?

**Visual**: Funnel từ Created → Sent → Received → In Progress → Waiting → Completed

#### Nhóm tuổi ticket

**Câu hỏi**: Ticket mở hiện tại đang cũ đến mức nào?

**Visual**: Buckets `0-4h`, `4-24h`, `1-3d`, `3-7d`, `7d+`

#### Phân bổ bên đang chờ

**Câu hỏi**: Delay đang đến từ bên nào?

**Visual**: Pie hoặc stacked bar: waiting on SEO, waiting on VHYT, waiting on external, waiting on approval

#### Workload theo nhân sự

**Câu hỏi**: Ai đang quá tải?

**Visual**: Horizontal bar by assignee: open tickets, critical tickets, breached tickets

#### Hiệu suất nhân sự

**Câu hỏi**: Ai nhanh, ai hiệu quả?

**Visual**: Scatter plot với:
- x = avg resolution time
- y = success rate
- bubble size = ticket volume

#### Bảng ticket cần can thiệp

**Câu hỏi**: Ticket nào cần manager can thiệp ngay?

**Visual**: Table gồm ticket ID, type, owner, waiting side, breach risk, days open

---

## 9. Trang 3 — Dashboard hành động cho SEO

### Mục đích

Trả lời câu hỏi: **Tôi cần làm gì bây giờ?**

### Câu hỏi chính

- Ticket nào cần tôi action ngay?
- Ticket nào đang chờ VHYT?
- Ticket nào bị trả lại để bổ sung?
- Ticket nào có nguy cơ trễ SLA?
- Ticket nào thành công hoặc thất bại?
- Ticket của tôi đang lặp lại vấn đề gì?

### Widget đề xuất

#### Tổng quan ticket của tôi

- My Open Tickets
- Need My Action
- Waiting on VHYT
- Near SLA Breach
- Completed This Week
- Failed This Week

#### Hàng đợi cần tôi xử lý

**Câu hỏi**: Ticket nào tôi cần xử lý ngay?

**Visual**: Priority table gồm ticket ID, type, channel, current step, due time, next action, urgency color

#### Ticket đang chờ VHYT

**Câu hỏi**: Ticket nào không bị block bởi tôi?

**Visual**: Table gồm ticket ID, waiting stage, VHYT assignee, time waiting

#### Ticket bị trả lại / cần sửa

**Câu hỏi**: Ticket nào đang bị trả về để tôi chỉnh sửa?

**Visual**: Table gồm ticket ID, correction round `1/2` hoặc `2/2`, reason, deadline

#### Kết quả gần đây của tôi

**Câu hỏi**: Ticket nào vừa xong và kết quả là gì?

**Visual**: List hoặc table gồm successful, failed, paused, reopened

#### Xu hướng ticket của tôi

**Câu hỏi**: Khối lượng ticket của tôi đang tăng hay giảm?

**Visual**: Line chart theo tuần: created, completed, failed

#### Channel lặp lại vấn đề

**Câu hỏi**: Channel nào của tôi cứ lặp đi lặp lại cùng một dạng issue?

**Visual**: Table theo channel: open tickets, repeated ticket types, recent outcomes

### Widget đặc thù cho SEO theo loại ticket

**TKT / BKT xịt**
- Channel nào đủ điều kiện re-apply?
- Channel nào đang bị khóa do cooldown?
- Channel nào đã re-apply nhưng vẫn thất bại?

**Die kênh**
- Event die nào đang active?
- Event die nào đã có ticket?
- Case nào cần thêm evidence?

**Claim**
- Ticket nào cần tôi xác nhận claim đã gỡ?
- Ticket nào cần tôi cut/delete hoặc whitelist?

**GBQ / GCD**
- Ticket nào cần tôi submit appeal?
- Ticket nào cần tôi xác nhận kết quả cuối?

---

## 10. Trang 4 — Nguyên nhân gốc và phòng ngừa

### Mục đích

Trả lời câu hỏi: **Vì sao vấn đề cứ lặp lại, và cần sửa upstream gì?**

### Câu hỏi chính

- Root cause nào tạo ra nhiều ticket nhất?
- Channel nào là recurring channel?
- Asset, artist, label, platform nào xuất hiện nhiều trong case fail hoặc case lặp lại?
- Phương án xử lý nào đang hiệu quả nhất?
- Content model nào đang rủi ro?

### Widget đề xuất

#### Pareto nguyên nhân gốc

**Câu hỏi**: Điều gì gây ra phần lớn vấn đề?

**Visual**: Pareto chart theo root cause

#### Channel lặp lại

**Câu hỏi**: Channel nào cứ lặp lại ticket?

**Visual**: Ranked table by recurrence

#### Tài nguyên / label / nền tảng rủi ro

**Câu hỏi**: Nguồn nào lặp lại nhiều nhất trong các case fail hoặc repeat?

**Visual**: Table hoặc heatmap theo artist, label, platform, asset

#### Hiệu quả theo phương án xử lý

**Câu hỏi**: Hướng xử lý nào hiệu quả nhất?

**Visual**: Success rate by option

#### Phân rã lý do thất bại

**Câu hỏi**: Ticket thất bại chủ yếu vì lý do gì?

**Visual**: Bar chart theo failure reason

#### Cơ hội phòng ngừa

**Câu hỏi**: Cần sửa gì upstream để giảm ticket?

**Visual**: Summary cards hoặc table:
- channel chưa whitelist nhưng lặp claim
- mẫu reject monetization lặp lại
- pattern die kênh lặp lại
- nhóm content rủi ro cao

---

## 11. Câu hỏi trọng yếu theo từng loại ticket

## 11.1. Claim

- Bên claim nào tạo ra nhiều claim mở nhất?
- Label hoặc asset nào lặp lại nhiều nhất?
- Phương án xử lý nào gỡ claim nhanh nhất?
- Channel nào mất doanh thu nhiều nhất vì claim chưa xử lý?

## 11.2. Whitelist

- Channel nào vẫn cần whitelist?
- Request whitelist nào đang chờ quá lâu?
- Net hoặc whitelist operator nào chậm nhất?
- Channel nào vẫn đang phơi ra rủi ro false claim?

## 11.3. GCD

- Channel nào đang gần ngưỡng nguy hiểm về strike?
- Tỷ lệ thành công của GCD là bao nhiêu?
- GCD thường đến từ nhạc, hình ảnh, livestream hay lý do khác?
- Team phản ứng nhanh đến đâu sau khi ticket được tạo?

## 11.4. GBQ

- Copyright strike nào đang nguy hiểm nhất?
- Phương án nào hiệu quả nhất?
- Channel nào đang có nhiều strike exposure?
- Case nào đang gần terminal failure?

## 11.5. TKT / BKT xịt

- Channel nào đang stuck ở monetization?
- Channel nào đủ điều kiện re-apply?
- Channel nào bị khóa bởi cooldown?
- Lý do reject chính là gì?
- Hướng hỗ trợ nào đang có recovery rate tốt nhất?

## 11.6. Die kênh

- Có bao nhiêu termination event đang mở?
- Case die nào còn khả năng cứu?
- Case die nào có legal / compliance risk cao?
- Root cause chính của die kênh là gì?
- Case nào cần executive intervention?

---

## 12. Bộ lọc toàn cục

Các trang dashboard nên hỗ trợ các filter sau:

- Time range
- Ticket type
- Status
- Project
- Net
- Department
- SEO owner
- VHYT assignee
- Priority / severity
- Waiting responsibility
- Outcome
- Channel
- Root cause

Default theo vai trò:

- **SEO**: `My tickets`
- **Manager**: `My team / my scope`
- **C-Level**: `All`

---

## 13. Quy tắc drill-down

Mọi chart nên drill về ticket list có filter tương ứng.

Ví dụ:

- click card `Breached SLA` → show danh sách ticket breached
- click khu vực `GBQ` → filter chỉ GBQ
- click channel trong leaderboard → mở channel risk detail
- click root cause → show toàn bộ ticket có root cause đó

---

## 14. Gợi ý công thức KPI

### KPI vận hành

- `Open Tickets` = ticket chưa ở final completed state
- `Need My Action` = ticket có current step owner = current user
- `Breached SLA` = ticket có deadline < hiện tại và chưa hoàn tất action
- `Median Resolution Time` = median từ sent đến final outcome
- `Pause Rate` = paused tickets / total tickets
- `Reopen Rate` = reopened tickets / total tickets

### KPI chất lượng

- `Success Rate` = successful outcomes / completed tickets
- `Failure Rate` = failed outcomes / completed tickets
- `Repeat Channel Rate` = số channel có >1 ticket trong kỳ / tổng số channel

### KPI riêng cho SEO

- `My Open Tickets`
- `My Need Action Tickets`
- `My Returned Tickets`
- `My Completed Successful`
- `My Completed Failed`

### KPI kinh doanh

- `Estimated Revenue at Risk`
- `Top Risk Channels`
- `Risk by Project`
- `Avoided Loss from Successful Resolution`

---

## 15. Định hướng thiết kế giao diện

Dashboard nên mang cảm giác của một **command center**, không phải chỉ là một BI report thông thường.

Nguyên tắc thiết kế:

- phân cấp rõ ràng giữa `action now`, `trend`, `insight`
- màu đỏ / vàng / xanh chỉ dùng khi ý nghĩa trạng thái rõ ràng
- table phải ưu tiên dễ đọc hơn là trang trí
- executive page phải tóm tắt trước
- SEO page phải ưu tiên task trước
- tách rõ `volume` với `impact`
- tách rõ `speed` với `success`
- tách rõ `ticket finished` với `problem solved`

### Gợi ý bố cục theo hàng

**Executive Overview**
- Row 1: KPI cards
- Row 2: ticket trend + revenue risk
- Row 3: risk by project / type
- Row 4: high-risk channels + escalations

**Operations Control**
- Row 1: queue cards
- Row 2: SLA compliance + aging
- Row 3: workflow funnel + waiting responsibility
- Row 4: assignee workload + escalation board

**SEO Action Dashboard**
- Row 1: my summary cards
- Row 2: need my action + waiting on VHYT
- Row 3: returned tickets + near SLA breach
- Row 4: recent outcomes + repeat problem channels

**Root Cause & Prevention**
- Row 1: root cause cards
- Row 2: Pareto + failure reasons
- Row 3: repeat channels + risky assets
- Row 4: option effectiveness + prevention opportunities

---

## 16. Vì sao dashboard này tạo ra giá trị

Dashboard này chỉ thực sự có giá trị nếu nó giúp 3 nhóm người dùng làm việc tốt hơn:

**Với SEO**
- action nhanh hơn
- ít bỏ sót hơn
- rõ next step hơn

**Với Manager**
- can thiệp sớm hơn
- chia workload đều hơn
- nhìn thấy bottleneck và nhân sự yếu rõ hơn

**Với C-Level**
- hiểu operational risk bằng ngôn ngữ business
- nhìn ra vấn đề mang tính hệ thống
- ưu tiên đầu tư phòng ngừa chính xác hơn

---

## 17. Gợi ý thứ tự triển khai

Nếu build theo phase:

**Phase 1**
- Executive Overview
- Operations Control
- SEO Action Dashboard

3 page này đã giải quyết ngay:
- visibility
- action clarity
- SLA control

**Phase 2**
- Root Cause & Prevention

Trang này rất giá trị nhưng phụ thuộc vào chất lượng data tagging tốt hơn.

---

## 18. Tài liệu nên làm tiếp theo

Sau tài liệu overview này, tài liệu đúng tiếp theo nên là:

**Dashboard Widget Specification**

Mỗi widget cần có:

- tên widget
- câu hỏi business mà widget trả lời
- chart type
- data source
- công thức tính
- filter behavior
- click / drill-down behavior
- role visibility

