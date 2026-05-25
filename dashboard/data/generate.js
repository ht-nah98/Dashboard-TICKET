#!/usr/bin/env node
// QLK Ticket Dashboard — Fake Data Generator (v2)
// Deterministic (seeded). Run: node generate.js
//
// v2 changes vs v1:
//   + net_whitelists.json (Helios, HG CNVH, WanaMusic, NE A, Guitar cover, Ghibli, Dream BGM…)
//   + kho_whitelists.json (master catalog of Kho WL)
//   + master_whitelist.json (the "Kho whitelist" table — channel × kho × net_whitelist)
//   + ticket_resources.json (Claim/GBQ/GCĐ multi-resource details)
//   + Claim ticket fields: video_status, is_urgent, evidence_urls[], self_handle, counter_template, claimer
//   + GBQ ticket fields: date_struck, cause_description, claimant_email, contract_link, footage_link, no_contract_reason
//   + WL ticket fields: kho_wl_note, net_whitelist_id, ngay_dk_wl, ngay_wl_thanh_cong
//   + GCĐ ticket fields: bo_tai_lieu_link, has_excel_attachment

const fs = require('fs');
const path = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const CONFIG = {
  seed: 'QLK-2026-05-22',
  dateStart: '2026-02-22T00:00:00+07:00',
  dateEnd: '2026-05-22T23:59:59+07:00',
  counts: {
    companies: 3,
    departments: 8,
    users: 30,
    projects: 5,
    networks: 4,
    netWhitelists: 12,
    khoWhitelists: 15,
    labels: 8,
    channels: 50,
    videos: 200,
    templates: 12,
    tickets: 500,
    masterWhitelistRowsApprox: 80,
  },
  ticketMix: { claim: 0.55, whitelist: 0.20, gbq: 0.10, gcd: 0.08, tkt_bkt: 0.05, die_kenh: 0.02 },
  statusMix: { completed: 0.60, processing: 0.20, sent: 0.10, paused: 0.05, draft: 0.03, closed: 0.02 },
};

// ─── SEEDED RNG (mulberry32) ───────────────────────────────────────────────
function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(hashSeed(CONFIG.seed));
const rand = () => rng();
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const weightedPick = (obj) => { const r = rand(); let acc = 0; for (const [k, v] of Object.entries(obj)) { acc += v; if (r < acc) return k; } return Object.keys(obj).pop(); };

// ─── TIME HELPERS ──────────────────────────────────────────────────────────
const startMs = new Date(CONFIG.dateStart).getTime();
const endMs = new Date(CONFIG.dateEnd).getTime();
const randTimeBetween = (min, max) => new Date(min + rand() * (max - min)).toISOString();
const randTimeInRange = () => randTimeBetween(startMs, endMs);
const addHours = (iso, h) => new Date(new Date(iso).getTime() + h * 3600 * 1000).toISOString();
const addDays = (iso, d) => addHours(iso, d * 24);
const yymmdd = (iso) => { const d = new Date(iso); return `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`; };

// ─── VIETNAMESE NAME POOLS ─────────────────────────────────────────────────
const VN_FAMILY = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Phan','Mai','Trịnh'];
const VN_MIDDLE = ['Văn','Thị','Hữu','Đức','Quang','Minh','Hoài','Thanh','Bảo','Tuấn','Anh','Ngọc','Hồng','Kim','Hải'];
const VN_GIVEN  = ['An','Bình','Châu','Dung','Đạt','Giang','Hà','Hiếu','Hoa','Hùng','Khánh','Lan','Linh','Long','Mai','Nam','Nga','Ngân','Phong','Phúc','Quân','Sơn','Thảo','Thắng','Thu','Trang','Trung','Tuấn','Vy','Yến'];
const PROJECT_NAMES = ['Âm Nhạc Việt','Giải Trí 24h','Vlog Cuộc Sống','Phim Hoạt Hình','Học Tập Online'];
const NETWORK_NAMES = ['Yeah1 Network','METUB Network','POPS Worldwide','BHMedia'];
// Net Whitelist names taken from the master whitelist screenshot + business docs
const NET_WHITELIST_NAMES = ['Helios','HG CNVH','WanaMusic','NE A','Guitar cover','Ghibli','Dream BGM','Phoenix Net','MF Net','BPM Net','Acoustic Studio','Lo-Fi Vibes'];
const KHO_WL_NAMES = ['Helios','Ghibli','Guitar cover','Dream BGM','Dự án test s3','Dự án 2-2','Dự án 3-1','Dự án 4-1','Acoustic Lo-Fi','Vietnam Pop','Karaoke Cover','Indie Folk','Studio Sessions','MV Production','Live Concert'];
const LABEL_NAMES = ['Sony Music','Universal Music','Warner Music','Lý Hải Production','BH Media','Yeah1 Music','POPS Music','Hoa Vàng Studio'];
const CHANNEL_THEMES = ['Music','Comedy','Vlog','Kids','News','Lifestyle','Tech','Cook','Gaming','Edu'];
const COMPANY_NAMES = ['HG Media Group','HG Digital','HG Entertainment'];
const DEPT_NAMES = ['SEO Operations','Vận hành YouTube','Vận hành Dự án','Whitelist Operations','Marketing','Quản lý','TP Kiểm duyệt','Hỗ trợ Kỹ thuật'];

function genVnName() { return `${pick(VN_FAMILY)} ${pick(VN_MIDDLE)} ${pick(VN_GIVEN)}`; }
function slugifyName(name) {
  return name.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,'a').replace(/[èéẹẻẽêềếệểễ]/g,'e').replace(/[ìíịỉĩ]/g,'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,'o').replace(/[ùúụủũưừứựửữ]/g,'u').replace(/[ỳýỵỷỹ]/g,'y').replace(/[đ]/g,'d')
    .replace(/[^a-z0-9]/g,'.').replace(/\.+/g,'.').replace(/^\.|\.$/g,'');
}

// ─── ID SEQUENCES ──────────────────────────────────────────────────────────
let seqs = {};
const seq = (prefix) => { seqs[prefix] = (seqs[prefix] || 0) + 1; return `${prefix}-${String(seqs[prefix]).padStart(4, '0')}`; };

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

const companies = COMPANY_NAMES.slice(0, CONFIG.counts.companies).map((name, i) => ({
  id: seq('CMP'), name, parent_company_id: i === 0 ? null : 'CMP-0001',
  created_at: CONFIG.dateStart,
}));

const departments = DEPT_NAMES.slice(0, CONFIG.counts.departments).map((name) => ({
  id: seq('DEP'), name, company_id: pick(companies).id,
}));

const projects = PROJECT_NAMES.slice(0, CONFIG.counts.projects).map((name) => ({
  id: seq('PRJ'), name, company_id: companies[0].id, manager_user_id: null,
  status: 'active',
}));

