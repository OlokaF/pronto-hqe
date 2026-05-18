import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#060F2A", surface: "#0D1B3E", card: "#12234D",
  border: "#1B3460", gold: "#DC9F09", goldText: "#F0B823",
  text: "#E8EDF8", muted: "#6B7FA8", faint: "#182B52",
  vanja: "#A78BFA", oloka: "#34D399",
  urgent: "#F04438", high: "#DC9F09", normal: "#3B82F6", low: "#4A5568",
};

const PR = {
  Urgent: { color: "#F04438", bg: "rgba(240,68,56,0.13)" },
  High:   { color: "#DC9F09", bg: "rgba(220,159,9,0.13)" },
  Normal: { color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  Low:    { color: "#4A5568", bg: "rgba(74,85,104,0.15)" },
};

const CATS = ["Social Post","Email","Video","Design","Admin","Meeting","Other"];

let _uid = 11;

const SEED = {
  vanja: [
    { id:1, text:"Send staff newsletter", done:false, priority:"Urgent", cat:"Email" },
    { id:2, text:"Schedule social stories for the week", done:false, priority:"High", cat:"Social Post" },
    { id:3, text:"Create motivation emails for May", done:false, priority:"High", cat:"Email" },
    { id:4, text:"TH post — trade hire content", done:true, priority:"Normal", cat:"Social Post" },
    { id:5, text:"Update Pronto Challenge on website", done:false, priority:"Normal", cat:"Admin" },
    { id:6, text:"Create new calendar for next month", done:false, priority:"Low", cat:"Admin" },
  ],
  oloka: [
    { id:7, text:"Draft post — Trade Breakfast BBQ recap", done:false, priority:"Urgent", cat:"Social Post" },
    { id:8, text:"Edit photos from Trade Breakfast BBQ", done:true, priority:"High", cat:"Design" },
    { id:9, text:"YouTube script — Yanmar quick hitch", done:false, priority:"High", cat:"Video" },
    { id:10, text:"Photo competition winner template update", done:false, priority:"Normal", cat:"Design" },
    { id:11, text:"Machine hire story — Hydrema dumper", done:false, priority:"Normal", cat:"Social Post" },
    { id:12, text:"LinkedIn learning — 30 min", done:true, priority:"Low", cat:"Admin" },
  ],
};

const CAL = [
  { day:"MON", date:11, title:"Wheeled Digger Post", type:"Product Spotlight", status:"done" },
  { day:"TUE", date:12, title:"Trade BBQ Recap Post", type:"Event", status:"done" },
  { day:"WED", date:13, title:"May Promotion Launch", type:"Promotion", today:true, status:"today" },
  { day:"THU", date:14, title:"Site Action with a View", type:"Social Post", status:"upcoming" },
  { day:"FRI", date:15, title:"Pronto Pick — May", type:"Pronto Pick", status:"upcoming" },
];

const TC = {
  "Product Spotlight": "#3B82F6",
  "Event":            "#10B981",
  "Promotion":        "#DC9F09",
  "Social Post":      "#A78BFA",
  "Pronto Pick":      "#F59E0B",
  "Blog":             "#34D399",
  "Video":            "#F87171",
};

const MSGS = [
  { id:1, from:"vanja", text:"Hey Loka! Have you finished editing the BBQ photos yet?", time:"8:42" },
  { id:2, from:"oloka", text:"Almost done — should have them by 10. Which shots do you need first?", time:"8:51" },
  { id:3, from:"vanja", text:"Group shots for sure. Bronson wants one for the newsletter.", time:"8:53" },
  { id:4, from:"oloka", text:"On it! Also the Yanmar YouTube script is due this week 👀", time:"9:05" },
  { id:5, from:"vanja", text:"Yep let's touch base at lunch. Also the May promo post needs to go live today!", time:"9:12" },
  { id:6, from:"oloka", text:"On it — drafting the caption now. Want me to use the BBQ angle or go product-focused?", time:"9:14" },
];

function PriorityBadge({ priority, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pc = PR[priority];
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position:"relative", flexShrink:0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", gap:5, padding:"3px 9px",
        borderRadius:20, border:`1px solid ${pc.color}50`,
        background:pc.bg, color:pc.color,
        fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.02em",
        fontFamily:"inherit",
      }}>
        <span style={{ width:6,height:6,borderRadius:"50%",background:pc.color }}/>
        {priority}
        <span style={{ fontSize:9, opacity:0.7 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", right:0, zIndex:200,
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:8, overflow:"hidden", minWidth:110,
          boxShadow:"0 12px 32px rgba(0,0,0,0.5)",
        }}>
          {["Urgent","High","Normal","Low"].map(p => (
            <button key={p} onClick={() => { onChange(p); setOpen(false); }} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%",
              padding:"9px 12px", background: priority===p ? PR[p].bg : "transparent",
              border:"none", cursor:"pointer", color:PR[p].color,
              fontSize:12, fontWeight:700, textAlign:"left", fontFamily:"inherit",
            }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:PR[p].color }}/>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, assignee, onToggle, onChangePriority }) {
  const acc = assignee === "vanja" ? C.vanja : C.oloka;
  return (
    <div style={{
      display:"flex", alignItems:"flex-start", gap:10,
      padding:"11px 13px",
      background: task.done ? "rgba(255,255,255,0.02)" : C.card,
      border:`1px solid ${task.done ? C.faint : C.border}`,
      borderLeft:`3px solid ${task.done ? C.faint : acc}`,
      borderRadius:10, marginBottom:7,
      opacity: task.done ? 0.5 : 1,
      transition:"all 0.2s",
    }}>
      <button onClick={onToggle} style={{
        width:17, height:17, borderRadius:4, marginTop:2, flexShrink:0,
        border:`2px solid ${task.done ? acc : C.border}`,
        background: task.done ? acc : "transparent",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontSize:9, fontWeight:900,
      }}>
        {task.done && "✓"}
      </button>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{
          margin:"0 0 4px", fontSize:12, fontWeight:500, lineHeight:1.4,
          color: task.done ? C.muted : C.text,
          textDecoration: task.done ? "line-through" : "none",
        }}>{task.text}</p>
        <span style={{
          display:"inline-block", fontSize:10, color:C.muted,
          background:C.faint, padding:"1px 6px", borderRadius:4,
        }}>{task.cat}</span>
      </div>
      <PriorityBadge priority={task.priority} onChange={p => onChangePriority(task.id, p)} />
    </div>
  );
}

