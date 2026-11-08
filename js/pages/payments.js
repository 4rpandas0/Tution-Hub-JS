import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {listStudents} from "../students.js";
import {listPayments, recordPayment, balances} from "../payments.js";
import {paymentForm, receipt} from "../forms.js";
import {boot} from "../app.js";

export async function render(){
 const [s,p]=await Promise.all([listStudents(),listPayments()]);
 const raw=$("#paymentSearch")?.value||"",q=raw.toLowerCase(),period=$("#paymentPeriod")?.value||"";
 const rows=[...p].sort((a,b)=>b.date.localeCompare(a.date)).filter(x=>(studentName(x.studentId,s).toLowerCase().includes(q)||x.id.toLowerCase().includes(q))&&(!period||x.period===period)).map(x=>`<tr><td><b>${esc(x.id)}</b></td><td>${esc(studentName(x.studentId,s))}</td><td>${esc(x.period)}</td><td>${money(x.due)}</td><td><b>${money(x.amount)}</b></td><td>${esc(x.date)}</td><td>${esc(x.method)}</td><td><button class="btn btn-secondary btn-small" data-action="receipt" data-id="${x.id}">${icon("printer")} Receipt</button></td></tr>`).join("");
 const b=await balances(),pending=b.reduce((n,x)=>n+x.balance,0),collected=p.filter(x=>x.date.startsWith(month())).reduce((n,x)=>n+x.amount,0);
 return `<div class="grid stats-grid">${stat("Collected this month",money(collected),"wallet",monthName(month()))}${stat("Outstanding this month",money(pending),"clock","Across active students")}${stat("Transactions",p.length,"receipt","All-time payments")}</div><div class="toolbar"><div class="search-box">${icon("search")}<input id="paymentSearch" placeholder="Search student or payment ID..." value="${esc(raw)}"></div><input class="field" style="width:auto" id="paymentPeriod" type="month" value="${esc(period)}"><button class="btn btn-primary" data-action="add-payment">${icon("plus")} Record payment</button></div><section class="content-card">${p.length?table(["Payment ID","Student","Fee period","Amount due","Paid","Payment date","Method","Receipt"],rows):empty("No payments recorded yet","Record a payment to see the transaction history")}</section>`;
}

export async function act(a, btn) {
 const id = btn.dataset.id;
 if(a==="add-payment")return paymentForm();if(a==="receipt")return receipt(id);
}

export function onInput(e) { return e.target.id === "paymentSearch" }
export function onChange(e) { return e.target.id === "paymentPeriod" }

boot({ render, act, onInput, onChange });