const networks = NETWORK_NAMES.slice(0, CONFIG.counts.networks).map((name) => ({
  id: seq('NET'), name, type: 'mcn',
  contact_email: `${slugifyName(name)}@network.vn`,
}));

// Net Whitelists belong to a Network. Each Network has 2–4 Net Whitelist buckets.
const netWhitelists = [];
for (let i = 0; i < CONFIG.counts.netWhitelists; i++) {
  const name = NET_WHITELIST_NAMES[i] || `Net WL ${i + 1}`;
  netWhitelists.push({
    id: seq('NWL'),
    name,
    network_id: networks[i % networks.length].id,
    description: `Bucket whitelist ${name}`,
    active: true,
    created_at: CONFIG.dateStart,
  });
}

// Kho Whitelist = catalog of repositories the company maintains
const khoWhitelists = KHO_WL_NAMES.slice(0, CONFIG.counts.khoWhitelists).map((name) => ({
  id: seq('KHO'),
  name,
  description: `Kho whitelist: ${name}`,
  owner_label: pick(LABEL_NAMES),
  created_at: CONFIG.dateStart,
}));

const labels = LABEL_NAMES.slice(0, CONFIG.counts.labels).map((name) => ({
  id: seq('LBL'), name, contact_email: `legal@${slugifyName(name).replace(/\./g,'')}.com`,
}));

// ─── USERS ─────────────────────────────────────────────────────────────────
const ROLE_PLAN = [
  { role: 'MANAGER', count: 2 },
  { role: 'VH_LEADER', count: 2 },
  { role: 'VHYT', count: 6 },
  { role: 'VHDA', count: 3 },
  { role: 'VHWL', count: 3 },
  { role: 'TP_MKT', count: 2 },
  { role: 'SEO', count: 12 },
];
const users = [];
for (const { role, count } of ROLE_PLAN) {
  for (let i = 0; i < count; i++) {
    const name = genVnName();
    const dept = role === 'SEO' ? departments[0]
      : role === 'VHYT' ? departments[1]
      : role === 'VHDA' ? departments[2]
      : role === 'VHWL' ? departments[3]
      : role === 'TP_MKT' ? departments[4]
      : role === 'MANAGER' ? departments[5]
      : role === 'VH_LEADER' ? departments[6]
      : departments[7];
    users.push({
      id: seq('USR'), name, role,
      email: `${slugifyName(name)}@hgmedia.app`,
      company_id: dept.company_id,
      department_id: dept.id,
      avatar_url: `https://i.pravatar.cc/64?u=${slugifyName(name)}`,
      created_at: CONFIG.dateStart,
      active: true,
    });
  }
}
const usersByRole = (r) => users.filter(u => u.role === r);
for (const p of projects) p.manager_user_id = pick(usersByRole('MANAGER')).id;

// ─── CHANNELS ──────────────────────────────────────────────────────────────
function genYtChannelId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = 'UC'; for (let i = 0; i < 22; i++) s += chars[Math.floor(rand() * chars.length)]; return s;
}
const channels = [];
for (let i = 0; i < CONFIG.counts.channels; i++) {
  const theme = pick(CHANNEL_THEMES);
  const idx = i + 1;
  const channelName = `${theme} ${pick(['Việt','24h','Plus','Official','Network','Studio','Hub','Pro'])} ${idx}`;
  const yt = genYtChannelId();
  const subs = randInt(10000, 5000000);
  const monthlyRevenue = Math.floor((5_000_000 + rand() * 495_000_000) / 1000) * 1000;
  channels.push({
    id: seq('CH'),
    youtube_channel_id: yt,
    name: channelName,
    url: `https://youtube.com/channel/${yt}`,
    avatar_url: `https://i.pravatar.cc/96?u=${yt}`,
    project_id: pick(projects).id,
    network_id: pick(networks).id,
    company_id: companies[0].id,
    department_id: departments[0].id,
    owner_seo_user_id: pick(usersByRole('SEO')).id,
    subscribers: subs,
    video_count: randInt(50, 800),
    monthly_revenue_vnd: monthlyRevenue,
    whitelist_status: weightedPick({'Thuộc net': 0.7, 'Tự do': 0.25, 'Dừng phát triển': 0.05}),
    status: weightedPick({active: 0.92, paused: 0.05, terminated: 0.03}),
    created_at: randTimeBetween(startMs - 365*86400*1000, startMs),
  });
}

// ─── VIDEOS ────────────────────────────────────────────────────────────────
const videos = [];
for (let i = 0; i < CONFIG.counts.videos; i++) {
  const ch = pick(channels);
  const vid = Math.random().toString(36).substring(2, 13);
  const publishedAt = randTimeBetween(startMs - 180*86400*1000, endMs);
  videos.push({
    id: seq('VID'),
    youtube_video_id: vid,
    title: `${pick(['Live','MV','Vlog','Review','Highlight','Tập'])} ${randInt(1, 999)} — ${pick(['Sự kiện','Hành trình','Câu chuyện','Khoảnh khắc','Khám phá'])}`,
    channel_id: ch.id,
    url: `https://youtube.com/watch?v=${vid}`,
    published_at: publishedAt,
    duration_seconds: randInt(60, 3600),
    view_count: randInt(1000, 5_000_000),
    estimated_revenue_vnd: Math.floor((50_000 + rand() * 50_000_000) / 1000) * 1000,
    video_status: weightedPick({ public: 0.85, unlisted: 0.15 }),
  });
}

// ─── TEMPLATES ─────────────────────────────────────────────────────────────
const templates = [];
const TEMPLATE_SPECS = [
  { for: 'CLAIM_PA2', titles: ['Mẫu kháng chuẩn — Có bản quyền','Mẫu kháng — Sử dụng hợp lệ','Mẫu kháng — Cover','Mẫu kháng — Footage license'] },
  { for: 'GCD',       titles: ['Mẫu kháng GCĐ — Nhạc có license','Mẫu kháng GCĐ — Hình ảnh public domain','Mẫu kháng GCĐ — Sai sót YouTube','Mẫu kháng GCĐ — Fair use'] },
  { for: 'GBQ_OPT3',  titles: ['Counter-notification — DMCA','Counter-notification — Sai nhận','Counter-notification — Có license','Counter-notification — Fair use'] },
];
for (const spec of TEMPLATE_SPECS) {
  for (const title of spec.titles) {
    templates.push({
      id: seq('TPL'),
      ticket_type: spec.for,
      title,
      content_excerpt: `Kính gửi quý đối tác, ... ${title} ...`,
      created_by_user_id: pick(usersByRole('VHYT')).id,
      created_at: randTimeInRange(),
      usage_count: randInt(0, 50),
    });
  }
}

