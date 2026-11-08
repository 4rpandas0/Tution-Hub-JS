const DB_NAME = "tution-hub-db";
const DB_VERSION = 1;
export const STORES = ["students","batches","attendance","payments"];
let database;
export function openDB(){
  if(database) return Promise.resolve(database);
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("students")){const s=db.createObjectStore("students",{keyPath:"id"});s.createIndex("name","name");s.createIndex("batchId","batchId");}
      if(!db.objectStoreNames.contains("batches"))db.createObjectStore("batches",{keyPath:"id"});
      if(!db.objectStoreNames.contains("attendance")){const s=db.createObjectStore("attendance",{keyPath:"id"});s.createIndex("date","date");s.createIndex("studentId","studentId");s.createIndex("batchId","batchId");}
      if(!db.objectStoreNames.contains("payments")){const s=db.createObjectStore("payments",{keyPath:"id"});s.createIndex("studentId","studentId");s.createIndex("date","date");s.createIndex("period","period");}
    };
    req.onsuccess=()=>{database=req.result;resolve(database)};
    req.onerror=()=>reject(req.error);
  });
}
export async function all(store){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export async function get(store,id){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store).objectStore(store).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export async function put(store,value){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).put(value);tx.oncomplete=()=>res(value);tx.onerror=()=>rej(tx.error)})}
export async function remove(store,id){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).delete(id);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
export async function clearStore(store){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).clear();tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
export async function replaceAll(data){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(STORES,"readwrite");for(const s of STORES){const os=tx.objectStore(s);os.clear();(data[s]||[]).forEach(x=>os.put(x));}tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
export const uid=(prefix)=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
