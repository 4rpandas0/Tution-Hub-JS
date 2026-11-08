import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {listStudents, saveStudent, deleteStudent} from "../students.js";
import {listBatches} from "../batches.js";
import {studentForm} from "../forms.js";
import {boot} from "../app.js";

export async function render(){
 const [s,b]=await Promise.all([listStudents(),listBatches()]);
 const raw=$("#studentSearch")?.value||"",q=raw.toLowerCase(),f=$("#studentBatch")?.value||"",st=$("#studentStatus")?.value||"";
 const rows=s.filter(x=>(x.name.toLowerCase().includes(q)||x.phone.includes(q))&&(!f||x.batchId===f)&&(!st||x.status===st)).map(x=>`<tr><td><div class="person"><div class="avatar">${esc(x.name[0]?.toUpperCase())}</div><div><b>${esc(x.name)}</b><small>${esc(x.id)}</small></div></div></td><td>${esc(x.phone)}</td><td>${esc(batchName(x.batchId,b))}</td><td>${money(x.fee)}</td><td><span class="badge ${x.status==="Active"?"green":"gray"}">${esc(x.status)}</span></td><td>${rowActions("student",x.id)}</td></tr>`).join("");
 return `<div class="toolbar"><div class="search-box">${icon("search")}<input id="studentSearch" placeholder="Search name or phone..." value="${esc(raw)}"></div><select id="studentBatch"><option value="">All batches</option>${b.map(x=>`<option value="${x.id}" ${f===x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select><select id="studentStatus"><option value="">All statuses</option><option ${st==="Active"?"selected":""}>Active</option><option ${st==="Inactive"?"selected":""}>Inactive</option></select><button class="btn btn-primary" data-action="add-student">${icon("plus")} Add student</button></div><section class="content-card">${s.length?table(["Student","Phone","Batch","Monthly fee","Status","Actions"],rows):empty("No students added yet","Add your first student to start managing your centre")}</section>`;
}

export async function act(a, btn) {
 const id = btn.dataset.id;
 if(a==="add-student")return studentForm()();if(a==="edit-student")return studentForm(id)();
 if(a==="delete-student"){if(confirm("Delete this student? Related attendance and payment history will remain for record keeping.")){await deleteStudent(id);toast("Student deleted");await render()}return}
}

// Text box re-renders on every keystroke; selects only on change, so the page
// is never rebuilt twice for one edit (which would drop focus).
export function onInput(e) { return e.target.id === "studentSearch" }
export function onChange(e) { return e.target.id === "studentBatch" || e.target.id === "studentStatus" }

boot({ render, act, onInput, onChange });