// ─── RESOURCE NAME POOLS (for ticket_resources) ────────────────────────────
const SONG_NAMES = ['Hành trình','Khoảnh khắc','Một thời','Mùa hè','Em ơi','Anh thương em','Lặng yên','Cánh hoa','Bốn mùa','Mơ phố','Trở về','Biển nhớ'];
const ARTISTS = ['Sơn Tùng MTP','Hà Anh Tuấn','Mỹ Tâm','Đan Trường','Đen Vâu','Hoàng Thùy Linh','Erik','Bích Phương','Vũ Cát Tường','Soobin Hoàng Sơn'];
const ISRC_PREFIXES = ['VNAB','VNCD','VNEF','VNGH','USRC','GBUM'];
function genIsrc() { return `${pick(ISRC_PREFIXES)}${randInt(20,29)}${String(randInt(0,999999)).padStart(7,'0')}`; }
function genAssetCode() { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let s = 'A'; for (let i = 0; i < 15; i++) s += chars[Math.floor(rand() * chars.length)]; return s; }

// ═══════════════════════════════════════════════════════════════════════════
// TICKETS, TICKET_RESOURCES, TIMELINE, SLA
// ═══════════════════════════════════════════════════════════════════════════

const tickets = [];
const ticketResources = [];
const timeline = [];
const slaEvents = [];

function makeTicketCode(type, refId, createdIso) {
  const date = yymmdd(createdIso);
  const dailyKey = `${type}-${refId.substring(0,8)}-${date}`;
  seqs[dailyKey] = (seqs[dailyKey] || 0) + 1;
  const s = String(seqs[dailyKey]).padStart(2, '0');
  switch (type) {
    case 'CLAIM':     return `TC-${refId.substring(0,8)}-${date}-${s}`;
    case 'WHITELIST': return `WL-${refId.substring(0,8)}-${date}-${s}`;
    case 'GBQ':       return `GBQ-${refId.substring(0,8)}-${date}-${s}`;
    case 'GCD':       return `GCD-${refId.substring(0,8)}-${date}-${s}`;
    case 'TKT_BKT':   return `TKT-${refId.substring(0,8)}-${date}-${s}`;
    case 'DIE':       return `DIE-${refId.substring(0,8)}-${date}-${s}`;
  }
}

function statusForType(type) {
  const base = weightedPick(CONFIG.statusMix);
  if (type === 'WHITELIST' && base === 'paused') return 'processing';
  if (type === 'GBQ' && base === 'paused' && rand() < 0.4) return 'failed';
  if (type === 'GCD' && base === 'paused' && rand() < 0.4) return 'failed';
  if (type === 'TKT_BKT' && base === 'closed' && rand() < 0.5) return 'locked';
  return base;
}

function addTimeline(ticketId, actor, role, action, fromState, toState, ts, metadata = {}) {
  timeline.push({
    id: seq('TL'),
    ticket_id: ticketId,
    actor_user_id: actor,
    actor_role: role,
    action,
    from_state: fromState,
    to_state: toState,
    timestamp: ts,
    metadata,
  });
}

function addSla(ticketId, eventType, ts, metadata = {}) {
  slaEvents.push({
    id: seq('SLA'),
    ticket_id: ticketId,
    event_type: eventType,
    timestamp: ts,
    metadata,
  });
}

// Build per-ticket resource records (Claim láo = 1; Claim đúng = 1–3; GBQ Audio = 1; GBQ Footage = 0–1; GCĐ nhạc = 1–4)
function buildResources(ticket, type, subKind /* audio | image | footage | thumb | nhac | hinh_anh */) {
  const isAudioLike = ['audio','nhac'].includes(subKind);
  const count = (() => {
    if (type === 'CLAIM' && ticket.claim_type === 'claim_dung') return randInt(1, 3);
    if (type === 'CLAIM') return 1;                // claim láo = 1
    if (type === 'GBQ' && isAudioLike) return 1;
    if (type === 'GBQ') return rand() < 0.7 ? 1 : 0; // Footage/Thumb optional
    if (type === 'GCD' && isAudioLike) return randInt(1, 4);
    if (type === 'GCD') return randInt(1, 2);
    return 0;
  })();

  for (let i = 0; i < count; i++) {
    const isLao = (ticket.claim_type === 'claim_lao') || (ticket.strike_type === 'gay_lao') || (ticket.gcd_type === 'gcd_lao');
    const hasAssetCode = rand() < (isAudioLike ? 0.7 : 0.3);
    const r = {
      id: seq('RES'),
      ticket_id: ticket.id,
      ticket_type: type,
      resource_kind: isAudioLike ? 'audio' : (subKind === 'image' || subKind === 'hinh_anh' ? 'image' : subKind === 'footage' ? 'footage' : 'thumb'),
      asset_code: hasAssetCode ? genAssetCode() : null,
      name: `${pick(SONG_NAMES)} ${randInt(1, 99)}`,
      artist: pick(ARTISTS),
      label: isAudioLike ? pick(LABEL_NAMES) : null,
      sub_project: isAudioLike ? pick(['Album 2025','OST Phim Việt','Single Tết','Live Acoustic']) : null,
      isrc: isAudioLike ? genIsrc() : null,
      dsp_link: isAudioLike ? `https://open.spotify.com/track/${Math.random().toString(36).substring(2, 14)}` : null,
      copyright_handling: isLao ? `Tài nguyên đã được license bởi ${pick(LABEL_NAMES)} cho dự án ${pick(PROJECT_NAMES)}.` : null,
      // For Footage/Thumb (GBQ Image branch)
      original_footage_link: (type === 'GBQ' && !isAudioLike) ? `https://drive.google.com/file/d/${Math.random().toString(36).substring(2, 16)}/view` : null,
      contract_proof_link: (type === 'GBQ' && !isAudioLike && rand() < 0.6) ? `https://drive.google.com/file/d/${Math.random().toString(36).substring(2, 16)}/view` : null,
      no_contract_reason: null,
      sort_order: i + 1,
      created_at: ticket.created_at,
    };
    // If GBQ Footage/Thumb has no contract, fill reason
    if (type === 'GBQ' && !isAudioLike && !r.contract_proof_link) {
      r.no_contract_reason = pick(['Đang xin license từ đối tác','Mua qua marketplace, chưa có hợp đồng giấy','License đã hết hạn, đang gia hạn']);
    }
    ticketResources.push(r);
  }
}

