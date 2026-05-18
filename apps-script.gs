/**
 * Pronto HQ — Google Sheets sync backend
 * ─────────────────────────────────────────
 * One-time setup:
 *   1. Open your Sheet → Extensions → Apps Script
 *   2. Paste this entire file in (replace anything already there)
 *   3. Save the project (disk icon), name it "Pronto HQ Sync"
 *   4. Deploy → New deployment → "Web app"
 *        Execute as:  Me
 *        Who has access: Anyone with the link
 *   5. Click Deploy. Authorize when asked.
 *   6. Copy the Web App URL it gives you — paste into the app's Sync panel.
 *
 * What it does:
 *   - GET  → returns the full JSON state read from all `_pronto_*` tabs
 *   - POST → replaces all `_pronto_*` tabs with the JSON state you send
 *
 * Tabs starting with `_pronto_` are managed by this script. Other tabs are untouched.
 */

const TAB_PREFIX = "_pronto_";

// ─── Routing ───
function doGet(e) {
  try {
    const state = readState_();
    return jsonOut_({ ok: true, state });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(body);
    if (!data || typeof data !== "object") throw new Error("Body must be a JSON object");
    if (data.action === "ping") return jsonOut_({ ok: true, pong: true });
    writeState_(data);
    return jsonOut_({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Schema: each key = sheet tab name (without prefix), value describes columns ───
//   shape "rows"   → array of objects with fixed columns
//   shape "scalars"→ array of single strings (one per row)
//   shape "kv"     → key/value pairs
const SCHEMA = {
  tasksByDate:        { shape: "tasksByDate" },
  content:            { shape: "content" },
  ideas:              { shape: "ideas" },
  suppliers:          { shape: "rows", cols: ["type","product","company","contact","company2","contact2","notes"] },
  budget_annual:      { shape: "rows", cols: ["label","amount"] },
  budget_budgeted:    { shape: "monthlyRows" },
  budget_actual:      { shape: "monthlyRows" },
  budget_meta:        { shape: "kv" },
  onboarding:         { shape: "onboarding" },
  courses:            { shape: "rows", cols: ["name","done","notes"] },
  testimonials:       { shape: "rows", cols: ["name","company","done"] },
  photos:             { shape: "scalars" },
  plan_items:         { shape: "rows", cols: ["id","section","monthIdx","text"] },
  plan_challenges:    { shape: "rows", cols: ["month","idea"] },
  staff:              { shape: "rows", cols: ["gender","name","dob","started","about","personality","photo"] },
  lunches:            { shape: "rows", cols: ["name","date"] },
  msgs:               { shape: "rows", cols: ["id","from","text","time"] },
  meta:               { shape: "kv" },
};

// ─── Read all tabs into a state object ───
function readState_() {
  const ss = SpreadsheetApp.getActive();
  const state = {};

  for (const key in SCHEMA) {
    const def = SCHEMA[key];
    const name = TAB_PREFIX + key;
    const sh = ss.getSheetByName(name);
    if (!sh) { state[key] = defaultFor_(def); continue; }
    const values = sh.getDataRange().getValues();
    state[key] = parseSheet_(values, def);
  }

  // Reshape into app structure
  const out = {
    version: 1,
    savedAt: (state.meta && state.meta.savedAt) || null,
    tasksByDate: state.tasksByDate || {},
    content: state.content || {},
    ideas: state.ideas || { general: [], video: [] },
    suppliers: state.suppliers || [],
    budget: {
      annual: state.budget_annual || [],
      budgeted: state.budget_budgeted || [],
      actual: state.budget_actual || [],
      monthsBudgeted: (state.budget_meta && state.budget_meta.monthsBudgeted) ? splitCsv_(state.budget_meta.monthsBudgeted) : [],
      monthsActual:   (state.budget_meta && state.budget_meta.monthsActual)   ? splitCsv_(state.budget_meta.monthsActual)   : [],
    },
    onboarding: state.onboarding || { intro: [], jobs: [], addedTo: [], olokasFullList: [] },
    courses: state.courses || [],
    testimonials: state.testimonials || [],
    photos: state.photos || [],
    plan: { items: state.plan_items || [], challenges: state.plan_challenges || [] },
    staff: state.staff || [],
    lunches: state.lunches || [],
    msgs: state.msgs || [],
  };
  return out;
}

function defaultFor_(def) {
  if (def.shape === "tasksByDate" || def.shape === "content") return {};
  if (def.shape === "ideas") return { general: [], video: [] };
  if (def.shape === "onboarding") return { intro: [], jobs: [], addedTo: [], olokasFullList: [] };
  if (def.shape === "kv") return {};
  return [];
}

function parseSheet_(values, def) {
  if (values.length < 1) return defaultFor_(def);
  const header = values[0].map(String);
  const rows = values.slice(1).filter(r => r.some(c => c !== "" && c !== null && c !== undefined));

  if (def.shape === "rows") {
    return rows.map(r => {
      const o = {};
      def.cols.forEach((c, i) => { o[c] = coerce_(c, r[i]); });
      return o;
    });
  }

  if (def.shape === "scalars") {
    return rows.map(r => String(r[0] || "")).filter(s => s);
  }

  if (def.shape === "kv") {
    const o = {};
    rows.forEach(r => { o[String(r[0])] = r[1]; });
    return o;
  }

  if (def.shape === "monthlyRows") {
    // header: ["label", ...12 month names]
    const monthHeaders = header.slice(1);
    return rows.map(r => ({
      label: String(r[0] || ""),
      values: monthHeaders.map((_, i) => Number(r[i+1]) || 0),
    }));
  }

  if (def.shape === "tasksByDate") {
    // header: [date, id, text, done, owner, category, priority]
    const out = {};
    rows.forEach(r => {
      const date = String(r[0] || "");
      if (!date) return;
      if (!out[date]) out[date] = [];
      out[date].push({
        id: Number(r[1]) || 0,
        text: String(r[2] || ""),
        done: parseBool_(r[3]),
        owner: String(r[4] || "vanja"),
        category: String(r[5] || "Admin"),
        priority: String(r[6] || "Normal"),
      });
    });
    return out;
  }

  if (def.shape === "content") {
    // header: [date, title, type, pillar, notes]
    const out = {};
    rows.forEach(r => {
      const date = String(r[0] || "");
      if (!date) return;
      if (!out[date]) out[date] = [];
      const post = { title: String(r[1] || ""), type: String(r[2] || "Post") };
      const pillar = String(r[3] || ""); if (pillar) post.pillar = pillar;
      const notes  = String(r[4] || ""); if (notes)  post.notes = notes;
      out[date].push(post);
    });
    return out;
  }

  if (def.shape === "ideas") {
    // header: [kind, text]   kind = "general" or "video"
    const out = { general: [], video: [] };
    rows.forEach(r => {
      const kind = String(r[0] || "").toLowerCase();
      const text = String(r[1] || "");
      if (!text) return;
      if (kind === "video") out.video.push(text); else out.general.push(text);
    });
    return out;
  }

  if (def.shape === "onboarding") {
    // header: [section, done, text, notes]   section = intro|jobs|addedTo|olokasFullList
    const out = { intro: [], jobs: [], addedTo: [], olokasFullList: [] };
    rows.forEach(r => {
      const section = String(r[0] || "");
      if (!out.hasOwnProperty(section)) return;
      if (section === "olokasFullList") {
        out[section].push(String(r[2] || ""));
      } else {
        out[section].push({
          done: parseBool_(r[1]),
          text: String(r[2] || ""),
          notes: String(r[3] || ""),
        });
      }
    });
    return out;
  }

  return defaultFor_(def);
}

function coerce_(col, v) {
  if (v === null || v === undefined) return "";
  if (col === "done" || col === "isEvent") return parseBool_(v);
  if (col === "amount" || col === "monthIdx" || col === "id") return Number(v) || 0;
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return v;
}
function parseBool_(v) {
  if (v === true || v === false) return v;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "y";
}
function splitCsv_(s) { return String(s).split(",").map(x => x.trim()).filter(Boolean); }

// ─── Write the full state back to the sheet ───
function writeState_(data) {
  const ss = SpreadsheetApp.getActive();

  writeShape_(ss, "tasksByDate", { shape: "tasksByDate" }, data.tasksByDate || {});
  writeShape_(ss, "content",     { shape: "content"     }, data.content     || {});
  writeShape_(ss, "ideas",       { shape: "ideas"       }, data.ideas       || { general: [], video: [] });
  writeShape_(ss, "suppliers",   { shape: "rows", cols: ["type","product","company","contact","company2","contact2","notes"] }, data.suppliers || []);

  const b = data.budget || {};
  writeShape_(ss, "budget_annual",   { shape: "rows", cols: ["label","amount"] }, b.annual || []);
  writeShape_(ss, "budget_budgeted", { shape: "monthlyRows", months: b.monthsBudgeted || [] }, b.budgeted || []);
  writeShape_(ss, "budget_actual",   { shape: "monthlyRows", months: b.monthsActual   || [] }, b.actual   || []);
  writeShape_(ss, "budget_meta",     { shape: "kv" }, {
    monthsBudgeted: (b.monthsBudgeted || []).join(","),
    monthsActual:   (b.monthsActual   || []).join(","),
  });

  writeShape_(ss, "onboarding",   { shape: "onboarding" }, data.onboarding || {});
  writeShape_(ss, "courses",      { shape: "rows", cols: ["name","done","notes"] }, data.courses || []);
  writeShape_(ss, "testimonials", { shape: "rows", cols: ["name","company","done"] }, data.testimonials || []);
  writeShape_(ss, "photos",       { shape: "scalars" }, data.photos || []);

  const p = data.plan || {};
  writeShape_(ss, "plan_items",      { shape: "rows", cols: ["id","section","monthIdx","text"] }, p.items || []);
  writeShape_(ss, "plan_challenges", { shape: "rows", cols: ["month","idea"] }, p.challenges || []);

  writeShape_(ss, "staff",   { shape: "rows", cols: ["gender","name","dob","started","about","personality","photo"] }, data.staff || []);
  writeShape_(ss, "lunches", { shape: "rows", cols: ["name","date"] }, data.lunches || []);
  writeShape_(ss, "msgs",    { shape: "rows", cols: ["id","from","text","time"] }, data.msgs || []);

  writeShape_(ss, "meta", { shape: "kv" }, { savedAt: new Date().toISOString(), version: "1" });
}

function writeShape_(ss, key, def, value) {
  const name = TAB_PREFIX + key;
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  let header = [];
  let rows = [];

  if (def.shape === "rows") {
    header = def.cols.slice();
    rows = (value || []).map(o => def.cols.map(c => normalizeCell_(o[c])));
  } else if (def.shape === "scalars") {
    header = ["text"];
    rows = (value || []).map(v => [String(v || "")]);
  } else if (def.shape === "kv") {
    header = ["key", "value"];
    rows = Object.keys(value || {}).map(k => [k, normalizeCell_(value[k])]);
  } else if (def.shape === "monthlyRows") {
    const months = def.months || [];
    header = ["label"].concat(months);
    rows = (value || []).map(r => [String(r.label || "")].concat(months.map((_, i) => Number((r.values || [])[i]) || 0)));
  } else if (def.shape === "tasksByDate") {
    header = ["date","id","text","done","owner","category","priority"];
    rows = [];
    Object.keys(value || {}).sort().forEach(date => {
      (value[date] || []).forEach(t => {
        rows.push([date, t.id || 0, t.text || "", !!t.done, t.owner || "", t.category || "", t.priority || ""]);
      });
    });
  } else if (def.shape === "content") {
    header = ["date","title","type","pillar","notes"];
    rows = [];
    Object.keys(value || {}).sort().forEach(date => {
      (value[date] || []).forEach(p => {
        rows.push([date, p.title || "", p.type || "Post", p.pillar || "", p.notes || ""]);
      });
    });
  } else if (def.shape === "ideas") {
    header = ["kind","text"];
    rows = [];
    (value.general || []).forEach(t => rows.push(["general", t]));
    (value.video   || []).forEach(t => rows.push(["video",   t]));
  } else if (def.shape === "onboarding") {
    header = ["section","done","text","notes"];
    rows = [];
    ["intro","jobs","addedTo"].forEach(section => {
      (value[section] || []).forEach(it => {
        rows.push([section, !!it.done, it.text || "", it.notes || ""]);
      });
    });
    (value.olokasFullList || []).forEach(text => {
      rows.push(["olokasFullList", false, text, ""]);
    });
  }

  // Replace contents
  sh.clear();
  const all = [header].concat(rows);
  if (all.length && all[0].length) {
    sh.getRange(1, 1, all.length, all[0].length).setValues(all);
    sh.getRange(1, 1, 1, all[0].length).setFontWeight("bold").setBackground("#14295A").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
}

function normalizeCell_(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

// Convenience for the developer testing in the editor
function _selfTest() {
  Logger.log(JSON.stringify(readState_(), null, 2).slice(0, 2000));
}
