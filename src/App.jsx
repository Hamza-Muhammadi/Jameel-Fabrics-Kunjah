import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ── Supabase Client ───────────────────────────────────────────
const SUPA_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPA_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";
const supabase = SUPA_URL && SUPA_KEY ? createClient(SUPA_URL, SUPA_KEY) : null;

// ── Supabase Helper ───────────────────────────────────────────

// ── Offline Queue ─────────────────────────────────────────────
const QUEUE_KEY="jf5_offline_queue";
const offlineQueue={
  add:(table,row)=>{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");const f=q.filter(x=>!(x.table===table&&x.row.id===row.id));f.push({table,row,ts:Date.now()});localStorage.setItem(QUEUE_KEY,JSON.stringify(f));},
  get:()=>JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]"),
  clear:()=>localStorage.removeItem(QUEUE_KEY),
  remove:(table,id)=>{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");localStorage.setItem(QUEUE_KEY,JSON.stringify(q.filter(x=>!(x.table===table&&x.row.id===id))));}
};
async function flushQueue(){
  if(!supabase||!navigator.onLine)return;
  const q=offlineQueue.get();if(!q.length)return;
  for(const item of q){try{await supabase.from(item.table).upsert({...item.row,updated_at:new Date().toISOString()});offlineQueue.remove(item.table,item.row.id);}catch(e){console.error(e);}}
}
if(typeof window!=="undefined"){window.addEventListener("online",()=>setTimeout(flushQueue,1000));}

const db = {
  get: async (table) => {
    if(!supabase) return null;
    const {data,error} = await supabase.from(table).select("*");
    if(error){console.error(table,error);return null;}
    return data;
  },
  upsert: async (table, row) => {
    const r2={...row,updated_at:new Date().toISOString()};
    if(!supabase||!navigator.onLine){offlineQueue.add(table,r2);return null;}
    const{error}=await supabase.from(table).upsert(r2);
    if(error){console.error(table,error);offlineQueue.add(table,r2);}
    return null;
  },
  del: async (table, id) => {
    if(!supabase) return null;
    const {error} = await supabase.from(table).delete().eq("id",id);
    if(error) console.error(table,error);
  },
  sub: (table, cb) => {
    if(!supabase) return null;
    return supabase.channel(table)
      .on("postgres_changes",{event:"*",schema:"public",table},(payload)=>cb(payload))
      .subscribe();
  }
};

// JAMEEL FABRICS SMART ERP v6.0 — Supabase Sync

const THEMES = {
  "Modern Blue": {bg:"#f4f6fb",surface:"#eef2f9",card:"#ffffff",border:"#e3e8f0",accent:"#2563eb",text:"#1e293b",muted:"#64748b",danger:"#dc2626",success:"#16a34a",info:"#0ea5e9",btnText:"#ffffff"},
  "Black Gold": {bg:"#0a0a0a",surface:"#141414",card:"#1a1a1a",border:"#2a2a2a",accent:"#c9a84c",text:"#f5f0e8",muted:"#777",danger:"#e05252",success:"#4caf7d",info:"#5296e0",btnText:"#000000"},
  "Royal Blue": {bg:"#050d1a",surface:"#0a1628",card:"#0f1f3a",border:"#1a3050",accent:"#4a90e2",text:"#e8f0f8",muted:"#7a9bbf",danger:"#e05252",success:"#4caf7d",info:"#c49af0",btnText:"#ffffff"},
  "Dark Green": {bg:"#050f08",surface:"#0a1a0d",card:"#0f2214",border:"#1a3820",accent:"#4caf7d",text:"#e8f5ed",muted:"#7aaa8a",danger:"#e05252",success:"#7dd4a0",info:"#4a90e2",btnText:"#06210f"},
  "Red Black":  {bg:"#0a0505",surface:"#140a0a",card:"#1a0f0f",border:"#2a1515",accent:"#e05252",text:"#f8e8e8",muted:"#aa7a7a",danger:"#e05252",success:"#4caf7d",info:"#4a90e2",btnText:"#ffffff"},
  "White Gold": {bg:"#fafaf7",surface:"#f5f2e8",card:"#ffffff",border:"#e8dfc0",accent:"#c9a84c",text:"#2c2416",muted:"#8a7a5a",danger:"#c0392b",success:"#4a7c59",info:"#2980b9",btnText:"#ffffff"},
  "Eid Green":  {bg:"#f3faf5",surface:"#e9f5ed",card:"#ffffff",border:"#cfe8d8",accent:"#0f9d58",text:"#143420",muted:"#5e8a70",danger:"#dc2626",success:"#16a34a",info:"#d4a017",btnText:"#ffffff"},
  "Ramadan Night": {bg:"#0b1020",surface:"#121833",card:"#18203f",border:"#26305a",accent:"#d4af37",text:"#eef0f8",muted:"#8a93b8",danger:"#e05252",success:"#4caf7d",info:"#7c9cf0",btnText:"#1a1408"}
};

const T_RO = {
  appName:"Jameel Fabrics ERP",dashboard:"Dashboard",pos:"POS Billing",inventory:"Inventory",
  customers:"Customers",employees:"Employees",reports:"Reports",udhaar:"Udhaar",
  expenses:"Kharcha",suppliers:"Suppliers",settings:"Settings",salary:"Tankhwah",
  cashClose:"Cash Closing",stockReturn:"Stock Wapsi",damaged:"Kharab Stock",offers:"Offers",
  barcode:"Barcode",thermal:"Thermal Bill",exports:"Export",booking:"Bookings",
  discounts:"Discounts",analytics:"Analytics",activityLog:"Activity Log",
  todaySale:"Aaj Ki Sale",totalExpense:"Total Kharcha",netProfit:"Net Munafa",
  lowStock:"Kam Stock",pendingUdhaar:"Baaki Udhaar",save:"Save",cancel:"Wapas",
  login:"Login",username:"Username",password:"Password",loginBtn:"Login Karo",logout:"Logout",
};
const T_EN = {
  appName:"Jameel Fabrics ERP",dashboard:"Dashboard",pos:"POS Billing",inventory:"Inventory",
  customers:"Customers",employees:"Employees",reports:"Reports",udhaar:"Udhaar",
  expenses:"Expenses",suppliers:"Suppliers",settings:"Settings",salary:"Salary",
  cashClose:"Cash Closing",stockReturn:"Stock Return",damaged:"Damaged Stock",offers:"Offers",
  barcode:"Barcode",thermal:"Thermal Bill",exports:"Export",booking:"Bookings",
  discounts:"Discounts",analytics:"Analytics",activityLog:"Activity Log",
  todaySale:"Today's Sale",totalExpense:"Total Expense",netProfit:"Net Profit",
  lowStock:"Low Stock",pendingUdhaar:"Pending Udhaar",save:"Save",cancel:"Cancel",
  login:"Login",username:"Username",password:"Password",loginBtn:"Login",logout:"Logout",
};
const T_UR = {
  appName:"جمیل فیبرکس",dashboard:"ڈیش بورڈ",pos:"بلنگ",inventory:"انوینٹری",
  customers:"گاہک",employees:"ملازمین",reports:"رپورٹس",udhaar:"ادھار",
  expenses:"اخراجات",suppliers:"سپلائر",settings:"سیٹنگز",salary:"تنخواہ",
  cashClose:"کیش بندش",stockReturn:"واپسی",damaged:"خراب اسٹاک",offers:"آفرز",
  barcode:"بارکوڈ",thermal:"تھرمل بل",exports:"ایکسپورٹ",booking:"بکنگ",
  discounts:"ڈسکاؤنٹ",analytics:"تجزیہ",activityLog:"لاگ",
  todaySale:"آج کی فروخت",totalExpense:"کل خرچ",netProfit:"خالص منافع",
  lowStock:"کم اسٹاک",pendingUdhaar:"باقی ادھار",save:"محفوظ",cancel:"منسوخ",
  login:"لاگ ان",username:"صارف نام",password:"پاس ورڈ",loginBtn:"لاگ ان",logout:"لاگ آؤٹ",
};
const LANGS = {ro:T_RO, en:T_EN, ur:T_UR};

const CATS = ["Mens Unstitched","Women Unstitched 3P","Women Stitched 2P+3P","Women Unstitched 2P","Other"];
const PAY_TYPES = ["Cash","Easypaisa","JazzCash","Bank Transfer"];
const WEB_PAY = "Website-Online";
const POS_PAY = [...PAY_TYPES, WEB_PAY];
// A bill paid via the website is tracked separately and is NOT counted in physical-shop sale totals
const isWebOnline = (s)=>String(s&&s.payment||"").includes(WEB_PAY);
const EXP_TYPES = ["Tea/Food","Transport","Salary","Electricity","Rent","Miscellaneous"];
const ROLES = ["Admin","Salesman","Manager","Cashier"];
const LOYALTY = ["Silver","Gold","Platinum","VIP"];
const CAT_C = ["#c9a84c","#5296e0","#4caf7d","#e0a052","#a052e0"];

const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem("jf5_"+k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem("jf5_"+k,JSON.stringify(v));}catch{}},
};

const td = ()=>new Date().toISOString().split("T")[0];
const gid = ()=>Date.now()+Math.floor(Math.random()*9999);
const pkr = (n)=>"Rs. "+Number(n||0).toLocaleString();
const mon = ()=>td().slice(0,7);
const gbc = ()=>"JF"+String(gid()).slice(-6);
const ghc = (i)=>{const m="ABCDEFGHIJ";return `J${m[i%10]}${m[(i+3)%10]}${m[(i+7)%10]}F`;};

// ── Electron Detection ────────────────────────────────────────
const IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI?.isElectron;

// ── Silent Print — Auto-detects Electron vs Browser ──────────
function silentPrint(html, settings={}, printerName='', copies=1) {
  if (IS_ELECTRON && window.electronAPI) {
    // Electron: direct hardware print — no dialog!
    window.electronAPI.silentPrint(html, printerName||'', copies, settings)
      .then(r => { if(!r.success) alert('Print error: ' + r.error); });
    return;
  }
  // Browser fallback
  const pw = settings.paperWidth||80;
  const fs2 = settings.fontSize||11;
  const mg = settings.margin||2;
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;width:0;height:0;border:0;left:-9999px";
  document.body.appendChild(f);
  const d = f.contentDocument||f.contentWindow.document;
  d.open(); d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{margin:${mg}mm;size:${pw}mm auto}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:${fs2}px;font-weight:700}</style></head><body>${html}</body></html>`); d.close();
  setTimeout(()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>{try{document.body.removeChild(f);}catch(e){}},2000);},350);
}

// ── Electron Backup override ──────────────────────────────────
async function electronBackup(data) {
  if (IS_ELECTRON) {
    const r = await window.electronAPI.saveBackup(data);
    if (r.success) alert('✅ Backup saved: ' + r.path);
    else if (!r.cancelled) alert('❌ Backup failed!');
    return;
  }
  // Browser fallback
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  a.download = `jameel-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

async function electronRestore() {
  if (IS_ELECTRON) {
    const r = await window.electronAPI.loadBackup();
    if (r.success) return r.data;
    return null;
  }
  return null; // Browser uses file input
}


// ── Barcode SVG ───────────────────────────────────────────────
function BarcodeSVG({value="JF001",width=180,height=48,showText=true}) {
  const bars=[];
  for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);for(let b=7;b>=0;b--)bars.push(((c*13+i*7+b)%3)!==0?1:0);}
  const all=[1,0,1,...bars,1,0,1];
  const bw=width/all.length;
  return(
    <svg width={width} height={height} style={{display:"block"}}>
      <rect width={width} height={height} fill="white"/>
      {all.map((b,i)=>b?<rect key={i} x={i*bw} y={0} width={Math.max(bw-0.3,0.5)} height={showText?height-12:height} fill="black"/>:null)}
      {showText&&<text x={width/2} y={height-1} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="black">{value}</text>}
    </svg>
  );
}

function svgStr(value,w,h) {
  const bars=[];
  for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);for(let b=7;b>=0;b--)bars.push(((c*13+i*7+b)%3)!==0?1:0);}
  const all=[1,0,1,...bars,1,0,1]; const bw=w/all.length;
  return all.map((b,i)=>b?`<rect x="${i*bw}" y="0" width="${Math.max(bw-0.3,0.5)}" height="${h}" fill="black"/>`:"").join("");
}

// ── Thermal Bill HTML ─────────────────────────────────────────
function buildBill(bill,tpl="standard",msg="Shukriya! Dobara tashreef layen 🙏",si={name:"Jameel Fabrics",address:"Circular Road Kunjah, Distt Gujrat",phone:"03008722232",tiktok:"@jameelfabrics",instagram:"@jameelfabrics"}) {
  if(!bill)return"";
  const D=`<div style="border-top:2px dashed #000;margin:5px 0"></div>`;
  const H=`<div style="text-align:center;font-weight:900"><div style="font-size:16px;font-weight:900">*** ${si.name.toUpperCase()} ***</div><div style="font-size:11px;font-weight:900">${si.address}</div><div style="font-size:11px;font-weight:900">Tel/WA: ${si.phone}</div>${si.tiktok?`<div style="font-size:10px;font-weight:900">TikTok:${si.tiktok} | IG:${si.instagram||""}</div>`:""}</div>`;
  const I=`<div style="font-size:12px;font-weight:900"><div style="display:flex;justify-content:space-between"><span>Date: ${bill.date}</span><span># ${String(bill.id).slice(-6)}</span></div><div>Customer: ${bill.customer||"Walk-in"}${bill.phone?` | ${bill.phone}`:""}</div><div style="display:flex;justify-content:space-between"><span>By: ${bill.salesman}${bill.dealing?` / ${bill.dealing}`:""}</span><span>${bill.payment}</span></div></div>`;
  const rows=bill.items.map(i=>`<tr><td style="padding:3px 1px;font-size:12px;font-weight:900">${i.name}${i.onOffer?" [OFFER]":""}</td><td style="padding:3px 1px;text-align:center;font-size:12px;font-weight:900;white-space:nowrap">${i.qty}${i.unit}</td><td style="padding:3px 1px;text-align:right;font-size:12px;font-weight:900">${Number(i.price).toLocaleString()}</td><td style="padding:3px 1px;text-align:right;font-weight:900;font-size:12px">${Number(i.total).toLocaleString()}</td></tr>`).join("");
  const tots=`${bill.discount>0?`<tr><td colspan="3" style="text-align:right;font-size:12px;font-weight:900;color:red">Discount:</td><td style="text-align:right;font-size:12px;font-weight:900;color:red">-Rs.${Number(bill.discount).toLocaleString()}</td></tr>`:""}<tr style="border-top:2px solid #000"><td colspan="3" style="text-align:right;font-size:14px;font-weight:900;padding:4px 1px">TOTAL:</td><td style="text-align:right;font-size:14px;font-weight:900;padding:4px 1px">Rs.${Number(bill.total).toLocaleString()}</td></tr><tr><td colspan="3" style="text-align:right;font-size:12px;font-weight:900;padding:3px 1px">Paid:</td><td style="text-align:right;font-size:12px;font-weight:900;color:green;padding:3px 1px">Rs.${Number(bill.paid).toLocaleString()}</td></tr><tr><td colspan="3" style="text-align:right;font-size:13px;font-weight:900;color:${bill.remaining>0?"red":"green"};padding:3px 1px">Remaining:</td><td style="text-align:right;font-size:13px;font-weight:900;color:${bill.remaining>0?"red":"green"};padding:3px 1px">Rs.${Number(bill.remaining).toLocaleString()}</td></tr>`;
  const P=`<div style="font-size:10px;font-weight:900;text-align:center;line-height:1.8">Receipt k baghair wapsi nahi<br/>Sale/Offer items non-returnable<br/>Exchange 2-3 din andar</div>`;
  const F=`<div style="text-align:center;font-size:11px;font-weight:900;margin-top:4px">${msg}<br/>TikTok:${si.tiktok||""} | IG:${si.instagram||""} | WA:${si.phone}</div>`;
  if(tpl==="premium")return`<div style="width:72mm;font-family:Arial,'Segoe UI',sans-serif;color:#000;font-weight:600">
    <div style="border:2px solid #000;padding:7px 6px;text-align:center;margin-bottom:6px">
      <div style="font-size:18px;font-weight:900;letter-spacing:1px">${si.name.toUpperCase()}</div>
      <div style="font-size:8px;letter-spacing:2px">PREMIUM FABRICS &middot; SINCE 1975</div>
      <div style="font-size:10px;margin-top:3px">${si.address}</div>
      <div style="font-size:10px">Tel / WhatsApp: ${si.phone}</div>
    </div>
    <div style="font-size:11px;display:flex;justify-content:space-between"><span>Bill #${String(bill.id).slice(-6)}</span><span>${bill.date}</span></div>
    <div style="font-size:11px">Customer: ${bill.customer||"Walk-in"}${bill.phone?" &middot; "+bill.phone:""}</div>
    <div style="font-size:11px;margin-bottom:3px">By: ${bill.salesman}${bill.dealing?" / "+bill.dealing:""} &middot; Pay: ${bill.payment}</div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;font-weight:700">
      <thead><tr><th style="text-align:left;border-top:1.5px solid #000;border-bottom:1.5px solid #000;padding:3px 1px">ITEM</th><th style="text-align:center;border-top:1.5px solid #000;border-bottom:1.5px solid #000">QTY</th><th style="text-align:right;border-top:1.5px solid #000;border-bottom:1.5px solid #000">RATE</th><th style="text-align:right;border-top:1.5px solid #000;border-bottom:1.5px solid #000">AMT</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${bill.discount>0?`<div style="text-align:right;font-size:11px;margin-top:3px">Discount: -Rs.${Number(bill.discount).toLocaleString()}</div>`:""}
    <div style="border:2px solid #000;text-align:center;padding:5px;margin:5px 0"><span style="font-size:17px;font-weight:900">TOTAL &nbsp; Rs.${Number(bill.total).toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700"><span>Paid: Rs.${Number(bill.paid).toLocaleString()}</span><span>Baaki: Rs.${Number(bill.remaining).toLocaleString()}</span></div>
    <div style="border-top:1px dashed #000;margin:5px 0"></div>
    ${P}
    <div style="text-align:center;font-size:11px;font-weight:700;margin-top:5px">${msg}</div>
    <div style="text-align:center;font-size:9px;margin-top:2px">IG: ${si.instagram||""} &nbsp;&middot;&nbsp; TikTok: ${si.tiktok||""}</div>
    ${si.payQR?`<div style="text-align:center;margin-top:6px;border-top:1px dashed #000;padding-top:5px"><div style="font-size:10px;font-weight:900">📲 Scan to Pay — EasyPaisa / JazzCash</div><img src="${si.payQR}" style="width:36mm;height:36mm;object-fit:contain;margin-top:3px"/></div>`:""}
  </div>`;
  if(tpl==="simple")return`<div style="width:72mm;font-family:'Courier New',monospace;font-weight:900">${H}${D}<div style="font-size:11px;font-weight:900">Date:${bill.date} | #${String(bill.id).slice(-6)} | By:${bill.salesman}${bill.dealing?"/"+bill.dealing:""}</div>${D}${bill.items.map(i=>`<div style="font-weight:900">${i.name} ${i.qty}${i.unit} x Rs.${Number(i.price).toLocaleString()} = Rs.${Number(i.total).toLocaleString()}</div>`).join("")}${D}<div style="text-align:right;font-size:15px;font-weight:900">TOTAL: Rs.${Number(bill.total).toLocaleString()}</div><div style="text-align:right;font-weight:900">Paid: Rs.${Number(bill.paid).toLocaleString()}</div><div style="text-align:right;color:${bill.remaining>0?"red":"green"};font-weight:900">Remaining: Rs.${Number(bill.remaining).toLocaleString()}</div>${D}${P}${D}${F}</div>`;
  return`<div style="width:72mm;font-family:'Courier New',monospace;font-weight:900">${H}${D}${I}${D}<table style="width:100%;border-collapse:collapse;font-weight:900"><thead><tr><th style="text-align:left;font-size:11px;font-weight:900;border-bottom:2px solid #000;padding:3px 1px">Item</th><th style="text-align:center;font-size:11px;font-weight:900;border-bottom:2px solid #000;padding:3px 1px">Qty</th><th style="text-align:right;font-size:11px;font-weight:900;border-bottom:2px solid #000;padding:3px 1px">Rate</th><th style="text-align:right;font-size:11px;font-weight:900;border-bottom:2px solid #000;padding:3px 1px">Amt</th></tr></thead><tbody>${rows}</tbody><tfoot>${tots}</tfoot></table>${D}${P}${D}${F}</div>`;
}

function exportCSV(data,fn) {
  if(!data.length)return alert("Koi data nahi!");
  const h=Object.keys(data[0]);
  const rows=data.map(r=>h.map(k=>`"${String(r[k]||"").replace(/"/g,'""')}"`).join(","));
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([[h.join(","),...rows].join("\n")],{type:"text/csv"}));a.download=fn;a.click();
}

function printHTML(html,title) {
  const w=window.open("","_blank");
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;padding:6px;border:1px solid #ddd;text-align:left}td{padding:5px;border:1px solid #eee}h2{color:#333;border-bottom:2px solid #c9a84c;padding-bottom:6px}@media print{button{display:none}}</style></head><body>${html}<br><button onclick="window.print()">🖨️ Print / Save PDF</button></body></html>`);
  w.document.close();
}

// ── SEED DATA ─────────────────────────────────────────────────
const SEED = {
  users:[
    {id:1,username:"admin",password:"admin123",role:"Admin",name:"Owner - Admin"},
    {id:2,username:"ali",password:"ali123",role:"Salesman",name:"Ali Hassan"},
    {id:3,username:"ahmed",password:"ahmed123",role:"Salesman",name:"Ahmed Khan"},
    {id:4,username:"bilal",password:"bilal123",role:"Cashier",name:"Bilal Raza"},
    {id:5,username:"manager",password:"manager123",role:"Manager",name:"Store Manager"},
  ],
  products:[
    {id:1,name:"Khaddar Premium",category:"Mens Unstitched",brand:"Gul Ahmed",color:"Navy Blue",fabric:"Khaddar",qtyType:"meter",barcode:"JF001",hiddenCode:"JABCF",rack:"A1",stock:45,costPrice:800,salePrice:1200,offerPrice:null,offerStart:null,offerEnd:null,supplier:"Gul Ahmed Co",bonus:50,maxDiscount:15},
    {id:2,name:"Lawn 3 Piece",category:"Women Unstitched 3P",brand:"Sana Safinaz",color:"Pink",fabric:"Lawn",qtyType:"piece",barcode:"JF002",hiddenCode:"JXYF",rack:"B2",stock:20,costPrice:1500,salePrice:2800,offerPrice:2500,offerStart:"2025-01-01",offerEnd:"2025-12-31",supplier:"Sana Safinaz",bonus:100,maxDiscount:10},
    {id:3,name:"Silk Dupatta",category:"Women Stitched 2P+3P",brand:"Maria B",color:"Red",fabric:"Silk",qtyType:"meter",barcode:"JF003",hiddenCode:"JMNF",rack:"C3",stock:8,costPrice:2000,salePrice:3500,offerPrice:null,offerStart:null,offerEnd:null,supplier:"Maria B",bonus:0,maxDiscount:5},
    {id:4,name:"Cotton 2P",category:"Women Unstitched 2P",brand:"Al Karam",color:"White",fabric:"Cotton",qtyType:"piece",barcode:"JF004",hiddenCode:"JPQF",rack:"D1",stock:3,costPrice:600,salePrice:1100,offerPrice:950,offerStart:"2025-01-01",offerEnd:"2025-12-31",supplier:"Al Karam",bonus:50,maxDiscount:8},
  ],
  customers:[
    {id:1,name:"Fatima Bibi",phone:"03001234567",whatsapp:"03001234567",address:"Main Bazar Kunjah",city:"Kunjah",notes:"",loyalty:"Gold",totalPurchases:45000,udhaar:2000,visits:12},
    {id:2,name:"Sadia Malik",phone:"03009876543",whatsapp:"03009876543",address:"Circular Road",city:"Gujrat",notes:"VIP Customer",loyalty:"Platinum",totalPurchases:120000,udhaar:0,visits:35},
    {id:3,name:"Amna Shahid",phone:"03112345678",whatsapp:"03112345678",address:"Model Town",city:"Gujrat",notes:"",loyalty:"Silver",totalPurchases:15000,udhaar:0,visits:5},
  ],
  employees:[
    {id:1,name:"Ali Hassan",phone:"03011111111",role:"Salesman",salary:25000,advance:0,joinDate:"2023-01-01"},
    {id:2,name:"Ahmed Khan",phone:"03022222222",role:"Salesman",salary:22000,advance:5000,joinDate:"2023-03-15"},
    {id:3,name:"Bilal Raza",phone:"03033333333",role:"Cashier",salary:20000,advance:0,joinDate:"2023-06-01"},
    {id:4,name:"Store Manager",phone:"03044444444",role:"Manager",salary:35000,advance:0,joinDate:"2022-06-01"},
  ],
  suppliers:[
    {id:1,name:"Gul Ahmed Co",phone:"04211234567",address:"Lahore",balance:15000,totalPurchases:85000},
    {id:2,name:"Sana Safinaz",phone:"04219876543",address:"Karachi",balance:8000,totalPurchases:120000},
    {id:3,name:"Al Karam Studio",phone:"04215555555",address:"Karachi",balance:0,totalPurchases:45000},
  ],
  sales:[],
  expenses:[],
  udhaarList:[],
  attendance:[],damagedStock:[],stockReturns:[],cashClosings:[],salaryPayments:[],
  purchaseInvoices:[],bookings:[],discountRequests:[],activityLogs:[],
};

