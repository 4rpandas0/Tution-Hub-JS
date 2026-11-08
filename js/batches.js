import {all,put,remove,uid} from "./db.js";
export const listBatches=()=>all("batches");
export async function saveBatch(d,id){
 if(!d.name?.trim()||!d.subject?.trim()||!d.teacher?.trim())throw Error("Batch name, subject and teacher are required.");
 if(!d.start||!d.end||d.start>=d.end)throw Error("End time must be later than start time.");
 if(!(Number(d.capacity)>0))throw Error("Capacity must be greater than zero.");
 const rows=await all("batches");if(rows.some(x=>x.name.toLowerCase()===d.name.toLowerCase()&&x.id!==id))throw Error("Batch name already exists.");
 const record={...d,id:id||uid("BAT"),capacity:Number(d.capacity)};await put("batches",record);return record;
}
export const deleteBatch=id=>remove("batches",id);
