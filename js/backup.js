import {all,replaceAll,STORES} from "./db.js";
export async function exportBackup(){
 const data={app:"Tution Hub",version:1,createdAt:new Date().toISOString(),data:{}};
 for(const s of STORES)data.data[s]=await all(s);
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`tution-hub-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
}
export async function importBackup(file){
 const parsed=JSON.parse(await file.text());
 if(parsed.app!=="Tution Hub"||parsed.version!==1||!parsed.data||!STORES.every(s=>Array.isArray(parsed.data[s])))throw Error("This backup file is invalid or unsupported.");
 const ids=new Set();for(const s of STORES){for(const row of parsed.data[s]){if(!row||typeof row.id!=="string"||ids.has(`${s}:${row.id}`))throw Error(`Invalid or duplicate record in ${s}.`);ids.add(`${s}:${row.id}`)}}
 const studentIds=new Set(parsed.data.students.map(s=>s.id)),batchIds=new Set(parsed.data.batches.map(b=>b.id));
 if(parsed.data.students.some(s=>!batchIds.has(s.batchId))||parsed.data.attendance.some(a=>!studentIds.has(a.studentId)||!batchIds.has(a.batchId))||parsed.data.payments.some(p=>!studentIds.has(p.studentId)))throw Error("Backup contains broken student or batch references.");
 await replaceAll(parsed.data);
}
