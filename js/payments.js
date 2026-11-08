import {all,put,uid} from "./db.js";
export const listPayments=()=>all("payments");
export async function recordPayment(d){
 if(!d.studentId||!d.period)throw Error("Choose a student and fee period.");
 const amount=Number(d.amount);if(!(amount>0))throw Error("Payment must be greater than zero.");
 const student=(await all("students")).find(s=>s.id===d.studentId);if(!student)throw Error("Student not found.");
 const rows=await all("payments");const paid=rows.filter(p=>p.studentId===d.studentId&&p.period===d.period).reduce((n,p)=>n+Number(p.amount),0);
 const due=Number(d.due??student.fee);if(paid+amount>due+0.001)throw Error("Payment exceeds the remaining balance.");
 const row={...d,id:uid("PAY"),amount,due,date:d.date||new Date().toISOString().slice(0,10),method:d.method||"Cash"};await put("payments",row);return row;
}
export async function balances(){
 const [students,payments]=await Promise.all([all("students"),all("payments")]);
 const period=new Date().toISOString().slice(0,7);
 return students.map(s=>{const paid=payments.filter(p=>p.studentId===s.id&&p.period===period).reduce((n,p)=>n+p.amount,0);return {...s,paid,balance:Math.max(0,s.fee-paid)}});
}
