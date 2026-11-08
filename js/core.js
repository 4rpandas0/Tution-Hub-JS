// Shared helpers for every page: DOM, formatting, modals, theme, sheet.
export const $ = s=>document.querySelector(s);
export const esc = s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
export const today=()=>new Date().toISOString().slice(0,10), month=()=>today().slice(0,7);
export const monthName=m=>new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN",{month:"long",year:"numeric"});

// Let any module ask the current page to re-render itself.
export function requestRefresh() { document.dispatchEvent(new CustomEvent("app:refresh")) }

export function toast(msg,error=false){const n=document.createElement("div");n.className="toast"+(error?" error":"");n.textContent=msg;$("#toastRoot").append(n);setTimeout(()=>n.remove(),3000)}
export function icon(name){return `<i data-lucide="${name}"></i>`}
export function refreshIcons(){window.lucide?.createIcons()}
export function empty(label,sub="Add a record to get started"){return `<div class="empty">${icon("inbox")}<b>${label}</b>${sub}</div>`}
export function modal(title,body){$("#modalRoot").innerHTML=`<div class="modal-backdrop" data-close><section class="modal"><button class="icon-btn modal-close" data-close>${icon("x")}</button><h2>${esc(title)}</h2>${body}</section></div>`;refreshIcons()}
export function closeModal(){$("#modalRoot").innerHTML=""}
export function field(label,name,value="",type="text",required=true,extra=""){return `<div class="form-group"><label>${label}${required?" *":""}</label><input class="field" name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""} ${extra}></div>`}
export function selectField(label,name,options,value=""){return `<div class="form-group"><label>${label} *</label><select class="field" name="${name}" required><option value="">Select ${label.toLowerCase()}</option>${options.map(o=>`<option value="${esc(o.value)}" ${o.value===value?"selected":""}>${esc(o.label)}</option>`).join("")}</select></div>`}
export function formModal(title,fields,submitText,handler){modal(title,`<form id="modalForm"><div class="form-grid">${fields}</div><div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary">${submitText}</button></div></form>`);$("#modalForm").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));try{await handler(d);closeModal();toast("Saved successfully");requestRefresh()}catch(err){toast(err.message,true)}}}
export function studentName(id,students){return students.find(s=>s.id===id)?.name||"Deleted student"}
export function batchName(id,batches){return batches.find(b=>b.id===id)?.name||"No batch"}
export function stat(label,value,ic,foot=""){return `<article class="stat-card"><div class="stat-head">${label}<span class="stat-icon">${icon(ic)}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></article>`}
export function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows||""}</tbody></table></div>`}
export function rowActions(type,id){return `<div class="actions"><button title="Edit" data-action="edit-${type}" data-id="${id}">${icon("pencil")}</button><button title="Delete" data-action="delete-${type}" data-id="${id}">${icon("trash-2")}</button></div>`}
export function applyTheme(t, persist = true) {
  document.documentElement.dataset.theme = t;
  if (persist) { try { localStorage.setItem("th-theme", t) } catch (e) {} }
  const html = icon(t === "dark" ? "sun" : "moon");
  ["#themeToggle", "#themeToggleTop"].forEach(s => { const b = $(s); if (b) b.innerHTML = html });
  const sheetIcon = $("#sheetThemeIcon"); if (sheetIcon) sheetIcon.innerHTML = html;
  refreshIcons();
  document.dispatchEvent(new CustomEvent("app:theme", { detail: t }));
}
export function toggleTheme() { applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark") }
export function initTheme() {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light", false);
  document.querySelectorAll("#themeToggle,#themeToggleTop,#sheetTheme").forEach(b => b.addEventListener("click", toggleTheme));
}
// Bottom-nav "More" sheet.
export function initSheet() {
  const sheet = $("#moreSheet"), scrim = $("#sheetScrim"), tab = $("#moreTab");
  if (!sheet || !scrim || !tab) return;
  const close = () => { sheet.classList.remove("open"); scrim.classList.remove("show"); tab.setAttribute("aria-expanded", "false") };
  const open = () => { sheet.classList.add("open"); scrim.classList.add("show"); tab.setAttribute("aria-expanded", "true") };
  tab.addEventListener("click", () => sheet.classList.contains("open") ? close() : open());
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close() });
}
