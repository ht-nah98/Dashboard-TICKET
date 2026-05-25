#!/usr/bin/env node
// Validate referential integrity + business-rule correctness of the generated data (v2).
const fs = require('fs');
const path = require('path');

const load = (n) => JSON.parse(fs.readFileSync(path.join(__dirname, n), 'utf8'));
const companies = load('companies.json');
const departments = load('departments.json');
const users = load('users.json');
const projects = load('projects.json');
const networks = load('networks.json');
const netWhitelists = load('net_whitelists.json');
const khoWhitelists = load('kho_whitelists.json');
const labels = load('labels.json');
const channels = load('channels.json');
const videos = load('videos.json');
const templates = load('templates.json');
const tickets = load('tickets.json');
const ticketResources = load('ticket_resources.json');
const masterWhitelist = load('master_whitelist.json');
const timeline = load('timeline.json');
const slaEvents = load('sla_events.json');

const idSet = (arr) => new Set(arr.map(x => x.id));
const ID = {
  company: idSet(companies),
  department: idSet(departments),
  user: idSet(users),
  project: idSet(projects),
  network: idSet(networks),
  netWhitelist: idSet(netWhitelists),
  khoWhitelist: idSet(khoWhitelists),
  label: idSet(labels),
  channel: idSet(channels),
  video: idSet(videos),
  template: idSet(templates),
  ticket: idSet(tickets),
};

const errors = [], warnings = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

// ─── Reference entities ────────────────────────────────────────────────────
for (const d of departments) check(ID.company.has(d.company_id), `dept ${d.id} → unknown company`);
for (const u of users) {
  check(ID.company.has(u.company_id), `user ${u.id} → unknown company`);
  check(ID.department.has(u.department_id), `user ${u.id} → unknown dept`);
  check(['SEO','VHYT','VHDA','VHWL','VH_LEADER','TP_MKT','MANAGER','SYSTEM'].includes(u.role), `user ${u.id} → invalid role`);
}
for (const p of projects) check(ID.user.has(p.manager_user_id), `project ${p.id} → unknown manager`);
for (const nw of netWhitelists) check(ID.network.has(nw.network_id), `net_whitelist ${nw.id} → unknown network`);
for (const c of channels) {
  check(ID.project.has(c.project_id), `channel ${c.id} → unknown project`);
  check(ID.network.has(c.network_id), `channel ${c.id} → unknown network`);
  check(ID.user.has(c.owner_seo_user_id), `channel ${c.id} → unknown owner SEO`);
  check(c.monthly_revenue_vnd >= 0, `channel ${c.id} → negative revenue`);
}
for (const v of videos) check(ID.channel.has(v.channel_id), `video ${v.id} → unknown channel`);
for (const t of templates) {
  check(ID.user.has(t.created_by_user_id), `template ${t.id} → unknown creator`);
  check(['CLAIM_PA2','GCD','GBQ_OPT3'].includes(t.ticket_type), `template ${t.id} → invalid ticket_type`);
}

// ─── Tickets ───────────────────────────────────────────────────────────────
const validTypes = new Set(['CLAIM','WHITELIST','GBQ','GCD','TKT_BKT','DIE']);
const validStates = new Set(['draft','sent','processing','completed','paused','closed','failed','locked']);
const byType = {}, byStatus = {};
let pa4Count = 0, pa4Linked = 0, claimAutoClose = 0, wlPausedBug = 0;
let wlMissingKho = 0, wlMissingNet = 0;
let gbqMissingRequired = 0;
let claimMissingEvidence = 0;

