
function generateObjectionResponse(objection, style){
  const s = MS.loadState();
  const compliance = s.session.complianceMode ? s.templates.compliancePhrases[2] : "";
  const frames = {
    "It's free": [
      "You’re right — many plans have a $0 premium.",
      "The important part is how you pay when you *use* services: copays, deductibles, and networks.",
      "Let’s check your doctors, meds, and travel needs — then we’ll see what’s truly lowest cost for *you*."
    ],
    "Cheapest plan": [
      "Totally fair to want to keep costs down.",
      "The key is balancing premium with predictability and access.",
      "If I show you two options — one cheaper monthly, one more predictable — which way do you usually prefer?"
    ],
    "I'll wait": [
      "I get it — it’s a lot at once.",
      "The risk is timing: certain enrollment windows and penalties depend on dates.",
      "If we do a 10‑minute snapshot now, you’ll at least know your deadline and next best step."
    ],
    "Still working": [
      "Perfect — then the first question is employer size (20+).",
      "If it’s 20+, you may be able to delay Part B without penalty — but we should confirm with HR.",
      "Want to walk through a quick snapshot so you know your best timing?"
    ]
  };
  const base = frames[objection] || [
    "Good question — let’s simplify it.",
    "Here’s the one rule that usually decides this.",
    "Then we’ll confirm your options in your zip code."
  ];
  const closing = style==="Direct" ? "Want me to help you pick the next step today?" :
                  style==="Story" ? "I had a client in a similar spot — after we checked doctors and meds, the decision became obvious. Want to do that same quick check?" :
                  "If we review your doctors, meds, and budget comfort, we can confirm what fits best. Want to schedule a quick review?";
  return `${base.join(" ")}\n\n${closing}\n${compliance ? "\n" + compliance : ""}`;
}

function scoreReply(text){
  const t = (text||"").toLowerCase();
  let score = 50;
  const boosts = ["doctors","meds","network","copay","premium","eligibility","enroll","timeline","compare","next step"];
  boosts.forEach(w=>{ if(t.includes(w)) score += 4; });
  if(t.includes("guarantee")||t.includes("always")) score -= 10;
  if(t.length > 120) score += 6;
  if(t.length < 40) score -= 6;
  score = Math.max(0, Math.min(100, score));
  const notes = [];
  if(score>80) notes.push("Strong: clear, consultative, next step.");
  else if(score>60) notes.push("Good: add one more specific check (docs/meds/timeline).");
  else notes.push("Add structure: acknowledge → rule → example → next step.");
  if(t.includes("guarantee")||t.includes("always")) notes.push("Avoid absolutes; keep it eligibility-based.");
  return {score, notes};
}

window.Coach = { generateObjectionResponse, scoreReply };