function buildProcessingPath(type, ticket, channel) {
  const events = [];
  const seoUser = users.find(u => u.id === channel.owner_seo_user_id) || pick(usersByRole('SEO'));
  const vhyt = pick(usersByRole('VHYT'));
  const vhleader = pick(usersByRole('VH_LEADER'));
  const vhda = pick(usersByRole('VHDA'));
  const vhwl = pick(usersByRole('VHWL'));
  const tpmkt = pick(usersByRole('TP_MKT'));

  const e = (action, fromState, toState, actor, role, metadata = {}) => events.push({ action, fromState, toState, actor, role, metadata });

  switch (type) {
    case 'CLAIM': {
      e('SEO tạo ticket',                 null, 'draft', seoUser.id, 'SEO');
      e('SEO gửi ticket',                 'draft', 'sent', seoUser.id, 'SEO');
      e('VHYT tiếp nhận',                 'sent', 'processing', vhyt.id, 'VHYT');
      if (rand() < 0.4) {
        e('VHYT yêu cầu bổ sung (1/2)',   'processing', 'processing', vhyt.id, 'VHYT', { round: '1/2' });
        e('SEO gửi lại',                  'processing', 'processing', seoUser.id, 'SEO');
      }
      const pa = weightedPick({ PA1: 0.35, PA2: 0.40, PA3: 0.15, PA4: 0.10 });
      e(`VHYT chọn ${pa}`,                'processing', 'processing', vhyt.id, 'VHYT', { pa });
      ticket.resolution_plan = pa;

      if (pa === 'PA1') {
        e('VHYT liên hệ bên claim',       'processing', 'processing', vhyt.id, 'VHYT');
        e('VHYT cập nhật: Claim đã gỡ',   'processing', 'processing', vhyt.id, 'VHYT');
      } else if (pa === 'PA2') {
        const tpl = pick(templates.filter(tp => tp.ticket_type === 'CLAIM_PA2'));
        ticket.template_id = tpl.id;
        e('VHYT tạo mẫu kháng',           'processing', 'processing', vhyt.id, 'VHYT', { template_id: tpl.id });
        e('SEO đã thực hiện kháng theo mẫu','processing', 'processing', seoUser.id, 'SEO');
      } else if (pa === 'PA3') {
        e('SEO Cut/Xóa hoàn tất',         'processing', 'processing', seoUser.id, 'SEO');
      } else if (pa === 'PA4') {
        e('VHYT trigger PA4 → tạo WL ticket', 'processing', 'processing', vhyt.id, 'VHYT');
        ticket.linked_wl_ticket_id = '__PENDING__';
      }
      return { events, primaryActor: vhyt.id, secondaryActor: seoUser.id };
    }

    case 'WHITELIST': {
      const subType = weightedPick({ whitelist: 0.85, remove_whitelist: 0.15 });
      ticket.sub_type = subType;
      const reviewRequired = rand() < 0.3;
      ticket.review_required = reviewRequired;
      // Assign net_whitelist + kho note
      const netWl = pick(netWhitelists.filter(n => n.network_id === channel.network_id)) || pick(netWhitelists);
      ticket.net_whitelist_id = netWl.id;
      const kho = pick(khoWhitelists);
      ticket.kho_whitelist_id = kho.id;
      ticket.kho_wl_note = `Cần ${pick(['gấp','thường','sau khi network duyệt'])} cho kho ${kho.name}.`;
      ticket.ngay_dk_wl = ticket.created_at;

      e('SEO tạo ticket whitelist',       null, 'draft', seoUser.id, 'SEO');
      e('SEO gửi ticket',                 'draft', 'sent', seoUser.id, 'SEO');
      e('VHDA tiếp nhận',                 'sent', 'processing', vhda.id, 'VHDA');
      e('VHDA đánh dấu Net Whitelist',    'processing', 'processing', vhda.id, 'VHDA', { net_whitelist_id: netWl.id, net_whitelist_name: netWl.name });
      if (reviewRequired) {
        e('VHDA gửi kiểm duyệt',          'processing', 'processing', vhda.id, 'VHDA');
        const reviewApproved = rand() < 0.85;
        if (reviewApproved) {
          e('VHDA cập nhật: Đã duyệt',    'processing', 'processing', vhda.id, 'VHDA', { review_result: 'approved' });
          ticket.review_result = 'approved';
        } else {
          e('VHDA cập nhật: Từ chối',     'processing', 'closed', vhda.id, 'VHDA', { review_result: 'rejected' });
          ticket.review_result = 'rejected';
          return { events, primaryActor: vhda.id, secondaryActor: seoUser.id, forceFinal: 'closed' };
        }
      }
      e('VHDA phân công VHWL',            'processing', 'processing', vhda.id, 'VHDA', { vhwl_user_id: vhwl.id });
      ticket.assigned_vhwl_user_id = vhwl.id;
      e('VHWL bắt đầu xử lý',             'processing', 'processing', vhwl.id, 'VHWL');
      e(`VHWL hoàn thành ${subType === 'whitelist' ? 'whitelist' : 'gỡ whitelist'}`, 'processing', 'processing', vhwl.id, 'VHWL');
      return { events, primaryActor: vhda.id, secondaryActor: vhwl.id };
    }

    case 'GBQ': {
      e('SEO tạo ticket GBQ',             null, 'draft', seoUser.id, 'SEO');
      e('SEO gửi ticket',                 'draft', 'sent', seoUser.id, 'SEO');
      e('VHYT tiếp nhận & thẩm định',     'sent', 'processing', vhyt.id, 'VHYT');
      const option = weightedPick({ OPT2: 0.30, OPT3: 0.35, OPT4: 0.20, OPT7: 0.15 });
      ticket.resolution_option = option;
      e(`VHYT chọn ${option}`,            'processing', 'processing', vhyt.id, 'VHYT', { option });
      if (option === 'OPT2') {
        e('VHYT liên hệ bên gậy',         'processing', 'processing', vhyt.id, 'VHYT', { claimant_email: ticket.claimant_email });
      } else if (option === 'OPT3') {
        const tpl = pick(templates.filter(tp => tp.ticket_type === 'GBQ_OPT3'));
        ticket.template_id = tpl.id;
        e('VHYT soạn mẫu kháng',          'processing', 'processing', vhyt.id, 'VHYT', { template_id: tpl.id });
        e('SEO nộp counter-notification', 'processing', 'processing', seoUser.id, 'SEO');
      } else if (option === 'OPT4') {
        e('Thuê dịch vụ ngoài',           'processing', 'processing', vhyt.id, 'VHYT');
        e('Chờ kết quả từ dịch vụ ngoài', 'processing', 'processing', vhyt.id, 'VHYT');
      } else {
        e('VHYT chạy song song OPT2+OPT3','processing', 'processing', vhyt.id, 'VHYT');
        e('SEO nộp counter-notification', 'processing', 'processing', seoUser.id, 'SEO');
      }
      return { events, primaryActor: vhyt.id, secondaryActor: seoUser.id };
    }

    case 'GCD': {
      const subType = weightedPick({ nhac: 0.60, hinh_anh: 0.40 });
      ticket.sub_type = subType;
      ticket.has_excel_attachment = rand() < 0.25;
      ticket.bo_tai_lieu_link = ticket.has_excel_attachment ? `https://drive.google.com/file/d/${Math.random().toString(36).substring(2, 16)}/view` : null;
      e('SEO tạo ticket GCĐ',             null, 'draft', seoUser.id, 'SEO');
      e('SEO gửi ticket',                 'draft', 'sent', seoUser.id, 'SEO');
      e('VHYT tiếp nhận (SLA 2h)',        'sent', 'processing', vhyt.id, 'VHYT');
      const tpl = pick(templates.filter(tp => tp.ticket_type === 'GCD'));
      ticket.template_id = tpl.id;
      e('VHYT tạo mẫu kháng',             'processing', 'processing', vhyt.id, 'VHYT', { template_id: tpl.id });
      e('VHYT gửi mẫu cho SEO',           'processing', 'processing', vhyt.id, 'VHYT');
      e('SEO thực hiện kháng (SLA 1h)',   'processing', 'processing', seoUser.id, 'SEO');
      return { events, primaryActor: vhyt.id, secondaryActor: seoUser.id };
    }

    case 'TKT_BKT': {
      const subType = weightedPick({ TKT: 0.55, BKT: 0.45 });
      ticket.sub_type = subType;
      ticket.cooldown_days = subType === 'TKT' ? 90 : 30;
      e('SEO tạo ticket',                 null, 'draft', seoUser.id, 'SEO');
      e('SEO gửi ticket',                 'draft', 'sent', seoUser.id, 'SEO');
      e('VHYT tiếp nhận & thẩm định',     'sent', 'processing', vhyt.id, 'VHYT');
      if (rand() < 0.35) {
        e('VHYT yêu cầu bổ sung (1/2)',   'processing', 'processing', vhyt.id, 'VHYT', { round: '1/2' });
        e('SEO gửi lại',                  'processing', 'processing', seoUser.id, 'SEO');
      }
      const direction = weightedPick({ PA1_DV_NGOAI: 0.40, PA2_VH_HO_TRO: 0.60 });
      ticket.resolution_direction = direction;
      e(`VHYT chọn ${direction}`,         'processing', 'processing', vhyt.id, 'VHYT', { direction });
      if (direction === 'PA2_VH_HO_TRO') {
        e('VHYT hỗ trợ làm video kháng',  'processing', 'processing', vhyt.id, 'VHYT');
        e('SEO submit re-apply',          'processing', 'processing', seoUser.id, 'SEO');
      } else {
        e('Đã chuyển dịch vụ ngoài',      'processing', 'processing', vhyt.id, 'VHYT');
      }
      return { events, primaryActor: vhyt.id, secondaryActor: seoUser.id };
    }

    case 'DIE': {
      const cause = weightedPick({ community: 0.40, copyright: 0.40, severe_abuse: 0.15, dedicated_violation: 0.05 });
      ticket.die_cause = cause;
      ticket.termination_event_id = `TE-${channel.youtube_channel_id.substring(0,8)}-${yymmdd(ticket.created_at)}`;
      e('SEO tạo ticket Die kênh',        null, 'draft', seoUser.id, 'SEO');
      e('SEO gửi ticket',                 'draft', 'sent', seoUser.id, 'SEO');
      e('VHYT tiếp nhận',                 'sent', 'processing', vhyt.id, 'VHYT');
      if (rand() < 0.5) {
        e('VHYT yêu cầu bổ sung hồ sơ',   'processing', 'processing', vhyt.id, 'VHYT');
        e('SEO bổ sung hồ sơ',            'processing', 'processing', seoUser.id, 'SEO');
      }
      const direction = weightedPick({ APPEAL_DIRECT: 0.50, EXTERNAL_SERVICE: 0.30, ABANDON: 0.20 });
      ticket.resolution_direction = direction;
      e(`VHYT chọn hướng ${direction}`,   'processing', 'processing', vhyt.id, 'VHYT', { direction });
      return { events, primaryActor: vhyt.id, secondaryActor: seoUser.id };
    }
  }
}

