import {$, esc, money, today, month, monthName, toast, icon, empty, modal, closeModal, field, selectField, formModal, studentName, batchName, stat, table, rowActions, requestRefresh, applyTheme, toggleTheme} from "../core.js";
import {all, put, remove, clearStore, STORES} from "../db.js";
import {listStudents, saveStudent} from "../students.js";
import {listBatches, saveBatch} from "../batches.js";
import {exportBackup, importBackup} from "../backup.js";
import {boot} from "../app.js";

export async function render(){
 return `<section class="panel"><h3 class="section-title">Data backup & restore</h3><p class="muted">Your records are stored in this browser using IndexedDB. Export backups regularly to keep a safe copy.</p><div class="setting-row"><div><b>Export full backup</b><p>Download students, batches, attendance and payment records as JSON.</p></div><button class="btn btn-primary" data-action="backup">${icon("download")} Export JSON</button></div><div class="setting-row"><div><b>Restore from backup</b><p>Replace all current records with a validated Tution Hub backup.</p></div><label class="btn btn-secondary">${icon("upload")} Choose file<input id="backupFile" type="file" accept="application/json,.json" hidden></label></div><div class="setting-row"><div><b>Load sample demo data</b><p>Add sample students and batches if the database is empty.</p></div><button class="btn btn-secondary" data-action="demo">Load demo data</button></div><div class="setting-row"><div><b>Clear demo data</b><p>Remove records identified as demo data only.</p></div><button class="btn btn-danger" data-action="clear-demo">Clear demo data</button></div><div class="setting-row"><div><b>Clear all application data</b><p>This permanently deletes all records in this browser.</p></div><button class="btn btn-danger" data-action="clear-all">Clear all data</button></div></section><section class="panel" style="margin-top:16px"><h3 class="section-title">Appearance</h3><div class="setting-row"><div><b>Dark theme</b><p>Switch between light and dark dashboard themes.</p></div><input class="switch" id="themeSwitch" type="checkbox" ${document.documentElement.dataset.theme==="dark"?"checked":""}></div></section><div class="notice" style="margin-top:16px">Privacy note: this is a browser-only app. Data does not sync automatically between devices or browsers. Keep a JSON backup before clearing browser data.</div>`;
}

async function demoData(){if((await listStudents()).length||(await listBatches()).length){throw Error("Demo data can only be loaded when students and batches are empty.")}const b1=await saveBatch({name:"Class 9 — Maths",subject:"Mathematics",teacher:"Ananya Sen",schedule:"Mon, Wed, Fri",start:"16:00",end:"17:00",capacity:25}),b2=await saveBatch({name:"Class 10 — Science",subject:"Science",teacher:"Rahul Das",schedule:"Tue, Thu, Sat",start:"17:00",end:"18:30",capacity:20});await put("batches",{...b1,demo:true});await put("batches",{...b2,demo:true});const names=[["Aarav Sharma","9876543210","Meera Sharma",b1.id],["Ishita Roy","9876543211","Suman Roy",b1.id],["Kabir Das","9876543212","Rina Das",b2.id],["Diya Sen","9876543213","Anil Sen",b2.id]];for(const [name,phone,guardian,batchId] of names){const st=await saveStudent({name,phone,guardian,batchId,fee:1200,status:"Active",joiningDate:today()});await put("students",{...st,demo:true})}toast("Demo data loaded");requestRefresh()}

export async function act(a, btn) {
 const id = btn.dataset.id;
 if(a==="backup"){try{await exportBackup();toast("Backup created")}catch(e){toast(e.message,true)}return}
 if(a==="demo")return demoData();
 if(a==="clear-demo"){if(!confirm("Remove records with demo IDs only?"))return;for(const st of STORES){const rows=await all(st);for(const r of rows)if(r.demo)await remove(st,r.id)}toast("Demo-tagged records cleared");await render();return}
 if(a==="clear-all"){if(confirm("Permanently delete ALL students, batches, attendance and payments?")){for(const st of STORES)await clearStore(st);toast("All data cleared");await render()}return}
}

export async function onChange(e) {
  if (e.target.id === "themeSwitch") { applyTheme(e.target.checked ? "dark" : "light"); return false }
  if (e.target.id === "backupFile" && e.target.files[0]) {
    try {
      if (!confirm("Restore this backup and replace all current data?")) return false;
      await importBackup(e.target.files[0]);
      toast("Backup restored");
      requestRefresh();
    } catch (err) { toast(err.message, true) } finally { e.target.value = "" }
  }
  return false;
}

boot({ render, act, onChange });
