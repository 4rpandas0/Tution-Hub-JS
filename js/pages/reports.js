import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {reportData, downloadCSV} from "../reports.js";
import {balances} from "../payments.js";
import {boot} from "../app.js";

export async function render(){
 const d=await reportData(),pending=await balances();
 return `<div class="grid report-cards stats-grid">${stat("Students",d.students.length,"users","Enrollment overview")}${stat("Attendance entries",d.attendance.length,"calendar-check","All saved sessions")}${stat("Payments",d.payments.length,"wallet","Transaction records")}</div><section class="panel"><div class="panel-head"><div><h3>Export reports</h3><p>Choose a report and date range, then download it as CSV.</p></div></div><div class="form-grid"><div class="form-group"><label>Report type</label><select id="reportType" class="field"><option value="payments">Monthly fee collection</option><option value="pending">Pending fees</option><option value="attendance">Student attendance</option><option value="batches">Batch-wise student count</option><option value="students">Student enrollment</option></select></div><div class="form-group"><label>From date</label><input id="reportFrom" class="field" type="date" value="${month()}-01"></div><div class="form-group"><label>To date</label><input id="reportTo" class="field" type="date" value="${today()}"></div></div><div class="form-actions"><button class="btn btn-primary" data-action="export-report">${icon("download")} Export CSV</button></div></section><section class="panel" style="margin-top:16px"><h3 class="section-title">Report guide</h3><div class="list-row"><span>Monthly fee collection</span><small class="muted">Payment transactions within selected dates</small></div><div class="list-row"><span>Pending fees</span><small class="muted">Current month balance by student</small></div><div class="list-row"><span>Student attendance</span><small class="muted">Attendance records within selected dates</small></div><div class="list-row"><span>Batch-wise student count</span><small class="muted">Current roster and capacity</small></div><div class="list-row"><span>Student enrollment</span><small class="muted">Students who joined within selected dates</small></div></section>`;
}

async function exportReport(){const d=await reportData(),type=$("#reportType").value,from=$("#reportFrom").value,to=$("#reportTo").value;if(from&&to&&from>to)throw Error("From date must be before the to date.");let rows=[],name=type;
 if(type==="payments"){rows=d.payments.filter(x=>x.date>=from&&x.date<=to).map(x=>({...x,student:d.students.find(s=>s.id===x.studentId)?.name||"Unknown"}));name="monthly-fee-collection"}
 if(type==="pending"){const b=await balances();rows=b.map(x=>({student:x.name,phone:x.phone,fee:x.fee,paid:x.paid,pending:x.balance,period:month()})).filter(x=>x.pending>0);name="pending-fees"}
 if(type==="attendance"){rows=d.attendance.filter(x=>x.date>=from&&x.date<=to).map(x=>({...x,student:d.students.find(s=>s.id===x.studentId)?.name||"Unknown",batch:d.batches.find(b=>b.id===x.batchId)?.name||"Unknown"}));name="student-attendance"}
 if(type==="batches"){rows=d.batches.map(b=>({batch:b.name,subject:b.subject,teacher:b.teacher,students:d.students.filter(s=>s.batchId===b.id).length,capacity:b.capacity}));name="batch-wise-count"}
 if(type==="students"){rows=d.students.filter(x=>x.joiningDate>=from&&x.joiningDate<=to);name="student-enrollment"}
 downloadCSV(`${name}.csv`,rows)}

export async function act(a, btn) {
 const id = btn.dataset.id;
 if(a==="export-report"){try{await exportReport();toast("CSV report exported")}catch(e){toast(e.message,true)}}
}

boot({ render, act });