function finalizeTicket(type, ticket, processing, finalStatus) {
  let lastTs = ticket.created_at;
  for (const ev of processing.events) {
    lastTs = addHours(lastTs, randInt(1, 12) + rand() * 6);
    addTimeline(ticket.id, ev.actor, ev.role, ev.action, ev.fromState, ev.toState, lastTs, ev.metadata);
  }
  ticket.updated_at = lastTs;

  if (processing.forceFinal === 'closed') {
    ticket.current_state = 'closed';
    ticket.closed_at = lastTs;
    return;
  }

  if (finalStatus === 'draft') {
    ticket.current_state = 'draft';
    const rest = timeline.filter(t => t.ticket_id === ticket.id && t.to_state !== 'draft');
    for (const r of rest) timeline.splice(timeline.indexOf(r), 1);
    return;
  }
  if (finalStatus === 'sent') {
    const sentEvents = timeline.filter(t => t.ticket_id === ticket.id);
    const sentIdx = sentEvents.findIndex(t => t.to_state === 'sent');
    if (sentIdx >= 0) {
      const toRemove = sentEvents.slice(sentIdx + 1);
      for (const r of toRemove) timeline.splice(timeline.indexOf(r), 1);
    }
    ticket.current_state = 'sent';
    return;
  }
  if (finalStatus === 'processing') { ticket.current_state = 'processing'; return; }
  if (finalStatus === 'paused') {
    const pauseTs = addHours(lastTs, 24);
    addTimeline(ticket.id, null, 'SYSTEM', 'Tự động Tạm dừng (24h không hành động)', 'processing', 'paused', pauseTs);
    addSla(ticket.id, 'auto_pause_24h', pauseTs);
    ticket.current_state = 'paused';
    ticket.updated_at = pauseTs;
    return;
  }
  if (finalStatus === 'closed') {
    const closedTs = addDays(lastTs, type === 'CLAIM' ? 30 : 1);
    if (type === 'CLAIM') {
      addTimeline(ticket.id, null, 'SYSTEM', 'Auto-close: Claim láo + PA2 + 30 ngày không phản hồi', 'processing', 'closed', closedTs);
      addSla(ticket.id, 'auto_close_30d', closedTs);
    } else {
      const actor = pick(usersByRole('VHYT'));
      addTimeline(ticket.id, actor.id, 'VHYT', 'VHYT đóng ticket', 'processing', 'closed', closedTs);
    }
    ticket.current_state = 'closed';
    ticket.closed_at = closedTs;
    ticket.updated_at = closedTs;
    return;
  }
  if (finalStatus === 'failed') {
    const failTs = addDays(lastTs, randInt(1, 7));
    const actor = pick(usersByRole('VHYT'));
    addTimeline(ticket.id, actor.id, 'VHYT', `${type} ghi nhận Thất bại`, 'processing', 'failed', failTs, { reason: 'YouTube từ chối kháng nghị' });
    ticket.current_state = 'failed';
    ticket.failed_at = failTs;
    ticket.updated_at = failTs;
    return;
  }
  if (finalStatus === 'locked') {
    const lockTs = addDays(lastTs, 1);
    addTimeline(ticket.id, null, 'SYSTEM', 'Khóa tạo lại (cấp kênh)', 'processing', 'locked', lockTs);
    ticket.current_state = 'locked';
    ticket.updated_at = lockTs;
    return;
  }
  // completed
  const completeTs = addDays(lastTs, randInt(0, 3));
  let action = 'SEO xác nhận hoàn thành';
  if (type === 'WHITELIST') action = 'VHWL chuyển trạng thái: Đã xử lý';
  const actorId = type === 'WHITELIST' ? processing.secondaryActor : (users.find(u => u.id === processing.secondaryActor)?.id || pick(usersByRole('SEO')).id);
  addTimeline(ticket.id, actorId, type === 'WHITELIST' ? 'VHWL' : 'SEO', action, 'processing', 'completed', completeTs);
  ticket.current_state = 'completed';
  ticket.completed_at = completeTs;
  ticket.updated_at = completeTs;
  if (type === 'WHITELIST') ticket.ngay_wl_thanh_cong = completeTs;

  if (rand() < 0.3) addSla(ticket.id, 'reminder_24h', addHours(ticket.created_at, 24));
  if (rand() < 0.1) addSla(ticket.id, 'breach_48h', addHours(ticket.created_at, 48));
}