for (const t of tickets) {
  check(validTypes.has(t.type), `ticket ${t.id} → invalid type ${t.type}`);
  check(validStates.has(t.current_state), `ticket ${t.id} → invalid state ${t.current_state}`);
  check(ID.channel.has(t.channel_id), `ticket ${t.id} → unknown channel`);
  check(ID.project.has(t.project_id), `ticket ${t.id} → unknown project`);
  check(ID.user.has(t.created_by_user_id), `ticket ${t.id} → unknown creator`);
  if (t.video_id) check(ID.video.has(t.video_id), `ticket ${t.id} → unknown video`);
  if (t.template_id) check(ID.template.has(t.template_id), `ticket ${t.id} → unknown template`);
  if (t.label_id) check(ID.label.has(t.label_id), `ticket ${t.id} → unknown label`);
  if (t.linked_wl_ticket_id) check(ID.ticket.has(t.linked_wl_ticket_id), `ticket ${t.id} → unknown linked WL`);
  if (t.linked_claim_ticket_id) check(ID.ticket.has(t.linked_claim_ticket_id), `ticket ${t.id} → unknown linked Claim`);
  if (t.assigned_vhwl_user_id) check(ID.user.has(t.assigned_vhwl_user_id), `ticket ${t.id} → unknown VHWL`);
  if (t.net_whitelist_id) check(ID.netWhitelist.has(t.net_whitelist_id), `ticket ${t.id} → unknown net_whitelist`);
  if (t.kho_whitelist_id) check(ID.khoWhitelist.has(t.kho_whitelist_id), `ticket ${t.id} → unknown kho_whitelist`);

  // ─── Per-type business rules
  if (t.type === 'WHITELIST') {
    if (t.current_state === 'paused') wlPausedBug++;
    check(t.current_state !== 'paused', `WL ticket ${t.id} → cannot be paused (WL has no Tạm dừng)`);
    // Non-draft WL tickets must have net_whitelist_id and kho_whitelist_id
    if (t.current_state !== 'draft') {
      if (!t.net_whitelist_id) wlMissingNet++;
      if (!t.kho_whitelist_id) wlMissingKho++;
      check(t.net_whitelist_id, `WL ticket ${t.id} (${t.current_state}) → missing net_whitelist_id`);
      check(t.kho_whitelist_id, `WL ticket ${t.id} (${t.current_state}) → missing kho_whitelist_id`);
    }
    // Completed whitelist should have ngay_wl_thanh_cong
    if (t.current_state === 'completed' && t.sub_type === 'whitelist') {
      check(t.ngay_wl_thanh_cong, `WL ticket ${t.id} → completed but missing ngay_wl_thanh_cong`);
    }
  }
  if (t.type === 'CLAIM') {
    if (t.current_state === 'closed') claimAutoClose++;
    if (t.resolution_plan === 'PA4') { pa4Count++; if (t.linked_wl_ticket_id) pa4Linked++; }
    // Claim láo MUST have evidence_urls non-empty (per US-OPS-020v2 AC3)
    if (t.current_state !== 'draft' && t.claim_type === 'claim_lao') {
      if (!t.evidence_urls || t.evidence_urls.length === 0) claimMissingEvidence++;
      check(t.evidence_urls && t.evidence_urls.length > 0, `Claim láo ${t.id} → missing evidence_urls`);
    }
    // Claim láo + self_handle should never be true (per US-OPS-020v2 AC9)
    if (t.claim_type === 'claim_lao' && t.self_handle) {
      errors.push(`Claim ${t.id} → claim_lao with self_handle=true (forbidden by AC9)`);
    }
    // Required claimer + video_status
    if (t.current_state !== 'draft') {
      check(t.claimer, `Claim ${t.id} → missing claimer`);
      check(t.video_status, `Claim ${t.id} → missing video_status`);
    }
  }
  if (t.type === 'GBQ' && t.current_state !== 'draft') {
    // GBQ required fields per US-GBQ-001 AC2
    if (!t.date_struck || !t.cause_description || !t.claimant_email) gbqMissingRequired++;
    check(t.date_struck, `GBQ ${t.id} → missing date_struck`);
    check(t.cause_description, `GBQ ${t.id} → missing cause_description`);
    check(t.claimant_email, `GBQ ${t.id} → missing claimant_email`);
  }

  byType[t.type] = (byType[t.type] || 0) + 1;
  byStatus[t.current_state] = (byStatus[t.current_state] || 0) + 1;
}

// ─── Ticket Resources ──────────────────────────────────────────────────────
let resourceClaimLaoCount = 0;
const resByTicket = {};
for (const r of ticketResources) {
  check(ID.ticket.has(r.ticket_id), `resource ${r.id} → unknown ticket`);
  check(['CLAIM','GBQ','GCD'].includes(r.ticket_type), `resource ${r.id} → invalid ticket_type ${r.ticket_type}`);
  check(['audio','image','footage','thumb'].includes(r.resource_kind), `resource ${r.id} → invalid resource_kind`);
  resByTicket[r.ticket_id] = (resByTicket[r.ticket_id] || 0) + 1;
}
// Claim láo MUST have exactly 1 resource (per US-OPS-020v2 AC8)
for (const t of tickets.filter(t => t.type === 'CLAIM' && t.claim_type === 'claim_lao' && t.current_state !== 'draft')) {
  const count = resByTicket[t.id] || 0;
  if (count !== 1) {
    errors.push(`Claim láo ${t.id} → has ${count} resources (must be exactly 1)`);
    resourceClaimLaoCount++;
  }
}
// GBQ Footage/Thumb resource: if no contract_proof_link, must have no_contract_reason
for (const r of ticketResources.filter(r => r.ticket_type === 'GBQ' && ['footage','thumb'].includes(r.resource_kind))) {
  if (!r.contract_proof_link && !r.no_contract_reason) {
    errors.push(`GBQ resource ${r.id} → no contract_proof_link AND no no_contract_reason`);
  }
}

