import {all,put,uid} from "./db.js";
export const listAttendance=()=>all("attendance");
export async function saveSession(batchId,date,marks){
 if(!batchId||!date)throw Error("Choose a batch and date.");
 const existing=await all("attendance");
 // One row per student/date/batch. Existing rows are updated, never duplicated.
 for(const [studentId,status] of Object.entries(marks)){
  if(!["Present","Absent","Late"].includes(status))continue;
  const old=existing.find(a=>a.studentId===studentId&&a.batchId===batchId&&a.date===date);
  await put("attendance",{id:old?.id||uid("ATT"),studentId,batchId,date,status});
 }
}