// ─── BUILD TICKETS ─────────────────────────────────────────────────────────
function ticketCounts() {
  const t = CONFIG.counts.tickets;
  return {
    claim:     Math.round(t * CONFIG.ticketMix.claim),
    whitelist: Math.round(t * CONFIG.ticketMix.whitelist),
    gbq:       Math.round(t * CONFIG.ticketMix.gbq),
    gcd:       Math.round(t * CONFIG.ticketMix.gcd),
    tkt_bkt:   Math.round(t * CONFIG.ticketMix.tkt_bkt),
    die_kenh:  Math.round(t * CONFIG.ticketMix.die_kenh),
  };
}

const counts = ticketCounts();
const typeMap = [['CLAIM', counts.claim], ['WHITELIST', counts.whitelist], ['GBQ', counts.gbq], ['GCD', counts.gcd], ['TKT_BKT', counts.tkt_bkt], ['DIE', counts.die_kenh]];

for (const [type, n] of typeMap) {
  for (let i = 0; i < n; i++) {
    const channel = pick(channels);
    const channelVideos = videos.filter(v => v.channel_id === channel.id);
    const video = (type === 'CLAIM' || type === 'GBQ' || type === 'GCD')
      ? (channelVideos.length ? pick(channelVideos) : pick(videos))
      : null;
    const createdAt = randTimeInRange();
    const ticket = {
      id: seq('T'),
      type,
      code: makeTicketCode(type, video ? video.youtube_video_id : channel.youtube_channel_id, createdAt),
      created_by_user_id: channel.owner_seo_user_id,
      channel_id: channel.id,
      video_id: video ? video.id : null,
      project_id: channel.project_id,
      network_id: channel.network_id,
      company_id: channel.company_id,
      department_id: channel.department_id,
      created_at: createdAt,
      updated_at: createdAt,
      current_state: 'draft',
    };

    // ─── Type-specific top-level fields
    if (type === 'CLAIM') {
      ticket.claim_type = weightedPick({ claim_dung: 0.65, claim_lao: 0.35 });
      ticket.claimer = `${pick(['Hãng nhạc','Label','Công ty','Đại diện'])} ${pick(LABEL_NAMES)}`;
      ticket.label_id = pick(labels).id;
      ticket.video_status = video?.video_status || 'public';
      ticket.is_urgent = ticket.video_status === 'public';
      ticket.resource_kind = pick(['audio', 'image']);
      ticket.evidence_urls = ticket.claim_type === 'claim_lao'
        ? Array.from({ length: randInt(1, 3) }, () => `https://youtube.com/post/${Math.random().toString(36).substring(2, 14)}`)
        : (rand() < 0.4 ? [`https://youtube.com/post/${Math.random().toString(36).substring(2, 14)}`] : []);
      ticket.self_handle = ticket.claim_type === 'claim_dung' && rand() < 0.15;
      if (ticket.self_handle) {
        ticket.counter_template_url = `https://drive.google.com/file/d/${Math.random().toString(36).substring(2, 16)}/view`;
        ticket.counter_template_text = null;
      }
    } else if (type === 'WHITELIST') {
      // sub_type, net_whitelist_id, kho_whitelist_id, kho_wl_note, ngay_dk_wl set inside builder
    } else if (type === 'GBQ') {
      ticket.strike_type = weightedPick({ gay_dung: 0.55, gay_lao: 0.45 });
      ticket.gay_category = weightedPick({ footage: 0.30, audio: 0.55, thumb: 0.15 });
      ticket.label_id = pick(labels).id;
      ticket.date_struck = randTimeBetween(new Date(createdAt).getTime() - 7*86400*1000, new Date(createdAt).getTime());
      ticket.cause_description = pick([
        'Sử dụng footage của đối thủ nhưng đã có license hợp lệ',
        'Trích đoạn nhạc đã được mua bản quyền qua marketplace',
        'Thumb sử dụng hình ảnh public domain',
        'Đoạn audio đã được clear bởi network từ năm 2024',
        'Footage được cung cấp bởi đối tác trong dự án',
      ]);
      ticket.claimant_email = `legal@${slugifyName(pick(LABEL_NAMES)).replace(/\./g,'')}.com`;
    } else if (type === 'GCD') {
      ticket.gcd_type = weightedPick({ gcd_dung: 0.45, gcd_lao: 0.55 });
      // sub_type, has_excel_attachment, bo_tai_lieu_link set inside builder
    } else if (type === 'TKT_BKT') {
      ticket.youtube_decision_date = randTimeBetween(startMs - 30*86400*1000, new Date(createdAt).getTime());
      // YouTube wait period for re-apply (typically 30-60 days from decision)
      const waitDays = pick([30, 45, 60]);
      const reapplyMs = new Date(ticket.youtube_decision_date).getTime() + waitDays * 86400 * 1000;
      ticket.re_apply_after = new Date(reapplyMs).toISOString();
      ticket.re_apply_wait_days = waitDays;
    } else if (type === 'DIE') {
      // die_cause and termination_event_id set inside builder
    }

    const finalStatus = statusForType(type);
    const processing = buildProcessingPath(type, ticket, channel);
    finalizeTicket(type, ticket, processing, finalStatus);

    // DIE-specific: mark whether the underlying termination event is still
    // active (ticket not yet resolved). SEO uses this to know which dies
    // they still need to fight.
    if (type === 'DIE') {
      ticket.die_event_active = ['sent', 'processing', 'paused'].includes(finalStatus);
    }

    // ─── Build resources (Claim/GBQ/GCĐ only) — after path so sub_type is set
    if (type === 'CLAIM') buildResources(ticket, type, ticket.resource_kind);
    if (type === 'GBQ') buildResources(ticket, type, ticket.gay_category);
    if (type === 'GCD') buildResources(ticket, type, ticket.sub_type);

    // Damage estimation
    const dailyRev = channel.monthly_revenue_vnd / 30;
    const ageDays = Math.max(1, (new Date(ticket.updated_at).getTime() - new Date(ticket.created_at).getTime()) / 86400000);
    const severity = type === 'DIE' ? 30 : type === 'TKT_BKT' ? 10 : type === 'GBQ' ? 5 : type === 'GCD' ? 3 : type === 'CLAIM' ? 1 : 0.5;
    ticket.affected_revenue_vnd = Math.floor(dailyRev * Math.min(ageDays, 30) * (severity / 30) / 1000) * 1000;

    tickets.push(ticket);
  }
}

