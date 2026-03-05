
function renderLeadsTable(targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  const s = MS.loadState();
  const leads = s.leads || [];
  const rows = leads.map(l=>{
    const tagHtml = (l.tags||[]).slice(0,3).map(t=>`<span class="pill">${MS.escapeHtml(t)}</span>`).join(" ");
    return `<tr>
      <td>${MS.escapeHtml(l.name||"")}</td>
      <td>${MS.escapeHtml(l.source||"")}</td>
      <td>${tagHtml}</td>
      <td><span class="pill ${l.status==="New"?"warn":l.status==="Appointment Set"?"good":""}">${MS.escapeHtml(l.status||"")}</span></td>
      <td>${MS.escapeHtml(l.nextAction||"")}</td>
      <td class="small muted">${MS.formatDate(l.createdAt)}</td>
      <td><button class="btn" data-view="${l.id}">View</button></td>
    </tr>`;
  }).join("");
  el.innerHTML = `
    <table class="table">
      <thead><tr>
        <th>Name</th><th>Source</th><th>Tags</th><th>Status</th><th>Next action</th><th>Created</th><th></th>
      </tr></thead>
      <tbody>${rows || ""}</tbody>
    </table>
  `;
  el.querySelectorAll("button[data-view]").forEach(btn=>{
    btn.addEventListener("click", ()=>openLead(btn.dataset.view));
  });
}

function openLead(id){
  const s = MS.loadState();
  const lead = (s.leads||[]).find(l=>l.id===id);
  if(!lead) return;
  const modal = document.getElementById("leadModal");
  const body = document.getElementById("leadModalBody");
  if(!modal || !body) return;

  body.innerHTML = `
    <div class="row between">
      <div>
        <div class="h2">${MS.escapeHtml(lead.name||"")}</div>
        <div class="muted small">${MS.escapeHtml(lead.phone||"")} • ${MS.escapeHtml(lead.email||"")} • ${MS.escapeHtml(lead.zip||"")}</div>
      </div>
      <span class="pill">${MS.escapeHtml(lead.source||"")}</span>
    </div>
    <hr/>
    <div class="grid cols-2">
      <div class="card pad">
        <div class="h3">Status</div>
        <select id="leadStatus">
          ${["New","Contacted","Appointment Set","Quote Sent","Enrolled","Nurture"].map(x=>`<option ${lead.status===x?"selected":""}>${x}</option>`).join("")}
        </select>
        <label style="margin-top:10px">Next action</label>
        <input class="input" id="leadNext" value="${MS.escapeHtml(lead.nextAction||"")}"/>
        <div class="row" style="margin-top:10px; flex-wrap:wrap">
          <button class="btn primary" id="saveLead">Save</button>
          <button class="btn" id="copySms">Copy SMS</button>
          <button class="btn" id="copyEmail">Copy Email</button>
        </div>
      </div>
      <div class="card pad">
        <div class="h3">Snapshot (if available)</div>
        <div class="copy" style="max-height:220px; overflow:auto; padding:10px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.02)">${MS.escapeHtml(lead.snapshot||"No snapshot saved yet.")}</div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="copySnapshot">Copy Snapshot</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("saveLead").onclick = ()=>{
    const status = document.getElementById("leadStatus").value;
    const next = document.getElementById("leadNext").value;
    MS.updateState(st=>{
      const l = st.leads.find(x=>x.id===id);
      if(l){ l.status=status; l.nextAction=next; l.lastTouch="Updated in portal"; }
    });
    MS.toast("Lead updated.");
    closeLeadModal();
    renderLeadsTable("leadsTable");
  };

  document.getElementById("copySnapshot").onclick = ()=>MS.copyToClipboard(lead.snapshot||"");
  document.getElementById("copySms").onclick = ()=>MS.copyToClipboard(`Hi ${lead.name?.split(" ")[0]||""} — got your Medicare snapshot. Want to book a quick review call this week?`);
  document.getElementById("copyEmail").onclick = ()=>MS.copyToClipboard(`Subject: Your Medicare Snapshot\n\nHi ${lead.name||""},\n\nThanks for requesting a Medicare snapshot. If you'd like, we can review your options and confirm the next steps together.\n\nBook here: ${MS.loadState().settings.bookingUrl}\n`);

  modal.style.display="block";
}

function closeLeadModal(){
  const modal = document.getElementById("leadModal");
  if(modal) modal.style.display="none";
}
window.Leads = { renderLeadsTable, closeLeadModal };