// ─── Master Whitelist ──────────────────────────────────────────────────────
const validMwlStatus = new Set(['Đang WL', 'Đã gỡ', 'Đang xử lý']);
const seenMwl = new Set();
let mwlDup = 0;
for (const m of masterWhitelist) {
  check(ID.channel.has(m.channel_id), `master_whitelist ${m.id} → unknown channel`);
  if (m.kho_whitelist_id) check(ID.khoWhitelist.has(m.kho_whitelist_id), `master_whitelist ${m.id} → unknown kho`);
  if (m.net_whitelist_id) check(ID.netWhitelist.has(m.net_whitelist_id), `master_whitelist ${m.id} → unknown net_whitelist`);
  if (m.source_ticket_id) check(ID.ticket.has(m.source_ticket_id), `master_whitelist ${m.id} → unknown source ticket`);
  check(validMwlStatus.has(m.trang_thai_wl), `master_whitelist ${m.id} → invalid trạng thái '${m.trang_thai_wl}'`);
  check(['ticket','manual_import'].includes(m.source), `master_whitelist ${m.id} → invalid source`);
  const key = `${m.channel_id}|${m.net_whitelist_id}|${m.kho_whitelist_id}|${m.trang_thai_wl}`;
  if (seenMwl.has(key)) mwlDup++;
  seenMwl.add(key);
}

// ─── Timeline ──────────────────────────────────────────────────────────────
const tlCount = {};
for (const e of timeline) {
  check(ID.ticket.has(e.ticket_id), `timeline ${e.id} → unknown ticket`);
  if (e.actor_user_id) check(ID.user.has(e.actor_user_id), `timeline ${e.id} → unknown actor`);
  check(['SEO','VHYT','VHDA','VHWL','VH_LEADER','TP_MKT','MANAGER','SYSTEM'].includes(e.actor_role), `timeline ${e.id} → invalid role`);
  tlCount[e.ticket_id] = (tlCount[e.ticket_id] || 0) + 1;
}
let ticketsNoTimeline = 0;
for (const t of tickets) {
  if (t.current_state !== 'draft' && !(tlCount[t.id] || 0)) ticketsNoTimeline++;
}

// ─── SLA events
for (const s of slaEvents) check(ID.ticket.has(s.ticket_id), `sla ${s.id} → unknown ticket`);

// ─── Print
console.log('\n🔍 Validation Report v2');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`Entities loaded:`);
console.log(`  ${networks.length} networks, ${netWhitelists.length} net_whitelists, ${khoWhitelists.length} kho_whitelists, ${labels.length} labels`);
console.log(`  ${channels.length} channels, ${videos.length} videos, ${users.length} users (${[...new Set(users.map(u=>u.role))].length} roles)`);
console.log(`  ${tickets.length} tickets, ${ticketResources.length} ticket_resources, ${masterWhitelist.length} master_whitelist rows`);
console.log(`  ${timeline.length} timeline events, ${slaEvents.length} sla events\n`);
console.log(`Tickets by type:   ${JSON.stringify(byType)}`);
console.log(`Tickets by state:  ${JSON.stringify(byStatus)}\n`);
console.log(`Business rule checks:`);
console.log(`  PA4 Claim tickets:        ${pa4Count} (linked to WL: ${pa4Linked})`);
console.log(`  Claim auto-closed:        ${claimAutoClose}`);
console.log(`  WL incorrectly paused:    ${wlPausedBug} (must be 0)`);
console.log(`  WL missing net_whitelist: ${wlMissingNet} (must be 0)`);
console.log(`  WL missing kho_whitelist: ${wlMissingKho} (must be 0)`);
console.log(`  Claim láo missing evidence: ${claimMissingEvidence} (must be 0)`);
console.log(`  GBQ missing required:     ${gbqMissingRequired} (must be 0)`);
console.log(`  Claim láo wrong res count: ${resourceClaimLaoCount} (must be 0)`);
console.log(`  Master WL duplicates:     ${mwlDup} (must be 0)`);
console.log(`  Tickets w/o timeline:     ${ticketsNoTimeline} (must be 0)\n`);

if (errors.length === 0) {
  console.log(`✅ PASS — 0 errors, ${warnings.length} warnings\n`);
  process.exit(0);
} else {
  console.log(`❌ FAIL — ${errors.length} errors, ${warnings.length} warnings\n`);
  console.log('First 20 errors:');
  errors.slice(0, 20).forEach(e => console.log(`  ✗ ${e}`));
  process.exit(1);
}