// ─── LINK PA4 → WL TICKETS ─────────────────────────────────────────────────
const claimPA4 = tickets.filter(t => t.type === 'CLAIM' && t.resolution_plan === 'PA4');
const wlPool = tickets.filter(t => t.type === 'WHITELIST' && t.current_state !== 'draft');
for (const claim of claimPA4) {
  const wlMatch = wlPool.find(w => w.channel_id === claim.channel_id && !w._linked) || pick(wlPool);
  if (wlMatch) {
    claim.linked_wl_ticket_id = wlMatch.id;
    wlMatch.linked_claim_ticket_id = claim.id;
    wlMatch._linked = true;
  } else {
    delete claim.linked_wl_ticket_id;
  }
}
for (const w of tickets) delete w._linked;

// ═══════════════════════════════════════════════════════════════════════════
// MASTER WHITELIST TABLE (Kho whitelist screenshot)
// ═══════════════════════════════════════════════════════════════════════════
// Generated from 2 sources:
//   1. Completed WL tickets (action='whitelist', status='completed') → 'Đang WL' row
//   2. Manual import seed rows (channels not yet wl-ticketed)

const masterWhitelist = [];
const seenChannelNet = new Set();

// From completed WL tickets
for (const t of tickets.filter(x => x.type === 'WHITELIST' && x.current_state === 'completed' && x.sub_type === 'whitelist')) {
  const channel = channels.find(c => c.id === t.channel_id);
  const kho = khoWhitelists.find(k => k.id === t.kho_whitelist_id);
  const netWl = netWhitelists.find(n => n.id === t.net_whitelist_id);
  const key = `${channel.id}|${netWl?.id}|${kho?.id}`;
  if (seenChannelNet.has(key)) continue;
  seenChannelNet.add(key);
  masterWhitelist.push({
    id: seq('MWL'),
    channel_id: channel.id,
    kho_whitelist_id: kho?.id || null,
    net_whitelist_id: netWl?.id || null,
    trang_thai_wl: 'Đang WL',
    ngay_dk_wl: t.ngay_dk_wl,
    ngay_wl_thanh_cong: t.ngay_wl_thanh_cong,
    ghi_chu: t.kho_wl_note,
    source_ticket_id: t.id,
    source: 'ticket',
    created_at: t.completed_at || t.updated_at,
  });
}

// Also rows from completed REMOVE WL tickets → 'Đã gỡ'
for (const t of tickets.filter(x => x.type === 'WHITELIST' && x.current_state === 'completed' && x.sub_type === 'remove_whitelist')) {
  const channel = channels.find(c => c.id === t.channel_id);
  const kho = khoWhitelists.find(k => k.id === t.kho_whitelist_id);
  const netWl = netWhitelists.find(n => n.id === t.net_whitelist_id);
  masterWhitelist.push({
    id: seq('MWL'),
    channel_id: channel.id,
    kho_whitelist_id: kho?.id || null,
    net_whitelist_id: netWl?.id || null,
    trang_thai_wl: 'Đã gỡ',
    ngay_dk_wl: t.ngay_dk_wl,
    ngay_wl_thanh_cong: t.ngay_wl_thanh_cong,
    ghi_chu: t.kho_wl_note,
    source_ticket_id: t.id,
    source: 'ticket',
    created_at: t.completed_at || t.updated_at,
  });
}

