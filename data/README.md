# Ticket Dashboard — Fake Data (v2)

Dataset for the ops ticket dashboard demo. All data is **fake** but realistic for a Vietnamese YouTube MCN, generated deterministically by `generate.js`.

## v2 vs v1 — what's new

- **Net Whitelist ≠ Network** — separated. `networks.json` (Yeah1, METUB, POPS, BHMedia) is the MCN parent; `net_whitelists.json` (Helios, HG CNVH, WanaMusic, NE A, Guitar cover, Ghibli, Dream BGM…) is the WL bucket inside a network.
- **Kho Whitelist (catalog)** — `kho_whitelists.json` lists the repositories (Helios, Ghibli, Guitar cover, Dream BGM, Dự án …).
- **Master Whitelist table** — `master_whitelist.json` replicates the "Kho whitelist" admin screen (channel × kho × net_whitelist × trạng thái WL × ngày ĐK × ngày thành công × ghi chú × source).
- **Ticket Resources** — `ticket_resources.json` normalizes the multi-resource model from US-OPS-020v2: each Claim/GBQ/GCĐ ticket has 1–N resources with asset_code, name, artist, label, sub_project, ISRC, DSP link, copyright_handling, contract/footage links.
- **Claim ticket** — adds `claimer`, `video_status`, `is_urgent`, `evidence_urls[]`, `self_handle`, `counter_template_url`, `resource_kind`.
- **GBQ ticket** — adds `strike_type`, `gay_category`, `date_struck`, `cause_description`, `claimant_email`.
- **WL ticket** — adds `net_whitelist_id`, `kho_whitelist_id`, `kho_wl_note`, `ngay_dk_wl`, `ngay_wl_thanh_cong`.
- **GCĐ ticket** — adds `gcd_type`, `has_excel_attachment`, `bo_tai_lieu_link`.

## Scope

| Dimension | Value |
|---|---|
| Date range | 2026-02-22 → 2026-05-22 (3 months ending today) |
| Companies | 3 |
| Departments | 8 |
| Users (staff) | 30 (SEO, VHYT, VHDA, VHWL, VH_LEADER, TP_MKT, MANAGER) |
| Projects | 5 |
| Networks | 4 |
| Net Whitelists | 12 |
| Kho Whitelists | 15 |
| Music labels | 8 |
| Channels | 50 |
| Videos | 200 |
| Mẫu kháng (templates) | 12 |
| **Tickets** | **500** |
| Ticket resources | ~570 |
| Master Whitelist rows | 80 |
| Timeline events | ~3,360 |
| SLA events | ~150 |

## Ticket mix (realistic — Claim dominates)

| Type | % | Approx count |
|---|---|---|
| Claim (EPIC-OPS-003) | 55% | 275 |
| Whitelist (EPIC-WL-001) | 20% | 100 |
| GBQ (EPIC-GBQ-001) | 10% | 50 |
| GCĐ (EPIC-GCD-001) | 8% | 40 |
| TKT/BKT xịt (EPIC-TKT-001) | 5% | 25 |
| Die Kênh | 2% | 10 |

## Status mix (healthy ops)

| Status | % |
|---|---|
| Đã hoàn thành | 60% |
| Đang xử lý | 20% |
| Đã gửi | 10% |
| Tạm dừng | 5% |
| Lưu nháp | 3% |
| Đóng ticket | 2% |
| Thất bại / Khóa tạo lại | <1% |

(Per-type state machines respected — Whitelist has no Tạm dừng, GBQ/GCĐ have Thất bại as terminal, TKT/BKT has Khóa tạo lại, etc.)

## Files

| File | Records | Description |
|---|---|---|
| `companies.json` | 3 | Parent + sub-companies |
| `departments.json` | 8 | Departments under companies |
| `users.json` | 30 | Staff with role/department/company |
| `projects.json` | 5 | Business projects |
| `networks.json` | 4 | Network providers (Yeah1, METUB, POPS, BHMedia) |
| `net_whitelists.json` | 12 | WL buckets under each Network (Helios, HG CNVH, …) |
| `kho_whitelists.json` | 15 | Kho WL catalog (Helios, Ghibli, Guitar cover, …) |
| `labels.json` | 8 | Music labels |
| `channels.json` | 50 | YouTube channels (revenue, subscribers, owner_seo) |
| `videos.json` | 200 | Videos linked to channels (with `video_status`) |
| `templates.json` | 12 | Mẫu kháng for Claim PA2, GCĐ, GBQ Option 3 |
| `tickets.json` | 500 | All tickets, normalized FK |
| `ticket_resources.json` | ~570 | Per-ticket resources (Claim/GBQ/GCĐ) |
| `master_whitelist.json` | 80 | Kho whitelist table — channel × kho × net_whitelist rows |
| `timeline.json` | ~3,360 | State-transition events per ticket |
| `sla_events.json` | ~150 | SLA reminders, breaches, auto-pauses, escalates |

