import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {listBatches, saveBatch, deleteBatch} from "../batches.js";
import {listStudents} from "../students.js";
import {batchForm} from "../forms.js";
import {boot} from "../app.js";

export async function render(){
 const [b,s]=await Promise.all([listBatches(),listStudents()]);
 const rows=b.map(x=>{const count=s.filter(y=>y.batchId===x.id).length;return `<tr><td><b>${esc(x.name)}</b><small class="muted" style="display:block">${esc(x.id)}</small></td><td>${esc(x.subject)}</td><td>${esc(x.teacher)}</td><td>${esc(x.schedule)} · ${esc(x.start)}–${esc(x.end)}</td><td><span class="badge ${count>=x.capacity?"red":"green"}">${count} / ${x.capacity}</span></td><td><button class="btn btn-secondary btn-small" data-action="batch-students" data-id="${x.id}">Students</button></td><td>${rowActions("batch",x.id)}</td></tr>`}).join("");
 return `<div class="toolbar"><div style="flex:1"></div><button class="btn btn-primary" data-action="add-batch">${icon("plus")} Create batch</button></div><section class="content-card">${b.length?table(["Batch","Subject","Teacher","Schedule","Capacity","Roster","Actions"],rows):empty("No batches created yet","Create a batch before enrolling students")}</section>`;
}

export async function act(a, btn) {
 const id = btn.dataset.id;
 if(a==="add-batch")return batchForm();if(a==="edit-batch")return batchForm(id);
 if(a==="delete-batch"){const s=await listStudents();if(s.some(x=>x.batchId===id))return toast("Move or delete students in this batch first.",true);if(confirm("Delete this batch?")){await deleteBatch(id);toast("Batch deleted");await render()}return}
 if(a==="batch-students"){const [s,b]=await Promise.all([listStudents(),listBatches()]);const batch=b.find(x=>x.id===id);modal(`${batch.name} — students`,s.filter(x=>x.batchId===id).map(x=>`<div class="list-row"><b>${esc(x.name)}</b><span class="muted">${esc(x.phone)}</span></div>`).join("")||empty("No students in this batch"))}
}

boot({ render, act });
