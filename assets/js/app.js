
/* Medi‑Solutions AI Agent Suite — Local prototype (no backend).
   Data stores in localStorage for easy GitHub Pages hosting.
*/
const STORE_KEY = "ms_ai_suite_v1";

function nowISO(){ return new Date().toISOString(); }
function uid(){
  return Math.random().toString(16).slice(2) + "-" + Math.random().toString(16).slice(2);
}

function defaultState(){
  return {
    session: { role: "agent", brand: "Medi‑Solutions", theme: "dark", complianceMode: true },
    settings: {
      bookingUrl: "https://calendly.com/",
      advisorEmail: "advisor@medi-solutions.org",
      advisorPhone: "732-308-9500",
      siteUrl: "https://www.medi-solutions.org"
    },
    weeklyTheme: {
      title: "IRMAA Week",
      focus: "Explain IRMAA simply + drive to the AI Advisor snapshot.",
      pillar: "Costs & Savings",
      updatedAt: nowISO()
    },
    templates: seedTemplates(),
    leads: seedLeads(),
    contentDrafts: [],
    approvals: [],
    library: seedLibrary()
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw){ const s = defaultState(); saveState(s); return s; }
    const parsed = JSON.parse(raw);
    // lightweight forward-compat
    return Object.assign(defaultState(), parsed);
  }catch(e){
    const s = defaultState(); saveState(s); return s;
  }
}
function saveState(state){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function updateState(mutator){
  const s = loadState();
  mutator(s);
  saveState(s);
  return s;
}

function setActiveNav(){
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach(a=>{
    const href = (a.getAttribute("href")||"").toLowerCase();
    if(href === page) a.classList.add("active"); else a.classList.remove("active");
  });
}

function applyTheme(){
  const s = loadState();
  document.documentElement.dataset.theme = s.session.theme === "light" ? "light":"dark";
  const t = document.getElementById("themeLabel");
  if(t) t.textContent = s.session.theme === "light" ? "Light" : "Dark";
  const b = document.getElementById("brandLabel");
  if(b) b.textContent = s.session.brand || "Medi‑Solutions";
  const c = document.getElementById("complianceLabel");
  if(c) c.textContent = s.session.complianceMode ? "Compliance: On" : "Compliance: Off";
}

function wireTopbar(){
  const roleSel = document.getElementById("roleSelect");
  if(roleSel){
    const s = loadState();
    roleSel.value = s.session.role || "agent";
    roleSel.addEventListener("change", ()=>{
      updateState(st=>{ st.session.role = roleSel.value; });
      applyRoleVisibility();
    });
  }
  const toggleTheme = document.getElementById("toggleTheme");
  if(toggleTheme){
    toggleTheme.addEventListener("click", ()=>{
      updateState(st=>{ st.session.theme = st.session.theme === "light" ? "dark":"light"; });
      applyTheme();
    });
  }
  const toggleCompliance = document.getElementById("toggleCompliance");
  if(toggleCompliance){
    toggleCompliance.addEventListener("click", ()=>{
      updateState(st=>{ st.session.complianceMode = !st.session.complianceMode; });
      applyTheme();
    });
  }
  const brandSel = document.getElementById("brandSelect");
  if(brandSel){
    const s = loadState();
    brandSel.value = s.session.brand || "Medi‑Solutions";
    brandSel.addEventListener("change", ()=>{
      updateState(st=>{ st.session.brand = brandSel.value; });
      applyTheme();
    });
  }
}

function applyRoleVisibility(){
  const s = loadState();
  const role = s.session.role || "agent";
  document.querySelectorAll("[data-role]").forEach(el=>{
    const allowed = el.dataset.role.split(",").map(x=>x.trim());
    el.style.display = allowed.includes(role) ? "" : "none";
  });
  const roleLabel = document.getElementById("roleLabel");
  if(roleLabel) roleLabel.textContent = role.toUpperCase();
}

function toast(msg){
  const el = document.createElement("div");
  el.className = "card pad";
  el.style.position="fixed";
  el.style.right="18px";
  el.style.bottom="18px";
  el.style.maxWidth="420px";
  el.style.zIndex="99";
  el.innerHTML = `<div class="row between"><div class="h3">Done</div><button class="btn ghost" aria-label="Close">✕</button></div>
                  <div class="muted small" style="margin-top:8px">${escapeHtml(msg)}</div>`;
  el.querySelector("button").onclick=()=>el.remove();
  document.body.appendChild(el);
  setTimeout(()=>{ if(el.isConnected) el.remove(); }, 4200);
}

function escapeHtml(str){
  return (str||"").replace(/[&<>"']/g, s=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[s]));
}

// -------- seeded content --------
function seedTemplates(){
  return {
    pillars: [
      {name:"Medicare Basics", desc:"Beginner-friendly explainers that build trust."},
      {name:"Mistakes & Warnings", desc:"Shareable pitfalls + urgency without fear-mongering."},
      {name:"Costs & Savings", desc:"Premiums, IRMAA, Part D, hidden costs, savings moves."},
      {name:"Retirement Timing", desc:"Still working, retiring soon, spouse coverage, SEP."},
      {name:"Client Scenarios", desc:"Realistic examples, anonymized, story-based teaching."}
    ],
    tones: ["Warm & clear","Professional","Direct & punchy","Storytelling","High-trust educator"],
    topicPacks: [
      {pillar:"Costs & Savings", topic:"IRMAA explained in plain English", angle:"Why some people pay more + what to do next"},
      {pillar:"Retirement Timing", topic:"Turning 65 but still working", angle:"Employer size matters (20+)"},
      {pillar:"Medicare Basics", topic:"Medicare Advantage vs Supplement", angle:"How they differ + who each fits"},
      {pillar:"Mistakes & Warnings", topic:"The Part B late enrollment penalty", angle:"When it applies + how to avoid"},
      {pillar:"Client Scenarios", topic:"Client retiring mid‑year", angle:"Timing Part B + drug coverage decisions"}
    ],
    hookBank: [
      "Turning 65 soon? Here’s the 60‑second rule most people miss.",
      "If you’re still working at 65, this one question changes everything.",
      "Medicare costs can surprise you — especially if your income is higher.",
      "Before you pick a plan, understand this one difference.",
      "Quick myth-buster: “$0 premium” doesn’t always mean “$0 cost.”"
    ],
    compliancePhrases: [
      "Educational content only — plan availability and costs vary by area and eligibility.",
      "We can review your options and confirm eligibility with you.",
      "For personalized advice, speak with a licensed agent."
    ]
  };
}

function seedLeads(){
  const today = new Date();
  const day = 24*3600*1000;
  return [
    {id:uid(), name:"Linda R.", phone:"(732) 555‑0184", email:"linda@example.com", zip:"07728", source:"YouTube", tags:["Turning 65","Still working"], status:"New", lastTouch:"—", nextAction:"Send snapshot + book review", createdAt:new Date(today-day*1).toISOString()},
    {id:uid(), name:"Mark D.", phone:"(201) 555‑0137", email:"mark@example.com", zip:"07030", source:"Facebook", tags:["IRMAA risk"], status:"Appointment Set", lastTouch:"Texted confirmation", nextAction:"Pre‑call checklist", createdAt:new Date(today-day*3).toISOString()},
    {id:uid(), name:"Janet P.", phone:"(609) 555‑0129", email:"janet@example.com", zip:"08753", source:"Google", tags:["Med Supp"], status:"Contacted", lastTouch:"Left voicemail", nextAction:"Follow‑up SMS", createdAt:new Date(today-day*6).toISOString()}
  ];
}

function seedLibrary(){
  return [
    {id:uid(), type:"Script", title:"Turning 65 — first call opener", body:"Hi <Name>, this is <Agent> with Medi‑Solutions. I saw you requested a Medicare snapshot. Quick question: are you still working, or are you retiring soon?"},
    {id:uid(), type:"Compliance", title:"Standard footer for posts", body:"Educational only. Plan availability and costs vary. For personalized guidance, speak with a licensed agent."},
    {id:uid(), type:"Playbook", title:"Advantage vs Supplement explanation", body:"Use a simple frame: (1) network & referrals, (2) cost structure, (3) predictability, (4) travel, (5) medications."}
  ];
}

// -------- helpers used by pages --------
function kpiFromLeads(leads){
  const total = leads.length;
  const newCount = leads.filter(l=>l.status==="New").length;
  const appt = leads.filter(l=>l.status==="Appointment Set").length;
  const nurture = leads.filter(l=>l.status==="Nurture").length;
  return {total,newCount,appt,nurture};
}

function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString(undefined,{month:"short", day:"numeric", year:"numeric"});
  }catch(e){ return iso || ""; }
}

function copyToClipboard(text){
  navigator.clipboard.writeText(text||"").then(()=>toast("Copied to clipboard."));
}

window.MS = {
  loadState, saveState, updateState,
  setActiveNav, applyTheme, wireTopbar, applyRoleVisibility,
  toast, escapeHtml, formatDate, copyToClipboard, kpiFromLeads,
  uid,
  nowISO
};

document.addEventListener("DOMContentLoaded", ()=>{
  setActiveNav();
  applyTheme();
  wireTopbar();
  applyRoleVisibility();
});