## Schema highlights

### `net_whitelists.json` (NEW)
```json
{ "id": "NWL-0001", "name": "Helios", "network_id": "NET-0001", "active": true }
```

### `kho_whitelists.json` (NEW)
```json
{ "id": "KHO-0001", "name": "Helios", "owner_label": "BH Media" }
```

### `master_whitelist.json` (NEW — replicates the screenshot)
```json
{
  "id": "MWL-0001",
  "channel_id": "CH-0012",
  "kho_whitelist_id": "KHO-0001",
  "net_whitelist_id": "NWL-0001",
  "trang_thai_wl": "Đang WL",   // | "Đã gỡ" | "Đang xử lý"
  "ngay_dk_wl": "2026-03-21T...",
  "ngay_wl_thanh_cong": "2026-03-24T...",
  "ghi_chu": "Cần gấp cho kho Helios.",
  "source_ticket_id": "T-0123",  // null if manual_import
  "source": "ticket"             // | "manual_import"
}
```

### `ticket_resources.json` (NEW)
```json
{
  "id": "RES-0001",
  "ticket_id": "T-0001",
  "ticket_type": "CLAIM",        // CLAIM | GBQ | GCD
  "resource_kind": "audio",      // audio | image | footage | thumb
  "asset_code": "A123ABC...",
  "name": "Hành trình 12",
  "artist": "Sơn Tùng MTP",
  "label": "Sony Music",
  "sub_project": "Album 2025",
  "isrc": "VNAB2400123",
  "dsp_link": "https://open.spotify.com/track/...",
  "copyright_handling": "...",
  "original_footage_link": null,    // GBQ Footage/Thumb only
  "contract_proof_link": null,      // GBQ Footage/Thumb only
  "no_contract_reason": null
}
```

### Claim ticket fields (per US-OPS-020v2)
- `claim_type` (claim_dung / claim_lao)
- `claimer` — text name of claiming party
- `video_status` (public / unlisted)
- `is_urgent` — true when video_status = public
- `evidence_urls[]` — required when claim_lao
- `self_handle` — only true when claim_dung
- `counter_template_url` / `counter_template_text` — when self_handle
- `resource_kind` (audio / image)

### GBQ ticket fields (per US-GBQ-001)
- `strike_type` (gay_dung / gay_lao)
- `gay_category` (footage / audio / thumb)
- `date_struck` — date YouTube applied the strike
- `cause_description` — SEO's bối cảnh
- `claimant_email` — email từ YouTube Studio notification

### Whitelist ticket fields (per US-WL-001/003)
- `sub_type` (whitelist / remove_whitelist)
- `net_whitelist_id` — VHDA's "Đánh dấu Net Whitelist" choice
- `kho_whitelist_id` — which Kho the WL is for
- `kho_wl_note` — SEO's free-text note
- `ngay_dk_wl`, `ngay_wl_thanh_cong`
- `review_required`, `review_result`
- `assigned_vhwl_user_id`

## Conventions

- All IDs are strings.
- Timestamps ISO 8601 with UTC offset `+07:00`.
- Money in VND (no decimals).
- Foreign keys: `*_id` references the `id` of the target entity (normalized).
- Roles: `SEO | VHYT | VHDA | VHWL | VH_LEADER | TP_MKT | MANAGER | SYSTEM`.

## Regenerating

```bash
cd ops-dashboard-demo/data
node generate.js     # produces all 16 JSON files
node validate.js     # checks FK integrity + business-rule correctness
```

Seeded RNG (`QLK-2026-05-22`) → byte-identical output across runs. Edit `CONFIG` in `generate.js` to change scale, mix, or date range.