function Column({ assignee, tasks, filter, onToggle, onChangePriority, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [pri, setPri] = useState("Normal");
  const [cat, setCat] = useState("Social Post");
  const inputRef = useRef(null);
  const name = assignee === "vanja" ? "Vanja" : "Oloka";
  const acc = assignee === "vanja" ? C.vanja : C.oloka;
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const visible = filter === "All" ? tasks : filter === "Urgent" ? tasks.filter(t => t.priority === "Urgent") : tasks.filter(t => !t.done);
  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);
  const submit = () => {
    if (!text.trim()) { setAdding(false); return; }
    onAdd({ text:text.trim(), priority:pri, cat, done:false, id:_uid++ });
    setText(""); setPri("Normal"); setCat("Social Post"); setAdding(false);
  };
  const selStyle = {
    background:C.surface, border:`1px solid ${C.border}`,
    color:C.text, borderRadius:6, fontSize:11, padding:"5px 8px", cursor:"pointer", fontFamily:"inherit",
  };
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:`${acc}20`, border:`2px solid ${acc}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:acc, fontWeight:800, fontSize:14,
          }}>{name[0]}</div>
          <div>
            <p style={{ margin:0, color:C.text, fontWeight:700, fontSize:14, fontFamily:"Syne, sans-serif" }}>{name}</p>
            <p style={{ margin:0, color:C.muted, fontSize:11 }}>{done}/{tasks.length} done</p>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ margin:"0 0 4px", color:acc, fontSize:13, fontWeight:700 }}>{pct}%</p>
          <div style={{ width:56, height:4, background:C.faint, borderRadius:2 }}>
            <div style={{ width:`${pct}%`, height:"100%", background:acc, borderRadius:2, transition:"width 0.4s" }}/>
          </div>
        </div>
      </div>
      <div>
        {visible.map(t => (
          <TaskCard key={t.id} task={t} assignee={assignee}
            onToggle={() => onToggle(t.id)}
            onChangePriority={onChangePriority}
          />
        ))}
        {visible.length === 0 && (
          <p style={{ color:C.muted, fontSize:12, textAlign:"center", padding:"16px 0" }}>No tasks match this filter</p>
        )}
      </div>
      {adding ? (
        <div style={{ padding:"11px 13px", background:C.surface, border:`1px dashed ${acc}60`, borderRadius:10, marginBottom:7 }}>
          <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter") submit(); if(e.key==="Escape") setAdding(false); }}
            placeholder="Task description..."
            style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontSize:12, outline:"none", marginBottom:8, fontFamily:"inherit" }}
          />
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
            <select value={pri} onChange={e => setPri(e.target.value)} style={selStyle}>
              {["Urgent","High","Normal","Low"].map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={cat} onChange={e => setCat(e.target.value)} style={selStyle}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={submit} style={{ background:acc, border:"none", borderRadius:6, color: assignee==="oloka" ? C.bg : "#fff", fontSize:11, fontWeight:700, padding:"5px 13px", cursor:"pointer", fontFamily:"inherit" }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, fontSize:11, padding:"5px 10px", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{
          width:"100%", padding:"9px", background:"transparent",
          border:`1px dashed ${C.border}`, borderRadius:10,
          color:C.muted, fontSize:12, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          fontFamily:"inherit",
        }}>
          <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add task
        </button>
      )}
    </div>
  );
}

export default function ProntoHQ() {
  const [nav, setNav] = useState("today");
  const [tasks, setTasks] = useState(SEED);
  const [filter, setFilter] = useState("All");
  const [msgs, setMsgs] = useState(MSGS);
  const [draft, setDraft] = useState("");
  const [chatAs, setChatAs] = useState("oloka");
  const msgEnd = useRef(null);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const toggleTask = (a, id) => setTasks(p => ({ ...p, [a]: p[a].map(t => t.id===id ? {...t,done:!t.done} : t) }));
  const changePriority = (a, id, priority) => setTasks(p => ({ ...p, [a]: p[a].map(t => t.id===id ? {...t,priority} : t) }));
  const addTask = (a, data) => setTasks(p => ({ ...p, [a]: [...p[a], data] }));
  const sendMsg = () => {
    if (!draft.trim()) return;
    setMsgs(p => [...p, { id:p.length+1, from:chatAs, text:draft.trim(), time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    setDraft("");
  };

  const allTasks = [...tasks.vanja, ...tasks.oloka];
  const totalDone = allTasks.filter(t => t.done).length;
  const urgentCount = allTasks.filter(t => t.priority==="Urgent" && !t.done).length;

  const navBtn = (key, label, icon) => (
    <button key={key} onClick={() => setNav(key)} style={{
      display:"flex", alignItems:"center", gap:7, padding:"8px 18px",
      borderRadius:8,
      background: nav===key ? C.gold : "transparent",
      border: nav===key ? "none" : `1px solid ${C.border}`,
      color: nav===key ? C.bg : C.muted,
      fontWeight: nav===key ? 700 : 500, fontSize:13, cursor:"pointer", fontFamily:"Syne, sans-serif",
    }}>{icon}{label}</button>
  );

  const fBtn = (v, label) => (
    <button key={v} onClick={() => setFilter(v)} style={{
      padding:"5px 14px", borderRadius:20,
      background: filter===v ? C.gold : "transparent",
      border: filter===v ? "none" : `1px solid ${C.border}`,
      color: filter===v ? C.bg : C.muted,
      fontSize:11, fontWeight: filter===v ? 700 : 500, cursor:"pointer",
      fontFamily:"inherit",
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.bg, color:C.text, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        select option{background:${C.card};color:${C.text};}
        input::placeholder{color:${C.muted};}
        input[type=text]:focus{outline:none;}
      `}</style>

      {/* Header */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 28px", borderBottom:`1px solid ${C.border}`, background:C.surface, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:C.gold, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, color:C.bg, fontSize:17 }}>P</span>
          </div>
          <div>
            <p style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:17, letterSpacing:"-0.01em" }}>
              Pronto <span style={{ color:C.gold }}>HQ</span>
            </p>
            <p style={{ color:C.muted, fontSize:10, letterSpacing:"0.04em" }}>MARKETING & AI</p>
          </div>
        </div>
        <nav style={{ display:"flex", gap:6 }}>
          {navBtn("today", "Today", "📋")}
          {navBtn("calendar", "Calendar", "📅")}
          {navBtn("chat", "Chat", "💬")}
        </nav>
        <p style={{ color:C.muted, fontSize:12 }}>Wed 13 May 2026</p>
      </header>

      <main style={{ flex:1, padding:"22px 28px", overflowY:"auto" }}>

        {/* ── TODAY ── */}
        {nav === "today" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.02em", marginBottom:4 }}>Today's Tasks</h1>
                <p style={{ color:C.muted, fontSize:12 }}>Wednesday, 13 May 2026</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { label:"Total", val:allTasks.length, color:C.text },
                  { label:"Done", val:totalDone, color:C.oloka },
                  { label:"Urgent", val:urgentCount, color:C.urgent },
                ].map(s => (
                  <div key={s.label} style={{
                    padding:"8px 14px", background:C.surface, border:`1px solid ${C.border}`,
                    borderRadius:10, textAlign:"center", minWidth:64,
                  }}>
                    <p style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"Syne, sans-serif" }}>{s.val}</p>
                    <p style={{ fontSize:10, color:C.muted, letterSpacing:"0.04em" }}>{s.label.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div style={{ display:"flex", gap:6, marginBottom:18 }}>
              <span style={{ color:C.muted, fontSize:12, alignSelf:"center", marginRight:4 }}>Filter:</span>
              {fBtn("All", "All Tasks")}
              {fBtn("Urgent", "🔴 Urgent")}
              {fBtn("Incomplete", "Incomplete")}
            </div>

            <div style={{ display:"flex", gap:22 }}>
              <Column assignee="vanja" tasks={tasks.vanja} filter={filter}
                onToggle={id => toggleTask("vanja", id)}
                onChangePriority={(id,p) => changePriority("vanja", id, p)}
                onAdd={data => addTask("vanja", data)}
              />
              <Column assignee="oloka" tasks={tasks.oloka} filter={filter}
                onToggle={id => toggleTask("oloka", id)}
                onChangePriority={(id,p) => changePriority("oloka", id, p)}
                onAdd={data => addTask("oloka", data)}
              />
            </div>
          </div>
        )}

        {/* ── CALENDAR ── */}
        {nav === "calendar" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.02em", marginBottom:4 }}>Content Calendar</h1>
              <p style={{ color:C.muted, fontSize:12 }}>Week of 11–15 May 2026</p>
            </div>

            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              {CAL.map(d => (
                <div key={d.day} style={{
                  flex:1, minWidth:0,
                  background: d.today ? `linear-gradient(160deg, ${C.gold}15, transparent)` : C.card,
                  border:`1.5px solid ${d.today ? C.gold : C.border}`,
                  borderRadius:12, padding:"14px",
                  position:"relative",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <p style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:"0.08em", marginBottom:3 }}>{d.day}</p>
                      <p style={{ fontSize:24, fontWeight:800, fontFamily:"Syne, sans-serif", color: d.today ? C.gold : C.text }}>{d.date}</p>
                    </div>
                    {d.today && <span style={{ background:C.gold, color:C.bg, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20, letterSpacing:"0.07em" }}>TODAY</span>}
                    {d.status === "done" && <span style={{ background:"rgba(52,211,153,0.15)", color:"#34D399", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20 }}>DONE</span>}
                  </div>
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                    <span style={{
                      display:"inline-block", fontSize:9, fontWeight:800, letterSpacing:"0.05em",
                      color: TC[d.type] || C.muted,
                      background:`${TC[d.type] || C.muted}18`,
                      padding:"2px 8px", borderRadius:20, marginBottom:7,
                    }}>{d.type.toUpperCase()}</span>
                    <p style={{ fontSize:12, fontWeight:600, color:C.text, lineHeight:1.4 }}>{d.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px" }}>
              <p style={{ fontWeight:700, fontSize:13, marginBottom:12, fontFamily:"Syne, sans-serif" }}>📋 Monthly Pillars</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["1× Pronto Pick","1× Blog (SEO)","1× Case Study","2× Point of Difference","1× Staff Profile","1–2× Reels","Weekly fleet feature"].map(p => (
                  <span key={p} style={{
                    fontSize:11, color:C.muted,
                    background:C.faint, border:`1px solid ${C.border}`,
                    padding:"4px 10px", borderRadius:20,
                  }}>• {p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {nav === "chat" && (
          <div style={{ maxWidth:660, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.02em", marginBottom:4 }}>Team Chat</h1>
                <p style={{ color:C.muted, fontSize:12 }}>Vanja & Oloka</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:C.muted }}>Chatting as:</span>
                {["vanja","oloka"].map(u => (
                  <button key={u} onClick={() => setChatAs(u)} style={{
                    padding:"6px 14px", borderRadius:20,
                    background: chatAs===u ? (u==="vanja" ? C.vanja : C.oloka) : "transparent",
                    border:`1px solid ${u==="vanja" ? C.vanja : C.oloka}`,
                    color: chatAs===u ? (u==="oloka" ? C.bg : "#fff") : (u==="vanja" ? C.vanja : C.oloka),
                    fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  }}>{u==="vanja" ? "Vanja" : "Oloka"}</button>
                ))}
              </div>
            </div>

            <div style={{
              background:C.surface, border:`1px solid ${C.border}`, borderRadius:14,
              padding:"18px", marginBottom:10,
              maxHeight:420, overflowY:"auto",
              display:"flex", flexDirection:"column", gap:14,
            }}>
              {msgs.map(m => {
                const me = m.from === chatAs;
                const acc = m.from==="vanja" ? C.vanja : C.oloka;
                return (
                  <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems: me ? "flex-end" : "flex-start" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      {!me && (
                        <div style={{
                          width:22, height:22, borderRadius:"50%",
                          background:`${acc}25`, border:`1.5px solid ${acc}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:10, fontWeight:800, color:acc,
                        }}>{m.from==="vanja" ? "V" : "O"}</div>
                      )}
                      <span style={{ color:C.muted, fontSize:11 }}>{m.time}</span>
                    </div>
                    <div style={{
                      maxWidth:"76%", padding:"9px 13px",
                      borderRadius: me ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                      background: me ? acc : C.card,
                      color: me ? (m.from==="oloka" ? C.bg : "#fff") : C.text,
                      fontSize:13, lineHeight:1.5,
                    }}>{m.text}</div>
                  </div>
                );
              })}
              <div ref={msgEnd}/>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <input
                value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key==="Enter" && sendMsg()}
                placeholder={`Message as ${chatAs==="vanja" ? "Vanja" : "Oloka"}...`}
                style={{
                  flex:1, padding:"11px 15px",
                  background:C.surface, border:`1px solid ${C.border}`,
                  borderRadius:10, color:C.text, fontSize:13, outline:"none", fontFamily:"inherit",
                }}
              />
              <button onClick={sendMsg} style={{
                padding:"11px 20px", background:C.gold, border:"none",
                borderRadius:10, color:C.bg, fontWeight:700, fontSize:13,
                cursor:"pointer", fontFamily:"inherit",
              }}>Send</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
