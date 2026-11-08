import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {listBatches} from "../batches.js";
import {listStudents} from "../students.js";
import {listAttendance, saveSession} from "../attendance.js";
import {boot} from "../app.js";

let currentMarks = {}, attendanceBatch = "", attendanceDate = today();

export async function render(){
 const [b,s,a]=await Promise.all([listBatches(),listStudents(),listAttendance()]);
 if(!attendanceBatch&&b[0])attendanceBatch=b[0].id;
 const members=s.filter(x=>x.batchId===attendanceBatch&&x.status==="Active");
 const saved=a.filter(x=>x.batchId===attendanceBatch&&x.date===attendanceDate);
 const marks={};members.forEach(x=>marks[x.id]=currentMarks[x.id]||saved.find(y=>y.studentId===x.id)?.status||"Present");
 currentMarks=marks;
 return `<section class="panel"><div class="toolbar"><div class="form-group" style="min-width:170px;flex:1"><label>Select batch</label><select id="attendanceBatch">${b.map(x=>`<option value="${x.id}" ${x.id===attendanceBatch?"selected":""}>${esc(x.name)}</option>`).join("")}</select></div><div class="form-group" style="min-width:150px;flex:1"><label>Attendance date</label><input id="attendanceDate" class="field" type="date" value="${attendanceDate}"></div></div><div class="notice">Mark each student as present, absent or late. Saving again updates the same session without creating duplicates.</div>${members.length?members.map(x=>`<div class="attendance-row"><div class="person"><div class="avatar">${esc(x.name[0]?.toUpperCase())}</div><div><b>${esc(x.name)}</b><small>${esc(x.phone)}</small></div></div><div class="attendance-actions">${["Present","Absent","Late"].map(v=>`<button data-action="mark" data-id="${x.id}" data-status="${v}" class="${marks[x.id]===v?"selected "+v.toLowerCase():""}">${v}</button>`).join("")}</div></div>`).join(""):empty("No active students in this batch")}<div class="form-actions"><button class="btn btn-primary" data-action="save-attendance" ${!members.length?"disabled":""}>${icon("save")} Save attendance</button></div></section><section class="panel" style="margin-top:16px"><div class="panel-head"><h3>Attendance history</h3><span class="muted">${saved.length} records on selected date</span></div>${saved.length?table(["Student","Status","Date"],saved.map(x=>`<tr><td>${esc(studentName(x.studentId,s))}</td><td><span class="badge ${x.status==="Present"?"green":x.status==="Absent"?"red":"amber"}">${x.status}</span></td><td>${x.date}</td></tr>`).join("")):empty("No saved attendance for this date")}</section>`;
}

export async function act(a, btn) {
 const id = btn.dataset.id;
 if(a==="mark"){currentMarks[id]=btn.dataset.status;document.querySelectorAll(`[data-action="mark"][data-id="${id}"]`).forEach(x=>{x.className=x.dataset.status===currentMarks[id]?"selected "+currentMarks[id].toLowerCase():""});return}
 if(a==="save-attendance"){try{await saveSession(attendanceBatch,attendanceDate,currentMarks);toast("Attendance saved");await render()}catch(e){toast(e.message,true)}return}
}

export function onChange(e) {
  if (e.target.id === "attendanceBatch") { attendanceBatch = e.target.value; currentMarks = {}; return true }
  if (e.target.id === "attendanceDate") { attendanceDate = e.target.value; currentMarks = {}; return true }
  return false;
}

boot({ render, act, onChange });
