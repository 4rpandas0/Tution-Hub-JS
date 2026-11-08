import {all} from "./db.js";
export async function reportData(){
 const [students,batches,attendance,payments]=await Promise.all(["students","batches","attendance","payments"].map(all));
 return {students,batches,attendance,payments};
}
export function downloadCSV(name,rows){
 if(!rows.length){throw Error("There is no data to export.");}
 const keys=[...new Set(rows.flatMap(Object.keys))];
 const esc=v=>`"${String(v??"").replaceAll('"','""')}"`;
 const csv=[keys.map(esc).join(","),...rows.map(r=>keys.map(k=>esc(r[k])).join(","))].join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=name;a.click();URL.revokeObjectURL(a.href);
}
