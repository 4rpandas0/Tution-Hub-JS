import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {listStudents} from "../students.js";
import {listBatches} from "../batches.js";
import {listAttendance} from "../attendance.js";
import {listPayments, balances} from "../payments.js";
import {boot} from "../app.js";

export async function render(){
 const [s,b,a,p]=await Promise.all([listStudents(),listBatches(),listAttendance(),listPayments()]);
 const active=s.filter(x=>x.status==="Active"),tod=a.filter(x=>x.date===today()),present=tod.filter(x=>x.status==="Present"||x.status==="Late").length,attPct=tod.length?Math.round(present/tod.length*100):0;
 const collected=p.filter(x=>x.date.startsWith(month())).reduce((n,x)=>n+x.amount,0);
 const bal=await balances(),pending=bal.reduce((n,x)=>n+x.balance,0);
 const recent=[...p].sort((x,y)=>y.date.localeCompare(x.date)).slice(0,5);
 const reminders=bal.filter(x=>x.balance>0&&x.status==="Active").slice(0,5);
 const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return d.toISOString().slice(0,7)});
 const rev=months.map(m=>p.filter(x=>x.date.startsWith(m)).reduce((n,x)=>n+x.amount,0));
 const enroll=months.map(m=>s.filter(x=>x.joiningDate?.startsWith(m)).length);
 return `<div class="grid stats-grid">${stat("Total students",s.length,"users","All registered students")}${stat("Active students",active.length,"user-check",`${s.length-active.length} inactive`)}${stat("Total batches",b.length,"layers","Teaching groups")}${stat("Today's attendance",`${attPct}%`,"calendar-check",`${tod.length} marked today`)}${stat("Fees collected this month",money(collected),"wallet",monthName(month()))}${stat("Pending fees",money(pending),"clock","Current month outstanding")}</div>
 <div class="grid dashboard-grid"><section class="panel"><div class="panel-head"><div><h3>Monthly revenue</h3><p>Payments received over the last six months</p></div><span class="badge green">+ Live data</span></div><div class="chart-wrap"><canvas id="revenueChart"></canvas></div></section>
 <section class="panel"><div class="panel-head"><div><h3>Fee reminders</h3><p>Students with outstanding fees this month</p></div><a class="btn btn-secondary btn-small" href="payments.html">View all</a></div>${reminders.length?reminders.map(x=>`<div class="list-row"><div class="person"><div class="avatar">${esc(x.name[0]?.toUpperCase())}</div><div><b>${esc(x.name)}</b><small>${esc(batchName(x.batchId,b))}</small></div></div><div style="text-align:right"><b class="amount">${money(x.balance)}</b><small class="muted" style="display:block">Due</small></div></div>`).join(""):empty("All fees are clear","No outstanding balances")}</section></div>
 <div class="grid dashboard-grid"><section class="panel"><div class="panel-head"><div><h3>Recent payments</h3><p>Latest fee transactions</p></div><a class="btn btn-secondary btn-small" href="payments.html">All payments</a></div>${recent.length?recent.map(x=>`<div class="list-row"><div class="person"><div class="avatar">${icon("wallet")}</div><div><b>${esc(studentName(x.studentId,s))}</b><small>${esc(x.period)} · ${esc(x.method)}</small></div></div><b class="amount">${money(x.amount)}</b></div>`).join(""):empty("No payments yet")}</section>
 <section class="panel"><div class="panel-head"><div><h3>Student enrollment</h3><p>New students over the last six months</p></div></div><div class="chart-wrap"><canvas id="enrollChart"></canvas></div></section></div>`;
}

function drawChart(id,labels,values,second=null){
 const c=$("#"+id);if(!c)return;const ctx=c.getContext("2d"),w=c.clientWidth,h=c.clientHeight,dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);
 const css=getComputedStyle(document.documentElement),muted=css.getPropertyValue("--muted").trim(),line=css.getPropertyValue("--line").trim(),primary=css.getPropertyValue("--primary").trim();
 const max=Math.max(1,...values,...(second||[]))*1.2,pad={l:32,r:10,t:12,b:28},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
 ctx.font="10px DM Sans";ctx.fillStyle=muted;ctx.strokeStyle=line;ctx.lineWidth=1;
 for(let i=0;i<4;i++){const y=pad.t+ch*i/3;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillText(Math.round(max*(1-i/3)).toString(),0,y+3)}
 const draw=(arr,color)=>{ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();arr.forEach((v,i)=>{const x=pad.l+(labels.length===1?cw/2:cw*i/(labels.length-1)),y=pad.t+ch-(v/max)*ch;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();arr.forEach((v,i)=>{const x=pad.l+(labels.length===1?cw/2:cw*i/(labels.length-1)),y=pad.t+ch-(v/max)*ch;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()})};
 draw(values,primary);if(second)draw(second,"#24b58a");labels.forEach((l,i)=>{ctx.fillStyle=muted;ctx.textAlign="center";ctx.fillText(l,pad.l+(labels.length===1?cw/2:cw*i/(labels.length-1)),h-7)});
}

async function afterRender(){const p=await listPayments(),s=await listStudents();const ms=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return d.toISOString().slice(0,7)});const labels=ms.map(x=>new Date(x+"-01").toLocaleDateString("en",{month:"short"}));drawChart("revenueChart",labels,ms.map(m=>p.filter(x=>x.date.startsWith(m)).reduce((n,x)=>n+x.amount,0)));drawChart("enrollChart",labels,ms.map(m=>s.filter(x=>x.joiningDate?.startsWith(m)).length));}

document.addEventListener("app:theme", () => { if ($("#revenueChart")) afterRender() });

boot({ render, afterRender });
