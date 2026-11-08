import {all,put,remove,uid} from "./db.js";
export async function listStudents(){return all("students")}
export async function saveStudent(data,id){
  if(!data.name?.trim())throw Error("Student name is required.");
  if(!/^[0-9+\-\s]{7,15}$/.test(data.phone||""))throw Error("Enter a valid student phone number.");
  if(!data.guardian?.trim())throw Error("Guardian name is required.");
  if(!data.batchId)throw Error("Choose a batch.");
  if(!(Number(data.fee)>=0))throw Error("Enter a valid monthly fee.");
  const rows=await all("students");
  if(rows.some(s=>s.phone===data.phone && s.id!==id))throw Error("A student with this phone number already exists.");
  const record={...data,id:id||uid("STU"),fee:Number(data.fee),status:data.status||"Active",joiningDate:data.joiningDate||new Date().toISOString().slice(0,10)};
  await put("students",record);return record;
}
export async function deleteStudent(id){await remove("students",id)}