// ── CSS Factory ───────────────────────────────────────────────
function mkCSS(T){const BT=T.btnText||"#000";const SH="0 1px 2px rgba(15,23,42,.04), 0 2px 8px rgba(15,23,42,.06)";return{
  app:{fontFamily:"'Nunito','Segoe UI',system-ui,sans-serif",background:T.bg,color:T.text,minHeight:"100vh",display:"flex",flexDirection:"column"},
  card:{background:T.card,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"16px",marginBottom:"12px",boxShadow:SH},
  btn:(c=T.accent)=>({background:c,color:BT,border:"none",borderRadius:"9px",padding:"8px 15px",cursor:"pointer",fontWeight:"700",fontSize:"12px",boxShadow:"0 1px 2px rgba(15,23,42,.08)"}),
  btnO:{background:"transparent",color:T.accent,border:`1.5px solid ${T.accent}`,borderRadius:"9px",padding:"7px 13px",cursor:"pointer",fontWeight:"700",fontSize:"12px"},
  iBtn:{background:T.card,color:T.text,border:`1px solid ${T.border}`,borderRadius:"8px",padding:"5px 9px",cursor:"pointer",fontSize:"13px"},
  inp:{background:T.card,border:`1px solid ${T.border}`,borderRadius:"9px",padding:"8px 11px",color:T.text,fontSize:"12px",width:"100%",boxSizing:"border-box",outline:"none"},
  sel:{background:T.card,border:`1px solid ${T.border}`,borderRadius:"9px",padding:"8px 11px",color:T.text,fontSize:"12px",width:"100%",boxSizing:"border-box"},
  lbl:{fontSize:"11px",color:T.muted,display:"block",marginBottom:"3px",marginTop:"8px",fontWeight:"600"},
  badge:(c)=>({background:c+"1f",color:c,padding:"2px 8px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",display:"inline-block"}),
  tbl:{width:"100%",borderCollapse:"collapse"},
  th:{background:T.surface,padding:"9px 11px",textAlign:"left",fontSize:"11px",color:T.muted,fontWeight:"700",borderBottom:`1px solid ${T.border}`,textTransform:"uppercase",letterSpacing:".3px"},
  td:{padding:"9px 11px",borderBottom:`1px solid ${T.border}`,fontSize:"12px"},
  sc:(c)=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"15px 17px",borderLeft:`4px solid ${c}`,boxShadow:SH}),
  h1:{fontSize:"17px",fontWeight:"800",color:T.text,marginBottom:"14px",letterSpacing:"-.2px"},
  h2:{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"6px"},
  modal:{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"12px"},
  mb:(w="500px")=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:"16px",padding:"22px",width:w,maxWidth:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(15,23,42,.25)"}),
  row:{display:"flex",gap:"8px",flexWrap:"wrap"},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"},
};}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [theme,setTheme] = useState(()=>LS.get("theme","Modern Blue"));
  const [lang,setLang]   = useState(()=>LS.get("lang","ro"));
  const [user,setUser]   = useState(null);
  const [mod,setMod]     = useState("dashboard");
  const [sideOpen,setSideOpen] = useState(true);
  const [pinLocked,setPinLocked] = useState(false);
  const [pinInput,setPinInput] = useState("");
  const [gSearch,setGSearch] = useState("");
  const [showGSearch,setShowGSearch] = useState(false);
  const gSearchRef = useRef(null);
  const pinTimer = useRef(null);
  // Ctrl+K / Cmd+K → focus global search from anywhere
  useEffect(()=>{const h=(e)=>{if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==="k"){e.preventDefault();setShowGSearch(true);if(gSearchRef.current)gSearchRef.current.focus();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  const shopInfoDef = {name:"Jameel Fabrics Kunjah",address:"Circular Road Kunjah, Distt Gujrat",phone:"03008722232",whatsapp:"03008722232",tiktok:"@jameelfabrics",instagram:"@jameelfabrics",website:"jameelfabrics.vercel.app"};

  const [users,setUsers]   = useState(()=>LS.get("users",SEED.users));
  const [prods,setProds]   = useState(()=>LS.get("prods",SEED.products));
  const [custs,setCusts]   = useState(()=>LS.get("custs",SEED.customers));
  const [emps,setEmps]     = useState(()=>LS.get("emps",SEED.employees));
  const [supps,setSupps]   = useState(()=>LS.get("supps",SEED.suppliers));
  const [sales,setSales]   = useState(()=>LS.get("sales",SEED.sales));
  const [exps,setExps]     = useState(()=>LS.get("exps",SEED.expenses));
  const [udh,setUdh]       = useState(()=>LS.get("udh",SEED.udhaarList));
  const [att,setAtt]       = useState(()=>LS.get("att",SEED.attendance));
  const [dmg,setDmg]       = useState(()=>LS.get("dmg",SEED.damagedStock));
  const [ret,setRet]       = useState(()=>LS.get("ret",SEED.stockReturns));
  const [cc,setCc]         = useState(()=>LS.get("cc",SEED.cashClosings));
  const [sal,setSal]       = useState(()=>LS.get("sal",SEED.salaryPayments));
  const [pi,setPi]         = useState(()=>LS.get("pi",SEED.purchaseInvoices));
  const [bk,setBk]         = useState(()=>LS.get("bk",SEED.bookings));
  const [dr,setDr]         = useState(()=>LS.get("dr",SEED.discountRequests));
  const [logs,setLogs]     = useState(()=>LS.get("logs",SEED.activityLogs));
  const [supRet,setSupRet] = useState(()=>LS.get("supRet",[]));
  const [shopInfo,setShopInfo] = useState(()=>LS.get("shopInfo",shopInfoDef));
  const [sysPin,setSysPin] = useState(()=>LS.get("sysPin",""));

  useEffect(()=>{LS.set("theme",theme);},[theme]);
  useEffect(()=>{LS.set("lang",lang);},[lang]);
  useEffect(()=>{LS.set("users",users);},[users]);
  useEffect(()=>{LS.set("prods",prods);},[prods]);
  useEffect(()=>{LS.set("custs",custs);},[custs]);
  useEffect(()=>{LS.set("emps",emps);},[emps]);
  useEffect(()=>{LS.set("supps",supps);},[supps]);
  useEffect(()=>{LS.set("sales",sales);},[sales]);
  useEffect(()=>{LS.set("exps",exps);},[exps]);
  useEffect(()=>{LS.set("udh",udh);},[udh]);
  useEffect(()=>{LS.set("att",att);},[att]);
  useEffect(()=>{LS.set("dmg",dmg);},[dmg]);
  useEffect(()=>{LS.set("ret",ret);},[ret]);
  useEffect(()=>{LS.set("cc",cc);},[cc]);
  useEffect(()=>{LS.set("sal",sal);},[sal]);
  useEffect(()=>{LS.set("pi",pi);},[pi]);
  useEffect(()=>{LS.set("bk",bk);},[bk]);
  useEffect(()=>{LS.set("dr",dr);},[dr]);
  useEffect(()=>{LS.set("logs",logs);},[logs]);
  useEffect(()=>{LS.set("supRet",supRet);},[supRet]);
  useEffect(()=>{LS.set("shopInfo",shopInfo);},[shopInfo]);
  useEffect(()=>{LS.set("sysPin",sysPin);},[sysPin]);

  // PIN Lock — 30 min idle
  useEffect(()=>{
    if(!sysPin||!user)return;
    const reset=()=>{clearTimeout(pinTimer.current);pinTimer.current=setTimeout(()=>setPinLocked(true),30*60*1000);};
    reset();
    window.addEventListener("mousemove",reset);window.addEventListener("keydown",reset);window.addEventListener("click",reset);
    return()=>{clearTimeout(pinTimer.current);window.removeEventListener("mousemove",reset);window.removeEventListener("keydown",reset);window.removeEventListener("click",reset);};
  },[sysPin,user]);

  const T  = THEMES[theme];
  const t  = LANGS[lang];
  const css = mkCSS(T);
  const isAdmin   = user?.role==="Admin";
  const isManager = user?.role==="Manager"||isAdmin;
  const log = (action,detail)=>{ if(!user)return; const l={id:gid(),time:new Date().toLocaleString(),date:td(),userName:user.name,user:user.name,action,detail}; setLogs(prev=>[l,...prev.slice(0,199)]); db.upsert("activity_logs",{id:l.id,date:l.date,user_name:l.userName,action,detail}); };

  const todaySales = sales.filter(s=>s.date===td());
  const todayPhys  = todaySales.filter(s=>!isWebOnline(s));   // physical-shop bills
  const todayWeb   = todaySales.filter(s=>isWebOnline(s));    // website-online bills (counted separately)
  const todayTotal = todayPhys.reduce((a,s)=>a+s.total,0);
  const todayOnline= todayWeb.reduce((a,s)=>a+s.total,0);
  const todayExp   = exps.filter(e=>e.date===td()).reduce((a,e)=>a+Number(e.amount),0);
  const todayProfit = todayPhys.reduce((a,s)=>a+s.items.reduce((b,i)=>{const p=prods.find(pr=>pr.id===(i.pid??i.productId));return b+(p?(i.price-p.costPrice)*i.qty:0);},0),0)-todayExp;
  const pendingUdh = udh.reduce((a,u)=>a+u.remaining,0);
  const lowStock   = prods.filter(p=>p.stock<=5);
  const pendingDR  = dr.filter(d=>d.status==="Pending");

  // Low stock sound alert — MUST be before any conditional return
  useEffect(()=>{
    if(lowStock.length>0&&user){
      try{
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        const o=ctx.createOscillator();const g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.frequency.value=880;g.gain.value=0.1;
        o.start();g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
        setTimeout(()=>o.stop(),300);
      }catch(e){}
    }
  },[lowStock.length]);

  const [syncing,setSyncing]=useState(false);
  const [syncStatus,setSyncStatus]=useState(supabase?"🔄 Connecting...":"💾 Local Only");
  const [isOnline,setIsOnline]=useState(navigator.onLine);
  const [waModal,setWaModal]=useState(null);
  const [pwaInstall,setPwaInstall]=useState(null);
  const openWA=(phone,message)=>setWaModal({phone,message});
  useEffect(()=>{
    // Online/offline detection
    const up=()=>{setIsOnline(true);setSyncStatus("🔄 Syncing...");flushQueue().then(()=>setSyncStatus("✅ Synced"));};
    const dn=()=>{setIsOnline(false);setSyncStatus("📴 Offline");};
    window.addEventListener("online",up);window.addEventListener("offline",dn);
    // Service Worker register
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/service-worker.js")
        .then(reg=>console.log("[ERP] SW registered:",reg.scope))
        .catch(err=>console.warn("[ERP] SW failed:",err));
    }
    // PWA install prompt
    const onInstall=(e)=>{e.preventDefault();setPwaInstall(e);};
    window.addEventListener("beforeinstallprompt",onInstall);
    return()=>{
      window.removeEventListener("online",up);
      window.removeEventListener("offline",dn);
      window.removeEventListener("beforeinstallprompt",onInstall);
    };
  },[]);
  const [lastSync,setLastSync]=useState("");
  const [showNotifs,setShowNotifs]=useState(false);
  const [seenNotifIds,setSeenNotifIds]=useState([]);

  // ── Load from Supabase on mount ──────────────────────────────
  useEffect(()=>{
    if(!supabase){setSyncStatus("💾 Local Only");return;}
    const load=async()=>{
      setSyncing(true);setSyncStatus("🔄 Loading...");
      try{
        const [pr,cu,em,su,sa,ex,ud,at,bk,pi,re,dm,sr,sl,cc,of,dr,lg,sp]=await Promise.all([
          db.get("products"),db.get("customers"),db.get("employees"),db.get("suppliers"),
          db.get("sales"),db.get("expenses"),db.get("udhaar"),db.get("attendance"),
          db.get("bookings"),db.get("purchase_invoices"),db.get("stock_returns"),
          db.get("damaged_stock"),db.get("supplier_returns"),db.get("salary_payments"),
          db.get("cash_closings"),db.get("offers"),db.get("discount_requests"),
          db.get("activity_logs"),db.get("shop_info"),
        ]);
        const map=(d,conv)=>d&&d.length?conv?d.map(conv):d:null;
        const pc=r=>({...r,id:r.id,name:r.name,brand:r.brand,color:r.color,fabric:r.fabric,category:r.category,rack:r.rack,stock:r.stock,costPrice:r.cost_price,salePrice:r.sale_price,qtyType:r.qty_type,barcode:r.barcode,bonus:r.bonus,maxDiscount:r.max_discount,offerPrice:r.offer_price,offerStart:r.offer_start,offerEnd:r.offer_end,supplier:r.supplier});
        const cc2=r=>({...r,id:r.id,name:r.customer_name||r.name,customerName:r.customer_name,phone:r.phone,city:r.city,address:r.address,loyalty:r.loyalty,totalPurchases:r.total_purchases,udhaar:r.udhaar,visits:r.visits});
        if(pr?.length)setProds(pr.map(pc));
        if(cu?.length)setCusts(cu.map(cc2));
        if(em?.length)setEmps(em);
        if(su?.length)setSupps(su.map(r=>({...r,totalPurchases:r.total_purchases})));
        if(sa?.length)setSales(sa.map(r=>({...r,items:r.items||[]})));
        if(ex?.length)setExps(ex);
        if(ud?.length)setUdh(ud.map(r=>({...r,customerName:r.customer_name,totalAmount:r.total_amount})));
        if(at?.length)setAtt(at.map(r=>({...r,empId:r.emp_id,empName:r.emp_name})));
        if(bk?.length)setBk(bk.map(r=>({...r,customerName:r.customer_name,productId:r.product_id,productName:r.product_name,advancePaid:r.advance_paid,totalAmount:r.total_amount,deliveryDate:r.delivery_date})));
        if(pi?.length)setPi(pi.map(r=>({...r,supplierId:r.supplier_id,supplierName:r.supplier_name,productId:r.product_id,productName:r.product_name,costPrice:r.cost_price})));
        if(re?.length)setRet(re.map(r=>({...r,customerName:r.customer_name,productId:r.product_id,productName:r.product_name})));
        if(dm?.length)setDmg(dm.map(r=>({...r,productId:r.product_id,productName:r.product_name,costPrice:r.cost_price,supplierId:r.supplier_id,supplierName:r.supplier_name,supplierReturn:r.supplier_return})));
        if(sr?.length)setSupRet(sr.map(r=>({...r,supplierId:r.supplier_id,supplierName:r.supplier_name,productId:r.product_id,productName:r.product_name,costPrice:r.cost_price})));
        if(sl?.length)setSal(sl.map(r=>({...r,empId:r.emp_id,empName:r.emp_name})));
        if(cc?.length)setCc(cc.map(r=>({...r,totalSales:r.total_sales,totalExpenses:r.total_expenses})));
        if(of?.length){/* offers in products already */}
        if(dr?.length)setDr(dr.map(r=>({...r,cartSnapshot:r.cart_snapshot,discountRequested:r.discount_requested})));
        if(lg?.length)setLogs(lg);
        if(sp?.length&&sp[0])setShopInfo({name:sp[0].name,address:sp[0].address,phone:sp[0].phone,whatsapp:sp[0].whatsapp,tiktok:sp[0].tiktok,instagram:sp[0].instagram,website:sp[0].website});
        setSyncStatus("✅ Synced");setLastSync(new Date().toLocaleTimeString());
      }catch(e){console.error(e);setSyncStatus("❌ Sync Error");}
      setSyncing(false);
    };
    load();
  },[]);

  // ── Real-time subscriptions ──────────────────────────────────
  useEffect(()=>{
    if(!supabase)return;
    const subs=[
      db.sub("products",()=>db.get("products").then(d=>{if(d?.length)setProds(d.map(r=>({...r,costPrice:r.cost_price,salePrice:r.sale_price,qtyType:r.qty_type,maxDiscount:r.max_discount,offerPrice:r.offer_price,offerStart:r.offer_start,offerEnd:r.offer_end})));})),
      db.sub("sales",()=>db.get("sales").then(d=>{if(d?.length)setSales(d.map(r=>({...r,items:r.items||[]})));})),
      db.sub("customers",()=>db.get("customers").then(d=>{if(d?.length)setCusts(d.map(r=>({...r,customerName:r.customer_name,totalPurchases:r.total_purchases})));})),
      db.sub("udhaar",()=>db.get("udhaar").then(d=>{if(d?.length)setUdh(d.map(r=>({...r,customerName:r.customer_name,totalAmount:r.total_amount})));})),
      db.sub("expenses",()=>db.get("expenses").then(d=>{if(d?.length)setExps(d);})),
    ];
    setSyncStatus("✅ Live Sync Active");
    return()=>subs.forEach(s=>s&&supabase.removeChannel(s));
  },[]);

  // ── Save to Supabase helpers ──────────────────────────────────
  const syncProd=(p)=>db.upsert("products",{id:p.id,name:p.name,brand:p.brand,color:p.color,fabric:p.fabric,category:p.category,rack:p.rack,stock:p.stock,cost_price:p.costPrice,sale_price:p.salePrice,qty_type:p.qtyType,barcode:p.barcode,bonus:p.bonus,max_discount:p.maxDiscount,offer_price:p.offerPrice,offer_start:p.offerStart,offer_end:p.offerEnd,supplier:p.supplier});
  const syncSale=(s)=>db.upsert("sales",{id:s.id,date:s.date,customer:s.customer,phone:s.phone,salesman:s.salesman,dealing:s.dealing,items:s.items,subtotal:s.subtotal,discount:s.discount,total:s.total,paid:s.paid,remaining:s.remaining,payment:s.payment});
  const syncCust=(c)=>db.upsert("customers",{id:c.id,name:c.name,phone:c.phone,city:c.city,address:c.address,loyalty:c.loyalty,total_purchases:c.totalPurchases,udhaar:c.udhaar,visits:c.visits});
  const syncExp=(e)=>db.upsert("expenses",{id:e.id,date:e.date,type:e.type,amount:e.amount,description:e.description,by:e.by});
  const syncUdh=(u)=>db.upsert("udhaar",{id:u.id,customer_name:u.customerName,phone:u.phone,total_amount:u.totalAmount,paid:u.paid,remaining:u.remaining,date:u.date,due_date:u.dueDate,notes:u.notes});
  const syncEmp=(e)=>db.upsert("employees",{id:e.id,name:e.name,phone:e.phone,role:e.role,salary:e.salary,advance:e.advance,join_date:e.joinDate,address:e.address});
  const syncSupp=(s)=>db.upsert("suppliers",{id:s.id,name:s.name,phone:s.phone,address:s.address,email:s.email,balance:s.balance,total_purchases:s.totalPurchases});
  const syncLog=(l)=>db.upsert("activity_logs",{id:l.id,date:l.date,user_name:l.userName,action:l.action,detail:l.detail});
  const syncShop=(s)=>db.upsert("shop_info",{id:1,name:s.name,address:s.address,phone:s.phone,whatsapp:s.whatsapp,tiktok:s.tiktok,instagram:s.instagram,website:s.website});
  // ── Phase 7: Website product sync (ERP → website "pending" queue) ──
  const WEB_CAT={"Mens Unstitched":"MP","Women Unstitched 3P":"WU","Women Stitched 2P+3P":"WS","Women Unstitched 2P":"WU","Other":"OT"};
  const webPayload=(p)=>({name:p.name,cat:WEB_CAT[p.category]||"OT",price:Number(p.salePrice)||0,old_price:(p.offerPrice&&Number(p.offerPrice)<Number(p.salePrice))?Number(p.salePrice):null,description:[p.fabric,p.color].filter(Boolean).join(" · "),img1:p.img1||"",img2:p.img2||"",img3:p.img3||"",brand:p.brand||"",color:p.color||"",badge:p.badge_type||"",display_stock_text:p.display_stock_text||"",in_stock:(Number(p.stock)||0)>0,website_status:"pending"});
  // Push a product to the website's PENDING queue (invisible on storefront until owner approves on website admin). Returns web id.
  const publishWeb=async(p)=>{
    if(!supabase){alert("Website sync off (Supabase set nahi).");return null;}
    try{
      if(p.webId){const{error}=await supabase.from("products").update(webPayload(p)).eq("id",p.webId);if(error)throw error;return p.webId;}
      const{data,error}=await supabase.from("products").insert({...webPayload(p),sold_count:0}).select("id").single();
      if(error)throw error;return data?.id||null;
    }catch(e){alert("Website pe bhejne me masla: "+(e.message||e));return null;}
  };
  // On an ERP sale, reflect stock on the published website product (the "alert" — owner manually unlists)
  const webStock=async(webId,remaining)=>{if(!supabase||!webId)return;try{await supabase.from("products").update({in_stock:remaining>0}).eq("id",webId);}catch(e){console.error("webStock",e);}};

  if(!user) return <Login users={users} onLogin={(u)=>{setUser(u);log("Login",u.name+" logged in");}} T={T} t={t} css={css}/>;

  // PIN Lock Screen
  if(pinLocked&&sysPin) return(
    <div style={{background:T.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"16px",padding:"36px",width:"300px",textAlign:"center",boxShadow:`0 20px 60px ${T.accent}22`}}>
        <div style={{fontSize:"40px",marginBottom:"12px"}}>🔒</div>
        <div style={{fontSize:"16px",fontWeight:"800",color:T.accent,marginBottom:"4px"}}>Screen Locked</div>
        <div style={{fontSize:"11px",color:T.muted,marginBottom:"18px"}}>30 min idle — PIN dalo</div>
        <input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} style={{...css.inp,textAlign:"center",letterSpacing:"8px",fontSize:"20px",marginBottom:"10px"}} placeholder="●●●●" onKeyDown={e=>{if(e.key==="Enter"){if(pinInput===sysPin){setPinLocked(false);setPinInput("");}else{alert("Galat PIN!");}}} }/>
        <button onClick={()=>{if(pinInput===sysPin){setPinLocked(false);setPinInput("");}else{alert("Galat PIN!");}}} style={{...css.btn(),width:"100%",padding:"10px",fontSize:"13px"}}>🔓 Unlock</button>
        <button onClick={()=>{setUser(null);setPinLocked(false);setPinInput("");}} style={{...css.btnO,width:"100%",marginTop:"8px",fontSize:"11px"}}>Logout</button>
      </div>
    </div>
  );

  // Backup
  const doBackup=()=>{const data={users,prods,custs,emps,supps,sales,exps,udh,att,dmg,ret,cc,sal,pi,bk,dr,logs,supRet,shopInfo,sysPin,exportDate:new Date().toLocaleString()};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=`jameel-backup-${td()}.json`;a.click();};
  const doRestore=(file)=>{const r=new FileReader();r.onload=e=>{try{const d=JSON.parse(e.target.result);if(d.prods)setProds(d.prods);if(d.custs)setCusts(d.custs);if(d.emps)setEmps(d.emps);if(d.supps)setSupps(d.supps);if(d.sales)setSales(d.sales);if(d.exps)setExps(d.exps);if(d.udh)setUdh(d.udh);if(d.att)setAtt(d.att);if(d.dmg)setDmg(d.dmg);if(d.ret)setRet(d.ret);if(d.cc)setCc(d.cc);if(d.sal)setSal(d.sal);if(d.pi)setPi(d.pi);if(d.bk)setBk(d.bk);if(d.dr)setDr(d.dr);if(d.supRet)setSupRet(d.supRet);if(d.shopInfo)setShopInfo(d.shopInfo);alert("✅ Backup restore ho gaya!");log("Backup","Restored");}catch{alert("❌ File invalid!");}};r.readAsText(file);};

  const sp = {T,t,css,isAdmin,isManager,td,gid,pkr,mon,log,BarcodeSVG,svgStr,db,syncProd,syncSale,syncCust,syncExp,syncUdh,syncEmp,syncSupp,syncShop,openWA,publishWeb,webStock};

  const navGroups = [
    {
      label:"🧾 BILLING",
      items:[
        {k:"dashboard",i:"📊",l:t.dashboard},
        {k:"pos",      i:"🧾",l:t.pos},
        {k:"salehistory",i:"📜",l:"Sale History"},
        {k:"thermal",  i:"🖨️",l:t.thermal},
        {k:"discounts",i:"🎯",l:t.discounts,badge:pendingDR.length},
        {k:"udhaar",   i:"💸",l:t.udhaar},
        {k:"booking",  i:"📋",l:t.booking},
      ]
    },
    {
      label:"📦 STOCK",
      items:[
        {k:"inventory",i:"📦",l:t.inventory},
        {k:"barcode",  i:"🔲",l:t.barcode},
        {k:"offers",   i:"🏷️",l:t.offers},
        {k:"stockret", i:"↩️",l:t.stockReturn},
        {k:"damaged",  i:"⚠️",l:t.damaged},
      ]
    },
    {
      label:"🏭 SUPPLIERS",
      items:[
        {k:"suppliers",i:"🏭",l:t.suppliers,adm:true},
        {k:"supret",   i:"🔄",l:"Supplier Return",adm:true},
      ]
    },
    {
      label:"👷 STAFF",
      items:[
        {k:"employees",i:"👷",l:t.employees},
        {k:"salary",   i:"💰",l:t.salary,adm:true},
        {k:"expenses", i:"🧾",l:t.expenses},
      ]
    },
    {
      label:"👥 CUSTOMERS",
      items:[
        {k:"customers",i:"👥",l:t.customers},
      ]
    },
    {
      label:"📊 REPORTS",
      items:[
        {k:"analytics",i:"📈",l:t.analytics,adm:true},
        {k:"reports",  i:"📋",l:t.reports,adm:true},
        {k:"exports",  i:"📤",l:t.exports,adm:true},
        {k:"cashclose",i:"🔒",l:t.cashClose,adm:true},
        {k:"actlog",   i:"📝",l:t.activityLog,adm:true},
      ]
    },
    {
      label:"⚙️ SYSTEM",
      items:[
        {k:"weborders",i:"🛒",l:"Web Orders"},
    {k:"settings", i:"⚙️",l:t.settings},
      ]
    },
  ];

  const notifs = [
    ...lowStock.map(p=>({id:"ls"+p.id,c:T.danger,m:`📦 ${p.name} — sirf ${p.stock} bacha!`,type:"lowstock"})),
    ...(pendingDR.length?[{id:"dr",c:"#a052e0",m:`🎯 ${pendingDR.length} discount request pending!`,type:"discount"}]:[]),
    ...bk.filter(b=>b.status==="Confirmed"&&b.deliveryDate===td()).map(b=>({id:"bk"+b.id,c:T.info,m:`📋 Booking delivery aaj: ${b.customerName} — ${b.productName}`,type:"booking"})),
  ];

  return (
    <div style={{...css.app,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      {/* TOPBAR */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 12px",height:"50px",display:"flex",alignItems:"center",gap:"8px",position:"sticky",top:0,zIndex:100,flexShrink:0}}>
        <button onClick={()=>setSideOpen(!sideOpen)} style={css.iBtn}>☰</button>
        <span style={{fontWeight:"900",fontSize:"14px",color:T.accent,whiteSpace:"nowrap"}}>🧵 {t.appName}</span>
        <div style={{flex:1,maxWidth:"280px",position:"relative"}}>
          <input ref={gSearchRef} value={gSearch} onChange={e=>{setGSearch(e.target.value);setShowGSearch(true);}} onFocus={()=>setShowGSearch(true)} onBlur={()=>setTimeout(()=>setShowGSearch(false),200)} onKeyDown={e=>{if(e.key==="Escape"){setGSearch("");setShowGSearch(false);e.target.blur();}}} style={{...css.inp,padding:"4px 10px",fontSize:"11px",height:"32px"}} placeholder="🔍 Search (Ctrl+K)..."/>
          {showGSearch&&gSearch.length>1&&(()=>{const q=gSearch.toLowerCase();const rp=prods.filter(p=>p.name.toLowerCase().includes(q)||p.barcode.includes(q)).slice(0,3);const rc=custs.filter(c=>c.name.toLowerCase().includes(q)||c.phone.includes(q)).slice(0,3);const rs=sales.filter(s=>s.customer.toLowerCase().includes(q)||String(s.id).includes(q)).slice(0,3);return(rp.length||rc.length||rs.length)?(<div style={{position:"absolute",top:"36px",left:0,right:0,background:T.card,border:`1px solid ${T.border}`,borderRadius:"10px",zIndex:999,maxHeight:"280px",overflow:"auto",boxShadow:"0 8px 24px #0008"}}>
            {rp.length>0&&<><div style={{padding:"5px 10px",fontSize:"9px",color:T.muted,fontWeight:"700"}}>📦 PRODUCTS</div>{rp.map(p=><div key={p.id} onClick={()=>{setMod("inventory");setGSearch("");setShowGSearch(false);}} style={{padding:"6px 10px",cursor:"pointer",fontSize:"11px",borderBottom:`1px solid ${T.border}33`}}><strong>{p.name}</strong> — <span style={{color:T.accent}}>{pkr(p.salePrice)}</span> <span style={{color:T.muted}}>Stock:{p.stock}</span></div>)}</>}
            {rc.length>0&&<><div style={{padding:"5px 10px",fontSize:"9px",color:T.muted,fontWeight:"700"}}>👥 CUSTOMERS</div>{rc.map(c=><div key={c.id} onClick={()=>{setMod("customers");setGSearch("");setShowGSearch(false);}} style={{padding:"6px 10px",cursor:"pointer",fontSize:"11px",borderBottom:`1px solid ${T.border}33`}}><strong>{c.name}</strong> — <span style={{color:T.muted}}>{c.phone}</span></div>)}</>}
            {rs.length>0&&<><div style={{padding:"5px 10px",fontSize:"9px",color:T.muted,fontWeight:"700"}}>🧾 BILLS</div>{rs.map(s=><div key={s.id} onClick={()=>{setMod("salehistory");setGSearch("");setShowGSearch(false);}} style={{padding:"6px 10px",cursor:"pointer",fontSize:"11px",borderBottom:`1px solid ${T.border}33`}}><strong>#{String(s.id).slice(-5)}</strong> {s.customer} — <span style={{color:T.accent}}>{pkr(s.total)}</span></div>)}</>}
          </div>):null;})()}
        </div>
        {notifs.length>0&&<div style={{position:"relative"}}>
          <button onClick={()=>{setShowNotifs(v=>!v);setSeenNotifIds(notifs.map(n=>n.id));}} style={{...css.iBtn,position:"relative"}}>
            🔔<span style={{position:"absolute",top:"-3px",right:"-3px",background:T.danger,color:"#fff",borderRadius:"50%",fontSize:"8px",width:"15px",height:"15px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900"}}>{notifs.length}</span>
          </button>
          {showNotifs&&<div style={{position:"absolute",right:0,top:"42px",background:T.card,border:`1px solid ${T.border}`,borderRadius:"12px",width:"290px",zIndex:999,boxShadow:`0 8px 32px #000a`,padding:"10px"}}>
            <div style={{fontWeight:"800",color:T.accent,marginBottom:"8px"}}>🔔 Notifications ({notifs.length})</div>
            {notifs.map(n=><div key={n.id} style={{padding:"8px 10px",borderRadius:"8px",background:n.c+"22",marginBottom:"5px",fontSize:"11px",borderLeft:`3px solid ${n.c}`,cursor:"pointer"}} onClick={()=>{setShowNotifs(false);if(n.type==="lowstock")setMod("inventory");if(n.type==="discount")setMod("discounts");if(n.type==="booking")setMod("booking");}}>{n.m}</div>)}
            <button onClick={()=>setShowNotifs(false)} style={{...css.btnO,width:"100%",marginTop:"4px",fontSize:"10px"}}>Close ✕</button>
          </div>}
        </div>}
        <span style={{fontSize:"10px",color:syncing?"#e0a052":syncStatus.includes("✅")?"#4caf7d":"#e05252",background:T.surface,padding:"2px 8px",borderRadius:"10px",border:`1px solid ${T.border}`}}>{syncStatus}{lastSync&&` — ${lastSync}`}</span>
        <span style={css.badge(isAdmin?T.accent:isManager?T.info:T.success)}>{user.role}</span>
        <span style={{fontSize:"11px",color:T.muted,maxWidth:"80px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
        <button onClick={()=>setTheme(["Modern Blue","White Gold","Eid Green"].includes(theme)?"Black Gold":"Modern Blue")} title="Light / Dark" style={{...css.btn(T.surface),color:T.text,border:`1px solid ${T.border}`,padding:"4px 7px",fontSize:"12px"}}>{["Modern Blue","White Gold","Eid Green"].includes(theme)?"🌙":"☀️"}</button>
        <select value={lang} onChange={e=>setLang(e.target.value)} style={{...css.sel,width:"auto",padding:"3px 6px",fontSize:"10px"}}>
          <option value="ro">RU</option><option value="en">EN</option><option value="ur">UR</option>
        </select>
        <button onClick={()=>{log("Logout",user.name+" logout");setUser(null);}} style={{...css.btn(T.danger),padding:"4px 7px",fontSize:"11px"}}>🚪</button>
      </div>

      {/* ALERTS BAR */}
      {notifs.length>0&&(
        <div style={{background:T.danger+"18",borderBottom:`1px solid ${T.danger}33`,padding:"4px 12px",display:"flex",gap:"12px",flexWrap:"wrap",flexShrink:0}}>
          {notifs.map(n=><span key={n.id} style={{fontSize:"11px",color:n.c}}>{n.m}</span>)}
        </div>
      )}

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* SIDEBAR — apna alag scroll */}
        <div style={{width:sideOpen?"210px":"50px",minWidth:sideOpen?"210px":"50px",background:T.surface,borderRight:`1px solid ${T.border}`,transition:"width 0.2s",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",overflowX:"hidden",paddingBottom:"8px"}}>
            {navGroups.map(group=>{
              const visItems=group.items.filter(item=>!item.adm||isManager);
              if(!visItems.length)return null;
              return(
                <div key={group.label}>
                  {sideOpen&&<div style={{padding:"10px 12px 3px",fontSize:"9px",fontWeight:"800",color:T.muted,letterSpacing:"1px",textTransform:"uppercase"}}>{group.label}</div>}
                  {visItems.map(item=>(
                    <div key={item.k} onClick={()=>setMod(item.k)} style={{padding:"7px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",background:mod===item.k?T.accent+"22":"transparent",borderLeft:mod===item.k?`3px solid ${T.accent}`:"3px solid transparent",color:mod===item.k?T.accent:T.text,fontSize:"11px",fontWeight:mod===item.k?"700":"500",whiteSpace:"nowrap",transition:"all 0.15s",overflow:"hidden"}}>
                      <span style={{fontSize:"15px",flexShrink:0}}>{item.i}</span>
                      {sideOpen&&<span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis"}}>{item.l}</span>}
                      {sideOpen&&item.badge>0&&<span style={{background:T.danger,color:"#fff",borderRadius:"50%",width:"16px",height:"16px",fontSize:"9px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",flexShrink:0}}>{item.badge}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          {sideOpen&&<div style={{padding:"6px 12px",borderTop:`1px solid ${T.border}`,fontSize:"9px",color:T.muted,flexShrink:0}}>v6.0 ✓</div>}
        </div>

        {/* MAIN — apna alag scroll */}
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"14px",height:"100%"}}>
          {mod==="dashboard" && <Dashboard {...sp} todayTotal={todayTotal} todayOnline={todayOnline} todayExp={todayExp} todayProfit={todayProfit} pendingUdh={pendingUdh} lowStock={lowStock} todaySales={todaySales} prods={prods} sales={sales} emps={emps} exps={exps} pendingDR={pendingDR}/>}
          {mod==="pos"       && <POS {...sp} prods={prods} setProds={setProds} custs={custs} emps={emps} sales={sales} setSales={setSales} udh={udh} setUdh={setUdh} dr={dr} setDr={setDr} user={user} buildBill={buildBill} silentPrint={silentPrint} shopInfo={shopInfo} bk={bk} setBk={setBk}/>}
          {mod==="salehistory"&&<SaleHistory {...sp} sales={sales} setSales={setSales} prods={prods} buildBill={buildBill} silentPrint={silentPrint} shopInfo={shopInfo}/>}
          {mod==="inventory" && <Inventory {...sp} prods={prods} setProds={setProds} supps={supps} gbc={gbc} ghc={ghc}/>}
          {mod==="barcode"   && <Barcode {...sp} prods={prods}/>}
          {mod==="thermal"   && <Thermal {...sp} sales={sales} buildBill={buildBill} silentPrint={silentPrint} shopInfo={shopInfo}/>}
          {mod==="customers" && <Customers {...sp} custs={custs} setCusts={setCusts} sales={sales}/>}
          {mod==="udhaar"    && <Udhaar {...sp} udh={udh} setUdh={setUdh}/>}
          {mod==="booking"   && <Bookings {...sp} bk={bk} setBk={setBk} custs={custs} prods={prods} user={user}/>}
          {mod==="discounts" && <Discounts {...sp} dr={dr} setDr={setDr} prods={prods} user={user}/>}
          {mod==="suppliers" && <Suppliers {...sp} supps={supps} setSupps={setSupps} pi={pi} setPi={setPi} prods={prods} setProds={setProds}/>}
          {mod==="supret"    && <SupplierReturn {...sp} supRet={supRet} setSupRet={setSupRet} supps={supps} prods={prods} setProds={setProds}/>}
          {mod==="employees" && <Employees {...sp} emps={emps} setEmps={setEmps} att={att} setAtt={setAtt} sales={sales} prods={prods} user={user}/>}
          {mod==="salary"    && <Salary {...sp} emps={emps} setEmps={setEmps} sal={sal} setSal={setSal} att={att} sales={sales} prods={prods}/>}
          {mod==="expenses"  && <Expenses {...sp} exps={exps} setExps={setExps} user={user}/>}
          {mod==="stockret"  && <StockReturn {...sp} ret={ret} setRet={setRet} prods={prods} setProds={setProds}/>}
          {mod==="damaged"   && <Damaged {...sp} dmg={dmg} setDmg={setDmg} prods={prods} setProds={setProds} supps={supps}/>}
          {mod==="offers"    && <Offers {...sp} prods={prods} setProds={setProds}/>}
          {mod==="cashclose" && <CashClose {...sp} cc={cc} setCc={setCc} sales={sales} exps={exps}/>}
          {mod==="analytics" && <Analytics {...sp} sales={sales} exps={exps} prods={prods} emps={emps} custs={custs} att={att}/>}
          {mod==="exports"   && <Exports {...sp} sales={sales} exps={exps} prods={prods} emps={emps} custs={custs} supps={supps} sal={sal} att={att} udh={udh} exportCSV={exportCSV} printHTML={printHTML}/>}
          {mod==="actlog"    && <ActLog {...sp} logs={logs} setLogs={setLogs}/>}
          {mod==="reports"   && <Reports {...sp} sales={sales} exps={exps} prods={prods} emps={emps} custs={custs} supps={supps} sal={sal} dmg={dmg} cc={cc} att={att} users={users}/>}
          {mod==="weborders" && <WebOrders T={T} css={css} pkr={pkr}/>}
          {mod==="settings"  && <Settings {...sp} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} users={users} setUsers={setUsers} shopInfo={shopInfo} setShopInfo={setShopInfo} sysPin={sysPin} setSysPin={setSysPin} doBackup={doBackup} doRestore={doRestore}/>}
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────
function Login({users,onLogin,T,t,css}) {
  const [un,setUn]=useState("");const [pw,setPw]=useState("");const [err,setErr]=useState("");
  const go=()=>{const u=users.find(x=>x.username===un&&x.password===pw);u?onLogin(u):setErr("Galat username ya password!");};
  return(
    <div style={{background:T.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"16px",padding:"36px",width:"320px",boxShadow:`0 20px 60px ${T.accent}22`}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <div style={{fontSize:"44px"}}>🧵</div>
          <div style={{fontSize:"20px",fontWeight:"900",color:T.accent}}>Jameel Fabrics</div>
          <div style={{fontSize:"11px",color:T.muted}}>Smart ERP v5.0 | Kunjah, Gujrat</div>
        </div>
        <label style={css.lbl}>{t.username}</label>
        <input value={un} onChange={e=>setUn(e.target.value)} style={css.inp} placeholder="admin / ali / ahmed" onKeyDown={e=>e.key==="Enter"&&go()}/>
        <label style={css.lbl}>{t.password}</label>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} style={css.inp} onKeyDown={e=>e.key==="Enter"&&go()}/>
        {err&&<div style={{color:T.danger,fontSize:"11px",marginTop:"4px"}}>{err}</div>}
        <button onClick={go} style={{...css.btn(),width:"100%",padding:"10px",marginTop:"16px",fontSize:"13px"}}>🔓 {t.loginBtn}</button>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({T,t,css,todayTotal,todayOnline,todayExp,todayProfit,pendingUdh,lowStock,todaySales,prods,sales,emps,exps,pendingDR,pkr,mon}) {
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const ds=d.toISOString().split("T")[0];return{day:d.toLocaleDateString("en",{weekday:"short"}),sale:sales.filter(s=>s.date===ds).reduce((a,s)=>a+s.total,0),exp:exps.filter(e=>e.date===ds).reduce((a,e)=>a+e.amount,0)};});
  const catData=CATS.map((c,i)=>({name:c.split(" ").slice(0,2).join(" "),value:sales.reduce((a,s)=>a+s.items.filter(it=>{const p=prods.find(pr=>pr.id===(it.pid??it.productId));return p&&p.category===c;}).reduce((b,it)=>b+it.total,0),0),color:CAT_C[i]}));
  const [target,setTarget]=useState(()=>LS.get("sales_target",0));
  useEffect(()=>{LS.set("sales_target",target);},[target]);
  const pct=target>0?Math.min(100,Math.round(todayTotal/target*100)):0;
  return(
    <div>
      <div style={css.h1}>📊 {t.dashboard} <span style={{fontSize:"11px",color:T.muted,fontWeight:"400"}}>— {td()}</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"10px",marginBottom:"14px"}}>
        {[{l:t.todaySale+" (Shop)",v:pkr(todayTotal),i:"💰",c:T.success},...(todayOnline>0?[{l:"Website Sale",v:pkr(todayOnline),i:"🌐",c:T.info}]:[]),{l:t.totalExpense,v:pkr(todayExp),i:"🧾",c:T.danger},{l:t.netProfit,v:pkr(todayProfit),i:"📈",c:T.accent},{l:t.pendingUdhaar,v:pkr(pendingUdh),i:"⚠️",c:"#e0a052"},{l:"Bills",v:todaySales.length,i:"🧾",c:T.info},{l:"Disc Req",v:pendingDR.length,i:"🎯",c:"#a052e0"}].map((s,i)=>(
          <div key={i} style={css.sc(s.c)}><div style={{fontSize:"18px"}}>{s.i}</div><div style={{fontSize:"17px",fontWeight:"900",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>
        ))}
      </div>
      <div style={{...css.card,marginBottom:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px",flexWrap:"wrap",gap:"6px"}}>
          <div style={{fontWeight:"700",fontSize:"12px"}}>🎯 Aaj ka Sales Target</div>
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}><input type="number" value={target||""} onChange={e=>setTarget(+e.target.value||0)} placeholder="Target Rs" style={{...css.inp,width:"120px",padding:"3px 6px",fontSize:"11px"}}/><span style={{fontSize:"13px",fontWeight:"800",color:pct>=100?T.success:T.accent}}>{pct}%</span></div>
        </div>
        <div style={{height:"16px",background:T.surface,borderRadius:"8px",overflow:"hidden",border:`1px solid ${T.border}`}}><div style={{height:"100%",width:`${pct}%`,background:pct>=100?T.success:T.accent,transition:"width .6s ease",borderRadius:"8px"}}/></div>
        <div style={{fontSize:"10px",color:T.muted,marginTop:"4px"}}>{pkr(todayTotal)} / {pkr(target)} {target>0?(todayTotal>=target?"— 🎉 Mubarak, target pura!":`— ${pkr(Math.max(0,target-todayTotal))} aur chahiye`):"— upar target set karo (motivation ke liye)"}</div>
      </div>
      {lowStock.length>0&&<div style={{...css.card,borderLeft:`4px solid ${T.danger}`,marginBottom:"12px"}}><div style={{color:T.danger,fontWeight:"700",fontSize:"12px",marginBottom:"4px"}}>🚨 Low Stock ({lowStock.length})</div><div style={css.row}>{lowStock.map(p=><span key={p.id} style={css.badge(T.danger)}>{p.name} ({p.stock})</span>)}</div></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:"12px"}}>
        <div style={css.card}>
          <div style={css.h2}>📅 7 Din — Sale vs Kharcha</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={last7} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="day" tick={{fill:T.muted,fontSize:9}}/>
              <YAxis tick={{fill:T.muted,fontSize:9}}/>
              <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}}/>
              <Bar dataKey="sale" fill={T.accent} name="Sale" radius={[3,3,0,0]}/>
              <Bar dataKey="exp" fill={T.danger} name="Kharcha" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={css.card}>
          <div style={css.h2}>🏷️ Category Breakdown</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={catData.filter(c=>c.value>0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={8}>
                {catData.map((c,i)=><Cell key={i} fill={c.color}/>)}
              </Pie>
              <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={css.card}>
          <div style={css.h2}>🧾 Aaj Ki Bills ({todaySales.length})</div>
          <div style={{maxHeight:"150px",overflow:"auto"}}>
            {todaySales.length===0?<div style={{color:T.muted,fontSize:"12px",textAlign:"center",padding:"20px"}}>Abhi koi sale nahi</div>:todaySales.map(s=>(
              <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:"11px"}}>
                <div><strong>{s.customer}</strong><div style={{fontSize:"10px",color:T.muted}}>{s.salesman}•{s.payment}</div></div>
                <div style={{textAlign:"right"}}><div style={{color:T.success,fontWeight:"700"}}>{pkr(s.total)}</div>{s.remaining>0&&<div style={{fontSize:"10px",color:T.danger}}>Baaki:{pkr(s.remaining)}</div>}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={css.card}>
          <div style={css.h2}>🏆 Top Salesman (Aaj)</div>
          {emps.map(e=>{const s=sales.filter(x=>x.salesman===e.name&&x.date===td()).reduce((a,x)=>a+x.total,0);return s>0&&<div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:"11px"}}><span>{e.name}</span><span style={{color:T.success,fontWeight:"700"}}>{pkr(s)}</span></div>;})}
        </div>
      </div>
    </div>
  );
}

// ── POS ───────────────────────────────────────────────────────
function POS({T,t,css,prods,setProds,custs,emps,sales,setSales,udh,setUdh,dr,setDr,user,isAdmin,gid,pkr,td,log,buildBill,silentPrint,shopInfo,bk,setBk,webStock}) {
  const [cart,setCart]=useState([]);
  const [cust,setCust]=useState("Walk-in");
  const [sman,setSman]=useState(user.name);
  const [dealing,setDealing]=useState("");
  const [pay,setPay]=useState("Cash");
  const [pay2,setPay2]=useState("Easypaisa");
  const [splitPay,setSplitPay]=useState(false);
  const [paid2,setPaid2]=useState(0);
  const [disc,setDisc]=useState(0);
  const [discPct,setDiscPct]=useState(0);
  const [paid,setPaid]=useState(0);
  const [sq,setSq]=useState("");
  const [cf,setCf]=useState("All");
  const [qi,setQi]=useState({});
  const [bill,setBill]=useState(null);
  const [tpl,setTpl]=useState("premium");
  const searchRef=useRef(null);
  // "Cha-ching" sale sound — two quick rising beeps via Web Audio
  const playChaching=()=>{try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[880,1320].forEach((f,k)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";o.frequency.value=f;o.connect(g);g.connect(ctx.destination);const tm=ctx.currentTime+k*0.12;g.gain.setValueAtTime(0.0001,tm);g.gain.exponentialRampToValueAtTime(0.25,tm+0.02);g.gain.exponentialRampToValueAtTime(0.0001,tm+0.26);o.start(tm);o.stop(tm+0.28);});}catch(e){}};
  const [showDR,setShowDR]=useState(false);
  const [drNote,setDrNote]=useState("");
  const [custMsg,setCustMsg]=useState("Shukriya! Dobara tashreef layen 🙏");
  const [showDiscModal,setShowDiscModal]=useState(false);
  const [fav,setFav]=useState(()=>LS.get("pos_fav",[]));
  useEffect(()=>{LS.set("pos_fav",fav);},[fav]);
  const [favOnly,setFavOnly]=useState(false);
  const toggleFav=(id)=>setFav(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);

  const now=td();
  // Advance booking alert for walk-in customers
  const bookedProducts=bk?bk.filter(b=>b.status==="Confirmed"&&b.productId).map(b=>b.productId):[];

  const ap=prods.map(p=>{
    if(p.offerPrice&&p.offerStart&&p.offerEnd&&now>=p.offerStart&&now<=p.offerEnd)return{...p,_ep:p.offerPrice,_off:true};
    return{...p,_ep:p.salePrice,_off:false};
  });
  const fl=ap.filter(p=>(cf==="All"||p.category===cf)&&(!favOnly||fav.includes(p.id))&&(p.name.toLowerCase().includes(sq.toLowerCase())||p.barcode.includes(sq)||p.color.toLowerCase().includes(sq.toLowerCase())));

  const add=(p)=>{
    if(bookedProducts.includes(p.id)&&cust==="Walk-in"){
      if(!confirm(`⚠️ "${p.name}" advance book hai kisi customer ka!\nPھر bhi Walk-in ko den?`))return;
    }
    const q=parseFloat(qi[p.id]||1);
    setCart(prev=>{const ex=prev.find(c=>c.pid===p.id);if(ex)return prev.map(c=>c.pid===p.id?{...c,qty:+(c.qty+q).toFixed(2),total:+((c.qty+q)*c.price).toFixed(0)}:c);return[...prev,{pid:p.id,name:p.name,qty:q,unit:p.qtyType,price:p._ep,total:+(q*p._ep).toFixed(0),bonus:p.bonus,onOffer:p._off,maxD:p.maxDiscount||10,itemSman:sman}];});
  };
  const sub=cart.reduce((a,c)=>a+c.total,0);
  const discAmt=discPct>0?Math.round(sub*discPct/100):Number(disc);
  const tot=sub-discAmt;
  const totalPaid=Number(paid)+(splitPay?Number(paid2):0);
  const rem=Math.max(tot-totalPaid,0);

  const reqDisc=()=>{if(!discAmt||discAmt<=0)return alert("Discount amount dalo!");const req={id:gid(),date:now,salesman:user.name,customer:cust,cartSnapshot:cart,subtotal:sub,discountRequested:discAmt,note:drNote,status:"Pending",createdAt:new Date().toLocaleString()};setDr(d=>[...d,req]);log("Discount Request",`Rs.${discAmt} — ${cust}`);setShowDR(false);setDrNote("");alert("✅ Admin ko request bhej di!");};

  const checkout=()=>{
    if(!cart.length)return alert("Cart khali hai!");
    // Bargaining floor-price guard — koi line cost price se kam pe na biche
    const lossLines=cart.filter(it=>{const p=prods.find(x=>x.id===it.pid);return p&&Number(it.price)<Number(p.costPrice);});
    if(lossLines.length){const names=lossLines.map(l=>l.name).join(", ");
      if(!isAdmin){alert("⚠️ Ye items COST se kam pe bik rahe hain (nuqsan):\n"+names+"\n\nAdmin se permission lo ya price theek karo.");return;}
      if(!confirm("⚠️ Nuqsan alert! Ye items cost price se kam pe bik rahe hain:\n"+names+"\n\nPhir bhi bill banayein?"))return;}
    if(discAmt>0&&!isAdmin){const mx=cart.reduce((a,item)=>{const p=prods.find(x=>x.id===item.pid);return a+(p?(item.price*item.qty*(p.maxDiscount||10)/100):0);},0);if(discAmt>mx){setShowDR(true);return;}}
    const payStr=splitPay?`${pay}+${pay2}`:pay;
    const s={id:gid(),date:now,time:new Date().toLocaleTimeString(),hour:new Date().getHours(),customer:cust,phone:custs.find(c=>c.name===cust)?.phone||"",salesman:sman,dealing:dealing,items:cart,subtotal:sub,discount:discAmt,total:tot,paid:totalPaid,remaining:rem,payment:payStr};
    setSales(prev=>[...prev,s]);
    cart.forEach(item=>setProds(prev=>prev.map(p=>p.id===item.pid?{...p,stock:Math.max(0,+(p.stock-item.qty).toFixed(2))}:p)));
    // Phase 7: if a sold product is listed on the website, reflect new stock there (alert owner to unlist)
    cart.forEach(item=>{const p=prods.find(x=>x.id===item.pid);if(p&&p.webId&&webStock)webStock(p.webId,Math.max(0,+(p.stock-item.qty).toFixed(2)));});
    if(rem>0){const co=custs.find(c=>c.name===cust);setUdh(prev=>[...prev,{id:gid(),customerName:cust,phone:co?.phone||"",totalAmount:rem,paid:0,remaining:rem,date:now,dueDate:"",notes:`Bill#${s.id}`}]);}
    log("Sale",`Bill#${s.id} — ${cust} — ${pkr(tot)}`);
    setBill(s);playChaching();setCart([]);setDisc(0);setDiscPct(0);setPaid(0);setPaid2(0);setSplitPay(false);setDealing("");
  };

  // Repeat last bill — load the most recent sale's items back into the cart
  const repeatLast=()=>{const last=sales[sales.length-1];if(!last||!last.items||!last.items.length)return alert("Koi pichla bill nahi!");if(cart.length&&!window.confirm("Mojooda cart replace karein?"))return;setCart(last.items.map(i=>({pid:i.pid,name:i.name,qty:i.qty,unit:i.unit,price:i.price,total:+(((i.qty)||0)*((i.price)||0)).toFixed(0),bonus:i.bonus,onOffer:i.onOffer,maxD:i.maxD,itemSman:i.itemSman})));};

  // Hold / Resume bills (park a customer's cart, serve another, resume later)
  const [held,setHeld]=useState(()=>LS.get("pos_held",[]));
  useEffect(()=>{LS.set("pos_held",held);},[held]);
  const holdBill=()=>{
    if(!cart.length)return alert("Cart khali hai!");
    setHeld(h=>[...h,{id:gid(),label:cust!=="Walk-in"?cust:("Hold "+(h.length+1)),time:new Date().toLocaleTimeString(),total:tot,cart,cust,sman,dealing,disc,discPct,pay,pay2,splitPay,paid,paid2,tpl}]);
    setCart([]);setDisc(0);setDiscPct(0);setPaid(0);setPaid2(0);setSplitPay(false);setDealing("");setCust("Walk-in");
  };
  const resumeBill=(hb)=>{
    if(cart.length&&!confirm("Mojooda cart par dosra bill resume karein? (current cart hold karein pehle)"))return;
    setCart(hb.cart||[]);setCust(hb.cust||"Walk-in");setSman(hb.sman||user.name);setDealing(hb.dealing||"");
    setDisc(hb.disc||0);setDiscPct(hb.discPct||0);setPay(hb.pay||"Cash");setPay2(hb.pay2||"Easypaisa");
    setSplitPay(hb.splitPay||false);setPaid(hb.paid||0);setPaid2(hb.paid2||0);setTpl(hb.tpl||"standard");
    setHeld(h=>h.filter(x=>x.id!==hb.id));
  };

  // Keyboard shortcuts — F9 checkout, F2 search, F4 hold (works even while typing)
  useEffect(()=>{const h=(e)=>{
    if(e.key==="F9"){e.preventDefault();checkout();}
    else if(e.key==="F2"){e.preventDefault();if(searchRef.current)searchRef.current.focus();}
    else if(e.key==="F4"){e.preventDefault();holdBill();}
  };window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);});

  // Barcode scan: scanner types the code then Enter → add the exact match
  const onScan=(e)=>{
    if(e.key!=="Enter")return;
    const code=sq.trim();if(!code)return;
    const m=ap.find(p=>p.barcode&&String(p.barcode)===code);
    if(m){add(m);setSq("");}
  };

  return(
    <div>
      <div style={css.h1}>🧾 {t.pos}</div>

      {held.length>0&&<div style={{...css.card,padding:"10px 12px",marginBottom:"10px"}}>
        <div style={{fontSize:"11px",fontWeight:"700",color:T.muted,marginBottom:"6px",textTransform:"uppercase",letterSpacing:".3px"}}>⏸️ Held Bills ({held.length})</div>
        <div style={{display:"flex",gap:"7px",flexWrap:"wrap"}}>
          {held.map(hb=>(
            <div key={hb.id} style={{display:"flex",alignItems:"center",gap:"6px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px",padding:"4px 6px 4px 12px"}}>
              <button onClick={()=>resumeBill(hb)} style={{background:"none",border:"none",cursor:"pointer",color:T.text,fontSize:"11px",fontWeight:"700"}}>{hb.label} · {pkr(hb.total||0)} <span style={{color:T.muted,fontWeight:"400"}}>· {hb.time}</span></button>
              <button onClick={()=>setHeld(h=>h.filter(x=>x.id!==hb.id))} style={{...css.btn(T.danger),padding:"1px 6px",fontSize:"10px"}}>✕</button>
            </div>
          ))}
        </div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:"12px",alignItems:"start"}}>
        {/* LEFT — Cart & Bill */}
        <div style={{...css.card,position:"sticky",top:0}}>
          <div style={{fontWeight:"800",color:T.accent,marginBottom:"8px"}}>🛒 Cart ({cart.length})</div>
          <label style={css.lbl}>Customer</label>
          <select value={cust} onChange={e=>setCust(e.target.value)} style={css.sel}><option value="Walk-in">Walk-in</option>{custs.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
          <label style={css.lbl}>Salesman (Bill pe)</label>
          <select value={sman} onChange={e=>setSman(e.target.value)} style={css.sel}>{[user.name,...emps.map(e=>e.name)].filter((v,i,a)=>a.indexOf(v)===i).map(n=><option key={n} value={n}>{n}</option>)}</select>
          <label style={css.lbl}>Dealing Person (Thermal pe)</label>
          <input value={dealing} onChange={e=>setDealing(e.target.value)} style={css.inp} placeholder="Dealing karne wala naam..."/>
          <label style={css.lbl}>Bill Template</label>
          <select value={tpl} onChange={e=>setTpl(e.target.value)} style={css.sel}><option value="premium">⭐ Premium</option><option value="standard">Standard</option><option value="simple">Simple</option></select>
          <div style={{maxHeight:"160px",overflow:"auto",margin:"7px 0",borderTop:`1px solid ${T.border}`,paddingTop:"5px"}}>
            {cart.length===0?<div style={{color:T.muted,textAlign:"center",padding:"10px",fontSize:"11px"}}>Cart khali</div>:cart.map(item=>(
              <div key={item.pid} style={{display:"flex",alignItems:"center",gap:"3px",padding:"3px 0",borderBottom:`1px solid ${T.border}`,fontSize:"10px"}}>
                <div style={{flex:1,minWidth:0}}><div style={{fontWeight:"600"}}>{item.name} <span style={{color:T.muted,fontWeight:"400"}}>{item.unit}</span></div><select value={item.itemSman||sman} onChange={e=>setCart(cart.map(c=>c.pid===item.pid?{...c,itemSman:e.target.value}:c))} style={{...css.sel,padding:"0 3px",fontSize:"9px",marginTop:"1px",width:"100%",height:"18px"}} title="Deal by (staff bonus)">{[user.name,...emps.map(e=>e.name)].filter((v,i,a)=>a.indexOf(v)===i).map(n=><option key={n} value={n}>👤 {n}</option>)}</select></div>
                <input type="number" value={item.qty} onChange={e=>setCart(cart.map(c=>c.pid===item.pid?{...c,qty:+e.target.value||0,total:(+e.target.value||0)*c.price}:c))} style={{...css.inp,width:"40px",padding:"2px 4px"}}/>
                {(()=>{const fp=prods.find(x=>x.id===item.pid);const below=fp&&Number(item.price)<Number(fp.costPrice);return(<div style={{width:"60px"}}><input type="number" value={item.price} onChange={e=>setCart(cart.map(c=>c.pid===item.pid?{...c,price:+e.target.value||0,total:c.qty*(+e.target.value||0)}:c))} style={{...css.inp,width:"60px",padding:"2px 4px",...(below?{borderColor:T.danger,color:T.danger}:{})}} title={fp?"Cost: "+pkr(fp.costPrice):""}/>{below&&<div style={{fontSize:"8px",color:T.danger,textAlign:"center",fontWeight:"700"}}>⚠️cost {pkr(fp.costPrice)}</div>}</div>);})()}
                <span style={{color:T.accent,fontWeight:"700",width:"56px",fontSize:"11px"}}>{pkr(item.total)}</span>
                <button onClick={()=>setCart(cart.filter(c=>c.pid!==item.pid))} style={{...css.btn(T.danger),padding:"2px 5px",fontSize:"10px"}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"7px"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",marginBottom:"3px"}}><span style={{color:T.muted}}>Subtotal:</span><span>{pkr(sub)}</span></div>
            <div style={{display:"flex",gap:"5px",alignItems:"center",marginTop:"4px"}}>
              <div style={{flex:1}}>
                <label style={css.lbl}>Discount Rs. {!isAdmin&&<span style={{color:"#a052e0",fontSize:"9px"}}>— admin approval</span>}</label>
                <input type="number" value={disc} onChange={e=>{setDisc(e.target.value);setDiscPct(0);}} style={css.inp} placeholder="0"/>
              </div>
              <div style={{flex:1}}>
                <label style={css.lbl}>Disc %</label>
                <input type="number" value={discPct} onChange={e=>{setDiscPct(e.target.value);setDisc(0);}} style={css.inp} placeholder="0"/>
              </div>
            </div>
            {discAmt>0&&<div style={{fontSize:"10px",color:T.danger}}>Discount: {pkr(discAmt)}</div>}
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:"800",fontSize:"14px",color:T.accent,margin:"5px 0"}}><span>TOTAL:</span><span>{pkr(tot)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px"}}>
              <label style={css.lbl}>Payment Split?</label>
              <input type="checkbox" checked={splitPay} onChange={e=>setSplitPay(e.target.checked)}/>
            </div>
            {!splitPay&&<><label style={css.lbl}>Payment</label><select value={pay} onChange={e=>setPay(e.target.value)} style={css.sel}>{POS_PAY.map(p=><option key={p} value={p}>{p==="Website-Online"?"🌐 Website-Online":p}</option>)}</select>{pay==="Website-Online"&&<div style={{fontSize:"10px",color:T.info,marginTop:"2px"}}>🌐 Website order — alag count hoga, shop sale me add nahi</div>}</>}
            {splitPay&&<div style={css.g2}>
              <div><label style={css.lbl}>Pay 1</label><select value={pay} onChange={e=>setPay(e.target.value)} style={css.sel}>{PAY_TYPES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              <div><label style={css.lbl}>Pay 2</label><select value={pay2} onChange={e=>setPay2(e.target.value)} style={css.sel}>{PAY_TYPES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              <div><label style={css.lbl}>Paid 1</label><input type="number" value={paid} onChange={e=>setPaid(e.target.value)} style={css.inp}/></div>
              <div><label style={css.lbl}>Paid 2</label><input type="number" value={paid2} onChange={e=>setPaid2(e.target.value)} style={css.inp}/></div>
            </div>}
            {!splitPay&&<><label style={css.lbl}>Paid (Rs.)</label><input type="number" value={paid} onChange={e=>setPaid(e.target.value)} style={css.inp} placeholder={tot}/></>}
            {rem>0&&<div style={{color:T.danger,fontSize:"10px",marginTop:"3px"}}>⚠️ Baaki: {pkr(rem)} → Udhaar</div>}
            <div style={{...css.row,marginTop:"6px"}}>
              <button onClick={()=>setShowCalc(true)} style={{...css.btnO,padding:"6px 10px",fontSize:"11px"}}>🧮</button>
              <button onClick={holdBill} style={{...css.btn(T.info),padding:"10px 12px",fontSize:"12px"}}>⏸️ Hold</button>
              <button onClick={checkout} style={{...css.btn(),flex:1,padding:"10px",fontSize:"13px"}}>✅ Checkout & Print</button>
            </div>
          </div>
        </div>

        {/* RIGHT — Products */}
        <div>
          <div style={css.row}>
            <input ref={searchRef} value={sq} onChange={e=>setSq(e.target.value)} onKeyDown={onScan} style={{...css.inp,flex:1}} placeholder="🔍 Naam / barcode (scan + Enter) / rang...  (F2)"/>
            <select value={cf} onChange={e=>setCf(e.target.value)} style={{...css.sel,width:"170px"}}>
              <option value="All">All</option>{CATS.map(c=><option key={c} value={c}>{c.split(" ").slice(0,2).join(" ")}</option>)}
            </select>
            <button onClick={()=>setFavOnly(f=>!f)} title="Sirf favorites" style={{...css.btn(favOnly?"#f5a623":T.surface),color:favOnly?"#fff":T.text,border:`1px solid ${T.border}`,padding:"8px 12px"}}>{favOnly?"★":"☆"} Fav</button>
            <button onClick={repeatLast} title="Pichla bill dobara load karo" style={{...css.btn(T.surface),color:T.text,border:`1px solid ${T.border}`,padding:"8px 12px"}}>↺ Repeat</button>
          </div>
          <div style={{fontSize:"9px",color:T.muted,margin:"2px 0 4px"}}>⌨️ Shortcuts: <b>F2</b> search · <b>F4</b> hold · <b>F9</b> checkout · <b>Ctrl+K</b> global search</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:"7px",marginTop:"8px",maxHeight:"calc(100vh - 200px)",overflow:"auto"}}>
            {fl.map(p=>(
              <div key={p.id} style={{background:T.card,border:`1px solid ${p.stock<=5?T.danger+"55":p._off?T.accent+"44":T.border}`,borderRadius:"9px",padding:"9px"}}>
                {p._off&&<div style={{...css.badge(T.accent),fontSize:"9px",marginBottom:"3px"}}>🏷️ OFFER</div>}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"4px"}}>
                  <div style={{fontWeight:"700",fontSize:"11px",marginBottom:"2px"}}>{p.name}</div>
                  <button onClick={()=>toggleFav(p.id)} title="Favorite" style={{background:"none",border:"none",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:0,color:fav.includes(p.id)?"#f5a623":T.muted}}>{fav.includes(p.id)?"★":"☆"}</button>
                </div>
                <div style={{fontSize:"10px",color:T.muted,marginBottom:"4px"}}>{p.color}•{p.rack}•{p.qtyType}</div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                  <div>{p._off&&<div style={{fontSize:"9px",color:T.muted,textDecoration:"line-through"}}>{pkr(p.salePrice)}</div>}<span style={{color:T.accent,fontWeight:"700",fontSize:"12px"}}>{pkr(p._ep)}</span></div>
                  <span style={css.badge(p.stock<=5?T.danger:T.success)}>{p.stock}</span>
                </div>
                <div style={{display:"flex",gap:"3px"}}>
                  <input type="number" min="0.1" step="0.1" value={qi[p.id]||1} onChange={e=>setQi({...qi,[p.id]:e.target.value})} style={{...css.inp,width:"44px",padding:"3px 5px",fontSize:"11px"}}/>
                  <button onClick={()=>add(p)} disabled={p.stock<=0} style={{...css.btn(p.stock<=0?T.muted:T.accent),flex:1,padding:"3px",fontSize:"10px",opacity:p.stock<=0?0.5:1}}>{p.stock<=0?"Out":"+ Add"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      

      {showDR&&<div style={css.modal}><div style={css.mb("380px")}><div style={{fontWeight:"800",color:"#a052e0",marginBottom:"12px"}}>🎯 Discount Approval Request</div><div style={{background:T.surface,borderRadius:"8px",padding:"10px",fontSize:"12px",marginBottom:"10px"}}>Cart: <strong>{pkr(sub)}</strong> | Discount: <strong style={{color:T.danger}}>{pkr(discAmt)}</strong></div><label style={css.lbl}>Wajah (Admin ko batao)</label><textarea value={drNote} onChange={e=>setDrNote(e.target.value)} style={{...css.inp,height:"70px",resize:"vertical"}} placeholder="Customer ne kya kaha..."/><div style={{...css.row,marginTop:"12px"}}><button onClick={reqDisc} style={{...css.btn("#a052e0"),flex:1}}>📨 Request Bhejo</button><button onClick={()=>setShowDR(false)} style={css.btnO}>Wapas</button></div></div></div>}

      {bill&&<div style={css.modal}><div style={css.mb("380px")}>
        <div style={{background:T.success+"22",border:`1px solid ${T.success}`,borderRadius:"10px",padding:"8px",textAlign:"center",marginBottom:"10px"}}><div style={{fontSize:"24px"}}>🎉✅</div><div style={{fontWeight:"800",color:T.success,fontSize:"13px"}}>Bill ban gaya — Shukriya!</div></div>
        <div style={{textAlign:"center",marginBottom:"10px"}}><div style={{fontWeight:"900",fontSize:"15px",color:T.accent}}>🧵 {shopInfo?.name||"JAMEEL FABRICS"}</div><div style={{fontSize:"10px",color:T.muted}}>{shopInfo?.address} | {shopInfo?.phone}</div></div>
        <div style={{fontSize:"11px",borderTop:`1px dashed ${T.border}`,padding:"8px 0"}}>{[["Date",bill.date],["Bill#","#"+String(bill.id).slice(-6)],["Customer",bill.customer],["By",bill.salesman],["Dealing",bill.dealing||"—"],["Payment",bill.payment]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.muted}}>{k}:</span><b>{v}</b></div>)}</div>
        <div style={{borderTop:`1px dashed ${T.border}`,padding:"8px 0"}}>{bill.items.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:"11px",marginBottom:"2px"}}><span>{it.name}{it.onOffer?" 🏷️":""} ({it.qty}{it.unit})</span><span style={{color:T.accent}}>{Number(it.total).toLocaleString()}</span></div>)}</div>
        <div style={{borderTop:`1px dashed ${T.border}`,padding:"8px 0",fontSize:"11px"}}>
          {bill.discount>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.danger}}>Discount:</span><span style={{color:T.danger}}>-{Number(bill.discount).toLocaleString()}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:"900",fontSize:"14px",color:T.accent}}><span>TOTAL:</span><span>Rs.{Number(bill.total).toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.muted}}>Paid:</span><span style={{color:T.success}}>Rs.{Number(bill.paid).toLocaleString()}</span></div>
          {bill.remaining>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.danger}}>Baaki:</span><span style={{color:T.danger}}>Rs.{Number(bill.remaining).toLocaleString()}</span></div>}
        </div>
        <div style={{...css.row,marginTop:"10px"}}>
          <button onClick={()=>silentPrint(buildBill(bill,tpl,custMsg,shopInfo))} style={{...css.btn(),flex:1}}>🖨️ Print</button>
          <button onClick={()=>{const msg=`*${(shopInfo?.name||"JAMEEL FABRICS").toUpperCase()}*\n_Premium Fabrics · Since 1975_\n\n🧾 Bill #${String(bill.id).slice(-6)}  ·  ${bill.date}\nCustomer: ${bill.customer||"Walk-in"}\nBy: ${bill.salesman}\n────────────\n${bill.items.map(it=>`• ${it.name} (${it.qty}${it.unit})  Rs.${Number(it.total).toLocaleString()}`).join("\n")}\n────────────\n${bill.discount>0?`Discount: -Rs.${Number(bill.discount).toLocaleString()}\n`:""}*TOTAL: Rs.${Number(bill.total).toLocaleString()}*\nPaid: Rs.${Number(bill.paid).toLocaleString()}${bill.remaining>0?`\n⚠️ Baaki: Rs.${Number(bill.remaining).toLocaleString()}`:""}\n\nShukriya! Dobara tashreef layen 🙏\n📞 ${shopInfo?.phone||""}`;window.open(`https://wa.me/92${(bill.phone||"").replace(/^0/,"")}?text=${encodeURIComponent(msg)}`);}} style={{...css.btn(T.success),flex:1}}>📱 WA Receipt</button>
          <button onClick={()=>setBill(null)} style={css.btnO}>✕</button>
        </div>
      </div></div>}
    </div>
  );
}

// ── SALE HISTORY ──────────────────────────────────────────────
function SaleHistory({T,t,css,sales,setSales,prods,buildBill,silentPrint,shopInfo,pkr,td,mon,log,isAdmin,gid}) {
  const [sq,setSq]=useState("");const [df,setDf]=useState(td().slice(0,7));const [pv,setPv]=useState(null);const [tpl,setTpl]=useState("standard");
  const fl=[...sales].filter(s=>(df?s.date.startsWith(df):true)&&(s.customer.toLowerCase().includes(sq.toLowerCase())||String(s.id).includes(sq)||s.salesman.toLowerCase().includes(sq.toLowerCase()))).reverse();
  const total=fl.reduce((a,s)=>a+s.total,0);const paid=fl.reduce((a,s)=>a+s.paid,0);const baaki=fl.reduce((a,s)=>a+s.remaining,0);
  const print=(s)=>silentPrint(buildBill(s,tpl,"Shukriya! Dobara tashreef layen 🙏",shopInfo));
  const wa=(s)=>{const text=`*${shopInfo?.name||"JAMEEL FABRICS"}*\nDate:${s.date} | #${String(s.id).slice(-6)}\nCustomer:${s.customer}\nBy:${s.salesman}\n\n${s.items.map(i=>`- ${i.name} x${i.qty}${i.unit} = Rs.${Number(i.total).toLocaleString()}`).join("\n")}\n\nTOTAL: *Rs.${Number(s.total).toLocaleString()}*\nPaid: Rs.${Number(s.paid).toLocaleString()}${s.remaining>0?`\nBaaki: Rs.${Number(s.remaining).toLocaleString()}`:""}\n\nShukriya!`;window.open(`https://wa.me/92${(s.phone||"").replace(/^0/,"")}?text=${encodeURIComponent(text)}`,"_blank");};
  const delSale=(id)=>{if(!isAdmin)return alert("Sirf Admin delete kar sakta!");if(!confirm("Bill delete karo?"))return;setSales(s=>s.filter(x=>x.id!==id));log("Delete Sale","Bill#"+id);};
  return(
    <div>
      <div style={css.h1}>📜 Sale History</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"8px",marginBottom:"12px"}}>
        {[{l:"Total Sale",v:pkr(total),c:T.success},{l:"Paid",v:pkr(paid),c:T.info},{l:"Baaki",v:pkr(baaki),c:T.danger},{l:"Bills",v:fl.length,c:T.accent}].map((s,i)=><div key={i} style={css.sc(s.c)}><div style={{fontSize:"14px",fontWeight:"900",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>)}
      </div>
      <div style={css.row}>
        <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,flex:1}} placeholder="🔍 Customer, bill#, salesman..."/>
        <input type="month" value={df} onChange={e=>setDf(e.target.value)} style={{...css.inp,width:"140px"}}/>
        <select value={tpl} onChange={e=>setTpl(e.target.value)} style={{...css.sel,width:"120px"}}><option value="standard">Standard</option><option value="simple">Simple</option></select>
      </div>
      <div style={{overflowX:"auto",marginTop:"10px"}}>
        <table style={css.tbl}>
          <thead><tr>{["Bill#","Date","Customer","Salesman","Dealing","Total","Paid","Baaki","Payment","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>{fl.map(s=>(
            <tr key={s.id} style={{background:pv?.id===s.id?T.accent+"11":"transparent"}}>
              <td style={css.td}><code style={{color:T.accent}}>#{String(s.id).slice(-5)}</code></td>
              <td style={css.td}>{s.date}</td>
              <td style={css.td}><strong>{s.customer}</strong><div style={{fontSize:"10px",color:T.muted}}>{s.phone}</div></td>
              <td style={css.td}>{s.salesman}</td>
              <td style={css.td}>{s.dealing||"—"}</td>
              <td style={css.td}><strong style={{color:T.accent}}>{pkr(s.total)}</strong></td>
              <td style={css.td}><span style={{color:T.success}}>{pkr(s.paid)}</span></td>
              <td style={css.td}><span style={{color:s.remaining>0?T.danger:T.success,fontWeight:s.remaining>0?"700":"400"}}>{pkr(s.remaining)}</span></td>
              <td style={css.td}><span style={css.badge(T.info)}>{s.payment}</span></td>
              <td style={css.td}><div style={css.row}>
                <button onClick={()=>print(s)} style={{...css.btn(),fontSize:"10px",padding:"3px 7px"}}>🖨️</button>
                <button onClick={()=>setPv(pv?.id===s.id?null:s)} style={{...css.btn(T.info),fontSize:"10px",padding:"3px 7px"}}>👁️</button>
                <button onClick={()=>wa(s)} style={{...css.btn(T.success),fontSize:"10px",padding:"3px 7px"}}>📱</button>
                {isAdmin&&<button onClick={()=>delSale(s.id)} style={{...css.btn(T.danger),fontSize:"10px",padding:"3px 7px"}}>🗑️</button>}
              </div></td>
            </tr>
          ))}{fl.length===0&&<tr><td colSpan={10} style={{...css.td,textAlign:"center",color:T.muted,padding:"20px"}}>Koi bill nahi</td></tr>}
          </tbody>
        </table>
      </div>
      {pv&&<div style={{...css.card,marginTop:"12px"}}><div style={{fontWeight:"700",color:T.accent,marginBottom:"8px"}}>👁️ Bill #{String(pv.id).slice(-5)} — {pv.customer}</div>{pv.items.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:"11px",padding:"3px 0",borderBottom:`1px solid ${T.border}33`}}><span>{it.name} × {it.qty}{it.unit}</span><span style={{color:T.accent}}>{pkr(it.total)}</span></div>)}<div style={{marginTop:"6px",fontWeight:"800",color:T.accent}}>TOTAL: {pkr(pv.total)} | Paid: {pkr(pv.paid)}{pv.remaining>0&&<span style={{color:T.danger}}> | Baaki: {pkr(pv.remaining)}</span>}</div></div>}
    </div>
  );
}

// ── SUPPLIER RETURN ───────────────────────────────────────────
function SupplierReturn({T,t,css,supRet,setSupRet,supps,prods,setProds,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const [er,setEr]=useState(null);
  const blank={supplierId:"",supplierName:"",productId:"",productName:"",qty:0,costPrice:0,reason:"",status:"Pending"};
  const [fm,setFm]=useState(blank);
  const save=()=>{const rec={...fm,id:er?er.id:gid(),date:er?er.date:td(),total:+fm.qty*+fm.costPrice};er?setSupRet(r=>r.map(x=>x.id===er.id?rec:x)):setSupRet(r=>[...r,rec]);if(!er&&fm.productId)setProds(p=>p.map(x=>x.id===+fm.productId?{...x,stock:Math.max(0,+(x.stock-+fm.qty).toFixed(2))}:x));log("SupplierReturn",`${fm.supplierName}—${fm.productName}`);setSf(false);setEr(null);setFm(blank);};
  const del=(id)=>{if(confirm("Delete?"))setSupRet(r=>r.filter(x=>x.id!==id));};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>🔄 Supplier Return</div><button onClick={()=>{setEr(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Supplier","Product","Qty","Amount","Reason","Status","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{[...supRet].reverse().map(r=><tr key={r.id}><td style={css.td}>{r.date}</td><td style={css.td}><strong>{r.supplierName}</strong></td><td style={css.td}>{r.productName}</td><td style={css.td}>{r.qty}</td><td style={css.td}><strong style={{color:T.danger}}>{pkr(r.total)}</strong></td><td style={css.td}>{r.reason}</td><td style={css.td}><span style={css.badge(r.status==="Resolved"?T.success:"#e0a052")}>{r.status}</span></td><td style={css.td}><div style={css.row}><button onClick={()=>{setEr(r);setFm({...r});setSf(true);}} style={{...css.btn(T.info),padding:"2px 5px",fontSize:"10px"}}>✏️</button><button onClick={()=>del(r.id)} style={{...css.btn(T.danger),padding:"2px 5px",fontSize:"10px"}}>🗑️</button></div></td></tr>)}{supRet.length===0&&<tr><td colSpan={8} style={{...css.td,textAlign:"center",color:T.muted}}>Koi record nahi</td></tr>}</tbody></table></div>
      {sf&&<div style={css.modal}><div style={css.mb("400px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{er?"✏️":"🔄"} Supplier Return</div><label style={css.lbl}>Supplier</label><select value={fm.supplierId} onChange={e=>{const s=supps.find(x=>x.id===+e.target.value);setFm({...fm,supplierId:e.target.value,supplierName:s?.name||""});}} style={css.sel}><option value="">— Select —</option>{supps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><label style={css.lbl}>Product</label><select value={fm.productId} onChange={e=>{const p=prods.find(x=>x.id===+e.target.value);setFm({...fm,productId:e.target.value,productName:p?.name||"",costPrice:p?.costPrice||0});}} style={css.sel}><option value="">— Select —</option>{prods.map(p=><option key={p.id} value={p.id}>{p.name} (Stock:{p.stock})</option>)}</select>{[["qty","Qty","number"],["costPrice","Cost Price","number"],["reason","Wajah","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<label style={css.lbl}>Status</label><select value={fm.status} onChange={e=>setFm({...fm,status:e.target.value})} style={css.sel}><option value="Pending">Pending</option><option value="Resolved">Resolved</option></select>{fm.qty&&fm.costPrice?<div style={{color:T.danger,fontSize:"11px",marginTop:"4px",fontWeight:"700"}}>Amount: {pkr(+fm.qty*+fm.costPrice)}</div>:null}<div style={{margin:"10px 0 6px",fontWeight:"700",color:T.accent,fontSize:"12px"}}>🌐 Website & Photos</div>
        <div style={css.g2}>
          {["img1","img2","img3"].map((k,i)=>(
            <div key={k}>
              <label style={css.lbl}>📸 Photo {i+1}{fm[k]?" ✅":""}</label>
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setFm(p=>({...p,[k]:ev.target.result}));r.readAsDataURL(f);}} style={{fontSize:"11px",width:"100%",marginTop:"2px"}}/>
              {fm[k]&&<img src={fm[k]} alt="" style={{width:"52px",height:"52px",objectFit:"cover",borderRadius:"6px",marginTop:"3px"}}/>}
            </div>
          ))}
          <div><label style={css.lbl}>Urgency Text</label><input value={fm.display_stock_text||""} onChange={e=>setFm({...fm,display_stock_text:e.target.value})} style={css.inp} placeholder="Sirf 3 bache!"/></div>
          <div><label style={css.lbl}>Badge</label><select value={fm.badge_type||""} onChange={e=>setFm({...fm,badge_type:e.target.value})} style={css.sel}><option value="">None</option><option value="SALE">🔥 SALE</option><option value="NEW">✨ NEW</option><option value="HOT">⚡ HOT</option><option value="LIMITED">⏳ LIMITED</option></select></div>
          <div><label style={css.lbl}>Size Type</label><select value={fm.size_type||"free"} onChange={e=>setFm({...fm,size_type:e.target.value})} style={css.sel}><option value="free">Free Size</option><option value="standard">XS–XXL</option><option value="number">26–34</option></select></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"8px 0",padding:"8px",background:T.success+"22",borderRadius:"8px",cursor:"pointer"}} onClick={()=>setFm({...fm,listOnWeb:!fm.listOnWeb})}>
          <div style={{width:"22px",height:"22px",borderRadius:"4px",border:`2px solid ${T.success}`,background:fm.listOnWeb?T.success:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"900",color:"#fff"}}>{fm.listOnWeb?"✓":""}</div>
          <div><div style={{fontWeight:"700",color:T.success,fontSize:"12px"}}>🌐 Website pe list karo</div><div style={{fontSize:"10px",color:T.muted}}>Check = online catalogue mein dikhega</div></div>
        </div>
        <div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── INVENTORY ─────────────────────────────────────────────────
function Inventory({T,t,css,prods,setProds,supps,isAdmin,gid,pkr,td,log,BarcodeSVG,gbc,ghc,publishWeb}) {
  const [sf,setSf]=useState(false);const [ep,setEp]=useState(null);const [sq,setSq]=useState("");const [cf,setCf]=useState("All");
  const blank={name:"",category:CATS[0],brand:"",color:"",fabric:"",qtyType:"meter",barcode:gbc(),hiddenCode:ghc(1),rack:"",stock:0,costPrice:0,salePrice:0,offerPrice:"",offerStart:"",offerEnd:"",supplier:"",bonus:0,maxDiscount:10,rollSize:"",img1:"",img2:"",img3:"",listOnWeb:false,display_stock_text:"",size_type:"free",badge_type:""};
  const [fm,setFm]=useState(blank);
  const fl=prods.filter(p=>(cf==="All"||p.category===cf)&&(p.name.toLowerCase().includes(sq.toLowerCase())||p.barcode.includes(sq)));
  const save=async()=>{if(!fm.name||!fm.salePrice)return alert("Naam aur price zaroori!");let o={...fm,id:ep?ep.id:gid(),stock:+fm.stock,costPrice:+fm.costPrice,salePrice:+fm.salePrice,offerPrice:fm.offerPrice?+fm.offerPrice:null,bonus:+fm.bonus,maxDiscount:+fm.maxDiscount||10};if(fm.listOnWeb&&publishWeb){const wid=await publishWeb(o);if(wid){o={...o,webId:wid,webStatus:"pending"};alert("🌐 Website ke 'Pending' me bhej diya!\nWebsite admin → Pending me ja kar photos/edit kar ke Publish karein.");}}ep?setProds(p=>p.map(x=>x.id===ep.id?o:x)):setProds(p=>[...p,o]);log("Inventory",`${fm.name} ${ep?"updated":"added"}`);setSf(false);setEp(null);setFm({...blank,barcode:gbc(),hiddenCode:ghc(prods.length+1)});};
  const isOff=(p)=>p.offerPrice&&p.offerStart&&p.offerEnd&&td()>=p.offerStart&&td()<=p.offerEnd;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"6px"}}><div style={css.h1}>📦 {t.inventory}</div><button onClick={()=>{setEp(null);setFm({...blank,barcode:gbc(),hiddenCode:ghc(prods.length+1)});setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={css.row}>
        <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,flex:1}} placeholder="🔍 Search..."/>
        <select value={cf} onChange={e=>setCf(e.target.value)} style={{...css.sel,width:"180px"}}><option value="All">All</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div style={{fontSize:"11px",color:T.muted,margin:"4px 0 8px"}}>{fl.length} products | Value: {pkr(fl.reduce((a,p)=>a+p.stock*p.costPrice,0))}</div>
      <div style={{overflowX:"auto"}}>
        <table style={css.tbl}>
          <thead><tr>{["#","Naam","Cat","Stock","Cost","Sale","Barcode","Offer","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>{fl.map((p,i)=>(
            <tr key={p.id} style={{background:p.stock<=5?T.danger+"11":"transparent"}}>
              <td style={css.td}>{i+1}</td>
              <td style={css.td}><strong>{p.name}</strong>{p.webId&&<span style={{...css.badge(T.info),marginLeft:"4px",fontSize:"8px"}}>🌐 Web</span>}<div style={{fontSize:"10px",color:T.muted}}>{p.brand}|{p.color}|{p.rack}</div></td>
              <td style={css.td}><span style={css.badge(T.info)}>{p.category.split(" ")[0]}</span></td>
              <td style={css.td}><span style={css.badge(p.stock<=5?T.danger:T.success)}>{p.stock} {p.qtyType}</span>{+p.rollSize>0&&<div style={{fontSize:"9px",color:T.muted}}>🧵 {Math.floor(p.stock/p.rollSize)} thaan + {(p.stock%p.rollSize).toFixed(1)}m</div>}</td>
              <td style={css.td}>{pkr(p.costPrice)}</td>
              <td style={css.td}><strong style={{color:T.accent}}>{pkr(p.salePrice)}</strong></td>
              <td style={css.td}><div style={{background:"#fff",borderRadius:"3px",padding:"2px",display:"inline-block"}}><BarcodeSVG value={p.barcode} width={80} height={22} showText={false}/></div><div style={{fontSize:"9px",color:T.muted}}>{p.barcode}</div></td>
              <td style={css.td}>{isOff(p)?<span style={css.badge(T.accent)}>🏷️{pkr(p.offerPrice)}</span>:<span style={{color:T.muted}}>—</span>}</td>
              <td style={css.td}><div style={css.row}><button onClick={()=>{setEp(p);setFm({...p});setSf(true);}} style={{...css.btn(T.info),padding:"3px 6px"}}>✏️</button><button onClick={()=>{if(confirm("Delete karo?"))setProds(pr=>pr.filter(x=>x.id!==p.id));log("Delete",p.name);}} style={{...css.btn(T.danger),padding:"3px 6px"}}>🗑️</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {sf&&<div style={css.modal}><div style={css.mb("580px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{ep?"✏️":"➕"} Product</div><div style={css.g2}>{[["name","Naam","text"],["brand","Brand","text"],["color","Rang","text"],["fabric","Fabric","text"],["rack","Rack","text"],["stock","Stock","number"],["costPrice","Cost Price","number"],["salePrice","Sale Price","number"],["maxDiscount","Max Disc %","number"],["offerPrice","Offer Price","number"],["offerStart","Offer Start","date"],["offerEnd","Offer End","date"],["bonus","Bonus Rs (Salesman)","number"],["barcode","Barcode","text"],["supplier","Supplier","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]||""} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div><label style={css.lbl}>Category</label><select value={fm.category} onChange={e=>setFm({...fm,category:e.target.value})} style={css.sel}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div><label style={css.lbl}>Qty Type</label><select value={fm.qtyType} onChange={e=>setFm({...fm,qtyType:e.target.value})} style={css.sel}><option value="meter">Meter</option><option value="gaz">Gaz</option><option value="piece">Piece</option></select></div></div>
        <div style={{background:T.surface,borderRadius:"8px",padding:"8px",marginTop:"8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"6px",alignItems:"center"}}><div style={{fontSize:"11px",fontWeight:"700",color:T.accent}}>🧮 Margin Calculator</div>{+fm.costPrice>0&&+fm.salePrice>0&&<div style={{fontSize:"11px"}}>Margin: <b style={{color:T.success}}>{Math.round((fm.salePrice/fm.costPrice-1)*100)}%</b> · Munafa/unit: <b style={{color:T.accent}}>{pkr(fm.salePrice-fm.costPrice)}</b></div>}</div>
          <div style={{display:"flex",gap:"5px",marginTop:"6px",flexWrap:"wrap",alignItems:"center"}}>{[20,30,40,50,60].map(m=><button key={m} type="button" onClick={()=>setFm({...fm,salePrice:Math.round((+fm.costPrice||0)*(1+m/100))})} style={{...css.btn(T.info),fontSize:"10px",padding:"3px 8px"}}>+{m}%</button>)}<span style={{fontSize:"9px",color:T.muted}}>cost pe margin laga kar sale price set karo</span></div>
          {fm.qtyType==="meter"&&<div style={{marginTop:"8px"}}><label style={css.lbl}>🧵 Thaan Size (meter per roll) — optional</label><input type="number" value={fm.rollSize||""} onChange={e=>setFm({...fm,rollSize:e.target.value})} style={{...css.inp,maxWidth:"160px"}} placeholder="e.g. 24"/>{+fm.rollSize>0&&+fm.stock>0&&<span style={{fontSize:"10px",color:T.muted,marginLeft:"8px"}}>Stock = {Math.floor(fm.stock/fm.rollSize)} thaan + {(fm.stock%fm.rollSize).toFixed(1)} m</span>}</div>}
        </div>
        <div style={{background:T.surface,borderRadius:"6px",padding:"8px",marginTop:"8px"}}>
          <div style={{fontSize:"10px",color:T.muted,marginBottom:"4px"}}>🔲 Product QR Code (scan se product dhundho)</div>
          <div style={{background:"#fff",borderRadius:"4px",padding:"4px",display:"inline-block"}}>
            <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
              {/* Simple QR-like pattern showing barcode value */}
              <rect width="80" height="80" fill="white"/>
              <rect x="2" y="2" width="20" height="20" fill="none" stroke="#000" strokeWidth="2"/>
              <rect x="6" y="6" width="12" height="12" fill="#000"/>
              <rect x="58" y="2" width="20" height="20" fill="none" stroke="#000" strokeWidth="2"/>
              <rect x="62" y="6" width="12" height="12" fill="#000"/>
              <rect x="2" y="58" width="20" height="20" fill="none" stroke="#000" strokeWidth="2"/>
              <rect x="6" y="62" width="12" height="12" fill="#000"/>
              <text x="40" y="44" textAnchor="middle" fontSize="5" fill="#000" fontFamily="monospace">{(fm.barcode||"").slice(0,12)}</text>
              <text x="40" y="52" textAnchor="middle" fontSize="4" fill="#666" fontFamily="monospace">{fm.name?.slice(0,16)||""}</text>
            </svg>
          </div>
          <div style={{fontSize:"9px",color:T.muted,marginTop:"3px"}}>Barcode: <code style={{color:T.accent}}>{fm.barcode}</code></div>
        </div>
        <div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── BARCODE ───────────────────────────────────────────────────
function Barcode({T,t,css,prods,isAdmin,pkr,BarcodeSVG,svgStr}) {
  const [tab,setTab]=useState("labels");
  const [sel,setSel]=useState(prods.map(p=>p.id));
  const [sq,setSq]=useState("");
  const [copies,setCopies]=useState({});
  const [lstyle,setLstyle]=useState("full");
  const [cv,setCv]=useState("JF001");
  const [ct,setCt]=useState("JAMEEL FABRICS");
  const [cp,setCp]=useState("1200");
  const [barPrinter,setBarPrinter]=useState("");
  const [printers,setPrinters]=useState([]);

  useEffect(()=>{
    if(IS_ELECTRON&&window.electronAPI){
      window.electronAPI.getPrinters().then(r=>{
        if(r.success){setPrinters(r.printers);const d=r.printers.find(p=>p.isDefault);if(d)setBarPrinter(d.name);}
      });
    }
  },[]);

  const fl=prods.filter(p=>p.name.toLowerCase().includes(sq.toLowerCase())||p.barcode.includes(sq));
  const toggle=(id)=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const lblHTML=(p,style)=>{
    const svg=`<svg width="160" height="40" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto"><rect width="160" height="40" fill="white"/>${svgStr(p.barcode,160,30)}<text x="80" y="39" text-anchor="middle" font-size="7" font-family="monospace" fill="black">${p.barcode}</text></svg>`;
    if(style==="mini")return`<div style="display:inline-block;margin:2mm;padding:2mm;border:1px dashed #999;text-align:center;font-family:'Courier New',monospace;vertical-align:top"><div style="font-size:11pt;font-weight:900">Rs.${Number(p.salePrice).toLocaleString()}</div>${svg}</div>`;
    if(style==="price")return`<div style="display:inline-block;margin:2mm;padding:2mm;border:1px dashed #999;text-align:center;font-family:'Courier New',monospace;vertical-align:top;min-width:45mm"><div style="font-size:9pt;font-weight:700">${p.name.slice(0,24)}</div><div style="font-size:12pt;font-weight:900">Rs.${Number(p.salePrice).toLocaleString()}/${p.qtyType}</div>${svg}</div>`;
    return`<div style="display:inline-block;margin:2mm;padding:2mm;border:1px dashed #999;text-align:center;font-family:'Courier New',monospace;vertical-align:top;min-width:55mm"><div style="font-size:9pt;font-weight:900">JAMEEL FABRICS</div><div style="border-top:1px dashed #999;margin:2px 0"></div><div style="font-size:9pt;font-weight:700">${p.name.slice(0,24)}</div><div style="font-size:8pt;color:#444">${p.category.split(" ")[0]} | ${p.color}</div><div style="font-size:13pt;font-weight:900">Rs.${Number(p.salePrice).toLocaleString()}/${p.qtyType}</div>${svg}<div style="border-top:1px dashed #999;margin:2px 0"></div><div style="font-size:7pt;color:#666">Rack:${p.rack}|${p.brand}</div></div>`;
  };

  const printLabels=()=>{
    const sp=prods.filter(p=>sel.includes(p.id));if(!sp.length)return alert("Koi product select nahi!");
    const html=sp.map(p=>Array.from({length:copies[p.id]||1}).map(()=>lblHTML(p,lstyle)).join("")).join("");
    if(IS_ELECTRON&&window.electronAPI){
      window.electronAPI.printBarcode(html,barPrinter,1).then(r=>{if(!r.success)alert("Print error: "+r.error);});
      return;
    }
    const f=document.createElement("iframe");f.style.cssText="position:fixed;width:0;height:0;border:0;left:-9999px";document.body.appendChild(f);
    const d=f.contentDocument||f.contentWindow.document;d.open();
    d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{margin:4mm}body{font-family:'Courier New',monospace}@media print{button{display:none}}</style></head><body>${html}</body></html>`);
    d.close();setTimeout(()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>{try{document.body.removeChild(f);}catch(e){}},2000);},400);
  };

  const printCustom=()=>{
    if(!cv)return alert("Value dalo!");
    const svg=`<svg width="200" height="52" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="52" fill="white"/>${svgStr(cv,200,40)}<text x="100" y="51" text-anchor="middle" font-size="8" font-family="monospace" fill="black">${cv}</text></svg>`;
    const html=`<div style="display:inline-block;padding:6mm;border:1px dashed #999"><div style="font-size:11pt;font-weight:900">${ct}</div><div style="border-top:1px dashed #999;margin:3px 0"></div>${cp?`<div style="font-size:16pt;font-weight:900">Rs.${Number(cp||0).toLocaleString()}</div>`:""}${svg}</div>`;
    if(IS_ELECTRON&&window.electronAPI){
      window.electronAPI.printBarcode(html,barPrinter,1).then(r=>{if(!r.success)alert("Print error: "+r.error);});
      return;
    }
    const f=document.createElement("iframe");f.style.cssText="position:fixed;width:0;height:0;border:0;left:-9999px";document.body.appendChild(f);
    const d=f.contentDocument||f.contentWindow.document;d.open();
    d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{margin:4mm}body{font-family:'Courier New',monospace;text-align:center;padding:10px}@media print{button{display:none}}</style></head><body>${html}</body></html>`);
    d.close();setTimeout(()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>{try{document.body.removeChild(f);}catch(e){}},2000);},400);
  };

  return(
    <div>
      <div style={css.h1}>🔲 {t.barcode}</div>
      {IS_ELECTRON&&printers.length>0&&<div style={{...css.card,marginBottom:"12px",borderLeft:`3px solid ${T.success}`}}>
        <div style={{fontWeight:"700",color:T.success,marginBottom:"6px"}}>✅ Desktop — Direct Barcode Print</div>
        <label style={css.lbl}>Barcode Printer Select</label>
        <select value={barPrinter} onChange={e=>setBarPrinter(e.target.value)} style={css.sel}>
          <option value="">— Default Printer —</option>
          {printers.map(p=><option key={p.name} value={p.name}>{p.name}{p.isDefault?" (Default)":""}</option>)}
        </select>
      </div>}
      <div style={{...css.row,marginBottom:"12px"}}>{["labels","custom"].map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{...css.btn(tab===tb?T.accent:T.surface),border:`1px solid ${T.border}`,color:tab===tb?"#000":T.text}}>{tb==="labels"?"📦 Product Labels":"✏️ Custom"}</button>)}</div>
      {tab==="labels"&&(
        <div>
          <div style={css.card}>
            <div style={{fontWeight:"700",marginBottom:"8px"}}>🎨 Label Style</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"6px",marginBottom:"10px"}}>
              {[{k:"full",l:"📦 Full",d:"Shop+product+price+barcode"},{k:"price",l:"💰 Price Tag",d:"Product+price+barcode"},{k:"mini",l:"⚡ Mini",d:"Price+barcode only"}].map(s=>(
                <div key={s.k} onClick={()=>setLstyle(s.k)} style={{padding:"7px",borderRadius:"8px",border:`2px solid ${lstyle===s.k?T.accent:T.border}`,cursor:"pointer",background:lstyle===s.k?T.accent+"11":T.surface}}>
                  <div style={{fontWeight:"700",color:lstyle===s.k?T.accent:T.text,fontSize:"11px"}}>{s.l}</div>
                  <div style={{fontSize:"9px",color:T.muted}}>{s.d}</div>
                </div>
              ))}
            </div>
            <div style={css.row}>
              <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,flex:1}} placeholder="🔍 Search..."/>
              <button onClick={()=>setSel(fl.map(p=>p.id))} style={css.btn(T.info)}>All</button>
              <button onClick={()=>setSel([])} style={css.btnO}>Clear</button>
              <button onClick={printLabels} style={css.btn(T.success)}>🖨️ Print ({sel.length})</button>
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={css.tbl}>
              <thead><tr>{["✓","Product","Price","Barcode","Preview","Copies"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>{fl.map(p=>(
                <tr key={p.id} style={{background:sel.includes(p.id)?T.accent+"11":"transparent"}}>
                  <td style={css.td}><input type="checkbox" checked={sel.includes(p.id)} onChange={()=>toggle(p.id)}/></td>
                  <td style={css.td}><strong>{p.name}</strong><div style={{fontSize:"10px",color:T.muted}}>{p.category.split(" ")[0]}|{p.color}</div></td>
                  <td style={css.td}><strong style={{color:T.accent}}>{pkr(p.salePrice)}</strong></td>
                  <td style={css.td}><code style={{fontSize:"11px",color:T.muted}}>{p.barcode}</code></td>
                  <td style={css.td}><div style={{background:"#fff",borderRadius:"3px",padding:"3px",display:"inline-block"}}><BarcodeSVG value={p.barcode} width={100} height={28}/></div></td>
                  <td style={css.td}><input type="number" min="1" max="100" value={copies[p.id]||1} onChange={e=>setCopies({...copies,[p.id]:+e.target.value||1})} style={{...css.inp,width:"60px"}}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab==="custom"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
          <div style={css.card}>
            <div style={{fontWeight:"700",marginBottom:"12px"}}>✏️ Custom Label</div>
            <label style={css.lbl}>Naam / Text</label><input value={ct} onChange={e=>setCt(e.target.value)} style={css.inp}/>
            <label style={css.lbl}>Barcode Value</label><input value={cv} onChange={e=>setCv(e.target.value)} style={css.inp}/>
            <label style={css.lbl}>Price (Rs.)</label><input value={cp} onChange={e=>setCp(e.target.value)} style={css.inp}/>
            <button onClick={printCustom} style={{...css.btn(),width:"100%",padding:"12px",marginTop:"14px",fontSize:"13px"}}>🖨️ Print Custom</button>
          </div>
          <div>
            <div style={{fontWeight:"700",color:T.muted,marginBottom:"8px"}}>👁️ Preview</div>
            <div style={{background:"#f0f0f0",borderRadius:"10px",padding:"14px",display:"flex",justifyContent:"center"}}>
              <div style={{background:"#fff",padding:"8px",border:"1px dashed #999",fontFamily:"'Courier New',monospace",textAlign:"center",minWidth:"160px"}}>
                <div style={{fontSize:"11px",fontWeight:"900",color:"#000"}}>{ct}</div>
                <div style={{borderTop:"1px dashed #999",margin:"3px 0"}}/>
                {cp&&<div style={{fontSize:"16px",fontWeight:"900",color:"#000"}}>Rs.{Number(cp||0).toLocaleString()}</div>}
                <div style={{marginTop:"4px"}}><BarcodeSVG value={cv||"JF001"} width={160} height={42}/></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── THERMAL ───────────────────────────────────────────────────
function Thermal({T,t,css,sales,buildBill,silentPrint,pkr,shopInfo}) {
  const [sq,setSq]=useState("");
  const [tpl,setTpl]=useState("standard");
  const [pv,setPv]=useState(null);
  const [copies,setCopies]=useState(1);
  const [msg,setMsg]=useState("Shukriya! Dobara tashreef layen 🙏");
  const [tab,setTab]=useState("print");
  const [printers,setPrinters]=useState([]);
  const [selPrinter,setSelPrinter]=useState("");
  const [ts,setTs]=useState(()=>{try{return JSON.parse(localStorage.getItem("jf5_thermalSettings")||"null")||{paperWidth:80,fontSize:11,margin:2,showHeader:true,showFooter:true,showPolicy:true,showSocial:true,boldAll:true,headerSize:15,shopName:"",shopAddress:"",shopPhone:""};}catch{return{paperWidth:80,fontSize:11,margin:2,showHeader:true,showFooter:true,showPolicy:true,showSocial:true,boldAll:true,headerSize:15,shopName:"",shopAddress:"",shopPhone:""}}});
  const saveThermalSettings=(ns)=>{setTs(ns);localStorage.setItem("jf5_thermalSettings",JSON.stringify(ns));};

  // Load printers in Electron
  useEffect(()=>{
    if(IS_ELECTRON&&window.electronAPI){
      window.electronAPI.getPrinters().then(r=>{
        if(r.success){
          setPrinters(r.printers);
          const def=r.printers.find(p=>p.isDefault);
          if(def)setSelPrinter(def.name);
        }
      });
    }
  },[]);

  const fl=sales.filter(x=>x.customer.toLowerCase().includes(sq.toLowerCase())||String(x.id).includes(sq)||x.date.includes(sq)||x.salesman.toLowerCase().includes(sq.toLowerCase())).slice().reverse().slice(0,100);

  const buildSI=()=>({
    name: ts.shopName||shopInfo?.name||"JAMEEL FABRICS",
    address: ts.shopAddress||shopInfo?.address||"Circular Road Kunjah, Distt Gujrat",
    phone: ts.shopPhone||shopInfo?.phone||"03008722232",
    tiktok: shopInfo?.tiktok||"",
    instagram: shopInfo?.instagram||"",
  });

  const print=(bill)=>{
    const si=buildSI();
    const html=Array.from({length:copies}).map(()=>buildBill(bill,tpl,msg,si)).join('<div style="page-break-after:always;height:4px"></div>');
    silentPrint(html,{paperWidth:ts.paperWidth,fontSize:ts.fontSize,margin:ts.margin},selPrinter,copies);
  };

  const wa=(bill)=>{
    const si=buildSI();
    const text=`*${si.name}*\nDate: ${bill.date} | #${String(bill.id).slice(-6)}\nCustomer: ${bill.customer}\nBy: ${bill.salesman}${bill.dealing?" / "+bill.dealing:""}\n\n${bill.items.map(i=>`- ${i.name} x${i.qty}${i.unit} = Rs.${Number(i.total).toLocaleString()}`).join("\n")}\n\nTOTAL: *Rs.${Number(bill.total).toLocaleString()}*\nPaid: Rs.${Number(bill.paid).toLocaleString()}${bill.remaining>0?`\nBaaki: Rs.${Number(bill.remaining).toLocaleString()}`:""}\n\n${msg}`;
    window.open(`https://wa.me/92${(bill.phone||"").replace(/^0/,"")}?text=${encodeURIComponent(text)}`,"_blank");
  };

  return(
    <div>
      <div style={css.h1}>🖨️ {t.thermal}</div>
      {IS_ELECTRON&&printers.length>0&&<div style={{...css.card,marginBottom:"12px",borderLeft:`3px solid ${T.success}`}}>
        <div style={{fontWeight:"700",color:T.success,marginBottom:"6px"}}>✅ Desktop Mode — Direct Print Active</div>
        <label style={css.lbl}>Thermal Printer Select</label>
        <select value={selPrinter} onChange={e=>setSelPrinter(e.target.value)} style={css.sel}>
          <option value="">— Default Printer —</option>
          {printers.map(p=><option key={p.name} value={p.name}>{p.name}{p.isDefault?" (Default)":""}</option>)}
        </select>
      </div>}
      <div style={{...css.row,marginBottom:"12px",flexWrap:"wrap"}}>
        {["print","settings"].map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{...css.btn(tab===tb?T.accent:T.surface),border:`1px solid ${T.border}`,color:tab===tb?"#000":T.text,fontSize:"11px"}}>{tb==="print"?"🖨️ Print Bills":"⚙️ Thermal Settings"}</button>)}
      </div>

      {tab==="settings"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px"}}>
          <div style={css.card}>
            <div style={{fontWeight:"700",marginBottom:"10px",color:T.accent}}>📐 Paper & Font</div>
            <label style={css.lbl}>Paper Width (mm)</label>
            <select value={ts.paperWidth} onChange={e=>saveThermalSettings({...ts,paperWidth:+e.target.value})} style={css.sel}>
              <option value={58}>58mm (Narrow)</option>
              <option value={72}>72mm (Standard)</option>
              <option value={80}>80mm (Wide)</option>
            </select>
            <label style={css.lbl}>Font Size: {ts.fontSize}px</label>
            <input type="range" min="8" max="16" value={ts.fontSize} onChange={e=>saveThermalSettings({...ts,fontSize:+e.target.value})} style={{width:"100%"}}/>
            <label style={css.lbl}>Margin: {ts.margin}mm</label>
            <input type="range" min="0" max="8" value={ts.margin} onChange={e=>saveThermalSettings({...ts,margin:+e.target.value})} style={{width:"100%"}}/>
            <label style={css.lbl}>Header Size: {ts.headerSize||15}px</label>
            <input type="range" min="10" max="20" value={ts.headerSize||15} onChange={e=>saveThermalSettings({...ts,headerSize:+e.target.value})} style={{width:"100%"}}/>
          </div>
          <div style={css.card}>
            <div style={{fontWeight:"700",marginBottom:"10px",color:T.accent}}>📝 Content Options</div>
            {[["showHeader","Show Header"],["showFooter","Show Footer"],["showPolicy","Show Policy"],["showSocial","Show Social IDs"],["boldAll","Bold All"]].map(([k,l])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}33`}}>
                <span style={{fontSize:"12px"}}>{l}</span>
                <div onClick={()=>saveThermalSettings({...ts,[k]:!ts[k]})} style={{width:"40px",height:"22px",borderRadius:"11px",background:ts[k]?T.success:T.border,cursor:"pointer",position:"relative",transition:"0.2s"}}>
                  <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:ts[k]?"20px":"2px",transition:"0.2s"}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={css.card}>
            <div style={{fontWeight:"700",marginBottom:"10px",color:T.accent}}>🏪 Custom Shop Info</div>
            <label style={css.lbl}>Shop Naam</label>
            <input value={ts.shopName||""} onChange={e=>saveThermalSettings({...ts,shopName:e.target.value})} style={css.inp} placeholder={shopInfo?.name||""}/>
            <label style={css.lbl}>Pata</label>
            <input value={ts.shopAddress||""} onChange={e=>saveThermalSettings({...ts,shopAddress:e.target.value})} style={css.inp} placeholder={shopInfo?.address||""}/>
            <label style={css.lbl}>Phone</label>
            <input value={ts.shopPhone||""} onChange={e=>saveThermalSettings({...ts,shopPhone:e.target.value})} style={css.inp} placeholder={shopInfo?.phone||""}/>
          </div>
          <div style={css.card}>
            <div style={{fontWeight:"700",marginBottom:"10px",color:T.accent}}>🖨️ Print Setup</div>
            {IS_ELECTRON?<div style={{fontSize:"11px",color:T.success,lineHeight:"1.8"}}>✅ Desktop mode active!<br/>Printer upar select karo<br/>Print button dabao — seedha nikal jayega<br/>Koi browser dialog nahi!</div>
            :<div style={{fontSize:"11px",color:T.muted,lineHeight:"1.8"}}><strong>Chrome Setup (1 baar):</strong><br/>• Ctrl+P → More Settings<br/>• Paper: Custom 80×200mm<br/>• Margins: None<br/>• Scale: 100%<br/>Phir sirf Print button dabao</div>}
          </div>
        </div>
      )}

      {tab==="print"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={css.card}>
              <div style={{fontWeight:"700",marginBottom:"8px"}}>🎨 Template</div>
              {[{k:"standard",l:"📄 Standard",d:"Full table"},{k:"simple",l:"⚡ Simple",d:"Fast print"}].map(tp=>(
                <div key={tp.k} onClick={()=>setTpl(tp.k)} style={{padding:"8px",borderRadius:"8px",border:`2px solid ${tpl===tp.k?T.accent:T.border}`,marginBottom:"5px",cursor:"pointer",background:tpl===tp.k?T.accent+"11":T.surface}}>
                  <div style={{fontWeight:"700",color:tpl===tp.k?T.accent:T.text,fontSize:"11px"}}>{tp.l}</div>
                  <div style={{fontSize:"10px",color:T.muted}}>{tp.d}</div>
                </div>
              ))}
            </div>
            <div style={css.card}>
              <div style={{fontWeight:"700",marginBottom:"8px"}}>⚙️ Options</div>
              <label style={css.lbl}>Copies</label>
              <input type="number" min="1" max="5" value={copies} onChange={e=>setCopies(+e.target.value||1)} style={{...css.inp,width:"70px"}}/>
              <label style={css.lbl}>Footer Message</label>
              <input value={msg} onChange={e=>setMsg(e.target.value)} style={css.inp}/>
              <div style={{fontSize:"10px",color:T.muted,marginTop:"4px"}}>
                {IS_ELECTRON?<span style={{color:T.success}}>✅ Direct: {selPrinter||"Default"}</span>:<span>Paper:{ts.paperWidth}mm | Font:{ts.fontSize}px</span>}
              </div>
            </div>
          </div>

          {pv&&<div style={{...css.card,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"12px"}}>
            <div>
              <div style={{fontWeight:"700",color:T.accent,marginBottom:"8px"}}>👁️ Preview</div>
              <div style={{background:"#f5f5f5",borderRadius:"8px",padding:"8px",display:"flex",justifyContent:"center"}}>
                <div style={{background:"#fff",borderRadius:"4px",padding:"6px",width:"240px",fontFamily:"'Courier New',monospace",fontSize:"11px",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}} dangerouslySetInnerHTML={{__html:buildBill(pv,tpl,msg,buildSI())}}/>
              </div>
            </div>
            <div>
              {[["Bill#","#"+String(pv.id).slice(-6)],["Date",pv.date],["Customer",pv.customer],["Salesman",pv.salesman],["Dealing",pv.dealing||"—"],["Total",pkr(pv.total)],["Paid",pkr(pv.paid)],["Baaki",pkr(pv.remaining)]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:"12px",padding:"4px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.muted}}>{k}:</span><strong>{v}</strong></div>
              ))}
              <div style={{...css.row,marginTop:"10px"}}>
                <button onClick={()=>print(pv)} style={{...css.btn(),flex:1,padding:"10px"}}>🖨️ Print</button>
                <button onClick={()=>wa(pv)} style={{...css.btn(T.success),flex:1,padding:"10px"}}>📱 WA</button>
                <button onClick={()=>setPv(null)} style={css.btnO}>✕</button>
              </div>
            </div>
          </div>}

          <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,marginBottom:"8px"}} placeholder="🔍 Customer, date, bill#, salesman..."/>
          <div style={{overflowX:"auto"}}>
            <table style={css.tbl}>
              <thead><tr>{["Bill#","Date","Customer","Salesman","Total","Paid","Baaki","Payment","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>
                {fl.map(s=>(
                  <tr key={s.id} style={{background:pv?.id===s.id?T.accent+"11":"transparent"}}>
                    <td style={css.td}><code style={{color:T.accent}}>#{String(s.id).slice(-5)}</code></td>
                    <td style={css.td}>{s.date}</td>
                    <td style={css.td}><strong>{s.customer}</strong></td>
                    <td style={css.td}>{s.salesman}</td>
                    <td style={css.td}><strong style={{color:T.accent}}>{pkr(s.total)}</strong></td>
                    <td style={css.td}><span style={{color:T.success}}>{pkr(s.paid)}</span></td>
                    <td style={css.td}><span style={{color:s.remaining>0?T.danger:T.success,fontWeight:s.remaining>0?"700":"400"}}>{pkr(s.remaining)}</span></td>
                    <td style={css.td}><span style={css.badge(T.info)}>{s.payment}</span></td>
                    <td style={css.td}><div style={css.row}>
                      <button onClick={()=>print(s)} title="Direct Print" style={{...css.btn(),fontSize:"10px",padding:"3px 7px"}}>🖨️</button>
                      <button onClick={()=>setPv(pv?.id===s.id?null:s)} style={{...css.btn(T.info),fontSize:"10px",padding:"3px 7px"}}>👁️</button>
                      <button onClick={()=>wa(s)} style={{...css.btn(T.success),fontSize:"10px",padding:"3px 7px"}}>📱</button>
                    </div></td>
                  </tr>
                ))}
                {fl.length===0&&<tr><td colSpan={9} style={{...css.td,textAlign:"center",color:T.muted,padding:"20px"}}>Koi bill nahi</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── CUSTOMERS ─────────────────────────────────────────────────
function Customers({T,t,css,custs,setCusts,sales,gid,pkr,log,td}) {
  const [sf,setSf]=useState(false);const [ec,setEc]=useState(null);const [sq,setSq]=useState("");const [vc,setVc]=useState(null);const [lf,setLf]=useState("All");
  const blank={name:"",phone:"",whatsapp:"",address:"",city:"Kunjah",notes:"",loyalty:"Silver",birthday:"",totalPurchases:0,udhaar:0,visits:0};const [fm,setFm]=useState(blank);
  // ── Bundle D: WhatsApp broadcast + birthday reminders ──
  const [bc,setBc]=useState(false);
  const [bcMsg,setBcMsg]=useState("Assalam o Alaikum! 🧵 Jameel Fabrics me nayi arrivals aa gayi hain — aaj hi tashreef layen. Shukriya!");
  const [bcAud,setBcAud]=useState("All");
  const waLink=(c,msg)=>`https://wa.me/92${String(c.whatsapp||c.phone||"").replace(/\D/g,"").replace(/^92/,"").replace(/^0/,"")}?text=${encodeURIComponent(msg)}`;
  const bday=custs.filter(c=>c.birthday&&c.birthday.slice(5)===td().slice(5));
  const fl=custs.filter(c=>(lf==="All"||c.loyalty===lf)&&(c.name.toLowerCase().includes(sq.toLowerCase())||c.phone.includes(sq)));
  const save=()=>{if(!fm.name||!fm.phone)return alert("Naam aur phone!");ec?setCusts(c=>c.map(x=>x.id===ec.id?{...x,...fm}:x)):setCusts(c=>[...c,{...fm,id:gid()}]);log("Customer",`${fm.name} ${ec?"updated":"added"}`);setSf(false);setEc(null);setFm(blank);};
  const lc=(l)=>l==="Platinum"?T.accent:l==="Gold"?"#e0a052":l==="VIP"?T.info:T.muted;
  // ── Phase 6: editable customer ledger / statement ──
  const [led,setLed]=useState(()=>LS.get("cust_ledger",[]));
  useEffect(()=>{LS.set("cust_ledger",led);},[led]);
  const [le,setLe]=useState({type:"payment",amount:"",desc:"",date:td()});
  const statement=(c)=>{
    if(!c)return{rows:[],bal:0,deb:0,cred:0};
    const items=[];
    sales.filter(s=>s.customer===c.name).forEach(s=>{
      items.push({date:s.date,desc:`Bill #${String(s.id).slice(-5)} (${s.payment})`,debit:s.total||0,credit:0,k:"s"+s.id});
      if(s.paid>0)items.push({date:s.date,desc:`Payment — Bill #${String(s.id).slice(-5)}`,debit:0,credit:s.paid,k:"sp"+s.id});
    });
    led.filter(l=>l.custName===c.name).forEach(l=>{
      items.push({date:l.date,desc:l.desc||(l.type==="payment"?"Payment received":"Charge"),debit:l.type==="charge"?+l.amount:0,credit:l.type==="payment"?+l.amount:0,k:l.id,manual:l.id});
    });
    items.sort((a,b)=>(a.date||"").localeCompare(b.date||""));
    let bal=0,deb=0,cred=0;const rows=items.map(r=>{bal+=r.debit-r.credit;deb+=r.debit;cred+=r.credit;return{...r,bal};});
    return{rows,bal,deb,cred};
  };
  const addLe=(c)=>{if(!le.amount||+le.amount<=0)return alert("Amount dalo!");setLed(p=>[...p,{...le,id:gid(),custName:c.name,amount:+le.amount}]);log("Ledger",`${c.name} — ${le.type} Rs.${le.amount}`);setLe({type:"payment",amount:"",desc:"",date:td()});};
  const delLe=(id)=>{if(confirm("Yeh entry delete karein?"))setLed(p=>p.filter(x=>x.id!==id));};
  const printStmt=(c)=>{const{rows,bal,deb,cred}=statement(c);printHTML(`<h2>🧵 Jameel Fabrics — Customer Statement</h2><p style="margin:0"><b>${c.name}</b> &nbsp; 📞 ${c.phone||"-"} &nbsp; ${c.city||""}</p><p style="margin:0;color:#666;font-size:11px">Generated: ${new Date().toLocaleString()}</p><table><tr><th>Date</th><th>Detail</th><th>Charge</th><th>Payment</th><th>Balance</th></tr>${rows.map(r=>`<tr><td>${r.date||"-"}</td><td>${r.desc}</td><td>${r.debit?pkr(r.debit):"-"}</td><td style="color:green">${r.credit?pkr(r.credit):"-"}</td><td><b>${pkr(r.bal)}</b></td></tr>`).join("")}</table><div class="total">Total Charge: ${pkr(deb)} | Total Paid: ${pkr(cred)} | <b>Baaki Balance: ${pkr(bal)}</b></div>`,"Customer Statement");};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"6px"}}><div style={css.h1}>👥 {t.customers}</div><div style={css.row}><button onClick={()=>setBc(true)} style={css.btn(T.info)}>📢 Broadcast</button><button onClick={()=>{setEc(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button></div></div>
      {bday.length>0&&<div style={{...css.card,borderLeft:`4px solid #e0a052`,marginBottom:"10px"}}><div style={{fontWeight:"700",color:"#e0a052",fontSize:"12px",marginBottom:"4px"}}>🎂 Aaj Birthday ({bday.length})</div><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{bday.map(c=><button key={c.id} onClick={()=>window.open(waLink(c,`🎂 Happy Birthday ${c.name}! Jameel Fabrics ki taraf se dher saari mubarakbaad. Aaj aap ke liye special discount — tashreef layen! 🎁`))} style={{...css.btn(T.success),fontSize:"10px"}}>🎂 {c.name} — Wish</button>)}</div></div>}
      <div style={css.row}>
        <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,flex:1}} placeholder="🔍 Naam ya phone..."/>
        <select value={lf} onChange={e=>setLf(e.target.value)} style={{...css.sel,width:"120px"}}><option value="All">All</option>{LOYALTY.map(l=><option key={l} value={l}>{l}</option>)}</select>
      </div>
      <div style={{fontSize:"11px",color:T.muted,margin:"4px 0 8px"}}>{fl.length} customers</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"8px"}}>
        {fl.map(c=>(
          <div key={c.id} style={{...css.card,borderLeft:`4px solid ${lc(c.loyalty)}`,marginBottom:0,cursor:"pointer"}} onClick={()=>setVc(c)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}><div><div style={{fontWeight:"700"}}>{c.name}</div><div style={{fontSize:"10px",color:T.muted}}>📞{c.phone}|{c.city}</div></div><span style={css.badge(lc(c.loyalty))}>{c.loyalty}</span></div>
            <div style={{display:"flex",gap:"10px",fontSize:"10px"}}><div><div style={{color:T.muted}}>Khareed</div><div style={{color:T.success,fontWeight:"700"}}>{pkr(c.totalPurchases)}</div></div><div><div style={{color:T.muted}}>Udhaar</div><div style={{color:c.udhaar>0?T.danger:T.success,fontWeight:"700"}}>{pkr(c.udhaar)}</div></div><div><div style={{color:T.muted}}>Visits</div><div style={{fontWeight:"700"}}>{c.visits}</div></div></div>
            <div style={{...css.row,marginTop:"6px"}} onClick={e=>e.stopPropagation()}><button onClick={()=>{setEc(c);setFm({...c});setSf(true);}} style={{...css.btn(T.info),fontSize:"10px",padding:"3px 6px"}}>✏️</button><button onClick={()=>window.open(`https://wa.me/92${c.phone.replace(/^0/,"")}`)} style={{...css.btn(T.success),fontSize:"10px",padding:"3px 6px"}}>📱 WA</button><button onClick={()=>{if(confirm("Delete?"))setCusts(x=>x.filter(y=>y.id!==c.id));}} style={{...css.btn(T.danger),fontSize:"10px",padding:"3px 6px"}}>🗑️</button></div>
          </div>
        ))}
      </div>
      {vc&&(()=>{const st=statement(vc);const waStmt=()=>{const msg=`*Jameel Fabrics — ${vc.name} ka Hisab*\n\n${st.rows.slice(-12).map(r=>`${r.date||""}  ${r.desc}\n  ${r.debit?"Charge "+pkr(r.debit):""}${r.credit?"Paid "+pkr(r.credit):""}  → Bal ${pkr(r.bal)}`).join("\n")}\n\n*Baaki Balance: ${pkr(st.bal)}*`;window.open(`https://wa.me/${vc.phone?"92"+vc.phone.replace(/^0/,""):""}?text=`+encodeURIComponent(msg),"_blank");};return(
      <div style={css.modal}><div style={css.mb("560px")}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><div style={{fontWeight:"800",fontSize:"16px",color:T.accent}}>📒 {vc.name} — Khaata</div><button onClick={()=>setVc(null)} style={css.btnO}>✕</button></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"5px",fontSize:"11px",marginBottom:"10px"}}>{[["Phone",vc.phone],["City",vc.city],["Loyalty",vc.loyalty],["Visits",vc.visits],["Total Khareed",pkr(vc.totalPurchases)],["Live Baaki",pkr(st.bal)]].map(([k,v])=><div key={k}><span style={{color:T.muted}}>{k}: </span><strong>{v}</strong></div>)}</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
          <div style={{...css.sc(T.success),flex:1,padding:"6px"}}><div style={{fontSize:"9px",color:T.muted}}>Total Charge</div><div style={{fontWeight:"800",color:T.success,fontSize:"13px"}}>{pkr(st.deb)}</div></div>
          <div style={{...css.sc(T.info),flex:1,padding:"6px"}}><div style={{fontSize:"9px",color:T.muted}}>Total Paid</div><div style={{fontWeight:"800",color:T.info,fontSize:"13px"}}>{pkr(st.cred)}</div></div>
          <div style={{...css.sc(st.bal>0?T.danger:T.success),flex:1,padding:"6px"}}><div style={{fontSize:"9px",color:T.muted}}>Baaki Balance</div><div style={{fontWeight:"800",color:st.bal>0?T.danger:T.success,fontSize:"13px"}}>{pkr(st.bal)}</div></div>
        </div>
        <div style={{fontWeight:"700",marginBottom:"4px",fontSize:"12px"}}>📋 Ledger Statement</div>
        <div style={{maxHeight:"210px",overflow:"auto",border:`1px solid ${T.border}`,borderRadius:"8px"}}><table style={css.tbl}><thead><tr>{["Date","Detail","Charge","Paid","Balance",""].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{st.rows.map((r)=><tr key={r.k}><td style={{...css.td,whiteSpace:"nowrap",fontSize:"10px"}}>{r.date||"-"}</td><td style={{...css.td,fontSize:"10px"}}>{r.desc}</td><td style={css.td}>{r.debit?pkr(r.debit):"-"}</td><td style={{...css.td,color:T.success}}>{r.credit?pkr(r.credit):"-"}</td><td style={{...css.td,fontWeight:"700"}}>{pkr(r.bal)}</td><td style={css.td}>{r.manual&&<button onClick={()=>delLe(r.manual)} style={{...css.btn(T.danger),padding:"1px 5px",fontSize:"9px"}}>✕</button>}</td></tr>)}{st.rows.length===0&&<tr><td colSpan={6} style={{...css.td,textAlign:"center",color:T.muted}}>Koi transaction nahi</td></tr>}</tbody></table></div>
        <div style={{marginTop:"8px",padding:"8px",background:T.surface,borderRadius:"8px"}}>
          <div style={{fontSize:"11px",fontWeight:"700",marginBottom:"5px"}}>➕ Entry add karein (payment / charge / adjustment)</div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",alignItems:"flex-end"}}>
            <div><label style={css.lbl}>Type</label><select value={le.type} onChange={e=>setLe({...le,type:e.target.value})} style={{...css.sel,width:"110px"}}><option value="payment">💚 Payment aaya</option><option value="charge">🔴 Charge / Udhaar</option></select></div>
            <div><label style={css.lbl}>Amount</label><input type="number" value={le.amount} onChange={e=>setLe({...le,amount:e.target.value})} style={{...css.inp,width:"90px"}}/></div>
            <div style={{flex:1,minWidth:"110px"}}><label style={css.lbl}>Tafseel</label><input value={le.desc} onChange={e=>setLe({...le,desc:e.target.value})} style={css.inp} placeholder="e.g. Cash received"/></div>
            <div><label style={css.lbl}>Date</label><input type="date" value={le.date} onChange={e=>setLe({...le,date:e.target.value})} style={{...css.inp,width:"130px"}}/></div>
            <button onClick={()=>addLe(vc)} style={css.btn(T.success)}>+ Add</button>
          </div>
        </div>
        <div style={{...css.row,marginTop:"10px"}}><button onClick={()=>printStmt(vc)} style={{...css.btn(),flex:1}}>🖨️ Print Statement</button><button onClick={waStmt} style={{...css.btn(T.success),flex:1}}>📱 WhatsApp Statement</button></div>
      </div></div>);})()}
      {sf&&<div style={css.modal}><div style={css.mb("420px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{ec?"✏️":"➕"} Customer</div><div style={css.g2}>{[["name","Naam","text"],["phone","Phone","text"],["whatsapp","WhatsApp","text"],["address","Pata","text"],["city","Sheher","text"],["notes","Notes","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div><label style={css.lbl}>Loyalty</label><select value={fm.loyalty} onChange={e=>setFm({...fm,loyalty:e.target.value})} style={css.sel}>{LOYALTY.map(l=><option key={l} value={l}>{l}</option>)}</select></div><div><label style={css.lbl}>🎂 Birthday</label><input type="date" value={fm.birthday||""} onChange={e=>setFm({...fm,birthday:e.target.value})} style={css.inp}/></div></div><div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
      {bc&&<div style={css.modal}><div style={css.mb("460px")}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><div style={{fontWeight:"800",color:T.accent}}>📢 WhatsApp Broadcast</div><button onClick={()=>setBc(false)} style={css.btnO}>✕</button></div>
        <label style={css.lbl}>Message</label>
        <textarea value={bcMsg} onChange={e=>setBcMsg(e.target.value)} style={{...css.inp,height:"80px",resize:"vertical"}}/>
        <label style={css.lbl}>Kis ko bhejna hai?</label>
        <select value={bcAud} onChange={e=>setBcAud(e.target.value)} style={css.sel}><option value="All">Sab customers ({custs.length})</option>{LOYALTY.map(l=><option key={l} value={l}>{l} ({custs.filter(c=>c.loyalty===l).length})</option>)}<option value="Udhaar">Jin pe udhaar hai ({custs.filter(c=>c.udhaar>0).length})</option></select>
        {(()=>{const tgt=custs.filter(c=>(c.whatsapp||c.phone)&&(bcAud==="All"?true:bcAud==="Udhaar"?c.udhaar>0:c.loyalty===bcAud));return(<>
        <div style={{fontSize:"11px",color:T.muted,margin:"8px 0 4px"}}>{tgt.length} customers — neeche se ek-ek ko bhejo (WhatsApp khud open hoga):</div>
        <div style={{maxHeight:"180px",overflow:"auto",border:`1px solid ${T.border}`,borderRadius:"8px",padding:"4px"}}>{tgt.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 6px",borderBottom:`1px solid ${T.border}33`,fontSize:"11px"}}><span>{c.name} <span style={{color:T.muted}}>{c.whatsapp||c.phone}</span></span><button onClick={()=>window.open(waLink(c,bcMsg))} style={{...css.btn(T.success),padding:"2px 8px",fontSize:"10px"}}>📱 Send</button></div>)}{tgt.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"10px",fontSize:"11px"}}>Koi customer nahi</div>}</div>
        <div style={{fontSize:"9px",color:T.muted,marginTop:"6px"}}>💡 WhatsApp web/app khulega message ke saath — aap Send dabayen. (Browser bulk auto-send allow nahi karta.)</div>
        </>);})()}
      </div></div>}
    </div>
  );
}

// ── UDHAAR ────────────────────────────────────────────────────
function Udhaar({T,t,css,udh,setUdh,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const [pa,setPa]=useState({});const [sq,setSq]=useState("");const [filt,setFilt]=useState("pending");
  const [fm,setFm]=useState({customerName:"",phone:"",totalAmount:0,paid:0,dueDate:"",notes:""});
  const tot=udh.reduce((a,u)=>a+u.remaining,0);
  const fl=udh.filter(u=>(filt==="all"||(filt==="pending"?u.remaining>0:u.remaining<=0))&&(u.customerName.toLowerCase().includes(sq.toLowerCase())||u.phone.includes(sq)));
  // Reminders: customers whose promised (due) date is today or already past, still owing
  const dueToday=udh.filter(u=>u.remaining>0&&u.dueDate&&u.dueDate<=td());
  const remindMsg=(u)=>`Assalam o Alaikum ${u.customerName}! *Jameel Fabrics* se reminder — aap ne ${u.dueDate} ko Rs.${Number(u.remaining).toLocaleString()} adaigi ka wada kiya tha. Meherbani farma kar payment kar dein. Shukriya 🙏`;
  const add=()=>{const a=+fm.totalAmount,p=+fm.paid;setUdh(prev=>[...prev,{...fm,id:gid(),totalAmount:a,paid:p,remaining:a-p,date:td()}]);log("Udhaar",`${fm.customerName} — Rs.${fm.totalAmount}`);setSf(false);setFm({customerName:"",phone:"",totalAmount:0,paid:0,dueDate:"",notes:""});};
  const recv=(u,amt)=>{const a=amt||+(pa[u.id]||0);if(!a)return alert("Amount dalo!");setUdh(prev=>prev.map(x=>x.id===u.id?{...x,paid:x.paid+a,remaining:Math.max(0,x.remaining-a)}:x));log("Udhaar Payment",`${u.customerName} — Rs.${a}`);setPa({...pa,[u.id]:""});};
  const del=(id)=>{if(confirm("Delete karo?"))setUdh(u=>u.filter(x=>x.id!==id));};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>💸 {t.udhaar}</div><button onClick={()=>setSf(true)} style={css.btn()}>+ Add</button></div>
      <div style={{...css.sc(T.danger),marginBottom:"12px"}}><div style={{fontSize:"20px",fontWeight:"900",color:T.danger}}>{pkr(tot)}</div><div style={{fontSize:"10px",color:T.muted}}>Pending — {udh.filter(u=>u.remaining>0).length} customers</div></div>

      {dueToday.length>0&&<div style={{...css.card,borderLeft:`4px solid ${T.danger}`,marginBottom:"12px"}}>
        <div style={{fontWeight:"800",color:T.danger,marginBottom:"4px"}}>🔔 Aaj ke Reminders ({dueToday.length})</div>
        <div style={{fontSize:"10px",color:T.muted,marginBottom:"8px"}}>In customers ne aaj/pehle adaigi ka wada kiya tha — reminder bhej do</div>
        {dueToday.map(u=>(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px",padding:"6px 0",borderTop:`1px solid ${T.border}`}}>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:"700",fontSize:"12px"}}>{u.customerName} <span style={{color:T.muted,fontSize:"10px",fontWeight:"400"}}>📞{u.phone}</span></div>
              <div style={{fontSize:"10px",color:T.danger}}>Baaki: {pkr(u.remaining)} · Wada: {u.dueDate}{u.dueDate<td()?" ⚠️ (overdue)":" (aaj)"}</div>
            </div>
            <button onClick={()=>{if(confirm(`${u.customerName} ko reminder bhejein?`))window.open(`https://wa.me/92${u.phone.replace(/^0/,"")}?text=${encodeURIComponent(remindMsg(u))}`);}} style={{...css.btn(T.success),flexShrink:0,fontSize:"11px"}}>📱 Reminder</button>
          </div>
        ))}
      </div>}

      <div style={css.row}>
        <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,flex:1}} placeholder="🔍 Search..."/>
        {["pending","all","cleared"].map(f=><button key={f} onClick={()=>setFilt(f)} style={{...css.btn(filt===f?T.accent:T.surface),border:`1px solid ${T.border}`,color:filt===f?"#000":T.text,fontSize:"10px"}}>{f==="pending"?"⏳ Baaki":f==="all"?"📋 All":"✅ Cleared"}</button>)}
      </div>
      <div style={{marginTop:"8px"}}>
      {fl.map(u=>(
        <div key={u.id} style={{...css.card,borderLeft:`4px solid ${u.remaining>0?T.danger:T.success}`,marginBottom:"8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><div style={{fontWeight:"700"}}>{u.customerName}</div><div style={{fontSize:"10px",color:T.muted}}>📞{u.phone} • {u.date}{u.dueDate&&` • Due: ${u.dueDate}`}</div>{u.notes&&<div style={{fontSize:"10px",color:T.muted}}>📝{u.notes}</div>}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:"16px",fontWeight:"900",color:u.remaining>0?T.danger:T.success}}>{pkr(u.remaining)}</div><div style={{fontSize:"10px",color:T.muted}}>Total:{pkr(u.totalAmount)} | Paid:{pkr(u.paid)}</div></div>
          </div>
          {u.remaining>0&&<>
            <div style={{...css.row,marginTop:"7px",flexWrap:"wrap"}}>
              <input type="number" value={pa[u.id]||""} onChange={e=>setPa({...pa,[u.id]:e.target.value})} style={{...css.inp,width:"100px"}} placeholder="Amount..."/>
              <button onClick={()=>recv(u)} style={css.btn(T.success)}>✅ Receive</button>
              <button onClick={()=>recv(u,u.remaining)} style={{...css.btn(T.accent),fontSize:"10px"}}>💯 Full Clear</button>
              <button onClick={()=>recv(u,Math.round(u.remaining/2))} style={{...css.btn(T.info),fontSize:"10px"}}>½ Half</button>
              <button onClick={()=>window.open(`https://wa.me/92${u.phone.replace(/^0/,"")}?text=${encodeURIComponent(`Assalam! Jameel Fabrics mein aapka Rs.${u.remaining} baaki hai. Meherbani farmayen.`)}`)} style={css.btn(T.info)}>📱 WA</button>
            </div>
          </>}
          <button onClick={()=>del(u.id)} style={{...css.btn(T.danger),fontSize:"9px",padding:"2px 6px",marginTop:"5px"}}>🗑️ Delete</button>
        </div>
      ))}
      {fl.length===0&&<div style={{...css.card,textAlign:"center",color:T.muted}}>Koi record nahi</div>}
      </div>
      {sf&&<div style={css.modal}><div style={css.mb("380px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>➕ Naya Udhaar</div>{[["customerName","Customer Naam","text"],["phone","Phone","text"],["totalAmount","Total Amount","number"],["paid","Abhi Diya","number"],["dueDate","Due Date","date"],["notes","Notes","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div style={{...css.row,marginTop:"12px"}}><button onClick={add} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── BOOKINGS ──────────────────────────────────────────────────
function Bookings({T,t,css,bk,setBk,custs,prods,user,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const [eb,setEb]=useState(null);const [flt,setFlt]=useState("All");
  const blank={customerName:"",phone:"",productId:"",productName:"",qty:1,advancePaid:0,totalAmount:0,date:td(),deliveryDate:"",notes:"",status:"Pending",salesman:user.name};
  const [fm,setFm]=useState(blank);
  const save=()=>{if(!fm.customerName||!fm.productId)return alert("Customer aur product zaroori!");const b={...fm,id:eb?eb.id:gid(),qty:+fm.qty,advancePaid:+fm.advancePaid,totalAmount:+fm.totalAmount,remaining:+fm.totalAmount - +fm.advancePaid};eb?setBk(prev=>prev.map(x=>x.id===eb.id?b:x)):setBk(prev=>[...prev,b]);log("Booking",`${fm.customerName}—${fm.productName}`);setSf(false);setEb(null);setFm(blank);};
  const upd=(id,st)=>setBk(b=>b.map(x=>x.id===id?{...x,status:st}:x));
  const del=(id)=>{if(confirm("Delete?"))setBk(b=>b.filter(x=>x.id!==id));};
  const fl=bk.filter(b=>flt==="All"||b.status===flt);
  const sc={Pending:T.accent,Confirmed:T.info,Delivered:T.success,Cancelled:T.danger};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>📋 {t.booking}</div><button onClick={()=>{setEb(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={{...css.row,marginBottom:"12px",flexWrap:"wrap"}}>{["All","Pending","Confirmed","Delivered","Cancelled"].map(s=><button key={s} onClick={()=>setFlt(s)} style={{...css.btn(flt===s?(sc[s]||T.accent):T.surface),border:`1px solid ${T.border}`,color:flt===s?"#000":T.text,fontSize:"11px"}}>{s}({bk.filter(b=>s==="All"||b.status===s).length})</button>)}</div>
      <div style={{display:"grid",gap:"8px"}}>
        {fl.length===0&&<div style={{...css.card,textAlign:"center",color:T.muted}}>Koi booking nahi</div>}
        {fl.map(b=>(
          <div key={b.id} style={{...css.card,borderLeft:`4px solid ${sc[b.status]||T.accent}`,marginBottom:0}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
              <div><div style={{fontWeight:"700"}}>{b.customerName} <span style={{fontSize:"10px",color:T.muted}}>📞{b.phone}</span></div><div style={{fontSize:"11px",color:T.muted}}>Product: <strong style={{color:T.text}}>{b.productName}</strong> × {b.qty}</div><div style={{fontSize:"11px",color:T.muted}}>Date:{b.date} | Delivery:<strong style={{color:T.accent}}>{b.deliveryDate||"—"}</strong></div>{b.notes&&<div style={{fontSize:"11px",color:T.muted}}>📝{b.notes}</div>}</div>
              <div style={{textAlign:"right"}}><span style={css.badge(sc[b.status]||T.accent)}>{b.status}</span><div style={{fontSize:"13px",fontWeight:"700",color:T.accent,marginTop:"4px"}}>{pkr(b.totalAmount)}</div><div style={{fontSize:"10px",color:T.muted}}>Advance:{pkr(b.advancePaid)}</div><div style={{fontSize:"10px",color:T.danger}}>Baaki:{pkr(b.remaining||0)}</div></div>
            </div>
            <div style={{...css.row,marginTop:"8px",flexWrap:"wrap"}}>
              {["Pending","Confirmed","Delivered","Cancelled"].filter(s=>s!==b.status).map(s=><button key={s} onClick={()=>upd(b.id,s)} style={{...css.btn(sc[s]),fontSize:"10px",padding:"3px 7px"}}>{s}</button>)}
              <button onClick={()=>window.open(`https://wa.me/92${b.phone.replace(/^0/,"")}?text=${encodeURIComponent(`Assalam! Aapki Jameel Fabrics booking ready hai. Total:Rs.${b.totalAmount} Delivery:${b.deliveryDate||"TBD"}`)}`)} style={{...css.btn(T.success),fontSize:"10px",padding:"3px 7px"}}>📱 WA</button>
              <button onClick={()=>{setEb(b);setFm({...b});setSf(true);}} style={{...css.btn(T.info),fontSize:"10px",padding:"3px 7px"}}>✏️</button>
              <button onClick={()=>del(b.id)} style={{...css.btn(T.danger),fontSize:"10px",padding:"3px 7px"}}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      {sf&&<div style={css.modal}><div style={css.mb("460px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{eb?"✏️":"📋"} Booking</div><div style={css.g2}><div><label style={css.lbl}>Customer</label><select value={fm.customerName} onChange={e=>{const c=custs.find(x=>x.name===e.target.value);setFm({...fm,customerName:e.target.value,phone:c?.phone||fm.phone});}} style={css.sel}><option value="">— Select —</option>{custs.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div><label style={css.lbl}>Phone</label><input value={fm.phone} onChange={e=>setFm({...fm,phone:e.target.value})} style={css.inp}/></div><div><label style={css.lbl}>Product</label><select value={fm.productId} onChange={e=>{const p=prods.find(x=>x.id===+e.target.value);setFm({...fm,productId:e.target.value,productName:p?.name||"",totalAmount:p?.salePrice||0});}} style={css.sel}><option value="">— Select —</option>{prods.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div><label style={css.lbl}>Qty</label><input type="number" value={fm.qty} onChange={e=>setFm({...fm,qty:e.target.value})} style={css.inp}/></div><div><label style={css.lbl}>Total Amount</label><input type="number" value={fm.totalAmount} onChange={e=>setFm({...fm,totalAmount:e.target.value})} style={css.inp}/></div><div><label style={css.lbl}>Advance Paid</label><input type="number" value={fm.advancePaid} onChange={e=>setFm({...fm,advancePaid:e.target.value})} style={css.inp}/></div><div><label style={css.lbl}>Booking Date</label><input type="date" value={fm.date} onChange={e=>setFm({...fm,date:e.target.value})} style={css.inp}/></div><div><label style={css.lbl}>Delivery Date</label><input type="date" value={fm.deliveryDate} onChange={e=>setFm({...fm,deliveryDate:e.target.value})} style={css.inp}/></div></div><label style={css.lbl}>Notes</label><textarea value={fm.notes} onChange={e=>setFm({...fm,notes:e.target.value})} style={{...css.inp,height:"50px",resize:"vertical"}}/><div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── DISCOUNTS ─────────────────────────────────────────────────
function Discounts({T,t,css,dr,setDr,prods,user,isAdmin,pkr,log}) {
  const pending=dr.filter(d=>d.status==="Pending");
  const decide=(id,st)=>{setDr(d=>d.map(x=>x.id===id?{...x,status:st,decidedBy:user.name,decidedAt:new Date().toLocaleString()}:x));log("Discount "+st,`Request #${id} — ${st}`);};
  return(
    <div>
      <div style={css.h1}>🎯 {t.discounts}</div>
      {pending.length===0?<div style={{...css.card,textAlign:"center",color:T.success}}>✅ Koi pending request nahi!</div>:(
        <div style={{marginBottom:"14px"}}>
          <div style={{fontWeight:"700",color:"#a052e0",marginBottom:"8px"}}>⏳ Pending ({pending.length})</div>
          {pending.map(req=>(
            <div key={req.id} style={{...css.card,borderLeft:`4px solid ${"#a052e0"}`,marginBottom:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                <div><div style={{fontWeight:"700"}}>{req.salesman} → {req.customer}</div><div style={{fontSize:"11px",color:T.muted}}>{req.createdAt}</div><div style={{fontSize:"12px",marginTop:"4px"}}>Cart:<strong>{pkr(req.subtotal)}</strong> | Discount:<strong style={{color:T.danger}}>{pkr(req.discountRequested)}</strong></div>{req.note&&<div style={{fontSize:"11px",color:T.muted}}>Wajah: {req.note}</div>}</div>
                {isAdmin&&<div style={css.row}><button onClick={()=>decide(req.id,"Approved")} style={css.btn(T.success)}>✅ Approve</button><button onClick={()=>decide(req.id,"Rejected")} style={css.btn(T.danger)}>❌ Reject</button></div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {["Approved","Rejected"].map(st=>{const list=dr.filter(d=>d.status===st);return list.length>0&&(
        <div key={st} style={{marginBottom:"12px"}}>
          <div style={{fontWeight:"700",color:st==="Approved"?T.success:T.danger,marginBottom:"6px"}}>{st==="Approved"?"✅":"❌"} {st} ({list.length})</div>
          <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Salesman","Customer","Discount","By","Date"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{list.map(r=><tr key={r.id}><td style={css.td}>{r.salesman}</td><td style={css.td}>{r.customer}</td><td style={css.td}><strong style={{color:T.danger}}>{pkr(r.discountRequested)}</strong></td><td style={css.td}>{r.decidedBy||"—"}</td><td style={css.td}>{r.decidedAt||r.createdAt}</td></tr>)}</tbody></table></div>
        </div>
      );})}
    </div>
  );
}

// ── SUPPLIERS ─────────────────────────────────────────────────
function Suppliers({T,t,css,supps,setSupps,pi,setPi,prods,setProds,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const [si,setSi]=useState(null);const [es,setEs]=useState(null);const [hv,setHv]=useState(null);
  const [fm,setFm]=useState({name:"",phone:"",address:"",email:"",balance:0,totalPurchases:0});
  const [iv,setIv]=useState({supplierId:null,supplierName:"",productId:"",productName:"",qty:0,costPrice:0,paid:0,notes:""});
  const [payAmt,setPayAmt]=useState({});
  const save=()=>{if(!fm.name)return;es?setSupps(s=>s.map(x=>x.id===es.id?{...x,...fm}:x)):setSupps(s=>[...s,{...fm,id:gid(),balance:+fm.balance,totalPurchases:+fm.totalPurchases}]);setSf(false);setEs(null);setFm({name:"",phone:"",address:"",email:"",balance:0,totalPurchases:0});};
  const addInv=()=>{const tot=+iv.qty*+iv.costPrice,rem=tot-+iv.paid;setPi(p=>[...p,{...iv,id:gid(),date:td(),total:tot,remaining:rem,productId:+iv.productId}]);if(iv.productId)setProds(pr=>pr.map(p=>p.id===+iv.productId?{...p,stock:+(p.stock + +iv.qty).toFixed(2)}:p));setSupps(s=>s.map(x=>x.id===iv.supplierId?{...x,balance:+(x.balance+rem).toFixed(0),totalPurchases:+(x.totalPurchases+tot).toFixed(0)}:x));log("Purchase",`${iv.supplierName} — Rs.${tot}`);setSi(null);setIv({supplierId:null,supplierName:"",productId:"",productName:"",qty:0,costPrice:0,paid:0,notes:""});};
  const paySupplier=(inv)=>{const amt=+(payAmt[inv.id]||0);if(!amt)return alert("Amount dalo!");setPi(p=>p.map(x=>x.id===inv.id?{...x,paid:x.paid+amt,remaining:Math.max(0,x.remaining-amt)}:x));setSupps(s=>s.map(x=>x.id===inv.supplierId?{...x,balance:Math.max(0,x.balance-amt)}:x));setPayAmt({...payAmt,[inv.id]:""});log("SupplierPay",`${inv.supplierName} — Rs.${amt}`);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>🏭 {t.suppliers}</div><button onClick={()=>{setEs(null);setFm({name:"",phone:"",address:"",email:"",balance:0,totalPurchases:0});setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"8px",marginBottom:"12px"}}>
        {supps.map(s=>(
          <div key={s.id} style={{...css.card,borderLeft:`4px solid ${s.balance>0?T.danger:T.success}`,marginBottom:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
              <div><div style={{fontWeight:"700"}}>{s.name}</div><div style={{fontSize:"10px",color:T.muted}}>📞{s.phone}</div>{s.address&&<div style={{fontSize:"10px",color:T.muted}}>📍{s.address}</div>}</div>
              <div style={{textAlign:"right"}}><div style={{color:s.balance>0?T.danger:T.success,fontWeight:"800",fontSize:"14px"}}>{pkr(s.balance)}</div><div style={{fontSize:"9px",color:T.muted}}>Baaki</div><div style={{fontSize:"10px",color:T.muted}}>Total: {pkr(s.totalPurchases)}</div></div>
            </div>
            <div style={{fontSize:"10px",color:T.muted,marginBottom:"6px"}}>Invoices: <strong>{pi.filter(p=>p.supplierId===s.id).length}</strong></div>
            <div style={css.row}>
              <button onClick={()=>{setSi(s);setIv({supplierId:s.id,supplierName:s.name,productId:"",productName:"",qty:0,costPrice:0,paid:0,notes:"" });}} style={{...css.btn(T.success),fontSize:"10px",flex:1}}>📦 Purchase</button>
              <button onClick={()=>setHv(hv?.id===s.id?null:s)} style={{...css.btn(T.info),fontSize:"10px"}}>📋</button>
              <button onClick={()=>{setEs(s);setFm({...s});setSf(true);}} style={{...css.btn(T.accent),fontSize:"10px"}}>✏️</button>
              <button onClick={()=>{if(confirm("Delete?"))setSupps(x=>x.filter(y=>y.id!==s.id));}} style={{...css.btn(T.danger),fontSize:"10px"}}>🗑️</button>
            </div>
          </div>
        ))}
        {supps.length===0&&<div style={{...css.card,textAlign:"center",color:T.muted}}>Koi supplier nahi</div>}
      </div>

      {hv&&<div style={{...css.card,marginBottom:"12px",borderTop:`3px solid ${T.accent}`}}>
        <div style={{fontWeight:"700",color:T.accent,marginBottom:"8px"}}>📋 {hv.name} — Purchase History</div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Product","Qty","Total","Paid","Baaki","Pay"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>
          {pi.filter(p=>p.supplierId===hv.id).reverse().map(inv=><tr key={inv.id}>
            <td style={css.td}>{inv.date}</td>
            <td style={css.td}><strong>{inv.productName||"—"}</strong></td>
            <td style={css.td}>{inv.qty}</td>
            <td style={css.td}><strong style={{color:T.accent}}>{pkr(inv.total)}</strong></td>
            <td style={css.td}><span style={{color:T.success}}>{pkr(inv.paid)}</span></td>
            <td style={css.td}><span style={{color:inv.remaining>0?T.danger:T.success,fontWeight:inv.remaining>0?"700":"400"}}>{pkr(inv.remaining)}</span></td>
            <td style={css.td}>{inv.remaining>0&&<div style={css.row}><input type="number" value={payAmt[inv.id]||""} onChange={e=>setPayAmt({...payAmt,[inv.id]:e.target.value})} style={{...css.inp,width:"80px",padding:"2px 5px"}} placeholder="Rs..."/><button onClick={()=>paySupplier(inv)} style={{...css.btn(T.success),padding:"2px 8px",fontSize:"10px"}}>✅</button><button onClick={()=>setPayAmt({...payAmt,[inv.id]:inv.remaining})} style={{...css.btn(T.accent),padding:"2px 6px",fontSize:"9px"}}>Full</button></div>}</td>
          </tr>)}
          {pi.filter(p=>p.supplierId===hv.id).length===0&&<tr><td colSpan={7} style={{...css.td,textAlign:"center",color:T.muted}}>Koi purchase nahi</td></tr>}
        </tbody></table></div>
        <button onClick={()=>setHv(null)} style={{...css.btnO,marginTop:"8px",fontSize:"10px"}}>Close ✕</button>
      </div>}

      {sf&&<div style={css.modal}><div style={css.mb("380px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{es?"✏️":"➕"} Supplier</div>{[["name","Naam","text"],["phone","Phone","text"],["address","Pata","text"],["email","Email","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]||""} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
      {si&&<div style={css.modal}><div style={css.mb("400px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>📦 Purchase — {si.name}</div><label style={css.lbl}>Product</label><select value={iv.productId} onChange={e=>{const p=prods.find(x=>x.id===+e.target.value);setIv({...iv,productId:e.target.value,productName:p?.name||"",costPrice:p?.costPrice||0});}} style={css.sel}><option value="">— Select —</option>{prods.map(p=><option key={p.id} value={p.id}>{p.name} (Stock:{p.stock})</option>)}</select>{[["qty","Qty","number"],["costPrice","Cost Price","number"],["paid","Abhi Diya (Paid)","number"],["notes","Notes","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={iv[k]} onChange={e=>setIv({...iv,[k]:e.target.value})} style={css.inp}/></div>)}{iv.qty&&iv.costPrice?<div style={{background:T.surface,borderRadius:"6px",padding:"6px",marginTop:"4px",fontSize:"11px"}}><div>Total: <strong style={{color:T.accent}}>{pkr(+iv.qty*+iv.costPrice)}</strong></div><div>Paid: <strong style={{color:T.success}}>{pkr(+iv.paid)}</strong></div><div>Baaki: <strong style={{color:T.danger}}>{pkr(+iv.qty*+iv.costPrice - +iv.paid)}</strong></div></div>:null}<div style={{...css.row,marginTop:"12px"}}><button onClick={addInv} style={{...css.btn(),flex:1}}>✅ Save</button><button onClick={()=>setSi(null)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── EMPLOYEES ─────────────────────────────────────────────────
function Employees({T,t,css,emps,setEmps,att,setAtt,sales,prods,user,isAdmin,gid,pkr,td,log}) {
  const [tb,setTb]=useState("list");const [sf,setSf]=useState(false);const [ee,setEe]=useState(null);
  const blank={name:"",phone:"",role:"Salesman",salary:0,advance:0,joinDate:td()};const [fm,setFm]=useState(blank);
  const mark=(id,st)=>{const ex=att.find(a=>a.empId===id&&a.date===td());ex?setAtt(a=>a.map(x=>x.empId===id&&x.date===td()?{...x,status:st}:x)):setAtt(a=>[...a,{id:gid(),empId:id,date:td(),status:st,checkIn:new Date().toTimeString().slice(0,5)}]);log("Attendance",`${emps.find(e=>e.id===id)?.name} — ${st}`);};
  const save=()=>{if(!fm.name)return;ee?setEmps(e=>e.map(x=>x.id===ee.id?{...x,...fm,salary:+fm.salary,advance:+fm.advance}:x)):setEmps(e=>[...e,{...fm,id:gid(),salary:+fm.salary,advance:+fm.advance}]);setSf(false);setEe(null);setFm(blank);};
  const es=(n,p)=>sales.filter(s=>s.salesman===n&&(p==="t"?s.date===td():p==="m"?s.date.startsWith(mon()):s.date.startsWith(td().slice(0,4)))).reduce((a,s)=>a+s.total,0);
  const eb=(n)=>sales.reduce((a,s)=>a+s.items.reduce((b,i)=>{const p=prods.find(pr=>pr.id===(i.pid??i.productId));return b+((p&&((i.itemSman||s.salesman)===n))?p.bonus*i.qty:0);},0),0);
  const ta=(id)=>att.find(a=>a.empId===id&&a.date===td());
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>👷 {t.employees}</div>{isAdmin&&<button onClick={()=>{setEe(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button>}</div>
      <div style={css.row}>{["list","attendance","performance"].map(tb2=><button key={tb2} onClick={()=>setTb(tb2)} style={{...css.btn(tb===tb2?T.accent:T.surface),border:`1px solid ${T.border}`,color:tb===tb2?"#000":T.text,fontSize:"11px"}}>{tb2==="list"?"📋":tb2==="attendance"?"📅":"📊"} {tb2}</button>)}</div>
      {tb==="list"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:"8px",marginTop:"12px"}}>{emps.map(e=><div key={e.id} style={css.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}><div><div style={{fontWeight:"700"}}>{e.name}</div><div style={{fontSize:"10px",color:T.muted}}>📞{e.phone}</div></div><span style={css.badge(T.accent)}>{e.role}</span></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px",fontSize:"10px"}}><div>Salary:<strong>{pkr(e.salary)}</strong></div><div>Advance:<strong style={{color:T.danger}}>{pkr(e.advance)}</strong></div><div>Aaj:<strong style={{color:T.success}}>{pkr(es(e.name,"t"))}</strong></div><div>Maheena:<strong>{pkr(es(e.name,"m"))}</strong></div></div>{isAdmin&&<div style={{...css.row,marginTop:"6px"}}><button onClick={()=>{setEe(e);setFm({...e});setSf(true);}} style={{...css.btn(T.info),flex:1,fontSize:"10px"}}>✏️ Edit</button><button onClick={()=>{if(confirm("Delete?"))setEmps(x=>x.filter(y=>y.id!==e.id));}} style={{...css.btn(T.danger),fontSize:"10px",padding:"5px 8px"}}>🗑️</button></div>}</div>)}</div>}
      {tb==="attendance"&&<div style={{marginTop:"12px"}}><div style={{fontWeight:"700",marginBottom:"8px",color:T.accent}}>📅 Aaj — {td()}</div>{emps.map(e=>{const a=ta(e.id);return<div key={e.id} style={{...css.card,display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"6px"}}><div style={{flex:1}}><div style={{fontWeight:"700"}}>{e.name}</div><div style={{fontSize:"10px",color:T.muted}}>{e.role}</div></div>{a&&<span style={css.badge(a.status==="Present"?T.success:a.status==="Late"?"#e0a052":T.danger)}>{a.status}({a.checkIn})</span>}<div style={css.row}><button onClick={()=>mark(e.id,"Present")} style={{...css.btn(T.success),padding:"3px 7px",fontSize:"10px"}}>✓</button><button onClick={()=>mark(e.id,"Late")} style={{...css.btn("#e0a052"),padding:"3px 7px",fontSize:"10px"}}>⏰</button><button onClick={()=>mark(e.id,"Absent")} style={{...css.btn(T.danger),padding:"3px 7px",fontSize:"10px"}}>✗</button></div></div>;})}  </div>}
      {tb==="performance"&&<div style={{marginTop:"12px"}}>
        <div style={{overflowX:"auto",marginBottom:"16px"}}><table style={css.tbl}><thead><tr>{["Naam","Aaj","Maheena","Saal","Total Bonus","Bills"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{emps.map(e=><tr key={e.id}><td style={css.td}><strong>{e.name}</strong></td><td style={css.td}><span style={{color:T.success}}>{pkr(es(e.name,"t"))}</span></td><td style={css.td}><span style={{color:T.info}}>{pkr(es(e.name,"m"))}</span></td><td style={css.td}><span style={{color:T.accent}}>{pkr(es(e.name,"y"))}</span></td><td style={css.td}><span style={{color:"#e0a052",fontWeight:"700"}}>{pkr(eb(e.name))}</span></td><td style={css.td}>{sales.filter(s=>s.salesman===e.name).length}</td></tr>)}</tbody></table></div>
        <div style={css.h2}>💰 Per-Product Bonus Breakdown <span style={{fontSize:"10px",color:T.muted}}>(Sirf Admin — Thermal pe nahi)</span></div>
        {emps.map(e=>{
          const prodBonuses={};
          sales.forEach(s=>s.items.forEach(i=>{if((i.itemSman||s.salesman)!==e.name)return;const p=prods.find(pr=>pr.id===(i.pid??i.productId));if(p&&p.bonus>0){if(!prodBonuses[p.id])prodBonuses[p.id]={name:p.name,bonus:p.bonus,qty:0,total:0};prodBonuses[p.id].qty+=i.qty;prodBonuses[p.id].total+=p.bonus*i.qty;}}));
          const bonusList=Object.values(prodBonuses).filter(b=>b.total>0);
          if(!bonusList.length)return null;
          return(
            <div key={e.id} style={{...css.card,marginBottom:"8px"}}>
              <div style={{fontWeight:"700",color:T.accent,marginBottom:"6px"}}>{e.name} — Total Bonus: <span style={{color:"#e0a052"}}>{pkr(bonusList.reduce((a,b)=>a+b.total,0))}</span></div>
              <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Product","Bonus/Unit","Qty Sold","Total Bonus"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{bonusList.map((b,i)=><tr key={i}><td style={css.td}>{b.name}</td><td style={css.td}><span style={{color:"#e0a052"}}>Rs.{b.bonus}</span></td><td style={css.td}>{b.qty.toFixed(1)}</td><td style={css.td}><strong style={{color:"#e0a052"}}>{pkr(b.total)}</strong></td></tr>)}</tbody></table></div>
            </div>
          );
        })}
      </div>}
      {sf&&isAdmin&&<div style={css.modal}><div style={css.mb("360px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{ee?"✏️":"➕"} Employee</div>{[["name","Naam","text"],["phone","Phone","text"],["salary","Salary","number"],["advance","Advance","number"],["joinDate","Join Date","date"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div><label style={css.lbl}>Role</label><select value={fm.role} onChange={e=>setFm({...fm,role:e.target.value})} style={css.sel}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div><div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── SALARY ────────────────────────────────────────────────────
function Salary({T,t,css,emps,setEmps,sal,setSal,att,sales,prods,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const [fm,setFm]=useState({empId:null,empName:"",salary:0,advance:0,bonus:0,deduction:0,notes:"",month:mon()});
  const pd=(id,m)=>att.filter(a=>a.empId===id&&a.date.startsWith(m)&&a.status!=="Absent").length;
  const eb=(name,m)=>sales.filter(s=>s.date.startsWith(m)).reduce((a,s)=>a+s.items.reduce((b,i)=>{const p=prods.find(pr=>pr.id===(i.pid??i.productId));return b+((p&&((i.itemSman||s.salesman)===name))?p.bonus*i.qty:0);},0),0);
  const pay=()=>{if(!fm.empId)return;const net=+fm.salary + +fm.bonus - +fm.advance - +fm.deduction;setSal(p=>[...p,{...fm,id:gid(),date:td(),net,empId:+fm.empId}]);setEmps(e=>e.map(x=>x.id===+fm.empId?{...x,advance:0}:x));log("Salary",`${fm.empName} — Rs.${net}`);setSf(false);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>💰 {t.salary}</div><button onClick={()=>setSf(true)} style={css.btn()}>+ Pay</button></div>
      <div style={{overflowX:"auto",marginBottom:"12px"}}><table style={css.tbl}><thead><tr>{["Employee","Salary","Haazri","Bonus","Advance","Net"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{emps.map(e=>{const days=pd(e.id,mon()),bonus=eb(e.name,mon()),net=e.salary+bonus-e.advance;return<tr key={e.id}><td style={css.td}><strong>{e.name}</strong></td><td style={css.td}>{pkr(e.salary)}</td><td style={css.td}><span style={css.badge(days>20?T.success:T.danger)}>{days}d</span></td><td style={css.td}><span style={{color:"#e0a052"}}>{pkr(bonus)}</span></td><td style={css.td}><span style={{color:T.danger}}>{pkr(e.advance)}</span></td><td style={css.td}><strong style={{color:T.accent}}>{pkr(net)}</strong></td></tr>;})}</tbody></table></div>
      <div style={css.h2}>Payment History</div>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Employee","Month","Net"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{[...sal].reverse().map(p=><tr key={p.id}><td style={css.td}>{p.date}</td><td style={css.td}><strong>{p.empName}</strong></td><td style={css.td}>{p.month}</td><td style={css.td}><strong style={{color:T.success}}>{pkr(p.net)}</strong></td></tr>)}{sal.length===0&&<tr><td colSpan={4} style={{...css.td,textAlign:"center",color:T.muted}}>Koi record nahi</td></tr>}</tbody></table></div>
      {sf&&<div style={css.modal}><div style={css.mb("380px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>💰 Salary Pay</div><label style={css.lbl}>Employee</label><select value={fm.empId||""} onChange={e=>{const emp=emps.find(x=>x.id===+e.target.value);setFm({...fm,empId:+e.target.value,empName:emp?.name||"",salary:emp?.salary||0,advance:emp?.advance||0,bonus:eb(emp?.name||"",fm.month)});}} style={css.sel}><option value="">— Select —</option>{emps.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><label style={css.lbl}>Month</label><input type="month" value={fm.month} onChange={e=>setFm({...fm,month:e.target.value})} style={css.inp}/>{[["salary","Salary","number"],["bonus","Bonus","number"],["advance","Advance Deduct","number"],["deduction","Extra Deduct","number"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div style={{color:T.accent,fontSize:"13px",marginTop:"6px",fontWeight:"700"}}>Net: {pkr(+fm.salary + +fm.bonus - +fm.advance - +fm.deduction)}</div><div style={{...css.row,marginTop:"12px"}}><button onClick={pay} style={{...css.btn(),flex:1}}>✅ Pay</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── EXPENSES ──────────────────────────────────────────────────
function Expenses({T,t,css,exps,setExps,user,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const [ee,setEe]=useState(null);
  const blank={type:"Tea/Food",amount:0,description:"",date:td(),by:user.name};
  const [fm,setFm]=useState(blank);
  const save=()=>{const rec={...fm,id:ee?ee.id:gid(),amount:+fm.amount};ee?setExps(e=>e.map(x=>x.id===ee.id?rec:x)):setExps(e=>[...e,rec]);log("Expense",`${fm.type} — Rs.${fm.amount}`);setSf(false);setEe(null);setFm(blank);};
  const del=(id)=>{if(confirm("Delete?"))setExps(e=>e.filter(x=>x.id!==id));};
  const tt=exps.filter(e=>e.date===td()).reduce((a,e)=>a+e.amount,0);const mt=exps.filter(e=>e.date.startsWith(mon())).reduce((a,e)=>a+e.amount,0);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>🧾 {t.expenses}</div><button onClick={()=>{setEe(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
        <div style={css.sc(T.danger)}><div style={{fontSize:"16px",fontWeight:"800",color:T.danger}}>{pkr(tt)}</div><div style={{fontSize:"10px",color:T.muted}}>Aaj</div></div>
        <div style={css.sc("#e0a052")}><div style={{fontSize:"16px",fontWeight:"800",color:"#e0a052"}}>{pkr(mt)}</div><div style={{fontSize:"10px",color:T.muted}}>Maheena</div></div>
      </div>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Type","Amount","Description","By","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{[...exps].reverse().map(e=><tr key={e.id}><td style={css.td}>{e.date}</td><td style={css.td}><span style={css.badge(T.danger)}>{e.type}</span></td><td style={css.td}><strong style={{color:T.danger}}>{pkr(e.amount)}</strong></td><td style={css.td}>{e.description}</td><td style={css.td}>{e.by}</td><td style={css.td}><div style={css.row}><button onClick={()=>{setEe(e);setFm({...e});setSf(true);}} style={{...css.btn(T.info),padding:"2px 5px",fontSize:"10px"}}>✏️</button><button onClick={()=>del(e.id)} style={{...css.btn(T.danger),padding:"2px 5px",fontSize:"10px"}}>🗑️</button></div></td></tr>)}</tbody></table></div>
      {sf&&<div style={css.modal}><div style={css.mb("340px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{ee?"✏️":"➕"} Kharcha</div><label style={css.lbl}>Type</label><select value={fm.type} onChange={e=>setFm({...fm,type:e.target.value})} style={css.sel}>{EXP_TYPES.map(tp=><option key={tp} value={tp}>{tp}</option>)}</select>{[["amount","Amount","number"],["description","Description","text"],["date","Date","date"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── STOCK RETURN ──────────────────────────────────────────────
function StockReturn({T,t,css,ret,setRet,prods,setProds,gid,pkr,td,log}) {
  const blank={customerName:"",phone:"",productId:"",productName:"",qty:0,price:0,reason:"",type:"Exchange"};
  const [sf,setSf]=useState(false);const [er,setEr]=useState(null);const [fm,setFm]=useState(blank);
  const save=()=>{
    const rec={...fm,id:er?er.id:gid(),qty:+fm.qty,price:+fm.price,total:+fm.qty*+fm.price,date:er?er.date:td()};
    if(er){setRet(r=>r.map(x=>x.id===er.id?rec:x));}
    else{setRet(r=>[...r,rec]);if(fm.type==="Return")setProds(p=>p.map(x=>x.id===+fm.productId?{...x,stock:+(x.stock + +fm.qty).toFixed(2)}:x));}
    log("Return",`${fm.customerName} — ${fm.productName}`);setSf(false);setEr(null);setFm(blank);
  };
  const del=(r)=>{if(!confirm("Delete?"))return;if(r.type==="Return")setProds(p=>p.map(x=>x.id===+r.productId?{...x,stock:Math.max(0,+(x.stock-r.qty).toFixed(2))}:x));setRet(prev=>prev.filter(x=>x.id!==r.id));};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>↩️ {t.stockReturn}</div><button onClick={()=>{setEr(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Customer","Product","Qty","Amount","Type","Reason","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{[...ret].reverse().map(r=><tr key={r.id}><td style={css.td}>{r.date}</td><td style={css.td}><strong>{r.customerName}</strong><div style={{fontSize:"9px",color:T.muted}}>{r.phone}</div></td><td style={css.td}>{r.productName}</td><td style={css.td}>{r.qty}</td><td style={css.td}><strong style={{color:T.danger}}>{pkr(r.total)}</strong></td><td style={css.td}><span style={css.badge(r.type==="Return"?T.danger:"#e0a052")}>{r.type}</span></td><td style={css.td}>{r.reason}</td><td style={css.td}><div style={css.row}><button onClick={()=>{setEr(r);setFm({...r});setSf(true);}} style={{...css.btn(T.info),padding:"2px 5px",fontSize:"10px"}}>✏️</button><button onClick={()=>del(r)} style={{...css.btn(T.danger),padding:"2px 5px",fontSize:"10px"}}>🗑️</button></div></td></tr>)}{ret.length===0&&<tr><td colSpan={8} style={{...css.td,textAlign:"center",color:T.muted}}>Koi record nahi</td></tr>}</tbody></table></div>
      {sf&&<div style={css.modal}><div style={css.mb("420px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{er?"✏️":"↩️"} Return/Exchange</div><label style={css.lbl}>Type</label><select value={fm.type} onChange={e=>setFm({...fm,type:e.target.value})} style={css.sel}><option value="Return">Return (Stock Wapas)</option><option value="Exchange">Exchange</option></select><label style={css.lbl}>Product</label><select value={fm.productId} onChange={e=>{const p=prods.find(x=>x.id===+e.target.value);setFm({...fm,productId:e.target.value,productName:p?.name||"",price:p?.salePrice||0});}} style={css.sel}><option value="">— Select —</option>{prods.map(p=><option key={p.id} value={p.id}>{p.name} (Stock:{p.stock})</option>)}</select>{[["customerName","Customer Naam","text"],["phone","Phone","text"],["qty","Qty","number"],["price","Price","number"],["reason","Wajah","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}{fm.qty&&fm.price?<div style={{color:T.danger,fontSize:"11px",marginTop:"4px",fontWeight:"700"}}>Amount: {pkr(+fm.qty*+fm.price)}</div>:null}<div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── DAMAGED STOCK ─────────────────────────────────────────────
function Damaged({T,t,css,dmg,setDmg,prods,setProds,supps,gid,pkr,td,log}) {
  const blank={productId:"",productName:"",qty:0,costPrice:0,reason:"",supplierId:"",supplierName:"",supplierReturn:false};
  const [sf,setSf]=useState(false);const [ed,setEd]=useState(null);const [fm,setFm]=useState(blank);
  const save=()=>{
    const rec={...fm,id:ed?ed.id:gid(),qty:+fm.qty,costPrice:+fm.costPrice,total:+fm.qty*+fm.costPrice,date:ed?ed.date:td()};
    if(ed){setDmg(d=>d.map(x=>x.id===ed.id?rec:x));}
    else{setDmg(d=>[...d,rec]);setProds(p=>p.map(x=>x.id===+fm.productId?{...x,stock:Math.max(0,+(x.stock-+fm.qty).toFixed(2))}:x));}
    log("Damaged",`${fm.productName} — ${fm.qty}`);setSf(false);setEd(null);setFm(blank);
  };
  const del=(d)=>{if(!confirm("Delete?"))return;setProds(p=>p.map(x=>x.id===+d.productId?{...x,stock:+(x.stock+d.qty).toFixed(2)}:x));setDmg(prev=>prev.filter(x=>x.id!==d.id));};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>⚠️ {t.damaged}</div><button onClick={()=>{setEd(null);setFm(blank);setSf(true);}} style={css.btn()}>+ Add</button></div>
      <div style={{...css.sc(T.danger),marginBottom:"12px"}}><div style={{fontSize:"16px",fontWeight:"900",color:T.danger}}>{pkr(dmg.reduce((a,d)=>a+d.total,0))}</div><div style={{fontSize:"10px",color:T.muted}}>Total Loss ({dmg.length} items)</div></div>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Product","Qty","Loss","Reason","Supplier?","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{[...dmg].reverse().map(d=><tr key={d.id}><td style={css.td}>{d.date}</td><td style={css.td}><strong>{d.productName}</strong></td><td style={css.td}>{d.qty}</td><td style={css.td}><strong style={{color:T.danger}}>{pkr(d.total)}</strong></td><td style={css.td}>{d.reason}</td><td style={css.td}>{d.supplierReturn?<span style={css.badge(T.success)}>✓ {d.supplierName}</span>:<span style={css.badge(T.muted)}>No</span>}</td><td style={css.td}><div style={css.row}><button onClick={()=>{setEd(d);setFm({...d});setSf(true);}} style={{...css.btn(T.info),padding:"2px 5px",fontSize:"10px"}}>✏️</button><button onClick={()=>del(d)} style={{...css.btn(T.danger),padding:"2px 5px",fontSize:"10px"}}>🗑️</button></div></td></tr>)}{dmg.length===0&&<tr><td colSpan={7} style={{...css.td,textAlign:"center",color:T.muted}}>Koi record nahi</td></tr>}</tbody></table></div>
      {sf&&<div style={css.modal}><div style={css.mb("420px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{ed?"✏️":"⚠️"} Damaged Stock</div><label style={css.lbl}>Product</label><select value={fm.productId} onChange={e=>{const p=prods.find(x=>x.id===+e.target.value);setFm({...fm,productId:e.target.value,productName:p?.name||"",costPrice:p?.costPrice||0});}} style={css.sel}><option value="">— Select —</option>{prods.map(p=><option key={p.id} value={p.id}>{p.name} (Stock:{p.stock})</option>)}</select>{[["qty","Qty","number"],["costPrice","Cost Price","number"],["reason","Wajah (Reason)","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<label style={css.lbl}>Supplier Return?</label><select value={String(fm.supplierReturn)} onChange={e=>setFm({...fm,supplierReturn:e.target.value==="true"})} style={css.sel}><option value="false">Nahi</option><option value="true">Haan — Supplier ko wapas karein</option></select>{fm.supplierReturn&&<><label style={css.lbl}>Supplier</label><select value={fm.supplierId} onChange={e=>{const s=supps.find(x=>x.id===+e.target.value);setFm({...fm,supplierId:e.target.value,supplierName:s?.name||""});}} style={css.sel}><option value="">— Select —</option>{supps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></>}{fm.qty&&fm.costPrice?<div style={{color:T.danger,fontSize:"12px",marginTop:"4px",fontWeight:"700"}}>Total Loss: {pkr(+fm.qty*+fm.costPrice)}</div>:null}<div style={{...css.row,marginTop:"12px"}}><button onClick={save} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── OFFERS ────────────────────────────────────────────────────
function Offers({T,t,css,prods,setProds,pkr,td}) {
  const now=td();const active=prods.filter(p=>p.offerPrice&&p.offerStart&&p.offerEnd&&now>=p.offerStart&&now<=p.offerEnd);const upcoming=prods.filter(p=>p.offerPrice&&p.offerStart&&now<p.offerStart);const expired=prods.filter(p=>p.offerPrice&&p.offerEnd&&now>p.offerEnd);
  const rm=(id)=>setProds(p=>p.map(x=>x.id===id?{...x,offerPrice:null,offerStart:null,offerEnd:null}:x));
  const Sec=({title,items,color})=>items.length===0?null:<div style={{marginBottom:"14px"}}><div style={{fontWeight:"700",color:color,marginBottom:"6px"}}>{title}({items.length})</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"8px"}}>{items.map(p=><div key={p.id} style={{...css.card,borderLeft:`4px solid ${color}`,marginBottom:0}}><div style={{fontWeight:"700",fontSize:"11px"}}>{p.name}</div><div style={{fontSize:"10px",color:T.muted}}>{p.category}</div><div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",margin:"4px 0"}}><span><s style={{color:T.muted}}>{pkr(p.salePrice)}</s></span><span style={{color:color,fontWeight:"700"}}>{pkr(p.offerPrice)}</span></div><div style={{fontSize:"10px",color:T.muted}}>📅{p.offerStart}→{p.offerEnd}</div><div style={{fontSize:"10px",color:T.info}}>Save:{pkr(p.salePrice-p.offerPrice)}({Math.round((1-p.offerPrice/p.salePrice)*100)}%)</div><button onClick={()=>rm(p.id)} style={{...css.btn(T.danger),marginTop:"5px",width:"100%",fontSize:"10px"}}>🗑️ Remove</button></div>)}</div></div>;
  return(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>🏷️ {t.offers}</div><div style={{fontSize:"11px",color:T.muted}}>Inventory → product → Offer Price + Dates</div></div><Sec title="✅ Active" items={active} color={T.success}/><Sec title="⏳ Upcoming" items={upcoming} color={T.info}/><Sec title="⌛ Expired" items={expired} color={T.muted}/>{active.length===0&&upcoming.length===0&&expired.length===0&&<div style={{...css.card,textAlign:"center",color:T.muted}}>Koi offer nahi</div>}</div>);
}

// ── CASH CLOSE ────────────────────────────────────────────────
function CashClose({T,t,css,cc,setCc,sales,exps,gid,pkr,td,log}) {
  const [sf,setSf]=useState(false);const already=cc.find(c=>c.date===td());
  const tc=sales.filter(s=>s.date===td()&&s.payment==="Cash").reduce((a,s)=>a+s.paid,0);const to=sales.filter(s=>s.date===td()&&s.payment!=="Cash"&&!isWebOnline(s)).reduce((a,s)=>a+s.paid,0);const te=exps.filter(e=>e.date===td()).reduce((a,e)=>a+e.amount,0);
  const [fm,setFm]=useState({openingCash:0,cashTaken:0,notes:""});
  const close=()=>{const rec={id:gid(),date:td(),openingCash:+fm.openingCash,totalSaleCash:tc,totalSaleOnline:to,totalExpense:te,cashExpected:+fm.openingCash+tc-te,cashTaken:+fm.cashTaken,closingCash:+fm.openingCash+tc-te-+fm.cashTaken,notes:fm.notes,closedAt:new Date().toTimeString().slice(0,5)};setCc(c=>[...c,rec]);log("Cash Closing",`Rs.${rec.closingCash}`);setSf(false);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>🔒 {t.cashClose}</div>{!already&&<button onClick={()=>setSf(true)} style={css.btn()}>🔒 Close Aaj</button>}</div>
      <div style={{...css.card,marginBottom:"12px"}}><div style={{fontWeight:"700",color:T.accent,marginBottom:"8px"}}>📊 Aaj — {td()}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"8px"}}>{[{l:"Cash Sale",v:pkr(tc),c:T.success},{l:"Online",v:pkr(to),c:T.info},{l:"Kharcha",v:pkr(te),c:T.danger},{l:"Net Cash",v:pkr(tc-te),c:T.accent}].map((s,i)=><div key={i} style={{background:T.surface,borderRadius:"8px",padding:"8px",textAlign:"center"}}><div style={{fontSize:"14px",fontWeight:"800",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>)}</div>{already&&<div style={{marginTop:"8px",padding:"6px",background:T.success+"22",borderRadius:"6px",fontSize:"11px",color:T.success}}>✅ Closing ho gayi — {already.closedAt}</div>}</div>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Opening","Cash","Online","Kharcha","Expected","Taken","Closing"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{[...cc].reverse().map(c=><tr key={c.id}><td style={css.td}>{c.date}</td><td style={css.td}>{pkr(c.openingCash)}</td><td style={css.td}><span style={{color:T.success}}>{pkr(c.totalSaleCash)}</span></td><td style={css.td}><span style={{color:T.info}}>{pkr(c.totalSaleOnline)}</span></td><td style={css.td}><span style={{color:T.danger}}>{pkr(c.totalExpense)}</span></td><td style={css.td}>{pkr(c.cashExpected)}</td><td style={css.td}>{pkr(c.cashTaken)}</td><td style={css.td}><strong style={{color:T.accent}}>{pkr(c.closingCash)}</strong></td></tr>)}{cc.length===0&&<tr><td colSpan={8} style={{...css.td,textAlign:"center",color:T.muted}}>Koi closing nahi</td></tr>}</tbody></table></div>
      {sf&&<div style={css.modal}><div style={css.mb("380px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>🔒 Cash Closing — {td()}</div><div style={{background:T.surface,borderRadius:"8px",padding:"8px",marginBottom:"8px",fontSize:"11px"}}>Cash:{pkr(tc)} | Online:{pkr(to)} | Kharcha:{pkr(te)}</div>{[["openingCash","Opening Cash","number"],["cashTaken","Cash Ghar Laya","number"],["notes","Notes","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div style={{color:T.accent,fontSize:"12px",marginTop:"4px",fontWeight:"700"}}>Closing: {pkr(+fm.openingCash+tc-te-+fm.cashTaken)}</div><div style={{...css.row,marginTop:"12px"}}><button onClick={close} style={{...css.btn(),flex:1}}>🔒 Close</button><button onClick={()=>setSf(false)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────────────────
function Analytics({T,t,css,sales,exps,prods,emps,custs,att,pkr,mon,td}) {
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const ds=d.toISOString().split("T")[0];return{day:d.toLocaleDateString("en",{weekday:"short"}),sale:sales.filter(s=>s.date===ds).reduce((a,s)=>a+s.total,0),exp:exps.filter(e=>e.date===ds).reduce((a,e)=>a+e.amount,0)};});
  const last6=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-i);const m=d.toISOString().slice(0,7);return{month:m.slice(5)+"/"+m.slice(2,4),sale:sales.filter(s=>s.date.startsWith(m)).reduce((a,s)=>a+s.total,0),exp:exps.filter(e=>e.date.startsWith(m)).reduce((a,e)=>a+e.amount,0)};}).reverse();
  const iid=it=>it.pid??it.productId;
  const catData=CATS.map((c,i)=>({name:c.split(" ").slice(0,2).join(" "),value:sales.reduce((a,s)=>a+s.items.filter(it=>{const p=prods.find(pr=>pr.id===iid(it));return p&&p.category===c;}).reduce((b,it)=>b+it.total,0),0),color:CAT_C[i]}));
  const payData=PAY_TYPES.map(pt=>({name:pt,value:sales.filter(s=>s.payment===pt).reduce((a,s)=>a+s.total,0)})).filter(p=>p.value>0);
  const physAll=sales.filter(s=>!isWebOnline(s));const webAll=sales.filter(s=>isWebOnline(s));
  const totSale=physAll.reduce((a,s)=>a+s.total,0);const totOnline=webAll.reduce((a,s)=>a+s.total,0);const totExp=exps.reduce((a,e)=>a+e.amount,0);
  // ── Phase 5: per-product profit, slow movers, sales-by-hour, daily summary ──
  const prodStats=prods.map(p=>{let u=0,r=0;sales.forEach(s=>(s.items||[]).forEach(it=>{if(iid(it)===p.id){u+=Number(it.qty)||0;r+=Number(it.total)||0;}}));const cost=u*(p.costPrice||0);return{id:p.id,name:p.name,units:+u.toFixed(2),rev:r,cost,profit:r-cost,stock:p.stock,stockVal:(p.stock||0)*(p.costPrice||0)};});
  const topProfit=[...prodStats].filter(p=>p.units>0).sort((a,b)=>b.profit-a.profit).slice(0,8);
  const slowMovers=[...prodStats].filter(p=>p.stock>0).sort((a,b)=>a.units-b.units).slice(0,8);
  const byHour=Array.from({length:13},(_,k)=>{const h=k+9;return{hr:((h>12?h-12:h))+(h>=12?"p":"a"),sale:sales.filter(s=>s.hour===h).reduce((a,s)=>a+s.total,0),bills:sales.filter(s=>s.hour===h).length};});
  const tsAll=sales.filter(s=>s.date===td());const tsT=tsAll.filter(s=>!isWebOnline(s));const tsWeb=tsAll.filter(s=>isWebOnline(s));
  const tToday=tsT.reduce((a,s)=>a+s.total,0);const tOnline=tsWeb.reduce((a,s)=>a+s.total,0);const tExpT=exps.filter(e=>e.date===td()).reduce((a,e)=>a+e.amount,0);
  const tProfit=tsT.reduce((a,s)=>a+(s.items||[]).reduce((b,it)=>{const p=prods.find(pr=>pr.id===iid(it));return b+(p?((it.price-p.costPrice)*(Number(it.qty)||0)):0);},0),0)-tExpT;
  const tUdh=tsT.reduce((a,s)=>a+(s.remaining||0),0);
  const topToday=[...prodStats].filter(p=>p.units>0).sort((a,b)=>b.rev-a.rev).slice(0,3).map(p=>p.name).join(", ")||"—";
  const dailyMsg=`📊 *Jameel Fabrics — Daily Summary*\n📅 ${td()}\n\n🧾 Bills: ${tsT.length}\n💰 Shop Sale: ${pkr(tToday)}${tOnline>0?`\n🌐 Website Sale: ${pkr(tOnline)}`:""}\n🧮 Kharcha: ${pkr(tExpT)}\n📈 Munafa: ${pkr(tProfit)}\n💳 Aaj ka Udhaar: ${pkr(tUdh)}\n\n🏆 Top: ${topToday}`;
  const sendDailyWA=()=>window.open("https://wa.me/?text="+encodeURIComponent(dailyMsg),"_blank");
  const sendDailyEmail=()=>window.open("mailto:?subject="+encodeURIComponent("Jameel Fabrics — Daily Summary "+td())+"&body="+encodeURIComponent(dailyMsg.replace(/\*/g,"")),"_blank");
  return(
    <div>
      <div style={css.h1}>📈 {t.analytics}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"10px",marginBottom:"14px"}}>
        {[{l:"Shop Sale",v:pkr(totSale),c:T.success},...(totOnline>0?[{l:"🌐 Website Sale",v:pkr(totOnline),c:T.info}]:[]),{l:"Total Kharcha",v:pkr(totExp),c:T.danger},{l:"Total Munafa",v:pkr(totSale-totExp),c:T.accent},{l:"Customers",v:custs.length,c:"#e0a052"},{l:"Products",v:prods.length,c:T.info},{l:"Total Bills",v:sales.length,c:T.muted}].map((s,i)=>(
          <div key={i} style={css.sc(s.c)}><div style={{fontSize:"15px",fontWeight:"800",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:"12px"}}>
        <div style={css.card}><div style={css.h2}>📅 7 Din Trend</div><ResponsiveContainer width="100%" height={160}><BarChart data={last7} margin={{top:5,right:5,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="day" tick={{fill:T.muted,fontSize:9}}/><YAxis tick={{fill:T.muted,fontSize:9}}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/><Bar dataKey="sale" fill={T.accent} name="Sale" radius={[3,3,0,0]}/><Bar dataKey="exp" fill={T.danger} name="Kharcha" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
        <div style={css.card}><div style={css.h2}>📆 6 Maheene</div><ResponsiveContainer width="100%" height={160}><BarChart data={last6} margin={{top:5,right:5,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="month" tick={{fill:T.muted,fontSize:9}}/><YAxis tick={{fill:T.muted,fontSize:9}}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/><Bar dataKey="sale" fill={T.success} name="Sale" radius={[3,3,0,0]}/><Bar dataKey="exp" fill={T.danger} name="Kharcha" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
        <div style={css.card}><div style={css.h2}>🏷️ Category</div><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={catData.filter(c=>c.value>0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={8}>{catData.map((c,i)=><Cell key={i} fill={c.color}/>)}</Pie><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/></PieChart></ResponsiveContainer></div>
        <div style={css.card}><div style={css.h2}>💳 Payment Methods</div><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={payData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={8}>{payData.map((_,i)=><Cell key={i} fill={[T.success,T.info,T.accent,"#e0a052"][i%4]}/>)}</Pie><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/></PieChart></ResponsiveContainer></div>
        <div style={css.card}><div style={css.h2}>👤 Salesman Compare</div><ResponsiveContainer width="100%" height={160}><BarChart data={emps.map(e=>({name:e.name.split(" ")[0],sale:sales.filter(s=>s.salesman===e.name).reduce((a,s)=>a+s.total,0)}))} margin={{top:5,right:5,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="name" tick={{fill:T.muted,fontSize:9}}/><YAxis tick={{fill:T.muted,fontSize:9}}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/><Bar dataKey="sale" fill={T.accent} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
        <div style={css.card}><div style={css.h2}>🏆 Top 5 Products</div>{prods.map(p=>({name:p.name,rev:sales.reduce((a,s)=>a+s.items.filter(i=>(i.pid??i.productId)===p.id).reduce((b,i)=>b+i.total,0),0)})).sort((a,b)=>b.rev-a.rev).slice(0,5).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:"11px"}}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><span style={{width:"16px",height:"16px",background:CAT_C[i%4],borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:"700",color:"#000"}}>{i+1}</span>{p.name}</div><span style={{color:T.accent,fontWeight:"700"}}>{pkr(p.rev)}</span></div>)}</div>
      </div>

      {/* ── Phase 5: Daily summary + deep product analytics ── */}
      <div style={{...css.card,marginTop:"12px",borderLeft:`4px solid ${T.accent}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
          <div><div style={{fontWeight:"800",color:T.accent}}>📋 Aaj ki Daily Summary</div><div style={{fontSize:"11px",color:T.muted}}>Bills: <b>{tsT.length}</b> · Sale: <b style={{color:T.success}}>{pkr(tToday)}</b> · Kharcha: <b style={{color:T.danger}}>{pkr(tExpT)}</b> · Munafa: <b style={{color:T.accent}}>{pkr(tProfit)}</b> · Udhaar: <b style={{color:T.danger}}>{pkr(tUdh)}</b></div></div>
          <div style={{display:"flex",gap:"6px"}}><button onClick={sendDailyWA} style={css.btn(T.success)}>📱 WhatsApp</button><button onClick={sendDailyEmail} style={css.btn(T.info)}>✉️ Email</button></div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:"12px",marginTop:"12px"}}>
        <div style={css.card}><div style={css.h2}>💵 Munafa by Product (Top 8)</div><div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Product","Units","Sale","Munafa"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{topProfit.map((p,i)=><tr key={i}><td style={css.td}>{p.name}</td><td style={css.td}>{p.units}</td><td style={css.td}>{pkr(p.rev)}</td><td style={{...css.td,color:p.profit>=0?T.success:T.danger,fontWeight:"700"}}>{pkr(p.profit)}</td></tr>)}{topProfit.length===0&&<tr><td colSpan={4} style={{...css.td,textAlign:"center",color:T.muted}}>Abhi koi sale nahi</td></tr>}</tbody></table></div></div>
        <div style={css.card}><div style={css.h2}>🐌 Slow Movers (kam bikne wale)</div><div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Product","Bika","Stock","Stock Value"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{slowMovers.map((p,i)=><tr key={i}><td style={css.td}>{p.name}</td><td style={{...css.td,color:p.units===0?T.danger:T.text,fontWeight:p.units===0?"700":"400"}}>{p.units}</td><td style={css.td}>{p.stock}</td><td style={{...css.td,color:T.muted}}>{pkr(p.stockVal)}</td></tr>)}{slowMovers.length===0&&<tr><td colSpan={4} style={{...css.td,textAlign:"center",color:T.muted}}>Koi product nahi</td></tr>}</tbody></table></div></div>
        <div style={css.card}><div style={css.h2}>🕐 Sales by Hour</div><ResponsiveContainer width="100%" height={170}><BarChart data={byHour} margin={{top:5,right:5,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="hr" tick={{fill:T.muted,fontSize:9}}/><YAxis tick={{fill:T.muted,fontSize:9}}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={(v)=>pkr(v)}/><Bar dataKey="sale" fill={T.accent} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer><div style={{fontSize:"10px",color:T.muted,textAlign:"center"}}>Kaunse waqt sab se zyada bikri hoti hai</div></div>
      </div>
    </div>
  );
}

// ── EXPORTS ───────────────────────────────────────────────────
function Exports({T,t,css,sales,exps,prods,emps,custs,supps,sal,att,udh,exportCSV,printHTML,pkr,td,mon}) {
  const ec=[
    {l:"Sales CSV",i:"💰",c:T.success,fn:()=>exportCSV(sales.map(s=>({Date:s.date,Customer:s.customer,Salesman:s.salesman,Total:s.total,Paid:s.paid,Remaining:s.remaining,Payment:s.payment})),`JF_Sales_${td()}.csv`)},
    {l:"Products CSV",i:"📦",c:T.info,fn:()=>exportCSV(prods.map(p=>({Name:p.name,Category:p.category,Brand:p.brand,Stock:p.stock,CostPrice:p.costPrice,SalePrice:p.salePrice,Barcode:p.barcode,Rack:p.rack})),`JF_Products_${td()}.csv`)},
    {l:"Customers CSV",i:"👥",c:T.accent,fn:()=>exportCSV(custs.map(c=>({Name:c.name,Phone:c.phone,City:c.city,Loyalty:c.loyalty,TotalPurchases:c.totalPurchases,Udhaar:c.udhaar})),`JF_Customers_${td()}.csv`)},
    {l:"Expenses CSV",i:"🧾",c:T.danger,fn:()=>exportCSV(exps.map(e=>({Date:e.date,Type:e.type,Amount:e.amount,Description:e.description,By:e.by})),`JF_Expenses_${td()}.csv`)},
    {l:"Employees CSV",i:"👷",c:"#e0a052",fn:()=>exportCSV(emps.map(e=>({Name:e.name,Phone:e.phone,Role:e.role,Salary:e.salary,Advance:e.advance})),`JF_Employees_${td()}.csv`)},
    {l:"Udhaar CSV",i:"💸",c:T.danger,fn:()=>exportCSV(udh.map(u=>({Customer:u.customerName,Phone:u.phone,Total:u.totalAmount,Paid:u.paid,Remaining:u.remaining,Date:u.date})),`JF_Udhaar_${td()}.csv`)},
  ];
  const pc=[
    {l:"Daily PDF",i:"📅",c:T.success,fn:()=>{const ts=sales.filter(s=>s.date===td());const tt=ts.reduce((a,s)=>a+s.total,0);const te=exps.filter(e=>e.date===td()).reduce((a,e)=>a+e.amount,0);printHTML(`<h2>🧵 Jameel Fabrics — Daily Report</h2><p>Date: ${td()}</p><table><tr><th>Customer</th><th>Salesman</th><th>Total</th><th>Paid</th><th>Payment</th></tr>${ts.map(s=>`<tr><td>${s.customer}</td><td>${s.salesman}</td><td>${pkr(s.total)}</td><td>${pkr(s.paid)}</td><td>${s.payment}</td></tr>`).join("")}</table><div class="total">Sale: ${pkr(tt)} | Kharcha: ${pkr(te)} | Net: ${pkr(tt-te)}</div>`,"Daily Report");}},
    {l:"Stock PDF",i:"📦",c:T.info,fn:()=>{const rows=prods.map(p=>`<tr style="${p.stock<=5?"background:#ffe0e0":""}"><td>${p.name}</td><td>${p.category}</td><td>${p.stock} ${p.qtyType}</td><td>${pkr(p.costPrice)}</td><td>${pkr(p.salePrice)}</td><td>${pkr(p.stock*p.costPrice)}</td></tr>`).join("");printHTML(`<h2>🧵 Jameel Fabrics — Stock Report</h2><table><tr><th>Product</th><th>Category</th><th>Stock</th><th>Cost</th><th>Sale</th><th>Value</th></tr>${rows}</table><div class="total">Total: ${pkr(prods.reduce((a,p)=>a+p.stock*p.costPrice,0))}</div>`,"Stock Report");}},
    {l:"Udhaar PDF",i:"💸",c:T.danger,fn:()=>{const rows=udh.filter(u=>u.remaining>0).map(u=>`<tr><td>${u.customerName}</td><td>${u.phone}</td><td>${pkr(u.totalAmount)}</td><td>${pkr(u.paid)}</td><td style="color:red">${pkr(u.remaining)}</td></tr>`).join("");printHTML(`<h2>🧵 Jameel Fabrics — Udhaar Report</h2><table><tr><th>Customer</th><th>Phone</th><th>Total</th><th>Paid</th><th>Baaki</th></tr>${rows}</table><div class="total">Total Pending: ${pkr(udh.reduce((a,u)=>a+u.remaining,0))}</div>`,"Udhaar Report");}},
  ];
  return(
    <div>
      <div style={css.h1}>📤 {t.exports}</div>
      <div style={{...css.sc(T.info),marginBottom:"12px",fontSize:"11px",color:T.muted}}>📊 CSV → Excel mein khulo | 🖨️ PDF → Print ya Save as PDF</div>
      <div style={css.h2}>📊 Excel / CSV</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"8px",marginBottom:"14px"}}>
        {ec.map((c,i)=><div key={i} style={{...css.card,borderLeft:`4px solid ${c.c}`,marginBottom:0}}><div style={{fontSize:"20px"}}>{c.i}</div><div style={{fontWeight:"700",color:c.c,fontSize:"12px"}}>{c.l}</div><button onClick={c.fn} style={{...css.btn(c.c),width:"100%",fontSize:"10px",marginTop:"6px"}}>⬇️ Download</button></div>)}
      </div>
      <div style={css.h2}>🖨️ PDF Print</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"8px"}}>
        {pc.map((c,i)=><div key={i} style={{...css.card,borderLeft:`4px solid ${c.c}`,marginBottom:0}}><div style={{fontSize:"20px"}}>{c.i}</div><div style={{fontWeight:"700",color:c.c,fontSize:"12px"}}>{c.l}</div><button onClick={c.fn} style={{...css.btn(c.c),width:"100%",fontSize:"10px",marginTop:"6px"}}>🖨️ Print</button></div>)}
      </div>
    </div>
  );
}

// ── ACTIVITY LOG ──────────────────────────────────────────────
function ActLog({T,t,css,logs,setLogs}) {
  const [sq,setSq]=useState("");
  const fl=logs.filter(l=>(l.user||"").toLowerCase().includes(sq.toLowerCase())||(l.action||"").toLowerCase().includes(sq.toLowerCase())||(l.detail||"").toLowerCase().includes(sq.toLowerCase()));
  const ac={"Login":T.success,"Logout":T.muted,"Sale":T.accent,"Booking":T.info,"Discount Request":"#a052e0","Salary":T.success};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={css.h1}>📝 {t.activityLog}</div><button onClick={()=>setLogs([])} style={css.btnO}>🗑️ Clear</button></div>
      <input value={sq} onChange={e=>setSq(e.target.value)} style={{...css.inp,marginBottom:"8px"}} placeholder="🔍 User, action, detail..."/>
      <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Time","User","Action","Detail"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{fl.slice(0,100).map(l=><tr key={l.id}><td style={{...css.td,fontSize:"10px",color:T.muted,whiteSpace:"nowrap"}}>{l.time}</td><td style={css.td}><strong>{l.user}</strong></td><td style={css.td}><span style={css.badge(ac[l.action]||T.info)}>{l.action}</span></td><td style={{...css.td,color:T.muted,fontSize:"11px"}}>{l.detail}</td></tr>)}{fl.length===0&&<tr><td colSpan={4} style={{...css.td,textAlign:"center",color:T.muted}}>Koi logs nahi</td></tr>}</tbody></table></div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────
function Reports({T,t,css,sales,exps,prods,emps,custs,supps,sal,dmg,cc,att,pkr,td,mon,users,log}) {
  const [ul,setUl]=useState(false);const [pass,setPass]=useState("");const [err,setErr]=useState("");const [tab,setTab]=useState("daily");
  const [selMonth,setSelMonth]=useState(mon());

  // Password check against any admin user or "report123" fallback
  const checkPass=()=>{
    const ok=users.find(u=>u.password===pass&&(u.role==="Admin"||u.role==="Manager"));
    if(ok){setUl(true);setErr("");}else{setErr("Galat password!");}
  };

  if(!ul)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"400px"}}>
      <div style={{...css.card,width:"300px",textAlign:"center",padding:"32px"}}>
        <div style={{fontSize:"36px"}}>🔐</div>
        <div style={{fontWeight:"700",fontSize:"15px",marginBottom:"4px"}}>Reports Password</div>
        <div style={{color:T.muted,fontSize:"11px",marginBottom:"12px"}}>Admin ya Manager password dalo</div>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={css.inp} placeholder="Password..." onKeyDown={e=>e.key==="Enter"&&checkPass()}/>
        {err&&<div style={{color:T.danger,fontSize:"11px",marginTop:"3px"}}>{err}</div>}
        <button onClick={checkPass} style={{...css.btn(),width:"100%",marginTop:"10px"}}>🔓 Unlock</button>
      </div>
    </div>
  );

  const ts=sales.filter(s=>s.date===td());
  const ms=sales.filter(s=>s.date.startsWith(selMonth));
  const tt=ts.reduce((a,s)=>a+s.total,0);
  const te=exps.filter(e=>e.date===td()).reduce((a,e)=>a+e.amount,0);
  const mt=ms.reduce((a,s)=>a+s.total,0);
  const me=exps.filter(e=>e.date.startsWith(selMonth)).reduce((a,e)=>a+e.amount,0);
  const es=(n,p)=>sales.filter(s=>s.salesman===n&&(p==="t"?s.date===td():s.date.startsWith(selMonth))).reduce((a,s)=>a+s.total,0);
  const eb=(n)=>sales.reduce((a,s)=>a+s.items.reduce((b,i)=>{const p=prods.find(pr=>pr.id===(i.pid??i.productId));return b+((p&&((i.itemSman||s.salesman)===n))?p.bonus*i.qty:0);},0),0);

  // Monthly comparison — last 6 months
  const last6=Array.from({length:6},(_,i)=>{
    const d=new Date();d.setMonth(d.getMonth()-i);
    const m=d.toISOString().slice(0,7);
    const sale=sales.filter(s=>s.date.startsWith(m)).reduce((a,s)=>a+s.total,0);
    const exp=exps.filter(e=>e.date.startsWith(m)).reduce((a,e)=>a+e.amount,0);
    return{month:m.slice(5)+"/"+m.slice(2,4),sale,exp,profit:sale-exp};
  }).reverse();

  // Profit per product
  const prodProfit=prods.map(p=>{
    const revenue=sales.reduce((a,s)=>a+s.items.filter(i=>(i.pid??i.productId)===p.id).reduce((b,i)=>b+i.total,0),0);
    const cost=sales.reduce((a,s)=>a+s.items.filter(i=>(i.pid??i.productId)===p.id).reduce((b,i)=>b+(i.qty*(p.costPrice||0)),0),0);
    const qty=sales.reduce((a,s)=>a+s.items.filter(i=>(i.pid??i.productId)===p.id).reduce((b,i)=>b+i.qty,0),0);
    return{...p,revenue,cost,profit:revenue-cost,qty};
  }).filter(p=>p.revenue>0).sort((a,b)=>b.profit-a.profit);

  // PDF Export
  const exportPDF=(content,title)=>{
    const f=document.createElement("iframe");f.style.cssText="position:fixed;width:0;height:0;border:0;left:-9999px";document.body.appendChild(f);
    const d=f.contentDocument||f.contentWindow.document;
    d.open();d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>
      body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:15px}
      h1{font-size:16px;margin-bottom:4px;color:#c9a84c}
      h2{font-size:13px;margin:12px 0 5px;border-bottom:1px solid #ccc;padding-bottom:3px}
      table{width:100%;border-collapse:collapse;margin-bottom:12px}
      th{background:#c9a84c;color:#000;padding:5px;text-align:left;font-size:10px}
      td{padding:4px 5px;border-bottom:1px solid #eee;font-size:10px}
      tr:nth-child(even){background:#f9f9f9}
      .header{display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #c9a84c}
      .stat{display:inline-block;margin:0 12px 8px 0;background:#f5f5f5;padding:6px 10px;border-radius:4px}
      .stat-val{font-size:14px;font-weight:bold;color:#c9a84c}
      .stat-lbl{font-size:9px;color:#666}
      @media print{button{display:none}}
    </style></head><body>
    <div class="header"><div><h1>🧵 JAMEEL FABRICS ERP</h1><div style="font-size:10px;color:#666">${title} — ${new Date().toLocaleString()}</div></div></div>
    ${content}
    <br><button onclick="window.print()" style="padding:8px 16px;background:#c9a84c;border:none;border-radius:4px;cursor:pointer;font-weight:bold">🖨️ Print / Save PDF</button>
    </body></html>`);
    d.close();
    setTimeout(()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>{try{document.body.removeChild(f);}catch(e){}},3000);},400);
  };

  const exportDailyPDF=()=>{
    const rows=ts.map(s=>`<tr><td>#${String(s.id).slice(-5)}</td><td>${s.customer}</td><td>${s.salesman}</td><td>Rs.${s.total.toLocaleString()}</td><td>Rs.${s.paid.toLocaleString()}</td><td style="color:${s.remaining>0?"red":"green"}">Rs.${s.remaining.toLocaleString()}</td><td>${s.payment}</td></tr>`).join("");
    exportPDF(`
      <div class="stat"><div class="stat-val">Rs.${tt.toLocaleString()}</div><div class="stat-lbl">Total Sale</div></div>
      <div class="stat"><div class="stat-val">Rs.${te.toLocaleString()}</div><div class="stat-lbl">Kharcha</div></div>
      <div class="stat"><div class="stat-val">Rs.${(tt-te).toLocaleString()}</div><div class="stat-lbl">Munafa</div></div>
      <div class="stat"><div class="stat-val">${ts.length}</div><div class="stat-lbl">Bills</div></div>
      <h2>📋 Aaj Ki Bills — ${td()}</h2>
      <table><thead><tr><th>Bill#</th><th>Customer</th><th>Salesman</th><th>Total</th><th>Paid</th><th>Baaki</th><th>Payment</th></tr></thead><tbody>${rows}</tbody></table>
    `,"Daily Report — "+td());
  };

  const exportMonthlyPDF=()=>{
    const rows=ms.map(s=>`<tr><td>${s.date}</td><td>${s.customer}</td><td>${s.salesman}</td><td>Rs.${s.total.toLocaleString()}</td><td>Rs.${s.paid.toLocaleString()}</td><td style="color:${s.remaining>0?"red":"green"}">Rs.${s.remaining.toLocaleString()}</td></tr>`).join("");
    exportPDF(`
      <div class="stat"><div class="stat-val">Rs.${mt.toLocaleString()}</div><div class="stat-lbl">Sale</div></div>
      <div class="stat"><div class="stat-val">Rs.${me.toLocaleString()}</div><div class="stat-lbl">Kharcha</div></div>
      <div class="stat"><div class="stat-val">Rs.${(mt-me).toLocaleString()}</div><div class="stat-lbl">Munafa</div></div>
      <div class="stat"><div class="stat-val">${ms.length}</div><div class="stat-lbl">Bills</div></div>
      <h2>📋 Bills — ${selMonth}</h2>
      <table><thead><tr><th>Date</th><th>Customer</th><th>Salesman</th><th>Total</th><th>Paid</th><th>Baaki</th></tr></thead><tbody>${rows}</tbody></table>
    `,"Monthly Report — "+selMonth);
  };

  const exportProfitPDF=()=>{
    const rows=prodProfit.map(p=>`<tr><td>${p.name}</td><td>${p.category}</td><td>${p.qty.toFixed(1)}</td><td>Rs.${p.revenue.toLocaleString()}</td><td>Rs.${p.cost.toLocaleString()}</td><td style="color:${p.profit>0?"green":"red"}">Rs.${p.profit.toLocaleString()}</td><td>${p.revenue>0?((p.profit/p.revenue)*100).toFixed(1):0}%</td></tr>`).join("");
    exportPDF(`
      <h2>💰 Profit Per Product</h2>
      <table><thead><tr><th>Product</th><th>Category</th><th>Qty Sold</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Margin%</th></tr></thead><tbody>${rows}</tbody></table>
    `,"Profit Per Product Report");
  };

  const tabs=[{k:"daily",l:"📅 Aaj"},{k:"monthly",l:"📆 Maheena"},{k:"compare",l:"📊 Comparison"},{k:"profit",l:"💰 Profit"},{k:"stock",l:"📦 Stock"},{k:"category",l:"🏷️ Category"},{k:"salesman",l:"👤 Salesman"},{k:"customer",l:"👥 Customer"}];

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
        <div style={css.h1}>📋 {t.reports}</div>
        <div style={css.row}>
          {tab==="daily"&&<button onClick={exportDailyPDF} style={{...css.btn(T.info),fontSize:"11px"}}>📄 PDF</button>}
          {tab==="monthly"&&<button onClick={exportMonthlyPDF} style={{...css.btn(T.info),fontSize:"11px"}}>📄 PDF</button>}
          {tab==="profit"&&<button onClick={exportProfitPDF} style={{...css.btn(T.info),fontSize:"11px"}}>📄 PDF</button>}
          <button onClick={()=>setUl(false)} style={css.btnO}>🔒 Lock</button>
        </div>
      </div>
      <div style={{...css.row,marginBottom:"10px",flexWrap:"wrap"}}>{tabs.map(tb=><button key={tb.k} onClick={()=>setTab(tb.k)} style={{...css.btn(tab===tb.k?T.accent:T.surface),border:`1px solid ${T.border}`,color:tab===tb.k?"#000":T.text,fontSize:"11px"}}>{tb.l}</button>)}</div>

      {(tab==="monthly"||tab==="salesman")&&<div style={{marginBottom:"8px"}}><label style={css.lbl}>Maheena Select</label><input type="month" value={selMonth} onChange={e=>setSelMonth(e.target.value)} style={{...css.inp,width:"160px"}}/></div>}

      {tab==="daily"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"8px",marginBottom:"10px"}}>{[{l:"Sale",v:pkr(tt),c:T.success},{l:"Kharcha",v:pkr(te),c:T.danger},{l:"Munafa",v:pkr(tt-te),c:T.accent},{l:"Bills",v:ts.length,c:T.info}].map((s,i)=><div key={i} style={css.sc(s.c)}><div style={{fontSize:"15px",fontWeight:"800",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>)}</div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Bill#","Customer","Salesman","Total","Paid","Baaki","Payment"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{ts.map(s=><tr key={s.id}><td style={css.td}><code>#{String(s.id).slice(-5)}</code></td><td style={css.td}>{s.customer}</td><td style={css.td}>{s.salesman}</td><td style={css.td}><strong style={{color:T.accent}}>{pkr(s.total)}</strong></td><td style={css.td}><span style={{color:T.success}}>{pkr(s.paid)}</span></td><td style={css.td}><span style={{color:s.remaining>0?T.danger:T.success}}>{pkr(s.remaining)}</span></td><td style={css.td}><span style={css.badge(T.info)}>{s.payment}</span></td></tr>)}{ts.length===0&&<tr><td colSpan={7} style={{...css.td,textAlign:"center",color:T.muted}}>Aaj koi sale nahi</td></tr>}</tbody></table></div>
      </div>}

      {tab==="monthly"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"8px",marginBottom:"10px"}}>{[{l:"Sale",v:pkr(mt),c:T.success},{l:"Kharcha",v:pkr(me),c:T.danger},{l:"Munafa",v:pkr(mt-me),c:T.accent},{l:"Bills",v:ms.length,c:T.info}].map((s,i)=><div key={i} style={css.sc(s.c)}><div style={{fontSize:"15px",fontWeight:"800",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>)}</div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Date","Customer","Salesman","Total","Paid","Baaki","Payment"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{ms.map(s=><tr key={s.id}><td style={css.td}>{s.date}</td><td style={css.td}>{s.customer}</td><td style={css.td}>{s.salesman}</td><td style={css.td}><strong style={{color:T.accent}}>{pkr(s.total)}</strong></td><td style={css.td}>{pkr(s.paid)}</td><td style={css.td}><span style={{color:s.remaining>0?T.danger:T.success}}>{pkr(s.remaining)}</span></td><td style={css.td}>{s.payment}</td></tr>)}{ms.length===0&&<tr><td colSpan={7} style={{...css.td,textAlign:"center",color:T.muted}}>Koi sale nahi</td></tr>}</tbody></table></div>
      </div>}

      {tab==="compare"&&<div>
        <div style={css.h2}>📊 6 Maheene Comparison</div>
        <div style={{...css.card,marginBottom:"12px"}}>
          <ResponsiveContainer width="100%" height={220}><BarChart data={last6} margin={{top:5,right:10,left:-10,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="month" tick={{fill:T.muted,fontSize:9}}/><YAxis tick={{fill:T.muted,fontSize:9}}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:10}} formatter={v=>pkr(v)}/><Legend wrapperStyle={{fontSize:"10px"}}/><Bar dataKey="sale" fill={T.success} name="Sale" radius={[3,3,0,0]}/><Bar dataKey="exp" fill={T.danger} name="Kharcha" radius={[3,3,0,0]}/><Bar dataKey="profit" fill={T.accent} name="Munafa" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
        </div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Maheena","Sale","Kharcha","Munafa","Margin%"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{last6.map((m,i)=><tr key={i}><td style={css.td}><strong>{m.month}</strong></td><td style={css.td}><span style={{color:T.success}}>{pkr(m.sale)}</span></td><td style={css.td}><span style={{color:T.danger}}>{pkr(m.exp)}</span></td><td style={css.td}><strong style={{color:m.profit>=0?T.accent:T.danger}}>{pkr(m.profit)}</strong></td><td style={css.td}>{m.sale>0?((m.profit/m.sale)*100).toFixed(1):0}%</td></tr>)}</tbody></table></div>
      </div>}

      {tab==="profit"&&<div>
        <div style={css.h2}>💰 Profit Per Product</div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Product","Category","Qty Sold","Revenue","Cost","Profit","Margin%"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{prodProfit.map((p,i)=><tr key={p.id} style={{background:i===0?T.accent+"11":"transparent"}}><td style={css.td}><strong>{p.name}</strong><div style={{fontSize:"9px",color:T.muted}}>{p.brand}</div></td><td style={css.td}><span style={css.badge(CAT_C[CATS.indexOf(p.category)%5]||T.info)}>{p.category.split(" ")[0]}</span></td><td style={css.td}>{p.qty.toFixed(1)} {p.qtyType}</td><td style={css.td}><span style={{color:T.success}}>{pkr(p.revenue)}</span></td><td style={css.td}><span style={{color:T.danger}}>{pkr(p.cost)}</span></td><td style={css.td}><strong style={{color:p.profit>=0?T.accent:T.danger}}>{pkr(p.profit)}</strong></td><td style={css.td}><span style={{color:p.profit>=0?T.success:T.danger}}>{p.revenue>0?((p.profit/p.revenue)*100).toFixed(1):0}%</span></td></tr>)}{prodProfit.length===0&&<tr><td colSpan={7} style={{...css.td,textAlign:"center",color:T.muted}}>Koi sale data nahi</td></tr>}</tbody></table></div>
      </div>}

      {tab==="stock"&&<div>
        <div style={{...css.sc(T.info),marginBottom:"10px"}}><div style={{fontSize:"15px",fontWeight:"800",color:T.info}}>{pkr(prods.reduce((a,p)=>a+p.stock*p.costPrice,0))}</div><div style={{fontSize:"10px",color:T.muted}}>Total Inventory Value</div></div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Product","Category","Stock","Cost","Sale","Value","Bonus"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{prods.map(p=><tr key={p.id} style={{background:p.stock<=5?T.danger+"11":"transparent"}}><td style={css.td}><strong>{p.name}</strong></td><td style={css.td}><span style={css.badge(T.info)}>{p.category.split(" ")[0]}</span></td><td style={css.td}><span style={css.badge(p.stock<=5?T.danger:T.success)}>{p.stock} {p.qtyType}</span></td><td style={css.td}>{pkr(p.costPrice)}</td><td style={css.td}><strong style={{color:T.accent}}>{pkr(p.salePrice)}</strong></td><td style={css.td}><strong>{pkr(p.stock*p.costPrice)}</strong></td><td style={css.td}><span style={{color:"#e0a052"}}>{pkr(p.bonus||0)}</span></td></tr>)}</tbody></table></div>
      </div>}

      {tab==="category"&&<div>
        <div style={{display:"grid",gap:"8px"}}>{CATS.map((cat,i)=>{const cp=prods.filter(p=>p.category===cat);const ct=sales.reduce((a,s)=>a+s.items.filter(it=>{const p=prods.find(pr=>pr.id===(it.pid??it.productId));return p&&p.category===cat;}).reduce((b,it)=>b+it.total,0),0);return<div key={cat} style={css.card}><div style={{fontWeight:"700",color:CAT_C[i%5],marginBottom:"5px"}}>{cat}</div><div style={{display:"flex",gap:"12px",fontSize:"11px",flexWrap:"wrap"}}><div>Items:<strong>{cp.length}</strong></div><div>Stock:<strong>{cp.reduce((a,p)=>a+p.stock,0).toFixed(1)}</strong></div><div>Sale:<strong style={{color:T.success}}>{pkr(ct)}</strong></div><div>Val:<strong style={{color:T.info}}>{pkr(cp.reduce((a,p)=>a+p.stock*p.costPrice,0))}</strong></div></div></div>;})}
        </div>
      </div>}

      {tab==="salesman"&&<div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Naam","Aaj Sale","Maheena Sale","Bonus","Bills","Haazri"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{emps.map(e=>{const days=att.filter(a=>a.empId===e.id&&a.date.startsWith(selMonth)&&a.status!=="Absent").length;return<tr key={e.id}><td style={css.td}><strong>{e.name}</strong></td><td style={css.td}><span style={{color:T.success}}>{pkr(es(e.name,"t"))}</span></td><td style={css.td}><span style={{color:T.info}}>{pkr(es(e.name,"m"))}</span></td><td style={css.td}><span style={{color:"#e0a052"}}>{pkr(eb(e.name))}</span></td><td style={css.td}>{sales.filter(s=>s.salesman===e.name).length}</td><td style={css.td}><span style={css.badge(days>20?T.success:T.danger)}>{days}d</span></td></tr>;})}</tbody></table></div>
      </div>}

      {tab==="customer"&&<div>
        <div style={{overflowX:"auto"}}><table style={css.tbl}><thead><tr>{["Naam","Phone","City","Loyalty","Khareed","Udhaar","Visits"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead><tbody>{custs.map(c=><tr key={c.id}><td style={css.td}><strong>{c.name}</strong></td><td style={css.td}>{c.phone}</td><td style={css.td}>{c.city}</td><td style={css.td}><span style={css.badge(T.accent)}>{c.loyalty}</span></td><td style={css.td}><strong style={{color:T.success}}>{pkr(c.totalPurchases)}</strong></td><td style={css.td}><span style={{color:c.udhaar>0?T.danger:T.success}}>{pkr(c.udhaar)}</span></td><td style={css.td}>{c.visits}</td></tr>)}</tbody></table></div>
      </div>}
    </div>
  );
}


// ── WEB ORDERS ────────────────────────────────────────────────
function WebOrders({T,css,pkr}) {
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const supabase_url=process.env.REACT_APP_SUPABASE_URL;
  const supabase_key=process.env.REACT_APP_SUPABASE_ANON_KEY;

  useEffect(()=>{
    if(!supabase_url||!supabase_key){setLoading(false);return;}
    const sb=createClient(supabase_url,supabase_key);
    sb.from("online_orders").select("*").order("created_at",{ascending:false}).then(({data})=>{setOrders(data||[]);setLoading(false);});
    const ch=sb.channel("web_orders").on("postgres_changes",{event:"INSERT",schema:"public",table:"online_orders"},()=>{
      sb.from("online_orders").select("*").order("created_at",{ascending:false}).then(({data})=>setOrders(data||[]));
    }).subscribe();
    return()=>sb.removeChannel(ch);
  },[]);

  const upd=async(id,status)=>{
    if(!supabase_url)return;
    const sb=createClient(supabase_url,supabase_key);
    await sb.from("online_orders").update({status}).eq("id",id);
    setOrders(o=>o.map(x=>x.id===id?{...x,status}:x));
  };

  const fl=filter==="all"?orders:orders.filter(o=>o.status===filter);
  const sc={pending:"#e0a052",confirmed:T.success,delivered:T.info,cancelled:T.danger};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <div style={css.h1}>🛒 Website Orders</div>
        <div style={{fontSize:"11px",color:T.muted}}>🔴 Realtime</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:"8px",marginBottom:"12px"}}>
        {[{l:"Total",v:orders.length,c:T.accent},{l:"Pending",v:orders.filter(o=>o.status==="pending").length,c:"#e0a052"},{l:"Confirmed",v:orders.filter(o=>o.status==="confirmed").length,c:T.success},{l:"Delivered",v:orders.filter(o=>o.status==="delivered").length,c:T.info}].map((s,i)=>(
          <div key={i} style={css.sc(s.c)}><div style={{fontSize:"18px",fontWeight:"900",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:T.muted}}>{s.l}</div></div>
        ))}
      </div>
      <div style={{...css.row,marginBottom:"10px",flexWrap:"wrap"}}>
        {["all","pending","confirmed","delivered","cancelled"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{...css.btn(filter===f?(sc[f]||T.accent):T.surface),border:`1px solid ${T.border}`,color:filter===f?"#000":T.text,fontSize:"10px",textTransform:"capitalize"}}>
            {f}({(f==="all"?orders:orders.filter(o=>o.status===f)).length})
          </button>
        ))}
      </div>
      {loading&&<div style={{...css.card,textAlign:"center",color:T.muted,padding:"24px"}}>🔄 Loading orders...</div>}
      {!loading&&fl.length===0&&<div style={{...css.card,textAlign:"center",color:T.muted,padding:"24px"}}>Koi orders nahi ✅</div>}
      {fl.map(o=>(
        <div key={o.id} style={{...css.card,borderLeft:`4px solid ${sc[o.status]||T.accent}`,marginBottom:"8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <div style={{fontWeight:"700"}}>{o.customer_name||"Customer"} <span style={{fontSize:"10px",color:T.muted}}>📞{o.customer_phone||""}</span></div>
              <div style={{fontSize:"10px",color:T.muted}}>{new Date(o.created_at).toLocaleString("en-PK")}</div>
              {(o.items||[]).map((it,i)=><div key={i} style={{fontSize:"11px",color:T.text,marginTop:"2px"}}>• {it.name} × {it.qty||1} = {pkr(it.price*(it.qty||1))}</div>)}
              {o.address&&<div style={{fontSize:"10px",color:T.muted,marginTop:"2px"}}>📍{o.address}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"16px",fontWeight:"900",color:T.accent}}>{pkr(o.total||0)}</div>
              <span style={{...css.badge(sc[o.status]||T.accent),textTransform:"capitalize"}}>{o.status}</span>
            </div>
          </div>
          <div style={{...css.row,marginTop:"8px",flexWrap:"wrap"}}>
            {o.status==="pending"&&<button onClick={()=>upd(o.id,"confirmed")} style={{...css.btn(T.success),fontSize:"10px"}}>✅ Confirm</button>}
            {o.status==="confirmed"&&<button onClick={()=>upd(o.id,"delivered")} style={{...css.btn(T.info),fontSize:"10px"}}>📦 Delivered</button>}
            {o.status!=="cancelled"&&o.status!=="delivered"&&<button onClick={()=>upd(o.id,"cancelled")} style={{...css.btn(T.danger),fontSize:"10px"}}>❌ Cancel</button>}
            {o.customer_phone&&<button onClick={()=>{const msg=`Assalam! Aapka order confirm ho gaya. Total: Rs.${o.total}`;window.open(`https://wa.me/92${o.customer_phone.replace(/^0/,"")}?text=${encodeURIComponent(msg)}`,"_blank");}} style={{...css.btn(T.success),fontSize:"10px"}}>📱 WA</button>}
          </div>
        </div>
      ))}
    </div>
  );
}


// ── SETTINGS ──────────────────────────────────────────────────
function Settings({T,t,css,theme,setTheme,lang,setLang,users,setUsers,isAdmin,shopInfo,setShopInfo,sysPin,setSysPin,doBackup,doRestore}) {
  const [showU,setShowU]=useState(false);const [eu,setEu]=useState(null);const [fm,setFm]=useState({username:"",password:"",role:"Salesman",name:"",phone:""});
  const [si,setSi]=useState(shopInfo||{});const [editShop,setEditShop]=useState(false);
  const [pinFm,setPinFm]=useState({old:"",nw:"",cf:""});const [showPinFm,setShowPinFm]=useState(false);
  const [pwFm,setPwFm]=useState({userId:"",oldPw:"",newPw:""});const [showPwFm,setShowPwFm]=useState(false);
  const clear=()=>{if(confirm("⚠️ Sara data delete?!")){Object.keys(localStorage).filter(k=>k.startsWith("jf5_")).forEach(k=>localStorage.removeItem(k));window.location.reload();}};
  const saveU=()=>{if(!fm.username||!fm.password||!fm.name)return alert("Username, password, naam zaroori!");eu?setUsers(u=>u.map(x=>x.id===eu.id?{...x,...fm}:x)):setUsers(u=>[...u,{...fm,id:Date.now()}]);setShowU(false);setEu(null);setFm({username:"",password:"",role:"Salesman",name:"",phone:""});};
  const saveShop=()=>{setShopInfo(si);setEditShop(false);alert("✅ Shop info save!");};
  const savePin=()=>{if(sysPin&&pinFm.old!==sysPin)return alert("Purana PIN galat!");if(!pinFm.nw){setSysPin("");setShowPinFm(false);return alert("PIN remove kar di!");}if(pinFm.nw!==pinFm.cf)return alert("PIN match nahi!");setSysPin(pinFm.nw);setShowPinFm(false);setPinFm({old:"",nw:"",cf:""});alert("✅ PIN set!");};
  const changePw=()=>{const u=users.find(x=>x.id===+pwFm.userId);if(!u)return alert("User select karo!");if(u.password!==pwFm.oldPw)return alert("Purana password galat!");if(!pwFm.newPw)return alert("Naya password dalo!");setUsers(us=>us.map(x=>x.id===u.id?{...x,password:pwFm.newPw}:x));setShowPwFm(false);setPwFm({userId:"",oldPw:"",newPw:""});alert("✅ Password change!");};
  return(
    <div>
      <div style={css.h1}>⚙️ {t.settings}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"12px"}}>
        <div style={css.card}><div style={{fontWeight:"700",marginBottom:"8px"}}>🎨 Theme</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>{Object.keys(THEMES).map(th=><button key={th} onClick={()=>setTheme(th)} style={{background:THEMES[th].card,border:`2px solid ${theme===th?THEMES[th].accent:THEMES[th].border}`,borderRadius:"8px",padding:"8px",cursor:"pointer",color:THEMES[th].text,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}><div style={{width:"14px",height:"14px",borderRadius:"50%",background:THEMES[th].accent}}/><span style={{fontSize:"10px"}}>{th}</span>{theme===th&&<span style={{fontSize:"9px",color:THEMES[th].accent}}>✓ Active</span>}</button>)}</div></div>
        <div style={css.card}><div style={{fontWeight:"700",marginBottom:"8px"}}>🌐 Language</div>{[["ro","Roman Urdu"],["en","English"],["ur","اردو"]].map(([v,l])=><button key={v} onClick={()=>setLang(v)} style={{...css.btn(lang===v?T.accent:T.surface),width:"100%",marginBottom:"5px",border:`1px solid ${T.border}`,color:lang===v?"#000":T.text,fontSize:"11px"}}>{l}</button>)}</div>
        <div style={css.card}>
          <div style={{fontWeight:"700",marginBottom:"8px"}}>🏪 Shop Info</div>
          {editShop?(<>
            {[["name","Naam"],["address","Pata"],["phone","Phone"],["whatsapp","WhatsApp"],["tiktok","TikTok ID"],["instagram","Instagram ID"],["website","Website"]].map(([k,l])=><div key={k}><label style={css.lbl}>{l}</label><input value={si[k]||""} onChange={e=>setSi({...si,[k]:e.target.value})} style={css.inp}/></div>)}
            <label style={css.lbl}>💳 Payment QR (EasyPaisa / JazzCash) — receipt pe chhpega</label>
            <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setSi({...si,payQR:ev.target.result});r.readAsDataURL(f);}} style={{fontSize:"11px",width:"100%"}}/>
            {si.payQR&&<div style={{marginTop:"4px",display:"flex",alignItems:"center",gap:"8px"}}><img src={si.payQR} alt="QR" style={{width:"70px",height:"70px",objectFit:"contain",border:`1px solid ${T.border}`,borderRadius:"6px",background:"#fff"}}/><button onClick={()=>setSi({...si,payQR:""})} style={{...css.btn(T.danger),fontSize:"9px",padding:"2px 6px"}}>Remove QR</button></div>}
            <div style={{...css.row,marginTop:"8px"}}><button onClick={saveShop} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>{setSi({...shopInfo});setEditShop(false);}} style={css.btnO}>Cancel</button></div>
          </>):(
            <>{Object.entries(shopInfo||{}).filter(([k])=>k!=="payQR").map(([k,v])=><div key={k} style={{fontSize:"11px",marginBottom:"4px"}}><span style={{color:T.muted}}>{k}: </span><strong>{v}</strong></div>)}{shopInfo?.payQR&&<div style={{fontSize:"11px",marginBottom:"4px"}}><span style={{color:T.muted}}>payment QR: </span><strong style={{color:T.success}}>✓ set</strong></div>}
            <button onClick={()=>{setSi({...shopInfo});setEditShop(true);}} style={{...css.btn(T.info),width:"100%",marginTop:"8px",fontSize:"11px"}}>✏️ Edit</button></>
          )}
        </div>
        {isAdmin&&<div style={css.card}><div style={{fontWeight:"700",marginBottom:"8px"}}>👤 Users</div><button onClick={()=>setShowU(!showU)} style={{...css.btn(T.info),width:"100%",marginBottom:"8px"}}>👥 Manage ({users.length})</button>{showU&&<div>{users.map(u=><div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:"11px"}}><div><strong>{u.name}</strong><div style={{fontSize:"10px",color:T.muted}}>{u.username}|{u.role}</div></div><button onClick={()=>{setEu(u);setFm({...u});}} style={{...css.btn(T.info),padding:"2px 6px",fontSize:"10px"}}>✏️</button></div>)}<button onClick={()=>{setEu(null);setFm({username:"",password:"",role:"Salesman",name:"",phone:""});}} style={{...css.btn(T.success),width:"100%",marginTop:"6px",fontSize:"10px"}}>+ Add User</button></div>}</div>}
        <div style={css.card}>
          <div style={{fontWeight:"700",marginBottom:"8px"}}>🔑 Password Change</div>
          <button onClick={()=>setShowPwFm(!showPwFm)} style={{...css.btn(T.info),width:"100%",marginBottom:"8px",fontSize:"11px"}}>🔑 Change Password</button>
          {showPwFm&&<><label style={css.lbl}>User Select</label><select value={pwFm.userId} onChange={e=>setPwFm({...pwFm,userId:e.target.value})} style={css.sel}><option value="">—Select—</option>{users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}</select><label style={css.lbl}>Purana Password</label><input type="password" value={pwFm.oldPw} onChange={e=>setPwFm({...pwFm,oldPw:e.target.value})} style={css.inp}/><label style={css.lbl}>Naya Password</label><input type="password" value={pwFm.newPw} onChange={e=>setPwFm({...pwFm,newPw:e.target.value})} style={css.inp}/><button onClick={changePw} style={{...css.btn(T.success),width:"100%",marginTop:"8px"}}>✅ Change</button></>}
        </div>
        <div style={css.card}>
          <div style={{fontWeight:"700",marginBottom:"8px"}}>🔒 PIN Lock <span style={{fontSize:"10px",color:T.muted}}>(30 min idle)</span></div>
          <div style={{fontSize:"11px",color:T.muted,marginBottom:"6px"}}>Status: {sysPin?"✅ Active":"❌ Off"}</div>
          <button onClick={()=>setShowPinFm(!showPinFm)} style={{...css.btn(T.info),width:"100%",marginBottom:"8px",fontSize:"11px"}}>🔐 {sysPin?"Change/Remove":"Set"} PIN</button>
          {showPinFm&&<>{sysPin&&<><label style={css.lbl}>Purana PIN</label><input type="password" value={pinFm.old} onChange={e=>setPinFm({...pinFm,old:e.target.value})} style={css.inp}/></>}<label style={css.lbl}>Nayi PIN (blank = remove)</label><input type="password" value={pinFm.nw} onChange={e=>setPinFm({...pinFm,nw:e.target.value})} style={css.inp}/><label style={css.lbl}>Confirm PIN</label><input type="password" value={pinFm.cf} onChange={e=>setPinFm({...pinFm,cf:e.target.value})} style={css.inp}/><button onClick={savePin} style={{...css.btn(T.success),width:"100%",marginTop:"8px"}}>💾 Save PIN</button></>}
        </div>
        <div style={css.card}>
          <div style={{fontWeight:"700",marginBottom:"8px"}}>💾 Backup & Restore</div>
          <button onClick={doBackup} style={{...css.btn(T.success),width:"100%",marginBottom:"10px",fontSize:"11px"}}>⬇️ Download Backup (JSON)</button>
          <label style={css.lbl}>Restore from File</label>
          <input type="file" accept=".json" onChange={e=>e.target.files[0]&&doRestore(e.target.files[0])} style={{fontSize:"11px",color:T.text,marginTop:"4px",width:"100%"}}/>
        </div>
        <div style={css.card}><div style={{fontWeight:"700",marginBottom:"8px"}}>💾 System</div><div style={{background:T.success+"22",borderRadius:"6px",padding:"6px",fontSize:"11px",color:T.success,marginBottom:"6px"}}>✅ v6.0 — All modules active</div><div style={{fontSize:"10px",color:T.muted,marginBottom:"6px"}}>Data auto-save localStorage ✓</div><button onClick={clear} style={{...css.btn(T.danger),width:"100%",fontSize:"11px"}}>🗑️ Reset All Data</button></div>
      </div>
      {eu!==null&&<div style={css.modal}><div style={css.mb("360px")}><div style={{fontWeight:"800",color:T.accent,marginBottom:"12px"}}>{eu.id?"✏️ Edit":"➕ Add"} User</div>{[["username","Username","text"],["password","Password","text"],["name","Full Naam","text"],["phone","Phone","text"]].map(([k,l,tp])=><div key={k}><label style={css.lbl}>{l}</label><input type={tp} value={fm[k]} onChange={e=>setFm({...fm,[k]:e.target.value})} style={css.inp}/></div>)}<div><label style={css.lbl}>Role</label><select value={fm.role} onChange={e=>setFm({...fm,role:e.target.value})} style={css.sel}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div><div style={{...css.row,marginTop:"12px"}}><button onClick={saveU} style={{...css.btn(),flex:1}}>💾 Save</button><button onClick={()=>setEu(null)} style={css.btnO}>Wapas</button></div></div></div>}
    </div>
  );
}

// ── WhatsApp Message Editor ────────────────────────────────────
function WAModal({phone,message,onClose}){
  const[msg,setMsg]=useState(message||"");
  const[ph,setPh]=useState(phone||"");
  function send(){
    if(!ph.trim())return alert("Phone dalo!");
    const n=ph.replace(/[^0-9]/g,"");
    const num=n.startsWith("92")?n:"92"+n.replace(/^0/,"");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`,"_blank");
    onClose();
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#1a1a1a",borderRadius:14,padding:20,width:"100%",maxWidth:440,boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontWeight:800,fontSize:15,color:"#25d366"}}>📱 WhatsApp Message</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#9ca3af",fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        <label style={{fontSize:11,color:"#9ca3af",display:"block",marginBottom:4}}>Phone Number</label>
        <input value={ph} onChange={e=>setPh(e.target.value)} placeholder="03001234567" style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #333",background:"#111",color:"#fff",fontSize:13,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>
        <label style={{fontSize:11,color:"#9ca3af",display:"block",marginBottom:4}}>Message (edit karo)</label>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={8} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #333",background:"#111",color:"#fff",fontSize:12,outline:"none",resize:"vertical",fontFamily:"inherit",lineHeight:1.6,boxSizing:"border-box",marginBottom:14}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={send} style={{flex:1,padding:11,background:"#25d366",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer"}}>📤 Send</button>
          <button onClick={onClose} style={{padding:"11px 18px",background:"none",border:"1px solid #333",color:"#9ca3af",borderRadius:8,fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
