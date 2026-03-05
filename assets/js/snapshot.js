
/* Snapshot Builder + lightweight calculators (prototype). */
function bracketLabel(val){
  if(!val) return "Not provided";
  return val;
}

function generateSnapshot(form){
  const s = MS.loadState();
  const brand = s.session.brand || "Medi‑Solutions";
  const name = form.name || "Client";
  const zip = form.zip || "—";
  const turning = form.turning65 || "—";
  const stillWorking = form.stillWorking || "No";
  const employerSize = form.employerSize || "—";
  const income = bracketLabel(form.incomeBracket);
  const meds = form.meds || "Not sure";
  const goal = form.goal || "Compare options";

  const bullets = [];

  // Still working logic
  if(stillWorking === "Yes"){
    bullets.push(`Because you’re still working, your **employer size** matters. If your employer has **20+ employees**, you may be able to delay Part B without penalty (confirm with HR and your plan).`);
    bullets.push(`When you retire (or lose employer coverage), you typically get a **Special Enrollment Period** to enroll in Part B and pick coverage.`);
  } else {
    bullets.push(`If you’re not working (or your employer coverage ends), it’s important to align **Part B start** with your timeline to avoid gaps or penalties.`);
  }

  // IRMAA screening note
  if(income && income !== "Not provided"){
    bullets.push(`Based on your income bracket (**${income}**), you *may* be subject to **IRMAA** on Part B and Part D. We can confirm once we know your most recent tax year used by Medicare.`);
  } else {
    bullets.push(`If your income is higher, Medicare may apply **IRMAA** (income-related monthly adjustment) to Part B and Part D — we can screen it quickly.`);
  }

  // Meds
  if(meds === "Yes"){
    bullets.push(`Because medications matter, we should review your **drug list** to make sure Part D (or MAPD) coverage is a good fit.`);
  } else if(meds === "No"){
    bullets.push(`Even without many meds, Part D planning still matters — penalties can apply if you go without “creditable” drug coverage.`);
  }

  // Goal guidance
  if(/supp/i.test(goal) || /supplement/i.test(goal)){
    bullets.push(`If you’re leaning **Supplement**, we’ll focus on predictability and access — then pair with Part D and (if needed) dental/vision options.`);
  } else if(/adv/i.test(goal)){
    bullets.push(`If you’re leaning **Advantage**, we’ll compare networks, copays, referrals, and travel needs — plus confirm your doctors and meds.`);
  } else {
    bullets.push(`Next step is a quick comparison of **Advantage vs Supplement** based on your doctors, medications, travel plans, and budget comfort.`);
  }

  // Part D MOOP note (editable yearly)
  bullets.push(`For planning: the **Part D out-of-pocket cap** is set by year (example: 2026 cap noted as **$2,100**). We’ll confirm the current year’s figure when reviewing your drugs.`);

  const compliance = s.session.complianceMode ? `\n\n_${s.templates.compliancePhrases.join(" ")}_` : "";

  const snapshot = `# ${brand} — Medicare Snapshot\n\n**Client:** ${name}\n\n**Zip:** ${zip}\n**Turning 65:** ${turning}\n**Still working:** ${stillWorking}\n**Employer size:** ${employerSize}\n**Income bracket:** ${income}\n**Prescription needs:** ${meds}\n\n## What this means for you\n- ${bullets.join("\n- ")}\n\n## Recommended next step\nSchedule a quick Medicare review so we can confirm eligibility, check your doctors/meds, and compare plan options in your area.\n${compliance}`;

  return snapshot;
}

function upsertLeadFromSnapshot(form, snapshot){
  const s = MS.updateState(st=>{
    const lead = {
      id: MS.uid(),
      name: form.name || "Client",
      phone: form.phone || "",
      email: form.email || "",
      zip: form.zip || "",
      source: form.source || "AI Advisor",
      tags: [
        form.stillWorking==="Yes" ? "Still working" : "Not working",
        form.incomeBracket ? "IRMAA screen" : "Income unknown",
        form.goal ? form.goal : "General"
      ],
      status: "New",
      lastTouch: "Snapshot generated",
      nextAction: "Offer appointment",
      createdAt: new Date().toISOString(),
      snapshot
    };
    st.leads.unshift(lead);
  });
  return s;
}

window.Snapshot = { generateSnapshot, upsertLeadFromSnapshot };
