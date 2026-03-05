
/* Content Engine generator (template-based). */
function genOutputs({pillar, topic, angle, tone, cta, platform, length}){
  const s = MS.loadState();
  const brand = s.session.brand || "Medi‑Solutions";
  const compliance = s.session.complianceMode ? s.templates.compliancePhrases[0] : "";
  const hook = s.templates.hookBank[Math.floor(Math.random()*s.templates.hookBank.length)];
  const len = length || "30s";

  const script = [
    `HOOK: ${hook}`,
    ``,
    `TOPIC: ${topic}`,
    `ANGLE: ${angle || "Clear, practical guidance"}`,
    ``,
    `SCRIPT (${len}):`,
    `1) One-sentence setup (who this is for).`,
    `2) The key rule in plain English.`,
    `3) One example that makes it real.`,
    `4) Next step + CTA.`,
    ``,
    `CTA: ${cta || `Get a personalized Medicare snapshot at ${s.settings.siteUrl}/ai-advisor`}`,
    compliance ? `\n${compliance}` : ""
  ].filter(Boolean).join("\n");

  const caption = [
    `${topic} — quick breakdown.`,
    angle ? `\n${angle}` : "",
    `\nWant a personalized Medicare snapshot?`,
    `${cta || `Start here: ${s.settings.siteUrl}/ai-advisor`}`,
    compliance ? `\n\n${compliance}` : ""
  ].join("\n");

  const linkedin = [
    `Medicare question I’m getting a lot lately: ${topic}.`,
    ``,
    `Here’s the simple way to think about it:`,
    `• ${angle || "One key rule + what to do next"}`,
    ``,
    `If you want help reviewing your options, we can walk through a quick snapshot and confirm eligibility.`,
    `${cta || `Start here: ${s.settings.siteUrl}/ai-advisor`}`,
    compliance ? `\n\n${compliance}` : ""
  ].join("\n");

  const email = [
    `Subject: ${topic} (quick, plain-English guide)`,
    ``,
    `Hi <First Name>,`,
    ``,
    `If you’ve been wondering about ${topic.toLowerCase()}, here’s the simple version:`,
    `- ${angle || "One key rule + the next step to avoid surprises."}`,
    ``,
    `If you want, you can get a personalized Medicare snapshot in 2 minutes and we’ll confirm next steps together.`,
    `${cta || `${s.settings.siteUrl}/ai-advisor`}`,
    compliance ? `\n\n${compliance}` : ""
  ].join("\n");

  const blog = [
    `SEO Title: ${topic} — What to Know`,
    `Meta description: ${angle || "Plain-English explanation plus what to do next."}`,
    ``,
    `Outline:`,
    `1) Why this question matters`,
    `2) The rule in plain English`,
    `3) Common mistakes to avoid`,
    `4) How to decide (simple checklist)`,
    `5) Next steps + invitation to a review`,
    ``,
    `CTA: ${cta || `Get your Medicare snapshot: ${s.settings.siteUrl}/ai-advisor`}`,
    compliance ? `\n\n${compliance}` : ""
  ].join("\n");

  return {script, caption, linkedin, email, blog};
}

function saveDraft(payload, outputs){
  MS.updateState(st=>{
    st.contentDrafts.unshift({
      id: MS.uid(),
      createdAt: new Date().toISOString(),
      payload,
      outputs,
      status: "Draft"
    });
  });
}

function submitForApproval(draftId){
  MS.updateState(st=>{
    const d = st.contentDrafts.find(x=>x.id===draftId);
    if(!d) return;
    d.status = "Submitted";
    st.approvals.unshift({id: MS.uid(), draftId, submittedAt: new Date().toISOString(), status:"Pending"});
  });
}

window.ContentEngine = { genOutputs, saveDraft, submitForApproval };