// Manual import seed rows — some channels have multiple WL rows (per the screenshot)
// Aim for total ~80 rows; current count varies, so top up.
const targetTotal = CONFIG.counts.masterWhitelistRowsApprox;
while (masterWhitelist.length < targetTotal) {
  const ch = pick(channels);
  const kho = pick(khoWhitelists);
  const netWl = pick(netWhitelists.filter(n => n.network_id === ch.network_id)) || pick(netWhitelists);
  const key = `${ch.id}|${netWl.id}|${kho.id}`;
  if (seenChannelNet.has(key)) continue;
  seenChannelNet.add(key);
  const dkDate = randTimeBetween(startMs - 60*86400*1000, endMs);
  const thanhCong = rand() < 0.85 ? addDays(dkDate, randInt(1, 14)) : null;
  masterWhitelist.push({
    id: seq('MWL'),
    channel_id: ch.id,
    kho_whitelist_id: kho.id,
    net_whitelist_id: netWl.id,
    trang_thai_wl: thanhCong ? 'Đang WL' : 'Đang xử lý',
    ngay_dk_wl: dkDate,
    ngay_wl_thanh_cong: thanhCong,
    ghi_chu: rand() < 0.3 ? `Nhập từ CSV ngày ${dkDate.substring(0,10)}` : null,
    source_ticket_id: null,
    source: 'manual_import',
    created_at: dkDate,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLA STEPS — per-step deadlines for SEO ↔ VHDA handoffs
// Each ticket type has a predefined workflow; each step has an expected SLA.
// We generate started_at / completed_at so ~30% steps slip past expected_hours.
// ═══════════════════════════════════════════════════════════════════════════

// step name, actor role (SEO|VHDA), expected hours
const STEP_FLOWS = {
  CLAIM: [
    ['VHDA tiếp nhận ticket', 'VHDA', 2],
    ['VHDA chọn Phương án xử lý', 'VHDA', 4],
    ['SEO thực thi PA', 'SEO', 6],
    ['VHDA xác nhận đã giải quyết', 'VHDA', 2],
  ],
  WHITELIST: [
    ['VHDA xét duyệt yêu cầu', 'VHDA', 4],
    ['SEO bổ sung tài liệu (nếu cần)', 'SEO', 8],
    ['VHDA hoàn tất whitelist', 'VHDA', 2],
  ],
  GBQ: [
    ['VHDA tiếp nhận GBQ', 'VHDA', 2],
    ['VHDA chọn Option kháng', 'VHDA', 6],
    ['SEO thu thập bằng chứng', 'SEO', 10],
    ['VHDA gỡ gậy', 'VHDA', 4],
  ],
  GCD: [
    ['VHDA tiếp nhận GCĐ', 'VHDA', 4],
    ['VHDA chọn hướng xử lý', 'VHDA', 12],
    ['SEO chuẩn bị bộ tài liệu', 'SEO', 24],
    ['VHDA hoàn tất kháng', 'VHDA', 6],
  ],
  TKT_BKT: [
    ['VHDA kháng kênh', 'VHDA', 12],
    ['SEO theo dõi phản hồi', 'SEO', 24],
    ['VHDA xử lý kết quả', 'VHDA', 8],
  ],
  DIE: [
    ['VHDA quyết định hướng (kháng/bỏ)', 'VHDA', 24],
    ['SEO thực thi (chuẩn bị hồ sơ)', 'SEO', 48],
    ['VHDA xác nhận kết quả', 'VHDA', 12],
  ],
};

const slaSteps = [];
let stepIdSeq = 1;

// NOW reference: the dashboard's "today" (matches data-loader)
const NOW_MS = new Date('2026-05-22T23:59:59+07:00').getTime();

for (const ticket of tickets) {
  const flow = STEP_FLOWS[ticket.type];
  if (!flow) continue;
  let cursor = new Date(ticket.created_at);

  const isOpen = ['sent', 'processing', 'paused'].includes(ticket.current_state);
  const isDraft = ticket.current_state === 'draft';
  // For open tickets we put "now" on the in-progress step. To keep that step's
  // started_at recent (so delay isn't absurd for very old tickets), we cap
  // the cursor to NOW - (expected * ramp) just before the in_progress step.
  const halfDone = Math.ceil(flow.length / 2);

  for (let i = 0; i < flow.length; i++) {
    const [name, actor, expected] = flow[i];

    // ── For an OPEN ticket: clamp the cursor before the in-progress step so
    //    the step started recently (delay bounded). This gives realistic
    //    "currently late by 0-5 days" instead of "late by 30+ days" on old
    //    tickets that we'd never realistically still be working.
    if (isOpen && i === halfDone) {
      // Pick a recent start: NOW minus a slip multiple of expected
      const slip = rand() < 0.35;   // 35% of in-progress steps are late
      const ratio = slip ? (1.2 + Math.pow(rand(), 2) * 3) : (0.2 + rand() * 0.7);
      const ageHours = expected * ratio;
      const startedMs = NOW_MS - ageHours * 3600 * 1000;
      cursor = new Date(Math.max(startedMs, cursor.getTime()));
    }

    const startedAt = new Date(cursor);

    // Decide if this step is overdue. ~30% slip; severity log-normal.
    const slip = rand() < 0.30;
    let actualHours;
    if (slip) {
      // late: expected * (1.3 → 4x). Bounded so we don't get crazy outliers.
      actualHours = expected * (1.3 + Math.pow(rand(), 2) * 2.7);
    } else {
      // on-time: 30% → 100% of expected
      actualHours = expected * (0.3 + rand() * 0.7);
    }
    actualHours = Math.max(0.25, actualHours);

    const completedAt = new Date(startedAt.getTime() + actualHours * 3600 * 1000);

    let status, finalCompletedAt;
    if (isDraft) {
      if (i === 0) {
        status = 'pending';
        finalCompletedAt = null;
      } else {
        continue;
      }
    } else if (isOpen) {
      if (i < halfDone) {
        status = 'completed';
        finalCompletedAt = completedAt;
      } else if (i === halfDone) {
        status = 'in_progress';
        finalCompletedAt = null;
      } else {
        continue;
      }
    } else {
      status = 'completed';
      finalCompletedAt = completedAt;
    }

    slaSteps.push({
      id: 'STEP-' + String(stepIdSeq++).padStart(5, '0'),
      ticket_id: ticket.id,
      ticket_type: ticket.type,
      step_index: i,
      step_name: name,
      actor_role: actor,         // 'SEO' or 'VHDA'
      expected_hours: expected,
      started_at: startedAt.toISOString(),
      completed_at: finalCompletedAt ? finalCompletedAt.toISOString() : null,
      status,                    // 'pending' | 'in_progress' | 'completed'
    });

    cursor = finalCompletedAt || completedAt;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE FILES
// ═══════════════════════════════════════════════════════════════════════════

const outDir = __dirname;
const write = (name, data) => {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + '\n');
  console.log(`  ✓ ${name.padEnd(24)} ${String(data.length).padStart(5)} records`);
};

console.log(`\n🎬 QLK Ticket Dashboard — Fake Data Generator (v2)`);
console.log(`   Seed: ${CONFIG.seed}`);
console.log(`   Range: ${CONFIG.dateStart.substring(0,10)} → ${CONFIG.dateEnd.substring(0,10)}\n`);
console.log(`📦 Writing entity files:`);
write('companies.json', companies);
write('departments.json', departments);
write('users.json', users);
write('projects.json', projects);
write('networks.json', networks);
write('net_whitelists.json', netWhitelists);
write('kho_whitelists.json', khoWhitelists);
write('labels.json', labels);
write('channels.json', channels);
write('videos.json', videos);
write('templates.json', templates);
write('tickets.json', tickets);
write('ticket_resources.json', ticketResources);
write('master_whitelist.json', masterWhitelist);
write('timeline.json', timeline);
write('sla_events.json', slaEvents);
write('sla_steps.json', slaSteps);

console.log(`\n📊 Ticket Summary:`);
const byType = {}, byStatus = {};
for (const t of tickets) {
  byType[t.type] = (byType[t.type] || 0) + 1;
  byStatus[t.current_state] = (byStatus[t.current_state] || 0) + 1;
}
console.log(`   By type:`);
for (const [k, v] of Object.entries(byType)) console.log(`     ${k.padEnd(12)} ${v} (${(v / tickets.length * 100).toFixed(1)}%)`);
console.log(`   By status:`);
for (const [k, v] of Object.entries(byStatus)) console.log(`     ${k.padEnd(12)} ${v} (${(v / tickets.length * 100).toFixed(1)}%)`);
console.log(`\n   Ticket resources: ${ticketResources.length}`);
console.log(`   Master Whitelist: ${masterWhitelist.length} rows`);
console.log(`   Timeline events:  ${timeline.length}`);
console.log(`   SLA events:       ${slaEvents.length}`);
console.log(`\n✅ Done.\n`);
