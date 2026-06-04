import React,{useState,useEffect,useRef,useCallback}from"react";
import{createClient}from"@supabase/supabase-js";
const SURL=process.env.REACT_APP_SUPABASE_URL||"";
const SKEY=process.env.REACT_APP_SUPABASE_ANON_KEY||"";
const sb=SURL&&SKEY?createClient(SURL,SKEY):null;
const WA_NUM="923228722232";
const CAT_L={WU:"Women Unstitched",WS:"Women Stitched",M:"Men's Unstitched",K:"Kids Unstitch",HOT:"Hot Sale",NEW:"New Arrivals","2PC":"2-Piece Sets"};
const CATS=[
  ["All","All"],
  ["WU","Women Unstitch"],
  ["WS","Women Stitch"],
  ["RS","Women Stitch + Unstitch – Fancy (Reshmi Suiting)"],
  ["AB","Abayas"],
  ["MP","Mens Unstitch Plain"],
  ["ME","Mens Unstitch Embroidery"],
  ["KU","Kids Unstitch"],
  ["BS","Bedsheets"],
  ["BL","Blankets"],
  ["OT","Others"],
  ["HOT","Hot Sale"],
  ["NEW","New Arrivals"],
];
// ── Brand limits per category ─────────────────────────────────
const CAT_BRAND_LIMITS={
  "MP":{min:10,max:16},   // Mens Plain
  "ME":{min:3, max:6},    // Mens Embroidery
  "WS":{min:1, max:15},   // Women Stitch
  "RS":{min:1, max:15},   // Reshmi Suiting
  "AB":{min:1, max:1},    // Abayas - no brand
  "KU":{min:1, max:1},    // Kids Unstitch - no brand
  "BS":{min:1, max:5},    // Bedsheets
  "BL":{min:1, max:5},    // Blankets
  "OT":{min:1, max:10},   // Others
  "WU":{min:1, max:20},   // Women Unstitch
};


// ── Feature Constants ────────────────────────────────────────
const FEEL_OPTS=["Soft","Medium","Stiff"];
const SEASON_OPTS=["Summer","Winter","All-season"];
const CARE_OPTS=["Machine Wash","Hand Wash","Dry Clean Only"];
const SORT_OPTS=[{v:"new",l:"Newest First"},{v:"price_asc",l:"Price: Low to High"},{v:"price_desc",l:"Price: High to Low"},{v:"name",l:"Name A-Z"}];


const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Jost',sans-serif;overflow-x:hidden;background:#faf9f7;color:#111}
img{max-width:100%}
button{font-family:'Jost',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d0ccc5;border-radius:10px}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideR{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes annScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes floatBadge1{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes floatBadge2{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@keyframes textSlide{0%{opacity:0;transform:translateY(10px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-10px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes skeletonShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skeleton{background:linear-gradient(90deg,#f0ede8 25%,#e8e4df 50%,#f0ede8 75%);background-size:200% 100%;animation:skeletonShimmer 1.4s ease infinite}

@keyframes revealUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
.rv{opacity:0;transform:translateY(36px);transition:opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1);}
.rv.visible{opacity:1;transform:translateY(0);}
/* Admin Panel CSS */
.adm-sb{width:240px;flex-shrink:0;background:#0f0d0a;height:100vh;display:flex;flex-direction:column;overflow:hidden;transition:width .3s ease}
.adm-sb.col{width:64px}
.adm-sb-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:6px;cursor:pointer;transition:all .15s;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;position:relative;background:none;border:none;width:100%;text-align:left;font-family:'Inter',sans-serif;font-size:13px;font-weight:500}
.adm-sb-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.85)}
.adm-sb-item.act{background:rgba(201,168,76,.15);color:#c9a84c}
.adm-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.adm-th{padding:10px 16px;font-size:11px;font-weight:600;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;background:#f9fafb}
.adm-td{padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6}
.adm-inp{width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:9px 12px;font-size:13px;color:#111;outline:none;font-family:inherit;transition:border-color .15s}
.adm-inp:focus{border-color:#c9a84c;box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.adm-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:inherit;white-space:nowrap}
@media(max-width:768px){.adm-sb{position:fixed;z-index:200;transform:translateX(-100%);transition:transform .3s}.adm-sb.mob-open{transform:translateX(0)}}

/* Countdown */
@keyframes cdTick{0%{transform:scaleY(1)}50%{transform:scaleY(.85)}100%{transform:scaleY(1)}}
.cd-tick{animation:cdTick .15s ease}

@media(max-width:768px){
  .mob-hero-banner{display:flex!important;}
  .hero-grid{grid-template-columns:1fr!important;text-align:center;}
  .hero-right{display:none!important;}
  .hero-btns{justify-content:center!important;}
  .two-col{grid-template-columns:1fr!important;}
  .four-col{grid-template-columns:1fr 1fr!important;}
  .footer-grid{grid-template-columns:1fr 1fr!important;}
  .hide-mob{display:none!important;}
  .search-bar{max-width:140px!important;}
  .stat-grid{grid-template-columns:1fr 1fr!important;}
}
@media(max-width:480px){
  .four-col{grid-template-columns:1fr!important;}
  .footer-grid{grid-template-columns:1fr!important;}
  .hero-text h1{font-size:clamp(38px,12vw,60px)!important;}
  .stat-grid{grid-template-columns:1fr 1fr!important;}
}


/* Price slider */
input[type=range].price-slider{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:linear-gradient(to right,#c9a84c var(--val,50%),#e0d8cc var(--val,50%));outline:none;}
input[type=range].price-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#c9a84c;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);}
/* Gift option */
.gift-box{border:2px dashed #c9a84c;border-radius:12px;padding:16px;background:#fffef5;}
/* AI suggester */
.ai-typing::after{content:"▌";animation:blink .7s infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
`;
let _tf=null;
function useToast(){const[list,setList]=useState([]);_tf=useCallback((msg,type="")=>{const id=Date.now();setList(t=>[...t,{id,msg,type}]);setTimeout(()=>setList(t=>t.filter(x=>x.id!==id)),3200);},[]);return list;}
function toast(m,t=""){if(_tf)_tf(m,t);}
function Toasts({list}){return(<div style={{position:"fixed",bottom:24,right:24,zIndex:99999,display:"flex",flexDirection:"column",gap:8,maxWidth:300,pointerEvents:"none"}}>{list.map(t=><div key={t.id} style={{background:t.type==="error"?"#1a0000":t.type==="success"?"#001a06":"#111",color:"#fff",padding:"11px 16px",borderRadius:8,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.3)",borderLeft:`3px solid ${t.type==="error"?"#ef4444":t.type==="success"?"#22c55e":"#c9a84c"}`,animation:"toastIn .25s ease"}}>{t.msg}</div>)}</div>);}
function useDB(fn,deps=[]){const[data,setData]=useState(null);const[loading,setLoading]=useState(true);useEffect(()=>{if(!sb){setLoading(false);return;}setLoading(true);fn().then(({data,error})=>{if(!error)setData(data);setLoading(false);});},deps);return{data,loading};}
function useSettings(){const{data}=useDB(()=>sb.from("website_settings").select("*"),[]);const s={};if(data)data.forEach(r=>s[r.key]=r.value);return s;}
function useReveal(){
  useEffect(()=>{
    function run(){
      const obs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target);}});
      },{threshold:.08,rootMargin:"0px 0px -40px 0px"});
      document.querySelectorAll(".rv").forEach(el=>obs.observe(el));
      return()=>obs.disconnect();
    }
    const t=setTimeout(run,100);
    return()=>clearTimeout(t);
  });
}
const IgSvg=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const WaSvg=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>;
const TkSvg=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.19a8.19 8.19 0 0 0 4.79 1.53V6.27a4.85 4.85 0 0 1-1.02-.57z"/></svg>;
const FbSvg=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;

// ══════════════════════════════════════════════════════════════
// CUSTOM CURSOR (desktop only)
// ══════════════════════════════════════════════════════════════
function CustomCursor(){
  const dot=useRef(null);const cursor=useRef(null);
  useEffect(()=>{
    const move=e=>{
      if(dot.current){dot.current.style.left=e.clientX+"px";dot.current.style.top=e.clientY+"px";}
      if(cursor.current){
        setTimeout(()=>{if(cursor.current){cursor.current.style.left=e.clientX+"px";cursor.current.style.top=e.clientY+"px";}},80);
      }
    };
    window.addEventListener("mousemove",move);
    return()=>window.removeEventListener("mousemove",move);
  },[]);
  // Only show on desktop
  if(typeof window!=="undefined"&&window.matchMedia("(pointer:coarse)").matches)return null;
  return(<>
    <div ref={dot} className="jf-cursor-dot"/>
    <div ref={cursor} className="jf-cursor">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* Needle shape */}
        <line x1="4" y1="28" x2="24" y2="8" stroke="#1a1612" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="24.5" cy="7.5" rx="3" ry="1.5" transform="rotate(-45 24.5 7.5)" fill="#c9a84c" stroke="#1a1612" strokeWidth="1"/>
        <circle cx="24.5" cy="7.5" r="1" fill="#1a1612"/>
        {/* Thread */}
        <path d="M4 28 Q2 30 3 31 Q4 32 6 30 Q8 28 7 26" stroke="#c9a84c" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  </>);
}

// ══════════════════════════════════════════════════════════════
// FREE SHIPPING BAR
// ══════════════════════════════════════════════════════════════
function FreeShippingBar({cartTotal,settings}){
  const min=Number(settings?.free_shipping_min||2000);
  const active=settings?.free_shipping_active!=="false";
  if(!active)return null;
  const remaining=Math.max(0,min-cartTotal);
  const pct=Math.min(100,Math.round((cartTotal/min)*100));
  return(
    <div className="fs-bar">
      <div className="fs-prog" style={{width:pct+"%"}}/>
      <span style={{position:"relative",zIndex:1}}>
        {remaining<=0
          ?<>✨ You've unlocked <strong>Free Shipping!</strong></>
          :<>Add <strong>Rs. {remaining.toLocaleString()}</strong> more for 🚚 <strong>Free Shipping</strong></>
        }
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EID COUNTDOWN
// ══════════════════════════════════════════════════════════════
function EidCountdown({settings}){
  const[time,setTime]=useState({d:0,h:0,m:0,s:0});
  const active=settings?.eid_show==="true";
  const eidDate=settings?.eid_date;
  useEffect(()=>{
    if(!active||!eidDate)return;
    const tick=()=>{
      const diff=new Date(eidDate)-new Date();
      if(diff<=0){setTime({d:0,h:0,m:0,s:0});return;}
      setTime({d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)});
    };
    tick();const t=setInterval(tick,1000);return()=>clearInterval(t);
  },[active,eidDate]);
  if(!active||!eidDate)return null;
  return(
    <div style={{background:"linear-gradient(135deg,#1a1612,#2c2416)",color:"#fff",padding:"20px",textAlign:"center",margin:"24px 0",borderRadius:12,border:"1px solid #c9a84c44"}}>
      <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:6}}>🌙 {settings?.eid_title||"Eid Collection"}</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginBottom:12}}>{settings?.eid_subtitle||"Exclusive Eid Arrivals — Coming Soon"}</div>
      <div style={{display:"flex",justifyContent:"center",gap:12}}>
        {[["Days",time.d],["Hours",time.h],["Min",time.m],["Sec",time.s]].map(([l,v])=>(
          <div key={l} style={{background:"rgba(201,168,76,.1)",border:"1px solid #c9a84c44",borderRadius:8,padding:"10px 14px",minWidth:56}}>
            <div style={{fontSize:24,fontWeight:700,color:"#c9a84c",fontFamily:"'Cormorant Garamond',serif"}}>{String(v).padStart(2,"0")}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.4)",letterSpacing:1,textTransform:"uppercase"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FABRIC FEEL INDICATOR
// ══════════════════════════════════════════════════════════════
function FabricFeel({feel,season,care}){
  if(!feel&&!season&&!care)return null;
  const feelColor={Soft:"#4caf7d",Medium:"#e0a052",Stiff:"#5296e0"};
  const seasonIcon={Summer:"☀️","All-season":"🌤️",Winter:"❄️"};
  const careIcon={"Machine Wash":"🫧","Hand Wash":"🤲","Dry Clean Only":"🧺"};
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:5,margin:"8px 0"}}>
      {feel&&<span className="feel-badge" style={{color:feelColor[feel]||"#9a8f83",borderColor:feelColor[feel]||"#9a8f83"}}>{feel==="Soft"?"🪶":feel==="Stiff"?"💎":"✋"} {feel}</span>}
      {season&&<span className="feel-badge" style={{color:"#6b5f52",borderColor:"#e0d8cc"}}>{seasonIcon[season]||"🌤️"} {season}</span>}
      {care&&<span className="feel-badge" style={{color:"#6b5f52",borderColor:"#e0d8cc"}}>{careIcon[care]||"🧺"} {care}</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PRICE RANGE SLIDER
// ══════════════════════════════════════════════════════════════
function PriceSlider({min,max,value,onChange}){
  return(
    <div style={{padding:"0 4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9a8f83",marginBottom:4}}>
        <span>Rs. {value[0].toLocaleString()}</span>
        <span>Rs. {value[1].toLocaleString()}</span>
      </div>
      <div style={{position:"relative",height:4,background:"#e0d8cc",borderRadius:2,margin:"8px 0 4px"}}>
        <div style={{position:"absolute",left:((value[0]-min)/(max-min)*100)+"%",right:(100-(value[1]-min)/(max-min)*100)+"%",height:"100%",background:"#c9a84c",borderRadius:2}}/>
        <input type="range" min={min} max={max} value={value[0]} onChange={e=>onChange([Math.min(+e.target.value,value[1]-500),value[1]])} className="price-slider" style={{position:"absolute",width:"100%",opacity:0,height:20,top:-8,cursor:"pointer"}}/>
        <input type="range" min={min} max={max} value={value[1]} onChange={e=>onChange([value[0],Math.max(+e.target.value,value[0]+500)])} className="price-slider" style={{position:"absolute",width:"100%",opacity:0,height:20,top:-8,cursor:"pointer"}}/>
        <div style={{position:"absolute",left:((value[0]-min)/(max-min)*100)+"%",top:-6,width:16,height:16,background:"#c9a84c",borderRadius:"50%",border:"2px solid #fff",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transform:"translateX(-50%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",left:((value[1]-min)/(max-min)*100)+"%",top:-6,width:16,height:16,background:"#c9a84c",borderRadius:"50%",border:"2px solid #fff",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transform:"translateX(-50%)",pointerEvents:"none"}}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// VOICE SEARCH
// ══════════════════════════════════════════════════════════════
function VoiceSearchBtn({onResult}){
  const[listening,setListening]=useState(false);
  const SR=typeof window!=="undefined"&&(window.SpeechRecognition||window.webkitSpeechRecognition);
  if(!SR)return null;
  function start(){
    const r=new SR();r.lang="ur-PK";r.interimResults=false;r.maxAlternatives=3;
    r.onresult=e=>{
      const t=e.results[0][0].transcript;
      setListening(false);onResult(t);
    };
    r.onerror=()=>setListening(false);
    r.onend=()=>setListening(false);
    r.start();setListening(true);
  }
  return(
    <button onClick={start} title="Voice Search" className={listening?"voice-active":""} style={{background:listening?"#ef4444":"#f5f0e8",border:"1px solid #e0d8cc",borderRadius:8,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"background .2s"}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={listening?"#fff":"#c9a84c"} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// AI OUTFIT SUGGESTER
// ══════════════════════════════════════════════════════════════
function AIOutfitSuggester({prods,onFilter}){
  const[open,setOpen]=useState(false);
  const[q,setQ]=useState("");
  const[ans,setAns]=useState("");
  const[loading,setLoading]=useState(false);

  async function ask(){
    if(!q.trim())return;
    setLoading(true);setAns("");
    const prodList=prods.slice(0,30).map(p=>`${p.name}|${p.category}|Rs.${p.sale_price||p.price}|${p.feel||""}|${p.season||""}`).join("\n");
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`You are a Pakistani fabric store assistant for Jameel Fabrics Kunjah. Available products:\n${prodList}\n\nCustomer asks: "${q}"\n\nSuggest 2-3 specific products from the list above with reasons. Be brief, friendly, in simple English. Format: Product Name — Why it's perfect. Max 3 lines.`}]})});
      const d=await r.json();
      setAns(d.content?.[0]?.text||"Could not get suggestions.");
    }catch{setAns("Service unavailable. Please try again.");}
    setLoading(false);
  }

  return(
    <>
      <button onClick={()=>setOpen(true)} style={{position:"fixed",bottom:80,right:16,zIndex:900,background:"linear-gradient(135deg,#1a1612,#2c2416)",color:"#c9a84c",border:"1px solid #c9a84c44",borderRadius:50,padding:"10px 16px",fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,.3)",display:"flex",alignItems:"center",gap:6}}>
        ✨ Style Help
      </button>
      {open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setOpen(false)}>
        <div style={{background:"#fff",borderRadius:"16px 16px 0 0",padding:24,width:"100%",maxWidth:480,maxHeight:"70vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontWeight:700,fontSize:16,color:"#1a1612",marginBottom:4}}>✨ AI Outfit Suggester</div>
          <div style={{fontSize:12,color:"#9a8f83",marginBottom:16}}>Tell me the occasion — I'll suggest the perfect fabric</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {["Mehndi ke liye","Eid outfit","Office wear","Wedding guest","Gift for wife"].map(s=>(
              <button key={s} onClick={()=>setQ(s)} style={{background:"#f5f0e8",border:"1px solid #e0d8cc",borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",color:"#6b5f52"}}>{s}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Type your occasion or question..." style={{flex:1,padding:"10px 14px",border:"1px solid #e0d8cc",borderRadius:8,fontSize:13,outline:"none"}}/>
            <button onClick={ask} disabled={loading} style={{background:"#1a1612",color:"#c9a84c",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,cursor:"pointer",fontWeight:600}}>{loading?"...":"Ask"}</button>
          </div>
          {loading&&<div style={{fontSize:13,color:"#9a8f83"}} className="ai-typing">Finding perfect suggestions</div>}
          {ans&&<div style={{background:"#fdfcf8",border:"1px solid #e0d8cc",borderRadius:8,padding:14,fontSize:13,color:"#4a4035",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{ans}</div>}
          <button onClick={()=>setOpen(false)} style={{marginTop:16,width:"100%",background:"none",border:"1px solid #e0d8cc",borderRadius:8,padding:"10px",fontSize:13,cursor:"pointer",color:"#9a8f83"}}>Close</button>
        </div>
      </div>}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// IMAGE ZOOM MODAL
// ══════════════════════════════════════════════════════════════
function ImageZoom({src,alt,onClose}){
  if(!src)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
      <img src={src} alt={alt||""} style={{maxWidth:"95vw",maxHeight:"95vh",objectFit:"contain",borderRadius:4}}/>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",fontSize:18,cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GIFT OPTION COMPONENT
// ══════════════════════════════════════════════════════════════
function GiftOption({value,onChange}){
  const opts=[{id:"box",l:"Gift Box",p:200},{id:"sheet",l:"Wrapping Sheet",p:100},{id:"card",l:"Greeting Card",p:50}];
  const extra=opts.filter(o=>value?.extras?.includes(o.id)).reduce((a,o)=>a+o.p,0)+(value?.enabled?200:0);
  return(
    <div className="gift-box" style={{marginTop:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:value?.enabled?12:0}}>
        <input type="checkbox" id="gift-cb" checked={!!value?.enabled} onChange={e=>onChange({...value,enabled:e.target.checked})} style={{width:16,height:16,accentColor:"#c9a84c"}}/>
        <label htmlFor="gift-cb" style={{fontWeight:600,fontSize:13,color:"#1a1612",cursor:"pointer"}}>🎁 Send as Gift <span style={{color:"#c9a84c",fontWeight:700}}>+Rs. 200</span></label>
      </div>
      {value?.enabled&&<>
        <div style={{fontSize:12,color:"#9a8f83",marginBottom:8}}>Recipient Details</div>
        <input value={value?.to_name||""} onChange={e=>onChange({...value,to_name:e.target.value})} placeholder="Recipient Name" style={{width:"100%",padding:"8px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:12,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
        <input value={value?.to_address||""} onChange={e=>onChange({...value,to_address:e.target.value})} placeholder="Delivery Address" style={{width:"100%",padding:"8px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:12,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
        <input value={value?.to_phone||""} onChange={e=>onChange({...value,to_phone:e.target.value})} placeholder="Recipient Phone" style={{width:"100%",padding:"8px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
        <div style={{fontSize:12,color:"#9a8f83",marginBottom:6}}>Add-ons:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
          {opts.map(o=>(
            <label key={o.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer",background:"#fff",border:"1px solid #e0d8cc",borderRadius:6,padding:"5px 10px"}}>
              <input type="checkbox" checked={value?.extras?.includes(o.id)||false} onChange={e=>{const ex=value?.extras||[];onChange({...value,extras:e.target.checked?[...ex,o.id]:ex.filter(x=>x!==o.id)});}} style={{accentColor:"#c9a84c"}}/>
              {o.l} <span style={{color:"#c9a84c"}}>+Rs.{o.p}</span>
            </label>
          ))}
        </div>
        <textarea value={value?.message||""} onChange={e=>onChange({...value,message:e.target.value})} placeholder="Gift card message (optional)..." rows={2} style={{width:"100%",padding:"8px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:4}}/>
        <div style={{fontSize:11,color:"#c9a84c",fontWeight:600,textAlign:"right"}}>Gift extras total: Rs. {extra}</div>
      </>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SUBSCRIPTION BOX
// ══════════════════════════════════════════════════════════════
function SubscriptionBox({settings,user,onAuth}){
  const[open,setOpen]=useState(false);
  const[form,setForm]=useState({name:user?.user_metadata?.full_name||"",phone:"",address:"",plan:"monthly"});
  const[done,setDone]=useState(false);
  const price=Number(settings?.sub_price||2500);
  const active=settings?.sub_active!=="false";
  if(!active)return null;
  async function subscribe(){
    if(!form.name||!form.phone)return alert("Name and phone required");
    if(sb&&user)await sb.from("subscriptions").insert({user_id:user.id,name:form.name,phone:form.phone,address:form.address,plan:form.plan,status:"pending",created_at:new Date().toISOString()});
    setDone(true);
  }
  return(
    <>
      <div style={{background:"linear-gradient(135deg,#1a1612,#2c2416)",borderRadius:16,padding:"28px 24px",margin:"32px 0",textAlign:"center",border:"1px solid #c9a84c44",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:.05}}>📦</div>
        <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:8}}>Exclusive</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:"#fff",margin:"0 0 8px",fontWeight:600}}>Monthly Fabric Box</h3>
        <p style={{fontSize:13,color:"rgba(255,255,255,.6)",margin:"0 0 16px",lineHeight:1.6}}>Surprise premium fabrics delivered every month.<br/>Curated by our experts — just for you.</p>
        <div style={{fontSize:28,fontWeight:700,color:"#c9a84c",fontFamily:"'Cormorant Garamond',serif",marginBottom:16}}>Rs. {price.toLocaleString()}<span style={{fontSize:13,fontWeight:400,color:"rgba(255,255,255,.5)"}}>/month</span></div>
        <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:20,fontSize:12,color:"rgba(255,255,255,.6)"}}>
          {["🧵 2-3 Premium Fabrics","📦 Free Delivery","✨ Surprise Every Month"].map((t,i)=><span key={i}>{t}</span>)}
        </div>
        <button onClick={()=>user?setOpen(true):onAuth("login")} style={{background:"#c9a84c",color:"#1a1612",border:"none",padding:"12px 28px",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:.5}}>Subscribe Now</button>
      </div>
      {open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setOpen(false)}>
        <div style={{background:"#fff",borderRadius:12,padding:24,width:"100%",maxWidth:400}} onClick={e=>e.stopPropagation()}>
          {done?<div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>📦</div>
            <div style={{fontWeight:700,fontSize:16,color:"#1a1612",marginBottom:6}}>Subscribed!</div>
            <div style={{fontSize:13,color:"#9a8f83"}}>We'll contact you on WhatsApp for payment and delivery details.</div>
            <button onClick={()=>{setOpen(false);setDone(false);}} style={{marginTop:16,background:"#1a1612",color:"#fff",border:"none",padding:"10px 24px",borderRadius:6,cursor:"pointer"}}>Close</button>
          </div>:<>
            <div style={{fontWeight:700,fontSize:16,color:"#1a1612",marginBottom:16}}>📦 Subscribe to Monthly Box</div>
            {[["name","Your Name"],["phone","WhatsApp Number"],["address","Delivery Address"]].map(([k,l])=>(
              <div key={k} style={{marginBottom:10}}>
                <label style={{fontSize:11,color:"#9a8f83",display:"block",marginBottom:3}}>{l}</label>
                <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{width:"100%",padding:"9px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{fontSize:12,color:"#9a8f83",margin:"8px 0 14px",padding:"8px",background:"#fdfcf8",borderRadius:6}}>💳 Payment via EasyPaisa/JazzCash after confirmation on WhatsApp</div>
            <button onClick={subscribe} style={{width:"100%",background:"#1a1612",color:"#c9a84c",border:"none",padding:"12px",borderRadius:6,fontSize:14,fontWeight:700,cursor:"pointer"}}>Confirm — Rs. {price.toLocaleString()}/month</button>
          </>}
        </div>
      </div>}
    </>
  );
}


function Intro({onEnter}){
  const[step,setStep]=useState(0);
  useEffect(()=>{const ts=[300,900,1500,2200].map((d,i)=>setTimeout(()=>setStep(i+1),d));return()=>ts.forEach(clearTimeout);},[]);
  const fu=s=>({opacity:step>=s?1:0,transform:step>=s?"translateY(0)":"translateY(20px)",transition:"all .8s cubic-bezier(.16,1,.3,1)"});
  return(<div style={{position:"fixed",inset:0,zIndex:9999,background:"#faf9f7",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,background:"#111",height:step>=4?"0":"clamp(12px,2vw,32px)",transition:"height 1.2s cubic-bezier(.77,0,.18,1) .1s"}}/>
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#111",height:step>=4?"0":"clamp(12px,2vw,32px)",transition:"height 1.2s cubic-bezier(.77,0,.18,1) .1s"}}/>
    <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#e8e4df 1px,transparent 1px),linear-gradient(90deg,#e8e4df 1px,transparent 1px)",backgroundSize:"52px 52px",opacity:.6,WebkitMaskImage:"radial-gradient(ellipse 75% 75% at 50% 50%,#000 25%,transparent 100%)"}}/>
    <div style={{...fu(1),marginBottom:"clamp(20px,3vw,32px)",zIndex:1}}>
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        <circle cx="44" cy="44" r="40" stroke="#111" strokeWidth="1" opacity=".9"/>
        <circle cx="44" cy="44" r="32" stroke="#111" strokeWidth=".4" opacity=".2"/>
        <circle cx="44" cy="44" r="20" stroke="#c9a84c" strokeWidth=".5" opacity=".4"/>
        <line x1="44" y1="4" x2="44" y2="16" stroke="#111" strokeWidth="1" opacity=".6"/>
        <line x1="44" y1="72" x2="44" y2="84" stroke="#111" strokeWidth="1" opacity=".6"/>
        <line x1="4" y1="44" x2="16" y2="44" stroke="#111" strokeWidth="1" opacity=".6"/>
        <line x1="72" y1="44" x2="84" y2="44" stroke="#111" strokeWidth="1" opacity=".6"/>
        <text x="44" y="52" fontFamily="Playfair Display,serif" fontSize="22" fontWeight="900" fill="#111" opacity=".95" textAnchor="middle">JF</text>
      </svg>
    </div>
    <div style={{...fu(2),zIndex:1,textAlign:"center",lineHeight:.85}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(42px,8.5vw,96px)",fontWeight:900,letterSpacing:"clamp(8px,2.5vw,20px)",color:"#111"}}>JAMEEL</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,72px)",fontWeight:300,fontStyle:"italic",color:"#6b6358",letterSpacing:"clamp(6px,2vw,18px)"}}>Fabrics</div>
    </div>
    <div style={{...fu(3),zIndex:1,display:"flex",alignItems:"center",gap:16,margin:"clamp(16px,2vw,24px) 0"}}>
      <div style={{width:32,height:1,background:"#c9a84c"}}/>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(10px,1.2vw,13px)",letterSpacing:"clamp(5px,1.5vw,12px)",color:"#9a8f83",fontStyle:"italic"}}>KUNJAH · SINCE 1975</div>
      <div style={{width:32,height:1,background:"#c9a84c"}}/>
    </div>
    <div style={{...fu(3),zIndex:1,fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(10px,1.1vw,12px)",letterSpacing:"clamp(4px,1vw,8px)",color:"#b5aba2",fontStyle:"italic"}}>EXCLUSIVE · ELEGANT · PAKISTANI</div>
    {step>=4&&(<button onClick={onEnter} style={{marginTop:"clamp(24px,3.5vw,40px)",padding:"14px clamp(44px,6vw,70px)",background:"#111",color:"#fff",border:"none",fontFamily:"'Jost',sans-serif",fontSize:9,fontWeight:700,letterSpacing:5,textTransform:"uppercase",cursor:"pointer",transition:"all .4s",zIndex:1}} onMouseEnter={e=>{e.currentTarget.style.background="#2a2520";e.currentTarget.style.letterSpacing="7px";}} onMouseLeave={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.letterSpacing="5px";}}>Enter the Store</button>)}
  </div>);
}
function AuthModal({mode,onClose,onSuccess}){
  const[tab,setTab]=useState(mode||"login");
  const[email,setEmail]=useState("");const[pass,setPass]=useState("");
  const[name,setName]=useState("");const[phone,setPhone]=useState("");
  const[loading,setLoading]=useState(false);
  const I={width:"100%",border:"none",borderBottom:"1px solid #d0ccc5",padding:"11px 0",fontSize:14,outline:"none",fontFamily:"inherit",background:"transparent",transition:"border-color .2s",color:"#111"};
  const L={fontSize:9,fontWeight:700,letterSpacing:2.5,color:"#9a8f83",textTransform:"uppercase",marginBottom:5,display:"block"};
  async function login(){if(!sb){toast("Database not connected","error");return;}if(!email||!pass){toast("Email aur password daalo","error");return;}setLoading(true);const{error}=await sb.auth.signInWithPassword({email,password:pass});setLoading(false);if(error)toast("Login failed: "+error.message,"error");else{toast("Welcome! ✓","success");onSuccess();}}
  async function register(){if(!sb){toast("Database not connected","error");return;}if(!email||!pass||!name){toast("Sab fields fill karo","error");return;}if(pass.length<6){toast("Password min 6 chars","error");return;}setLoading(true);const{error}=await sb.auth.signUp({email,password:pass,options:{data:{full_name:name,phone}}});setLoading(false);if(error)toast("Register failed: "+error.message,"error");else{toast("Account created! ✓","success");onSuccess();}}
  return(<div style={{position:"fixed",inset:0,zIndex:9998,background:"rgba(0,0,0,.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:"#faf9f7",width:"100%",maxWidth:420,padding:"40px 36px",boxShadow:"0 30px 80px rgba(0,0,0,.25)"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#111",textAlign:"center",marginBottom:4}}>Welcome</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#9a8f83",fontStyle:"italic",textAlign:"center",marginBottom:28}}>Jameel Fabrics Kunjah</div>
      <div style={{display:"flex",marginBottom:28,borderBottom:"1px solid #e8e4df"}}>
        {["login","register"].map(t=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,letterSpacing:1,color:tab===t?"#111":"#9a8f83",borderBottom:tab===t?"2px solid #111":"2px solid transparent",transition:"all .2s",textTransform:"uppercase"}}>{t==="login"?"Sign In":"Register"}</button>)}
      </div>
      <div style={{display:"grid",gap:22}}>
        {tab==="register"&&<div><label style={L}>Full Name *</label><input style={I} value={name} onChange={e=>setName(e.target.value)} placeholder="Hamza Muhammadi" onFocus={e=>e.target.style.borderBottomColor="#111"} onBlur={e=>e.target.style.borderBottomColor="#d0ccc5"}/></div>}
        <div><label style={L}>Email *</label><input style={I} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onFocus={e=>e.target.style.borderBottomColor="#111"} onBlur={e=>e.target.style.borderBottomColor="#d0ccc5"}/></div>
        <div><label style={L}>Password *</label><input style={I} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onFocus={e=>e.target.style.borderBottomColor="#111"} onBlur={e=>e.target.style.borderBottomColor="#d0ccc5"} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?login():register())}/></div>
        {tab==="register"&&<div><label style={L}>Phone</label><input style={I} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0300-1234567" onFocus={e=>e.target.style.borderBottomColor="#111"} onBlur={e=>e.target.style.borderBottomColor="#d0ccc5"}/></div>}
      </div>
      <button onClick={tab==="login"?login:register} disabled={loading} style={{width:"100%",marginTop:28,padding:14,background:"#111",color:"#fff",border:"none",fontFamily:"inherit",fontSize:9,fontWeight:700,letterSpacing:4,textTransform:"uppercase",cursor:loading?"not-allowed":"pointer",opacity:loading?.6:1}}>{loading?"Please wait...":(tab==="login"?"Sign In":"Create Account")}</button>
      <button onClick={onClose} style={{width:"100%",marginTop:12,padding:10,background:"none",border:"none",color:"#9a8f83",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
    </div>
  </div>);
}

function CartPanel({cart,setCart,wa,onClose,user}){
  const[code,setCode]=useState("");const[coupon,setCoupon]=useState(null);const[cL,setCL]=useState(false);
  const[showForm,setShowForm]=useState(false);
  const[custName,setCustName]=useState("");const[custCity,setCustCity]=useState("");const[custAddr,setCustAddr]=useState("");
  const sub=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const disc=coupon?(coupon.type==="percent"?Math.round(sub*coupon.value/100):coupon.value):0;
  const giftExtra=gift.enabled?(200+(['box','sheet','card'].filter(id=>gift.extras?.includes(id)).reduce((s,id)=>s+({box:200,sheet:100,card:50}[id]||0),0))):0;
  const total=Math.max(0,sub-disc)+giftExtra;
  async function applyC(){if(!code.trim()||!sb)return;setCL(true);const{data}=await sb.from("coupons").select("*").eq("code",code.toUpperCase()).eq("active",true).single();setCL(false);if(!data){toast("Invalid coupon","error");return;}if(data.expires_at&&new Date(data.expires_at)<new Date()){toast("Coupon expired!","error");return;}if(sub<(data.min_order||0)){toast("Min order Rs."+Number(data.min_order).toLocaleString()+" chahiye","error");return;}setCoupon(data);toast("Coupon applied! "+String.fromCodePoint(10003),"success");}
  async function checkout(){
    if(!cart.length)return;
    if(sb&&user){await sb.from("online_orders").insert({customer_id:user.id,customer_email:user.email,customer_name:user.user_metadata?.full_name||"",items:cart,total,coupon_code:coupon?.code||null,discount_amount:disc,gift_option:gift.enabled?gift:null,status:"pending"});if(coupon)await sb.from("coupons").update({used_count:(coupon.used_count||0)+1}).eq("id",coupon.id);}
    const sep="\u2501".repeat(20);
    let msg="Assalamualaikum! \n\nI would like to place an order from *JAMEEL FABRICS Kunjah*.\n\n";
    msg+=sep+"\n ORDER DETAILS\n"+sep+"\n\n";
    msg+=cart.map(p=>{let l="* "+p.name+" *";l+="\n   Category: "+(CAT_L[p.cat]||p.cat||"");if(p.color)l+="\n   Color: "+p.color;l+="\n   Price: Rs."+Number(p.price).toLocaleString()+" x "+p.qty+" = Rs."+(p.price*p.qty).toLocaleString();const img=p.img1||p.photo_url||"";if(img)l+="\n   Image: "+img;return l;}).join("\n\n");
    msg+="\n\n";
    if(coupon)msg+="Coupon: "+coupon.code+" (-Rs."+disc.toLocaleString()+")\n\n";
    msg+=sep+"\nTOTAL: *Rs."+total.toLocaleString()+"*\n"+sep+"\n\nPlease confirm availability and share delivery address.\n\nJazakAllah Khair!";
    window.open("https://wa.me/"+(wa||WA_NUM)+"?text="+encodeURIComponent(msg),"_blank");
    setCart([]);onClose();
  }
  return(<>
    <div style={{position:"fixed",inset:0,zIndex:9990,background:"rgba(0,0,0,.45)",backdropFilter:"blur(4px)"}} onClick={onClose}/>
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(420px,95vw)",background:"#faf9f7",zIndex:9991,display:"flex",flexDirection:"column",boxShadow:"-16px 0 48px rgba(0,0,0,.12)",animation:"slideR .3s ease"}}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid #e8e4df",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>Cart <span style={{color:"#9a8f83",fontSize:14,fontWeight:400}}>({cart.reduce((s,x)=>s+x.qty,0)} items)</span></div>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9a8f83"}}>X</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
        {!cart.length?(<div style={{textAlign:"center",padding:"56px 20px",color:"#b5aba2"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#9a8f83",marginBottom:8}}>Cart is Empty</div><div style={{fontSize:13}}>Add beautiful pieces to your cart</div></div>):
        cart.map(item=>(
          <div key={item.id} style={{display:"flex",gap:14,marginBottom:18,paddingBottom:18,borderBottom:"1px solid #e8e4df"}}>
            <div style={{width:60,height:72,background:"#f0ede8",flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
              {(item.img1||item.photo_url)?<img src={item.img1||item.photo_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:(item.icon||"👗")}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{item.name}</div>
              <div style={{fontSize:11,color:"#9a8f83",marginBottom:8}}>{item.color||""}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={()=>setCart(c=>item.qty===1?c.filter(x=>x.id!==item.id):c.map(x=>x.id===item.id?{...x,qty:x.qty-1}:x))} style={{width:28,height:28,border:"1px solid #d0ccc5",borderRadius:"50%",background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                  <span style={{fontSize:13,fontWeight:600,minWidth:18,textAlign:"center"}}>{item.qty}</span>
                  <button onClick={()=>setCart(c=>c.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x))} style={{width:28,height:28,border:"1px solid #d0ccc5",borderRadius:"50%",background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700}}>Rs.{(item.price*item.qty).toLocaleString()}</span>
                  <button onClick={()=>setCart(c=>c.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",cursor:"pointer",color:"#c9a49a",fontSize:18}}>x</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cart.length>0&&(
        <div style={{padding:"18px 24px",borderTop:"1px solid #e8e4df",flexShrink:0}}>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Coupon code" style={{flex:1,border:"1px solid #d0ccc5",padding:"9px 14px",fontSize:13,outline:"none",fontFamily:"inherit",letterSpacing:1.5,fontWeight:600,background:"#fff"}}/>
            <button onClick={applyC} disabled={cL} style={{background:"#111",color:"#fff",border:"none",padding:"9px 18px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",opacity:cL?.6:1}}>{cL?"...":"Apply"}</button>
          </div>
          <div style={{marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#9a8f83",marginBottom:5}}><span>Subtotal</span><span>Rs.{sub.toLocaleString()}</span></div>
            {coupon&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#16a34a",marginBottom:5}}><span>Discount ({coupon.code})</span><span>-Rs.{disc.toLocaleString()}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:700,marginTop:10,paddingTop:10,borderTop:"1px solid #e8e4df"}}><span>Total</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22}}>Rs.{total.toLocaleString()}</span></div>
            <div style={{fontSize:11,color:"#b5aba2",marginTop:5}}>Delivery charges separate (discuss on WhatsApp)</div>
          </div>
          {/* Optional customer detail form */}
          <div style={{marginBottom:12}}>
            <button onClick={()=>setShowForm(f=>!f)} style={{background:"none",border:"1px solid #e0dbd3",width:"100%",padding:"8px",fontSize:10,fontWeight:600,letterSpacing:1,cursor:"pointer",fontFamily:"inherit",color:"#9a8f83",display:"flex",alignItems:"center",justifyContent:"space-between",textTransform:"uppercase"}}>
              <span>Add Delivery Details (Optional)</span>
              <span>{showForm?"▲":"▼"}</span>
            </button>
            {showForm&&(
              <div style={{background:"#f5f2ee",padding:12,border:"1px solid #e0dbd3",borderTop:"none",display:"grid",gap:8}}>
                <input value={custName} onChange={e=>setCustName(e.target.value)} placeholder="Your Name" style={{border:"1px solid #d0ccc5",padding:"8px 10px",fontSize:12,outline:"none",fontFamily:"inherit",background:"#fff"}}/>
                <input value={custCity} onChange={e=>setCustCity(e.target.value)} placeholder="City" style={{border:"1px solid #d0ccc5",padding:"8px 10px",fontSize:12,outline:"none",fontFamily:"inherit",background:"#fff"}}/>
                <input value={custAddr} onChange={e=>setCustAddr(e.target.value)} placeholder="Address (optional)" style={{border:"1px solid #d0ccc5",padding:"8px 10px",fontSize:12,outline:"none",fontFamily:"inherit",background:"#fff"}}/>
                <div style={{fontSize:9,color:"#b5aba2",letterSpacing:.5}}>Yeh details WhatsApp message mein shamil hongi</div>
              </div>
            )}
          </div>
          {/* Advance payment note */}
          <div style={{background:"#fef9c3",border:"1px solid #fde68a",padding:"8px 12px",fontSize:10,color:"#92400e",marginBottom:12,lineHeight:1.6}}>
            💰 <strong>Advance Payment:</strong> Product price advance. Delivery (Pak Post) charges alag.
          </div>
          <GiftOption value={gift} onChange={setGift}/>
          <button onClick={checkout} style={{width:"100%",padding:15,background:"#111",color:"#fff",border:"none",fontFamily:"inherit",fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}} onMouseEnter={e=>e.currentTarget.style.background="#2a2520"} onMouseLeave={e=>e.currentTarget.style.background="#111"}>
            <WaSvg/> Order via WhatsApp
          </button>
        </div>
      )}
    </div>
  </>);
}

/* ═══ LOADING SKELETON ═══ */
function PCardSkeleton(){
  return(
    <div style={{background:"#fff",border:"1px solid #ede9e3",overflow:"hidden"}}>
      <div className="skeleton" style={{aspectRatio:"3/4",width:"100%"}}/>
      <div style={{padding:"14px 16px 18px"}}>
        <div className="skeleton" style={{height:8,width:"55%",marginBottom:10,borderRadius:2}}/>
        <div className="skeleton" style={{height:14,width:"90%",marginBottom:6,borderRadius:2}}/>
        <div className="skeleton" style={{height:14,width:"70%",marginBottom:12,borderRadius:2}}/>
        <div className="skeleton" style={{height:10,width:"45%",marginBottom:12,borderRadius:2}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div className="skeleton" style={{height:18,width:"38%",borderRadius:2}}/>
          <div className="skeleton" style={{width:40,height:40,borderRadius:0}}/>
        </div>
      </div>
    </div>
  );
}


function PCard({prod,onAdd,onWish,wished,idx,onOpenModal,onPriceDrop}){
  const[hov,setHov]=useState(false);const[added,setAdded]=useState(false);
  const img=prod.img1||prod.photo_url||"";
  const price=Number(prod.sale_price||prod.price||0);
  const old=prod.old_price?Number(prod.old_price):null;
  const lowStock=prod.display_stock_text&&(prod.display_stock_text.includes("2")||prod.display_stock_text.includes("3")||prod.display_stock_text.toLowerCase().includes("last")||prod.display_stock_text.toLowerCase().includes("sirf"));
  function handleAdd(e){e.stopPropagation();onAdd(prod);setAdded(true);setTimeout(()=>setAdded(false),1200);}
  function handleShare(e){e.stopPropagation();const txt="Yeh product dekho: *"+prod.name+"*\nRs."+price.toLocaleString()+"\n\nJameel Fabrics Kunjah\njameel-fabrics-catalogue.vercel.app";window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank");}
  return(
    <div className="rv" onClick={()=>onOpenModal&&onOpenModal(prod)} style={{background:"#fff",border:"1px solid "+(hov?"#c0b9b0":"#ede9e3"),cursor:"pointer",transition:"all .45s cubic-bezier(.16,1,.3,1)",position:"relative",overflow:"hidden",transform:hov?"translateY(-8px)":"none",boxShadow:hov?"0 20px 56px rgba(0,0,0,.1)":"0 1px 4px rgba(0,0,0,.04)"}}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{position:"relative",aspectRatio:"3/4",overflow:"hidden",background:"#f5f2ee"}}>
        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(48px,7vw,72px)",transition:"transform .7s cubic-bezier(.16,1,.3,1)",transform:hov?"scale(1.1)":"scale(1)"}}>
          {img?<img src={img} alt={prod.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:(prod.icon||"👗")}
        </div>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(17,17,17,.72),transparent 55%)",opacity:hov?1:0,transition:"opacity .4s",display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",paddingBottom:20,gap:8}}>
          <button onClick={e=>{e.stopPropagation();onOpenModal&&onOpenModal(prod);}} style={{background:"#fff",color:"#111",border:"none",padding:"9px 28px",fontSize:9,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",transform:hov?"translateY(0)":"translateY(16px)",transition:"transform .35s"}}>QUICK VIEW</button>
          <button onClick={handleAdd} style={{background:"transparent",color:"rgba(255,255,255,.85)",border:"1px solid rgba(255,255,255,.4)",padding:"6px 22px",fontSize:9,fontWeight:600,letterSpacing:1.5,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",transform:hov?"translateY(0)":"translateY(16px)",transition:"transform .35s .05s"}}>ADD TO CART</button>
        </div>
        {prod.badge&&<div style={{position:"absolute",top:12,left:12,background:prod.badge==="SALE"?"#b91c1c":"#111",color:"#fff",padding:"3px 10px",fontSize:7,fontWeight:800,letterSpacing:2,textTransform:"uppercase",zIndex:2}}>{prod.badge}</div>}
        <button onClick={e=>{e.stopPropagation();onWish(prod.id);}} style={{position:"absolute",top:12,right:12,zIndex:2,width:34,height:34,borderRadius:"50%",background:"rgba(250,249,247,.92)",border:"1px solid #d0ccc5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:hov?1:0,transform:hov?"scale(1)":"scale(.6)",transition:"all .3s"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" stroke={wished?"#b91c1c":"#9a8f83"} strokeWidth="1.5" fill={wished?"#b91c1c":"none"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button onClick={handleShare} style={{position:"absolute",bottom:12,right:12,zIndex:2,width:30,height:30,borderRadius:"50%",background:"rgba(37,211,102,.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:hov?1:0,transform:hov?"scale(1)":"scale(.6)",transition:"all .3s .1s",color:"#fff"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        </button>
      </div>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{padding:"14px 16px 18px"}}>
        <div style={{fontSize:8,color:"#9a8f83",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{CAT_L[prod.cat]||prod.category||""}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#111",marginBottom:4,lineHeight:1.3}}>{prod.name}</div>
        {prod.color&&<div style={{fontSize:11,color:"#9a8f83",marginBottom:6}}>{prod.color}</div>}
        {prod.display_stock_text&&(
          <div style={{fontSize:10,marginBottom:7,fontWeight:lowStock?700:400,color:lowStock?"#b91c1c":"#b5aba2",fontStyle:lowStock?"normal":"italic",display:"flex",alignItems:"center",gap:4}}>
            {lowStock&&<span style={{animation:"pulse 1.2s ease infinite",display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#b91c1c",flexShrink:0}}/>}
            {prod.display_stock_text}
            <FabricFeel feel={prod.feel} season={prod.season} care={prod.care}/>
          </div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8}}>
          <div>
            {old&&<div style={{fontSize:11,color:"#c9a49a",textDecoration:"line-through",fontFamily:"'Cormorant Garamond',serif"}}>Rs.{old.toLocaleString()}</div>}
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:old?"#b91c1c":"#111",lineHeight:1}}>Rs.{price.toLocaleString()}</div>
          </div>
          <button onClick={handleAdd} style={{flexShrink:0,background:added?"#16a34a":"#111",color:"#fff",border:"none",width:40,height:40,cursor:"pointer",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .25s"}}>{added?"✓":"+"}</button>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ic,title,desc,color}){
  const[hov,setHov]=useState(false);
  return(<div className="rv" style={{background:hov?"#fff":color||"#faf9f7",border:"1px solid "+(hov?"#c0b9b0":"#e8e4df"),padding:"clamp(20px,2.5vw,28px)",transition:"all .35s cubic-bezier(.16,1,.3,1)",transform:hov?"translateY(-6px)":"none",boxShadow:hov?"0 16px 44px rgba(0,0,0,.08)":"none",cursor:"default"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
    <div style={{fontSize:28,marginBottom:14}}>{ic}</div>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#111",marginBottom:8}}>{title}</div>
    <div style={{fontSize:12,color:"#9a8f83",lineHeight:1.9}}>{desc}</div>
  </div>);
}


/* ═══ PRODUCT MODAL ═══ */
function ProductModal({prod,onClose,onAdd,onWish,wished}){
  const[imgIdx,setImgIdx]=useState(0);
  const[selSize,setSelSize]=useState("");
  const[added,setAdded]=useState(false);
  const autoRef=useRef(null);

  const images=[];
  for(let i=1;i<=5;i++){const v=prod["img"+i]||prod["photo_url"+(i===1?"":i)]||"";if(v)images.push(v);}
  const emojis=["👗","✨","🧵","💎","🌸"];
  const imgs=images.length>0?images:emojis.slice(0,Math.max(1,Object.values(prod).filter(v=>v&&String(v).startsWith("http")).length||1));

  useEffect(()=>{
    autoRef.current=setInterval(()=>setImgIdx(i=>(i+1)%imgs.length),2000);
    return()=>clearInterval(autoRef.current);
  },[imgs.length]);

  useEffect(()=>{
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow="";};
  },[]);

  const price=Number(prod.sale_price||prod.price||0);
  const old=prod.old_price?Number(prod.old_price):null;
  const save=old?Math.round((old-price)/old*100):0;
  const lowStock=prod.display_stock_text&&(prod.display_stock_text.toLowerCase().includes("last")||prod.display_stock_text.toLowerCase().includes("sirf")||prod.display_stock_text.includes("2")||prod.display_stock_text.includes("3"));
  const sizes=prod.sizes||[];

  function handleAdd(){onAdd(prod);setAdded(true);setTimeout(()=>setAdded(false),1200);}
  function shareWA(){const txt="Yeh product dekho: *"+prod.name+"*\nRs."+price.toLocaleString()+"\n\nJameel Fabrics Kunjah\njameel-fabrics-catalogue.vercel.app";window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank");}

  // Swipe support
  const touchStart=useRef(0);
  function onTS(e){touchStart.current=e.touches[0].clientX;}
  function onTE(e){const dx=touchStart.current-e.changedTouches[0].clientX;if(Math.abs(dx)>40){setImgIdx(i=>(i+(dx>0?1:-1)+imgs.length)%imgs.length);clearInterval(autoRef.current);}}

  const curImg=imgs[imgIdx];
  const isUrl=curImg&&(curImg.startsWith("http")||curImg.startsWith("/"));

  return(
    <div style={{position:"fixed",inset:0,zIndex:9995,background:"rgba(0,0,0,.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"10px",overflowY:"auto"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#faf9f7",width:"100%",maxWidth:860,maxHeight:"92vh",overflowY:"auto",display:"grid",gridTemplateColumns:"1fr 1fr",position:"relative"}} className="two-col">
        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"#fff",border:"1px solid #e0dbd3",width:34,height:34,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#111";}}>✕</button>

        {/* Left: Images */}
        <div style={{background:"#f0ede8",padding:"clamp(16px,3vw,24px)",display:"flex",flexDirection:"column",gap:10}}>
          {/* Main image */}
          <div onTouchStart={onTS} onTouchEnd={onTE} style={{aspectRatio:"3/4",background:"#e8e4df",display:"flex",alignItems:"center",justifyContent:"center",fontSize:100,position:"relative",overflow:"hidden",cursor:"pointer"}}>
            {isUrl?<img src={curImg} alt={prod.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity .3s"}} onError={e=>e.target.style.display="none"}/>:<span style={{transition:"all .3s"}}>{curImg}</span>}
            {imgs.length>1&&(
              <>
                <button onClick={()=>{setImgIdx(i=>(i-1+imgs.length)%imgs.length);clearInterval(autoRef.current);}} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.85)",border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                <button onClick={()=>{setImgIdx(i=>(i+1)%imgs.length);clearInterval(autoRef.current);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.85)",border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
              </>
            )}
            <div style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.5)",color:"#fff",padding:"3px 8px",fontSize:9,borderRadius:20}}>{imgIdx+1}/{imgs.length}</div>
            <div style={{position:"absolute",bottom:10,left:10,background:"rgba(0,0,0,.4)",color:"#fff",padding:"3px 8px",fontSize:8,letterSpacing:1}}>Auto ●</div>
          </div>
          {/* Thumbnails */}
          {imgs.length>1&&(
            <div style={{display:"flex",gap:6,overflowX:"auto"}}>
              {imgs.map((img,i)=>(
                <div key={i} onClick={()=>{setImgIdx(i);clearInterval(autoRef.current);}} style={{flex:"0 0 58px",height:70,background:"#e0dbd3",border:"2px solid "+(i===imgIdx?"#111":"transparent"),cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden",transition:"border-color .2s"}}>
                  {img.startsWith("http")||img.startsWith("/")?<img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:img}
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:9,color:"#9a8f83",textAlign:"center",letterSpacing:1}}>← Swipe to change image</div>
        </div>

        {/* Right: Info */}
        <div style={{padding:"clamp(16px,3vw,28px)",overflowY:"auto"}}>
          <div style={{fontSize:9,color:"#9a8f83",letterSpacing:2.5,textTransform:"uppercase",marginBottom:8}}>{CAT_L[prod.cat]||prod.category||""}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(18px,2.5vw,24px)",fontWeight:700,color:"#111",marginBottom:6,lineHeight:1.2}}>{prod.name}</div>
          {prod.color&&<div style={{fontSize:12,color:"#9a8f83",marginBottom:14}}>{prod.color}</div>}

          {/* Price */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,3vw,30px)",fontWeight:700,color:old?"#b91c1c":"#111"}}> Rs.{price.toLocaleString()}</div>
            {old&&<><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#c9a49a",textDecoration:"line-through"}}>Rs.{old.toLocaleString()}</div><div style={{background:"#dcfce7",color:"#16a34a",padding:"3px 10px",fontSize:10,fontWeight:700,borderRadius:20}}>Save {save}%</div></>}
          </div>

          {/* Stock urgency */}
          {prod.display_stock_text&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:lowStock?"#fee2e2":"#f5f2ee",color:lowStock?"#b91c1c":"#9a8f83",padding:"5px 12px",fontSize:11,fontWeight:lowStock?700:400,marginBottom:14,animation:lowStock?"pulse 1.2s ease infinite":"none"}}>
              {lowStock&&<span style={{width:6,height:6,borderRadius:"50%",background:"#b91c1c",display:"inline-block"}}/>}
              {prod.display_stock_text}
            </div>
          )}

          <div style={{height:1,background:"#e8e4df",margin:"12px 0"}}/>

          {/* Sizes */}
          {sizes.length>0&&(<>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:"#9a8f83",textTransform:"uppercase",marginBottom:8}}>Select Size</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
              {sizes.map(s=><button key={s} onClick={()=>setSelSize(s)} style={{border:"1px solid "+(selSize===s?"#111":"#d0ccc5"),padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer",background:selSize===s?"#111":"#fff",color:selSize===s?"#fff":"#111",transition:"all .2s",fontFamily:"inherit"}}>{s}</button>)}
            </div>
            <div style={{fontSize:10,color:"#c9a84c",cursor:"pointer",letterSpacing:1,marginBottom:14,textDecoration:"underline"}}>Size Guide</div>
          </>)}

          {/* Description */}
          {prod.note&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#9a8f83",lineHeight:1.9,fontStyle:"italic",marginBottom:18}}>{prod.note}</div>}

          {/* Buttons */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={handleAdd} style={{flex:1,background:added?"#16a34a":"#111",color:"#fff",border:"none",padding:14,fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"background .25s"}} onMouseEnter={e=>!added&&(e.currentTarget.style.background="#2a2520")} onMouseLeave={e=>!added&&(e.currentTarget.style.background="#111")}>{added?"✓ Added!":"Add to Cart"}</button>
            <button onClick={()=>onWish(prod.id)} style={{width:48,border:"1px solid "+(wished?"#b91c1c":"#d0ccc5"),background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" stroke={wished?"#b91c1c":"#9a8f83"} strokeWidth="1.5" fill={wished?"#b91c1c":"none"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
          {/* WA Order */}
          <button onClick={()=>{onAdd(prod);onClose();}} style={{width:"100%",background:"#25D366",color:"#fff",border:"none",padding:13,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="#1ea855"} onMouseLeave={e=>e.currentTarget.style.background="#25D366"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            Add to Cart & Order
          </button>
          {/* Share */}
          <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:12,borderTop:"1px solid #e8e4df"}}>
            <span style={{fontSize:10,color:"#9a8f83",letterSpacing:1,flex:1}}>Share this product:</span>
            <button onClick={shareWA} style={{background:"#25D366",color:"#fff",border:"none",padding:"7px 14px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:4,display:"flex",alignItems:"center",gap:5}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



/* ═══ COUNTDOWN BANNER ═══ */
function CountdownBanner({settings}){
  const[time,setTime]=useState({d:0,h:0,m:0,s:0,expired:false});
  const endDate=settings.countdown_end||"";
  const title=settings.countdown_title||"🔥 Eid Special Sale";
  const subtext=settings.countdown_subtext||"Up to 30% Off — Limited Time!";
  const active=settings.countdown_active==="true";

  useEffect(()=>{
    if(!endDate||!active)return;
    function tick(){
      const diff=new Date(endDate)-new Date();
      if(diff<=0){setTime({d:0,h:0,m:0,s:0,expired:true});return;}
      setTime({
        d:Math.floor(diff/86400000),
        h:Math.floor((diff%86400000)/3600000),
        m:Math.floor((diff%3600000)/60000),
        s:Math.floor((diff%60000)/1000),
        expired:false
      });
    }
    tick();
    const t=setInterval(tick,1000);
    return()=>clearInterval(t);
  },[endDate,active]);

  if(!active||!endDate||time.expired)return null;
  const pad=n=>String(n).padStart(2,'0');

  return(
    <div style={{background:"linear-gradient(135deg,#b91c1c 0%,#dc2626 50%,#b91c1c 100%)",padding:"10px clamp(12px,3vw,24px)",display:"flex",alignItems:"center",justifyContent:"center",gap:"clamp(10px,2vw,24px)",flexWrap:"wrap",borderBottom:"1px solid rgba(0,0,0,.2)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(12px,1.5vw,16px)",fontWeight:700,color:"#fff",letterSpacing:1}}>{title}</span>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(11px,1.3vw,14px)",color:"rgba(255,255,255,.75)",fontStyle:"italic"}}>— {subtext}</span>
      </div>
      <div style={{display:"flex",gap:"clamp(5px,1vw,8px)",alignItems:"center"}}>
        {[["d","Days"],["h","Hrs"],["m","Mins"],["s","Secs"]].map(([k,lbl],i)=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:"clamp(5px,1vw,8px)"}}>
            {i>0&&<span style={{color:"rgba(255,255,255,.5)",fontSize:20,fontWeight:300,marginBottom:14}}>:</span>}
            <div style={{textAlign:"center"}}>
              <div style={{background:"rgba(0,0,0,.3)",color:"#fff",fontFamily:"'Jost',sans-serif",fontSize:"clamp(16px,2.5vw,22px)",fontWeight:700,padding:"5px clamp(8px,1.5vw,12px)",minWidth:"clamp(38px,5vw,48px)",textAlign:"center",letterSpacing:1,border:"1px solid rgba(255,255,255,.15)"}}>{pad(time[k])}</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,.55)",textTransform:"uppercase",letterSpacing:1.5,marginTop:3}}>{lbl}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>document.getElementById("prods")?.scrollIntoView({behavior:"smooth"})} style={{background:"#fff",color:"#b91c1c",border:"none",padding:"8px clamp(14px,2vw,20px)",fontSize:9,fontWeight:800,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif",transition:"all .2s",flexShrink:0}} onMouseEnter={e=>{e.currentTarget.style.background="#f5f5f5"}} onMouseLeave={e=>{e.currentTarget.style.background="#fff"}}>
        Shop Now
      </button>
    </div>
  );
}


/* ═══ REVIEWS SECTION ═══ */
/* ═══ PWA INSTALL ═══ */
function PWAInstallBtn(){
  const[prompt,setPrompt]=useState(null);
  const[shown,setShown]=useState(false);
  useEffect(()=>{
    const handler=e=>{e.preventDefault();setPrompt(e);};
    window.addEventListener("beforeinstallprompt",handler);
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  if(!prompt||shown)return null;
  return(
    <div style={{position:"fixed",bottom:90,left:16,zIndex:800,background:"#fff",border:"1px solid #e0dbd3",padding:"12px 16px",boxShadow:"0 8px 24px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:12,maxWidth:280,animation:"fadeUp .4s ease"}}>
      <div style={{width:36,height:36,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'Playfair Display',serif",fontSize:12,fontWeight:900,color:"#fff"}}>JF</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:12,color:"#111"}}>Install App</div>
        <div style={{fontSize:10,color:"#9a8f83",marginTop:1}}>Home screen pe add karo</div>
      </div>
      <button onClick={async()=>{prompt.prompt();const{outcome}=await prompt.userChoice;if(outcome==="accepted"){setShown(true);toast("App installed! ✓","success");}}} style={{background:"#111",color:"#fff",border:"none",padding:"6px 12px",fontSize:9,fontWeight:700,letterSpacing:1,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Install</button>
      <button onClick={()=>setShown(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#9a8f83",fontSize:18,lineHeight:1,padding:0}}>×</button>
    </div>
  );
}


function ReviewsSection(){
  const[reviews,setReviews]=useState([]);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({name:"",city:"",text:"",rating:5,photo:""});
  const[submitting,setSub]=useState(false);
  const sb=typeof createClient!=="undefined"&&process.env.REACT_APP_SUPABASE_URL?createClient(process.env.REACT_APP_SUPABASE_URL,process.env.REACT_APP_SUPABASE_ANON_KEY):null;

  useEffect(()=>{
    if(!sb)return;
    sb.from("reviews").select("*").eq("approved",true).order("created_at",{ascending:false}).limit(20).then(({data})=>setReviews(data||[]));
  },[]);

  async function submit(){
    if(!form.name||!form.text)return alert("Please fill name and review.");
    setSub(true);
    const payload={name:form.name,city:form.city,text:form.text,rating:form.rating,photo:form.photo||null,approved:false};
    if(sb)await sb.from("reviews").insert(payload);
    setSub(false);setShowForm(false);
    setForm({name:"",city:"",text:"",rating:5,photo:""});
    alert("Thank you! Your review will appear after approval.");
  }

  const stars=(n)=>Array.from({length:5},(_,i)=><span key={i} style={{color:i<n?"#c9a84c":"#ddd",fontSize:14}}>★</span>);

  return(
    <section style={{padding:"60px 20px",background:"#fdfcf8",borderTop:"1px solid #f0ece0"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:8}}>Customer Reviews</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,4vw,38px)",fontWeight:600,color:"#1a1612",margin:0}}>What Our Customers Say</h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20,marginBottom:36}}>
          {reviews.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:"#9a8f83",padding:"40px 0",fontSize:14}}>No reviews yet. Be the first!</div>}
          {reviews.map((r,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:12,padding:"20px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1px solid #f0ece0"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                {r.photo
                  ?<img src={r.photo} alt="" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"2px solid #c9a84c"}}/>
                  :<div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#a07830)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:16}}>{r.name?r.name[0].toUpperCase():"?"}</div>
                }
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:"#1a1612"}}>{r.name}</div>
                  {r.city&&<div style={{fontSize:11,color:"#9a8f83"}}>📍 {r.city}</div>}
                </div>
                <div style={{marginLeft:"auto"}}>{stars(r.rating||5)}</div>
              </div>
              <p style={{fontSize:13,color:"#4a4035",lineHeight:1.6,margin:0}}>"{r.text}"</p>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center"}}>
          {!showForm
            ?<button onClick={()=>setShowForm(true)} style={{background:"#1a1612",color:"#fff",border:"none",padding:"12px 28px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer",letterSpacing:1}}>Write a Review</button>
            :<div style={{background:"#fff",border:"1px solid #e8dfc0",borderRadius:12,padding:"24px 20px",maxWidth:480,margin:"0 auto",textAlign:"left"}}>
              <div style={{fontWeight:600,fontSize:15,color:"#1a1612",marginBottom:16}}>Share Your Experience</div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:12,color:"#9a8f83",display:"block",marginBottom:4}}>Your Name *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Hamza Muhammadi" style={{width:"100%",padding:"9px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:12,color:"#9a8f83",display:"block",marginBottom:4}}>City</label>
                <input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="e.g. Lahore" style={{width:"100%",padding:"9px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:12,color:"#9a8f83",display:"block",marginBottom:4}}>Rating</label>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setForm({...form,rating:n})} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:n<=form.rating?"#c9a84c":"#ddd",padding:"2px"}}>★</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:12,color:"#9a8f83",display:"block",marginBottom:4}}>Your Review *</label>
                <textarea value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Share your experience with our products..." rows={3} style={{width:"100%",padding:"9px 12px",border:"1px solid #e0d8cc",borderRadius:6,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:"#9a8f83",display:"block",marginBottom:4}}>📸 Add Photo (optional)</label>
                <input type="file" accept="image/*" capture="environment" onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setForm(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}} style={{fontSize:12,width:"100%"}}/>
                {form.photo&&<img src={form.photo} alt="" style={{width:60,height:60,objectFit:"cover",borderRadius:6,marginTop:6,border:"1px solid #e0d8cc"}}/>}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={submit} disabled={submitting} style={{flex:1,background:"#1a1612",color:"#fff",border:"none",padding:"10px",borderRadius:6,fontSize:13,cursor:"pointer"}}>{submitting?"Submitting...":"Submit Review"}</button>
                <button onClick={()=>setShowForm(false)} style={{background:"none",border:"1px solid #e0d8cc",padding:"10px 16px",borderRadius:6,fontSize:13,cursor:"pointer",color:"#9a8f83"}}>Cancel</button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  );
}


function FeatureIcon({code}){
  const icons={
    "EX":<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    "PQ":<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "WA":<svg width="22" height="22" viewBox="0 0 24 24" fill="#c9a84c"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9 9 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    "FD":<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    "EE":<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><polyline points="1,4 1,10 7,10"/><polyline points="23,20 23,14 17,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
    "TS":<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  };
  return icons[code]||<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>;
}


function BrowsingBadge(){
  const[count,setCount]=useState(()=>Math.floor(Math.random()*12)+8);
  useEffect(()=>{
    const t=setInterval(()=>{
      setCount(c=>{
        const change=Math.random()>.5?1:-1;
        return Math.max(5,Math.min(28,c+change));
      });
    },4000);
    return()=>clearInterval(t);
  },[]);
  return(
    <div style={{position:"fixed",bottom:92,right:28,zIndex:699,background:"rgba(17,17,17,.88)",backdropFilter:"blur(8px)",color:"#fff",padding:"7px 12px",borderRadius:20,fontSize:11,display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 16px rgba(0,0,0,.25)",pointerEvents:"none"}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 1.5s ease infinite",flexShrink:0}}/>
      <span style={{fontWeight:600}}>{count}</span>
      <span style={{color:"rgba(255,255,255,.6)",fontSize:10}}>people browsing now</span>
    </div>
  );
}



// ── Brand Section per Category ───────────────────────────────
function BrandBar({prods,cat,brandFilter,setBrandFilter}){
  if(cat==="All"||cat==="HOT"||cat==="NEW")return null;
  const catProds=prods.filter(p=>p.cat===cat||p.category===cat);
  const brands=["All",...new Set(catProds.map(p=>p.brand).filter(Boolean))];
  const limits=CAT_BRAND_LIMITS[cat]||{};
  if(brands.length<=2)return null;
  return(
    <div style={{padding:"10px clamp(16px,4vw,60px)",background:"#fff",borderBottom:"1px solid #f0ece0",overflowX:"auto"}}>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"#9a8f83",letterSpacing:2,textTransform:"uppercase",flexShrink:0}}>Brand:</span>
        {brands.map(b=>(
          <button key={b} onClick={()=>setBrandFilter(b)} style={{
            padding:"5px 14px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",
            border:`1px solid ${brandFilter===b?"#1a1612":"#e0d8cc"}`,
            background:brandFilter===b?"#1a1612":"transparent",
            color:brandFilter===b?"#fff":"#6b5f52",
            whiteSpace:"nowrap",transition:"all .15s"
          }}>{b==="All"?"All Brands":b}</button>
        ))}
        {limits.max&&<span style={{fontSize:10,color:"#c9a84c",marginLeft:"auto",flexShrink:0}}>{catProds.filter(p=>brandFilter==="All"||p.brand===brandFilter).length} products</span>}
      </div>
    </div>
  );
}


function Store({user,onLogout,onAccount,onAdmin}){
  const settings=useSettings();
  const[prods,setProds]=useState([]);
  const[cat,setCat]=useState("All");
  const[cart,setCart]=useState([]);
  const[wish,setWish]=useState(new Set());
  const[cartOpen,setCartOpen]=useState(false);
  const[menuOpen,setMenuOpen]=useState(false);
  const[authModal,setAuthModal]=useState(null);
  const[search,setSearch]=useState("");
  const[heroIdx,setHeroIdx]=useState(0);
  const[priceRange,setPriceRange]=useState([0,15000]);
  const[sortBy,setSortBy]=useState("new");
  const[brandFilter,setBrandFilter]=useState("All");
  const[zoomImg,setZoomImg]=useState(null);
  const[gift,setGift]=useState({enabled:false});
  const[abandonTimer,setAbandonTimer]=useState(null);
  const[priceDrop,setPriceDrop]=useState({});
  const[heroImgIdx,setHeroImgIdx]=useState(0);
  const[cdTime,setCdTime]=useState({d:"00",h:"00",m:"00",s:"00"});
  const heroImgs=["👗","✨","🌸","🧵","💎"];
  const[modalProd,setModalProd]=useState(null);
  const[recentlyViewed,setRecentlyViewed]=useState(()=>{try{return JSON.parse(localStorage.getItem("jf_rv")||"[]");}catch{return [];}});
  const[showTop,setShowTop]=useState(false);
  const searchRef=useRef(null);
  useReveal();
  const heroLines=["Exclusive Collections","Premium Pakistani Fabric","Handpicked Quality","Timeless Elegance","Limited Edition Pieces"];
  useEffect(()=>{const t=setInterval(()=>setHeroIdx(i=>(i+1)%heroLines.length),3000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>setHeroImgIdx(i=>(i+1)%heroImgs.length),2000);return()=>clearInterval(t);},[]);
  // Countdown timer
  useEffect(()=>{
    function tick(){
      const endStr=settings.sale_end_date;
      if(!endStr||settings.show_countdown!=="true"){setCdTime(null);return;}
      const diff=new Date(endStr)-Date.now();
      if(diff<=0){setCdTime(null);return;}
      const pad=n=>String(Math.floor(n)).padStart(2,"0");
      setCdTime({d:pad(diff/86400000),h:pad((diff%86400000)/3600000),m:pad((diff%3600000)/60000),s:pad((diff%60000)/1000)});
    }
    tick();
    const t=setInterval(tick,1000);
    return()=>clearInterval(t);
  },[settings]);
  useEffect(()=>{if(!sb)return;sb.from("products").select("*").eq("website_status","approved").eq("active",true).order("created_at",{ascending:false}).then(({data})=>setProds(data||[]));const ch=sb.channel("shop_p").on("postgres_changes",{event:"*",schema:"public",table:"products"},()=>{sb.from("products").select("*").eq("website_status","approved").eq("active",true).order("created_at",{ascending:false}).then(({data})=>setProds(data||[]));}).subscribe();return()=>sb.removeChannel(ch);},[]);
  useEffect(()=>{if(!sb||!user)return;sb.from("wishlists").select("product_id").eq("customer_id",user.id).then(({data})=>{if(data)setWish(new Set(data.map(x=>x.product_id)));});},[user]);
  useEffect(()=>{document.body.style.overflow=menuOpen?"hidden":"";return()=>{document.body.style.overflow="";};},[menuOpen]);
  // Back to top
  useEffect(()=>{
    const fn=()=>setShowTop(window.scrollY>400);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const aRef=useRef(0),aTimer=useRef(null);
  function adminTrigger(){aRef.current++;clearTimeout(aTimer.current);aTimer.current=setTimeout(()=>aRef.current=0,2000);if(aRef.current>=5){aRef.current=0;onAdmin();}}
  const allBrands=["All",...new Set(prods.map(p=>p.brand).filter(Boolean))];
  const filtered=prods.filter(p=>{
    const cOk=cat==="All"||(p.cat===cat||p.category===cat);
    const sOk=!search||(p.name?.toLowerCase().includes(search.toLowerCase())||p.color?.toLowerCase().includes(search.toLowerCase())||p.brand?.toLowerCase().includes(search.toLowerCase())||p.category?.toLowerCase().includes(search.toLowerCase()));
    const price=Number(p.sale_price||p.price||0);
    const prOk=price>=priceRange[0]&&price<=priceRange[1];
    const brOk=brandFilter==="All"||p.brand===brandFilter;
    return cOk&&sOk&&prOk&&brOk;
  }).sort((a,b)=>{
    if(sortBy==="price_asc")return(a.sale_price||a.price||0)-(b.sale_price||b.price||0);
    if(sortBy==="price_desc")return(b.sale_price||b.price||0)-(a.sale_price||a.price||0);
    if(sortBy==="name")return(a.name||"").localeCompare(b.name||"");
    return new Date(b.created_at||0)-new Date(a.created_at||0); // newest
  });
  const maxPrice=Math.max(15000,...prods.map(p=>Number(p.sale_price||p.price||0)));
  const cartCount=cart.reduce((s,x)=>s+x.qty,0);
  const wa=settings.wa_number||WA_NUM;
  const ann=(settings.announcement||"New Arrivals|Exclusive Designs|Fast Delivery|Book on WhatsApp").split("|");
  function openModal(prod){
    setModalProd(prod);
    // Save to recently viewed
    setRecentlyViewed(prev=>{
      const filtered=prev.filter(p=>p.id!==prod.id);
      const updated=[prod,...filtered].slice(0,6);
      try{localStorage.setItem("jf_rv",JSON.stringify(updated));}catch{}
      return updated;
    });
  }

  function addToCart(prod){
    setCart(c=>{const ex=c.find(x=>x.id===prod.id);if(ex)return c.map(x=>x.id===prod.id?{...x,qty:x.qty+1}:x);return[...c,{...prod,qty:1,price:Number(prod.sale_price||prod.price||0)}];});
    toast("Added: "+prod.name,"success");
    // Cart abandon reminder — 15 min
    if(abandonTimer)clearTimeout(abandonTimer);
    const t=setTimeout(()=>{
      const wa=settings?.wa_number||WA_NUM;
      const msg=encodeURIComponent("Assalam! You left items in your cart at Jameel Fabrics. Complete your order: "+window.location.href);
      // Show notification instead of redirecting
      if(Notification.permission==="granted"){new Notification("Don't forget your cart! 🛍️",{body:"Complete your Jameel Fabrics order",icon:"/logo192.png"});}
    },15*60*1000);
    setAbandonTimer(t);
  }
  function savePriceDrop(prod){
    const saved=JSON.parse(localStorage.getItem("jf_pricedrop")||"{}");
    saved[prod.id]={price:Number(prod.sale_price||prod.price||0),name:prod.name,wa:settings?.wa_number||WA_NUM};
    localStorage.setItem("jf_pricedrop",JSON.stringify(saved));
    toast("Price drop alert set for "+prod.name+" 🔔","success");
  }
  async function toggleWish(id){if(!user){setAuthModal("login");toast("Login karke wishlist save karo");return;}const has=wish.has(id);if(has){setWish(w=>{const n=new Set(w);n.delete(id);return n;});if(sb)await sb.from("wishlists").delete().eq("customer_id",user.id).eq("product_id",id);}else{setWish(w=>new Set([...w,id]));if(sb)await sb.from("wishlists").insert({customer_id:user.id,product_id:id});}}

  return(<div style={{background:"#faf9f7",minHeight:"100vh",fontFamily:"'Jost',sans-serif"}}>
    <FreeShippingBar cartTotal={cart.reduce((s,i)=>s+(i.price*i.qty),0)} settings={settings}/>
    <ImageZoom src={zoomImg} onClose={()=>setZoomImg(null)}/>
    <AIOutfitSuggester prods={prods} onFilter={setCat}/>
    {/* Countdown Banner - above announcement */}
    {cdTime&&(
      <div style={{background:"linear-gradient(135deg,#b91c1c,#dc2626)",padding:"9px clamp(14px,3vw,32px)",display:"flex",alignItems:"center",justifyContent:"center",gap:"clamp(10px,2vw,24px)",flexWrap:"wrap",borderBottom:"1px solid rgba(0,0,0,.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:14}}>🔥</span>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(11px,1.4vw,14px)",fontWeight:700,color:"#fff",letterSpacing:.5}}>{settings.sale_title||"Eid Special Sale"}</div>
          <span style={{fontSize:10,color:"rgba(255,255,255,.7)",fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(11px,1.3vw,14px)"}}>{settings.sale_text||"Up to 30% Off"}</span>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
          {["d","h","m","s"].map((u,i)=>(
            <div key={u} style={{display:"flex",alignItems:"center",gap:5}}>
              {i>0&&<span style={{color:"rgba(255,255,255,.5)",fontWeight:700,fontSize:16,lineHeight:1,marginBottom:12}}>:</span>}
              <div style={{textAlign:"center"}}>
                <span style={{background:"rgba(0,0,0,.25)",color:"#fff",fontFamily:"'Jost',sans-serif",fontSize:"clamp(16px,2.5vw,22px)",fontWeight:700,padding:"4px 8px",display:"block",minWidth:38,letterSpacing:1}}>{cdTime[u]}</span>
                <span style={{fontSize:7,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginTop:3}}>{["Days","Hrs","Mins","Secs"][i]}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>document.getElementById("prods")?.scrollIntoView({behavior:"smooth"})} style={{background:"#fff",color:"#b91c1c",border:"none",padding:"7px 18px",fontSize:9,fontWeight:800,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#fef2f2";}} onMouseLeave={e=>{e.currentTarget.style.background="#fff";}}>
          Shop Now
        </button>
      </div>
    )}
    {/* Announcement */}
    <div style={{background:"#111",height:34,display:"flex",alignItems:"center",overflow:"hidden"}}>
      <div style={{display:"flex",animation:"annScroll 32s linear infinite",whiteSpace:"nowrap"}}>
        {[...ann,...ann].map((a,i)=><span key={i} style={{padding:"0 48px",fontSize:9,letterSpacing:2.5,color:"rgba(255,255,255,.75)",textTransform:"uppercase"}}>{"✦ "+a.trim()}</span>)}
      </div>
    </div>
    {/* Countdown banner */}
    <CountdownBanner settings={settings}/>
    {/* NAV */}
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(250,249,247,.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid #e8e4df",height:64,display:"flex",alignItems:"center",padding:"0 clamp(14px,3vw,52px)",gap:12,boxShadow:"0 1px 16px rgba(0,0,0,.06)"}}>
      <button onClick={()=>{setCat("All");window.scrollTo({top:0,behavior:"smooth"});}} style={{cursor:"pointer",flexShrink:0,background:"none",border:"none",textAlign:"left",marginRight:"auto",padding:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(13px,1.5vw,17px)",fontWeight:900,letterSpacing:"clamp(2px,1vw,6px)",color:"#111",lineHeight:1.1}}>{settings.store_name||"JAMEEL FABRICS"}</div>
        <div style={{fontSize:7,letterSpacing:"clamp(2px,.8vw,5px)",color:"#9a8f83",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",lineHeight:1}}>KUNJAH · PUNJAB</div>
      </button>
      <div className="search-bar hide-mob" style={{display:"flex",alignItems:"center",gap:8,background:"#f0ede8",border:"1px solid #e0dbd3",padding:"7px 14px",flex:1,maxWidth:200}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a8f83" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input ref={searchRef} type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:"none",border:"none",outline:"none",fontSize:12,color:"#111",width:"100%",fontFamily:"inherit"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"#9a8f83",fontSize:16,padding:0}}>x</button>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2,flexShrink:0}}>
        <button onClick={()=>user?onAccount():setAuthModal("login")} style={{background:"none",border:"none",cursor:"pointer",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",color:"#6b6358",borderRadius:4,transition:"background .2s",position:"relative"}} onMouseEnter={e=>e.currentTarget.style.background="#f0ede8"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {wish.size>0&&<span style={{position:"absolute",top:5,right:5,background:"#b91c1c",color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{wish.size}</span>}
        </button>
        <button onClick={()=>setCartOpen(true)} style={{background:"#111",color:"#fff",border:"none",padding:"9px 14px",fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,cursor:"pointer",transition:"background .2s",whiteSpace:"nowrap",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background="#2a2520"} onMouseLeave={e=>e.currentTarget.style.background="#111"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Cart ({cartCount})
        </button>
        <button onClick={()=>setMenuOpen(true)} style={{background:"none",border:"none",cursor:"pointer",width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:5,flexShrink:0,borderRadius:4,transition:"background .2s",marginLeft:2}} onMouseEnter={e=>e.currentTarget.style.background="#f0ede8"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
          {[0,1,2].map(i=><span key={i} style={{display:"block",width:5,height:5,borderRadius:"50%",background:"#111"}}/>)}
        </button>
      </div>
    </nav>
    {/* SIDE MENU */}
    {menuOpen&&(<>
      <div style={{position:"fixed",inset:0,zIndex:998,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)"}} onClick={()=>setMenuOpen(false)}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(320px,88vw)",zIndex:999,background:"#faf9f7",display:"flex",flexDirection:"column",boxShadow:"-16px 0 48px rgba(0,0,0,.14)",animation:"slideR .3s cubic-bezier(.77,0,.18,1)"}}>
        <div style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e8e4df",flexShrink:0}}>
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#111"}}>JAMEEL FABRICS</div><div style={{fontSize:9,color:"#9a8f83",letterSpacing:2,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Kunjah · Punjab</div></div>
          <button onClick={()=>setMenuOpen(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#9a8f83"}}>x</button>
        </div>
        <div style={{flex:1,overflowY:"auto",overscrollBehavior:"contain"}}>
          {[
            {sep:true,label:"Navigate"},
            {ic:"🏠",lbl:"Home",fn:()=>{setCat("All");setMenuOpen(false);window.scrollTo({top:0,behavior:"smooth"});}},
            {sep:true,label:"Categories"},
            {ic:"👗",lbl:"Women Unstitch",fn:()=>{setCat("WU");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"✂️",lbl:"Women Stitch",fn:()=>{setCat("WS");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"💎",lbl:"Reshmi Suiting",fn:()=>{setCat("RS");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"🕌",lbl:"Abayas",fn:()=>{setCat("AB");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"👔",lbl:"Mens Plain",fn:()=>{setCat("MP");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"🪡",lbl:"Mens Embroidery",fn:()=>{setCat("ME");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"🧒",lbl:"Kids Unstitch",fn:()=>{setCat("KU");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"🛏️",lbl:"Bedsheets",fn:()=>{setCat("BS");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"🧣",lbl:"Blankets",fn:()=>{setCat("BL");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"📦",lbl:"Others",fn:()=>{setCat("OT");setMenuOpen(false);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}},
            {sep:true,label:"Account"},
            ...(user?[
              {ic:"👤",lbl:"My Account",fn:()=>{onAccount();setMenuOpen(false);}},
              {ic:"🚪",lbl:"Logout",fn:()=>{onLogout();setMenuOpen(false);},muted:true},
            ]:[
              {ic:"👤",lbl:"Login / Register",fn:()=>{setAuthModal("login");setMenuOpen(false);}},
            ]),
            {sep:true,label:"Info"},
            {ic:"📍",lbl:"Visit Our Store",fn:()=>{setMenuOpen(false);document.getElementById("store-map")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"📋",lbl:"Our Policies",fn:()=>{setMenuOpen(false);document.getElementById("policies")?.scrollIntoView({behavior:"smooth"});}},
            {ic:"💬",lbl:"WhatsApp Us",fn:()=>{window.open("https://wa.me/"+wa,"_blank");setMenuOpen(false);}}
          ].map((item,i)=>item.sep?(
            <div key={i} style={{padding:"12px 24px 4px",fontSize:8,letterSpacing:3,textTransform:"uppercase",color:"#b5aba2",fontWeight:700}}>{item.label}</div>
          ):(
            <button key={i} onClick={item.fn} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 24px",cursor:"pointer",border:"none",background:"none",width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:item.small?11:13,fontWeight:500,color:item.muted?"#9a8f83":"#111",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#f0ede8"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{opacity:.7,fontSize:16,width:22,textAlign:"center"}}>{item.ic}</span>{item.lbl}
            </button>
          ))}
        </div>
      </div>
    </>)}
    {/* EID COUNTDOWN */}
    <EidCountdown settings={settings}/>
    {/* HERO */}
    <section className="hero-grid" style={{minHeight:"95vh",display:"grid",gridTemplateColumns:"1fr 1fr",alignItems:"center",padding:"80px clamp(16px,5vw,80px) 60px",position:"relative",overflow:"hidden",gap:"clamp(24px,4vw,60px)"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#e8e4df 1px,transparent 1px),linear-gradient(90deg,#e8e4df 1px,transparent 1px)",backgroundSize:"52px 52px",WebkitMaskImage:"radial-gradient(ellipse 90% 90% at 30% 50%,#000 20%,transparent 100%)",opacity:.4,pointerEvents:"none"}}/>
      <div className="hero-text" style={{zIndex:1}}>
        {/* Mobile full-width image banner - shows only on mobile */}
        <div className="mob-hero-banner" style={{width:"100%",background:"#f0ede8",border:"1px solid #e0dbd3",aspectRatio:"4/3",marginBottom:20,position:"relative",overflow:"hidden",display:"none",alignItems:"center",justifyContent:"center",fontSize:72}}>
          <span style={{transition:"all .4s"}}>{heroImgs[heroImgIdx]}</span>
          <div style={{position:"absolute",top:10,left:10,background:"#111",color:"#fff",padding:"4px 10px",fontSize:7,fontWeight:800,letterSpacing:2}}>NEW ARRIVAL</div>
          <div style={{position:"absolute",top:10,right:10,background:"#c9a84c",color:"#111",padding:"4px 10px",fontSize:7,fontWeight:800,letterSpacing:2}}>LIMITED EDITION</div>
          <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5}}>
            {heroImgs.map((_,i)=><span key={i} style={{width:i===heroImgIdx?14:5,height:5,borderRadius:3,background:i===heroImgIdx?"#111":"rgba(0,0,0,.25)",transition:"width .3s",display:"inline-block"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,animation:"fadeUp .8s ease .1s both"}}>
          <div style={{width:28,height:1,background:"#c9a84c"}}/>
          <div style={{fontSize:9,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",fontWeight:600}}>{settings.hlabel||"Winter Collection 2026"}</div>
        </div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(40px,6.5vw,84px)",fontWeight:900,lineHeight:.88,color:"#111",letterSpacing:"clamp(1px,.8vw,5px)",animation:"fadeUp .8s ease .2s both",marginBottom:14}}>
          JAMEEL<br/>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontStyle:"italic",color:"#6b6358",fontSize:"clamp(30px,5vw,64px)",letterSpacing:"clamp(6px,2vw,16px)"}}>Fabrics</span>
        </h1>
        <div style={{height:"clamp(20px,2.2vw,28px)",overflow:"hidden",marginBottom:22,animation:"fadeUp .8s ease .35s both"}}>
          <div key={heroIdx} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(13px,1.5vw,18px)",color:"#9a8f83",fontStyle:"italic",letterSpacing:2,animation:"textSlide 3s ease both"}}>{heroLines[heroIdx]}</div>
        </div>
        <div style={{width:44,height:1,background:"#c9a84c",marginBottom:22,animation:"fadeUp .6s ease .5s both"}}/>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(13px,1.4vw,17px)",color:"#9a8f83",lineHeight:2,marginBottom:32,animation:"fadeUp .8s ease .55s both"}}>{settings.about||"Premium Pakistani fabrics — each piece handpicked for quality, exclusivity and timeless elegance."}</p>
        <div className="hero-btns" style={{display:"flex",gap:12,flexWrap:"wrap",animation:"fadeUp .8s ease .65s both"}}>
          <button onClick={()=>document.getElementById("prods")?.scrollIntoView({behavior:"smooth"})} style={{background:"#111",color:"#fff",border:"none",padding:"13px 36px",fontSize:9,fontWeight:700,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"all .35s"}} onMouseEnter={e=>{e.currentTarget.style.background="#2a2520";e.currentTarget.style.letterSpacing="5px";}} onMouseLeave={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.letterSpacing="4px";}}>View Collection</button>
          <a href={"https://wa.me/"+wa} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <button style={{background:"transparent",color:"#111",border:"1px solid #111",padding:"13px 28px",fontSize:9,fontWeight:700,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"all .35s",display:"flex",alignItems:"center",gap:8}} onMouseEnter={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#111";}}>
              <WaSvg/> WhatsApp Us
            </button>
          </a>
        </div>
      </div>
      <div className="hero-right" style={{zIndex:1,animation:"fadeUp 1.2s ease .4s both"}}>
        <div style={{background:"#f0ede8",border:"1px solid #e0dbd3",aspectRatio:"3/4",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:16,right:16,background:"#111",color:"#fff",padding:"7px 16px",fontSize:8,fontWeight:800,letterSpacing:2,textTransform:"uppercase",zIndex:3,animation:"floatBadge1 3s ease-in-out infinite",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>NEW ARRIVAL</div>
          <div style={{position:"absolute",bottom:20,left:16,background:"#c9a84c",color:"#111",padding:"7px 16px",fontSize:8,fontWeight:800,letterSpacing:2,textTransform:"uppercase",zIndex:3,animation:"floatBadge2 3.5s ease-in-out infinite",boxShadow:"0 4px 16px rgba(201,168,76,.4)"}}>LIMITED EDITION</div>
          <div style={{fontSize:"clamp(72px,12vw,130px)",opacity:.12,position:"absolute",bottom:-20,right:-10,fontFamily:"'Playfair Display',serif",fontWeight:900,color:"#111",lineHeight:1,userSelect:"none"}}>JF</div>
          <div style={{textAlign:"center",padding:"36px 20px",zIndex:2}}>
            <div style={{fontSize:"clamp(52px,9vw,96px)",marginBottom:18}}>👗</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(15px,1.8vw,21px)",fontWeight:700,color:"#111",marginBottom:8}}>Exclusive Designs</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(12px,1.3vw,15px)",color:"#9a8f83",fontStyle:"italic",lineHeight:1.8}}>Once sold, never repeated<br/>Crafted for the discerning</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:18}}>
              <div style={{width:20,height:1,background:"#c9a84c"}}/>
              <div style={{fontSize:9,color:"#c9a84c",letterSpacing:3,textTransform:"uppercase",fontWeight:600}}>Kunjah</div>
              <div style={{width:20,height:1,background:"#c9a84c"}}/>
            </div>
          </div>
        </div>
        <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
          {[["500+","Happy Customers"],["100%","Exclusive Designs"],["4.9★","Customer Rating"],["5+","Years Trusted"]].map(([n,l])=>(
            <div key={l} style={{background:"#fff",border:"1px solid #e0dbd3",padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#111"}}>{n}</div>
              <div style={{fontSize:9,color:"#9a8f83",letterSpacing:1,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div onClick={adminTrigger} onTouchEnd={adminTrigger} style={{position:"absolute",bottom:0,left:0,width:50,height:50,opacity:0,cursor:"default",zIndex:10}}/>
    </section>
    {/* CATEGORY BAR */}
    <div style={{background:"#fff",borderTop:"1px solid #e8e4df",borderBottom:"1px solid #e8e4df",position:"sticky",top:64,zIndex:99,overflowX:"auto"}}>
      <div style={{display:"flex",justifyContent:"center",minWidth:"max-content",margin:"0 auto"}}>
        {CATS.map(([c,lbl])=>(
          <button key={c} onClick={()=>{setCat(c);document.getElementById("prods")?.scrollIntoView({behavior:"smooth"});}} style={{padding:"14px clamp(14px,2.5vw,28px)",border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:cat===c?"#111":"#9a8f83",borderBottom:cat===c?"2px solid #111":"2px solid transparent",transition:"all .25s",whiteSpace:"nowrap",flexShrink:0}}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
    {/* VIDEO */}
    {settings.video_show==="true"&&settings.video_url&&(
      <section style={{padding:"clamp(56px,7vw,88px) clamp(16px,4vw,60px)",borderBottom:"1px solid #e8e4df",background:"#fff"}}>
        <div className="rv" style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:9,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>{settings.video_label||"Featured"}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,color:"#111"}}>{settings.video_title||"Watch Our Collection"}</div>
        </div>
        <div className="rv" style={{maxWidth:920,margin:"0 auto",border:"1px solid #e0dbd3"}}>
          {(settings.video_url.includes("youtube")||settings.video_url.includes("youtu.be"))?
            <iframe src={"https://www.youtube.com/embed/"+(settings.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)||[])[1]+"?rel=0"} style={{width:"100%",height:"clamp(210px,45vw,520px)",border:"none"}} allowFullScreen/>:
            <video src={settings.video_url} controls style={{width:"100%",maxHeight:520,display:"block",background:"#111"}} preload="metadata"/>
          }
        </div>
      </section>
    )}
    {/* PRODUCTS */}
    <section id="prods" style={{background:"#faf9f7",borderBottom:"1px solid #e8e4df"}}>
      <div style={{textAlign:"center",padding:"clamp(48px,6vw,68px) clamp(16px,4vw,60px) 28px"}}>
        <div className="rv" style={{fontSize:9,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Our Collection</div>
        <div className="rv" style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,color:"#111",marginBottom:8}}>{cat==="All"?"All Collections":CAT_L[cat]||cat}</div>
        <div className="rv" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
          <div style={{width:40,height:1,background:"#c9a84c"}}/>
          <div style={{fontSize:9,color:"#9a8f83",letterSpacing:2}}>{filtered.length} pieces</div>
          <div style={{width:40,height:1,background:"#c9a84c"}}/>
        </div>
        {settings.sold_count&&<div className="rv" style={{fontSize:11,color:"#9a8f83",textAlign:"center",marginTop:8,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>{settings.sold_count}+ pieces sold this month</div>}
      </div>
      {/* ── BRAND BAR ─────────────────────────────── */}
      <BrandBar prods={prods} cat={cat} brandFilter={brandFilter} setBrandFilter={setBrandFilter}/>
      {/* ── ADVANCED FILTERS ─────────────────────────── */}
      <div style={{padding:"12px clamp(16px,4vw,60px)",background:"#fff",borderBottom:"1px solid #f0ece0"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",marginBottom:10}}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"7px 12px",border:"1px solid #e0d8cc",borderRadius:8,fontSize:12,outline:"none",background:"#fff",color:"#4a4035",cursor:"pointer"}}>
            {SORT_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          {allBrands.length>2&&<select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} style={{padding:"7px 12px",border:"1px solid #e0d8cc",borderRadius:8,fontSize:12,outline:"none",background:"#fff",color:"#4a4035",cursor:"pointer"}}>
            {allBrands.map(b=><option key={b} value={b}>{b==="All"?"All Brands":b}</option>)}
          </select>}
          <span style={{fontSize:11,color:"#9a8f83",marginLeft:"auto"}}>{filtered.length} products</span>
        </div>
        <div style={{maxWidth:320}}>
          <div style={{fontSize:11,color:"#9a8f83",marginBottom:4}}>Price Range</div>
          <PriceSlider min={0} max={maxPrice} value={priceRange} onChange={setPriceRange}/>
        </div>
      </div>

      {filtered.length===0?(
        <div style={{textAlign:"center",padding:64,color:"#b5aba2"}}><div style={{fontSize:40,marginBottom:12,opacity:.4}}>📦</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#9a8f83"}}>No products found</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"clamp(12px,1.5vw,18px)",padding:"0 clamp(16px,4vw,60px) clamp(56px,7vw,80px)",maxWidth:1500,margin:"0 auto"}}>
          {prods.length===0&&!filtered.length
            ?[...Array(8)].map((_,i)=><PCardSkeleton key={i}/>)
            :filtered.map((prod,i)=><PCard key={prod.id} prod={prod} idx={i} onAdd={addToCart} onWish={toggleWish} wished={wish.has(prod.id)} onOpenModal={openModal}/>)
          }
        </div>
      )}
    </section>
    {/* REVIEWS */}
    <section id="reviews" style={{padding:"clamp(48px,6vw,72px) clamp(16px,4vw,60px)",background:"#fff",borderBottom:"1px solid #e8e4df"}}>
      <div className="rv" style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:9,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Happy Customers</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,color:"#111"}}>Customer Reviews</div>
      </div>
      <ReviewsSection/>
    </section>
    {/* POLICIES */}
    <section id="policies" style={{padding:"clamp(56px,7vw,88px) clamp(16px,4vw,60px)",background:"#fff",borderBottom:"1px solid #e8e4df"}}>
      <div className="rv" style={{textAlign:"center",marginBottom:44}}>
        <div style={{fontSize:9,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Our Promise</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,color:"#111"}}>Our Policies</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,maxWidth:1200,margin:"0 auto"}}>
        {[
          {ic:"🔄",title:"Easy Exchange",desc:"Not satisfied? Exchange within 3 days. Your satisfaction is our priority.",color:"#fef9f0"},
          {ic:"✓",title:"Quality Assured",desc:"Every piece is personally inspected. We only sell what we would wear ourselves.",color:"#f0faf5"},
          {ic:"📦",title:"Careful Packaging",desc:"Your order is packed with care to arrive in perfect condition.",color:"#f0f5ff"},
          {ic:"💬",title:"WhatsApp Support",desc:"Direct access to the owner. Real human support, anytime.",color:"#fdf0ff"},
          {ic:"🔒",title:"Secure Ordering",desc:"Your personal information is never shared. Complete privacy guaranteed.",color:"#fff5f0"},
          {ic:"⚡",title:"Fast Delivery",desc:"Nationwide delivery in 3-5 working days.",color:"#f5fff0"},
        ].map(p=><PolicyCard key={p.title} {...p}/>)}
      </div>
    </section>
    {/* STORE MAP */}
    <section id="store-map" style={{padding:"clamp(56px,7vw,88px) clamp(16px,4vw,60px)",background:"#faf9f7",borderBottom:"1px solid #e8e4df"}}>
      <div className="two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(32px,5vw,72px)",alignItems:"start",maxWidth:1200,margin:"0 auto"}}>
        <div className="rv">
          <div style={{fontSize:9,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Find Us</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,color:"#111",marginBottom:20}}>Visit Our Store</div>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            {[["📍","Address",(settings.addr1||"Circular Road, Kunjah")+", "+(settings.addr2||"Distt Gujrat, Punjab")],["📞","Phone",settings.phone||"03228722232"],["💬","WhatsApp",settings.wa_number?"0"+settings.wa_number.slice(-10):"03228722232"],["⏰","Hours",settings.hours||"Mon-Sat: 10am-8pm"]].map(([ic,lbl,val])=>(
              <div key={lbl} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,background:"#f0ede8",border:"1px solid #e0dbd3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{ic}</div>
                <div><div style={{fontSize:9,letterSpacing:2,color:"#9a8f83",textTransform:"uppercase",fontWeight:700,marginBottom:2}}>{lbl}</div><div style={{fontSize:13,color:"#111"}}>{val}</div></div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <a href={"https://wa.me/"+(wa||WA_NUM)} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
              <button style={{background:"#111",color:"#fff",border:"none",padding:"12px 28px",fontSize:9,fontWeight:700,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}} onMouseEnter={e=>e.currentTarget.style.background="#2a2520"} onMouseLeave={e=>e.currentTarget.style.background="#111"}><WaSvg/> WhatsApp</button>
            </a>
            <a href="https://maps.google.com/?q=Kunjah+Gujrat+Punjab+Pakistan" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
              <button style={{background:"transparent",color:"#111",border:"1px solid #111",padding:"12px 24px",fontSize:9,fontWeight:700,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"all .2s",display:"flex",alignItems:"center",gap:6}} onMouseEnter={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#111";}}>📍 Open in Maps</button>
            </a>
          </div>
        </div>
        <div className="rv" style={{border:"1px solid #e0dbd3",overflow:"hidden"}}>
          <iframe title="Jameel Fabrics Location" src="https://maps.google.com/maps?q=Kunjah,+Gujrat,+Punjab,+Pakistan&output=embed&z=14" style={{width:"100%",height:"clamp(260px,40vw,420px)",border:"none",display:"block"}} loading="lazy"/>
          <div style={{padding:"14px 16px",background:"#f0ede8",borderTop:"1px solid #e0dbd3",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:"#111"}}>Circular Road, Kunjah</div>
            <a href="https://maps.google.com/?q=Kunjah+Gujrat+Punjab+Pakistan" target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"#c9a84c",textDecoration:"none",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Get Directions</a>
          </div>
        </div>
      </div>
    </section>
    {/* ABOUT */}
    <section style={{background:"#fdfcf8",padding:"56px clamp(16px,4vw,60px)",borderTop:"1px solid #f0ece0",borderBottom:"1px solid #f0ece0"}}>
      <div style={{maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(28px,4vw,60px)",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Est. 1975</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,3.5vw,40px)",fontWeight:600,color:"#1a1612",lineHeight:1.2,margin:"0 0 16px"}}>Jameel Fabrics<br/><em style={{fontWeight:300}}>Kunjah</em></h2>
          <p style={{fontSize:14,color:"#6b5f52",lineHeight:1.8,margin:"0 0 20px"}}>{settings?.about||"For nearly four decades, Jameel Fabrics has been Kunjah's most trusted name in premium Pakistani clothing. From elegant unstitched suits to fine embroidered fabric — every piece reflects our commitment to quality."}</p>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {[
              [settings?.story_stat1||"40+","Years"],
              [settings?.story_stat2||"10K+","Happy Customers"],
              [settings?.story_stat3||"500+","Products"],
            ].map(([n,d],i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:700,color:"#c9a84c",fontFamily:"'Cormorant Garamond',serif"}}>{n}</div>
                <div style={{fontSize:10,color:"#9a8f83",letterSpacing:1,textTransform:"uppercase"}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"linear-gradient(135deg,#1a1612,#2c2416)",borderRadius:12,padding:"32px 28px",color:"#fff"}}>
          <div style={{fontSize:11,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Why Choose Us</div>
          {[["🧵","Premium Quality","Only the finest Pakistani fabrics"],["✂️","Expert Craftsmanship","Decades of tailoring expertise"],["🚚","Nationwide Delivery","Fast & secure shipping"],["💬","Personal Service","Guidance on every purchase"]].map(([ic,t,d],i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<3?16:0}}>
              <span style={{fontSize:18,marginTop:2}}>{ic}</span>
              <div><div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{t}</div><div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>{d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <SubscriptionBox settings={settings} user={user} onAuth={setAuthModal}/>
    {/* FOOTER */}
    <footer style={{background:"#0a0907",color:"#e0dbd3",padding:"clamp(52px,6vw,80px) clamp(16px,4vw,60px) 28px"}}>
      <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr",gap:"clamp(24px,3.5vw,52px)",marginBottom:52,maxWidth:1200,margin:"0 auto 52px"}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,letterSpacing:4,color:"#fff",marginBottom:4}}>{settings.store_name||"JAMEEL FABRICS"}</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:10,letterSpacing:4,color:"rgba(255,255,255,.3)",marginBottom:16,fontStyle:"italic"}}>Kunjah · Est. Punjab</div>
          <p style={{fontSize:11,color:"rgba(255,255,255,.35)",lineHeight:2,marginBottom:20}}>Premium Pakistani fabrics. Exclusive designs, exceptional quality, trusted by families since 1975.</p>
          <div style={{display:"flex",gap:10}}>
            {[{url:settings.insta||"#",bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",ic:<IgSvg/>},{url:"https://wa.me/"+wa,bg:"#25D366",ic:<WaSvg/>},{url:settings.tiktok||"#",bg:"#010101",ic:<TkSvg/>,border:"1px solid rgba(255,255,255,.15)"},{url:settings.fb||"#",bg:"#1877F2",ic:<FbSvg/>}].map((s,i)=>(
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{width:36,height:36,borderRadius:4,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"transform .2s,opacity .2s",textDecoration:"none",color:"#fff",border:s.border||"none"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.opacity=".85";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}>{s.ic}</a>
            ))}
          </div>
        </div>
        {[{title:"Collections",items:["Men's Unstitched","Women Unstitched","Women Stitched","Kids Unstitch Wear","New Arrivals"]},{title:"Information",items:["About Us","Our Policies","Delivery Info","Exchange Policy","Contact Us"]},{title:"Contact",items:["📍 "+(settings.addr1||"Circular Road, Kunjah"),"📍 "+(settings.addr2||"Distt Gujrat, Punjab"),"📞 "+(settings.phone||"03228722232"),"⏰ "+(settings.hours||"Mon-Sat: 10am-8pm")]}].map(col=>(
          <div key={col.title}>
            <div style={{fontSize:8,letterSpacing:3,color:"rgba(255,255,255,.35)",textTransform:"uppercase",fontWeight:700,marginBottom:16}}>{col.title}</div>
            {col.items.map(l=><div key={l} style={{fontSize:11,color:"rgba(255,255,255,.28)",padding:"5px 0",cursor:"pointer",transition:"color .2s",lineHeight:1.6}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.7)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.28)"}>{l}</div>)}
          </div>
        ))}
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:20,maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,.18)",letterSpacing:1}}>© 2026 {settings.store_name||"JAMEEL FABRICS KUNJAH"}. All Rights Reserved.</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,.18)",letterSpacing:1}}>Premium Pakistani Clothing</div>
      </div>
    </footer>
    {/* Browsing counter */}
    <BrowsingBadge/>
    <a href={"https://wa.me/"+wa} target="_blank" rel="noopener noreferrer" style={{position:"fixed",bottom:28,right:28,width:54,height:54,background:"#25D366",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 28px rgba(37,211,102,.4)",cursor:"pointer",textDecoration:"none",zIndex:700,transition:"transform .3s,box-shadow .3s",color:"#fff"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.14)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";}}><WaSvg/></a>
    {/* Recently Viewed */}
    {recentlyViewed.length>0&&(
      <div style={{position:"fixed",bottom:90,left:16,zIndex:690,maxWidth:220,display:"none"}} className="hide-mob-no">
      </div>
    )}
    {/* PWA Install prompt */}
    <PWAInstallBtn/>
    {/* Back to Top */}
    {showTop&&(
      <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:90,right:28,width:44,height:44,background:"#111",color:"#fff",border:"none",borderRadius:"50%",cursor:"pointer",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,.25)",transition:"all .3s"}} onMouseEnter={e=>e.currentTarget.style.background="#2a2520"} onMouseLeave={e=>e.currentTarget.style.background="#111"}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18,15 12,9 6,15"/></svg>
      </button>
    )}
    {/* Product Modal */}
    {modalProd&&<ProductModal prod={modalProd} onClose={()=>setModalProd(null)} onAdd={addToCart} onWish={toggleWish} wished={wish.has(modalProd.id)}/>}
    {cartOpen&&<CartPanel cart={cart} setCart={setCart} wa={wa} onClose={()=>setCartOpen(false)} user={user}/>}
    {authModal&&<AuthModal mode={authModal} onClose={()=>setAuthModal(null)} onSuccess={()=>setAuthModal(null)}/>}
  </div>);
}

function AccountPage({user,onBack}){
  const[orders,setOrders]=useState([]);const[wl,setWl]=useState([]);
  useEffect(()=>{if(!sb||!user)return;sb.from("online_orders").select("*").eq("customer_id",user.id).order("created_at",{ascending:false}).then(({data})=>setOrders(data||[]));sb.from("wishlists").select("*,products(*)").eq("customer_id",user.id).then(({data})=>setWl(data||[]));},[user]);
  const C={background:"#fff",border:"1px solid #e8e4df",padding:24,marginBottom:16};
  return(<div style={{background:"#faf9f7",minHeight:"100vh",fontFamily:"'Jost',sans-serif"}}>
    <div style={{background:"#fff",borderBottom:"1px solid #e8e4df",padding:"16px clamp(16px,4vw,60px)",display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:100}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#9a8f83",fontSize:13,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg> Back
      </button>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>My Account</div>
    </div>
    <div style={{maxWidth:820,margin:"0 auto",padding:"28px clamp(16px,4vw,40px)"}}>
      <div style={C}><div style={{fontSize:15,fontWeight:600,marginBottom:12}}>Account Info</div><div style={{fontSize:14,color:"#6b6358",marginBottom:5}}><strong>Email:</strong> {user.email}</div><div style={{fontSize:14,color:"#6b6358"}}><strong>Name:</strong> {user.user_metadata?.full_name||"Not set"}</div></div>
      <div style={C}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>My Orders ({orders.length})</div>
        {!orders.length?<div style={{textAlign:"center",padding:32,color:"#b5aba2"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:16}}>No orders yet</div></div>:
          orders.map(o=><div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:"1px solid #f0ede8",flexWrap:"wrap",gap:10}}>
            <div><div style={{fontWeight:600,fontSize:13}}>#{o.id.slice(-6).toUpperCase()}</div><div style={{fontSize:11,color:"#b5aba2",marginTop:2}}>{(o.items||[]).length} items - {new Date(o.created_at).toLocaleDateString()}</div></div>
            <div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{fontWeight:700,fontFamily:"'Cormorant Garamond',serif",fontSize:18}}>Rs.{Number(o.total).toLocaleString()}</div><span style={{padding:"3px 10px",fontSize:11,fontWeight:600,background:o.status==="delivered"?"#dcfce7":o.status==="confirmed"?"#dbeafe":"#fef9c3",color:o.status==="delivered"?"#16a34a":o.status==="confirmed"?"#2563eb":"#ca8a04"}}>{o.status}</span></div>
          </div>)
        }
      </div>
      <div style={C}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Wishlist ({wl.length})</div>
        {!wl.length?<div style={{textAlign:"center",padding:32,color:"#b5aba2"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:16}}>No saved items</div></div>:
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
            {wl.map(w=><div key={w.id} style={{border:"1px solid #e8e4df",overflow:"hidden"}}>
              <div style={{aspectRatio:"3/4",background:"#f5f2ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{w.products?.icon||"👗"}</div>
              <div style={{padding:"10px 12px"}}><div style={{fontWeight:600,fontSize:13}}>{w.products?.name||""}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:700,marginTop:4}}>Rs.{Number(w.products?.sale_price||w.products?.price||0).toLocaleString()}</div></div>
            </div>)}
          </div>
        }
      </div>
    </div>
  </div>);
}
// ── Error Boundary ────────────────────────────────────────────
class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  componentDidCatch(e,info){console.error("AdminPanel error:",e,info);}
  render(){
    if(this.state.err)return(
      <div style={{padding:40,textAlign:"center",fontFamily:"'Inter',sans-serif"}}>
        <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
        <div style={{fontWeight:600,fontSize:16,color:"#111",marginBottom:8}}>Something went wrong</div>
        <div style={{fontSize:12,color:"#9ca3af",marginBottom:20,maxWidth:400,margin:"0 auto 20px"}}>{this.state.err.message}</div>
        <button onClick={()=>this.setState({err:null})} style={{background:"#111",color:"#fff",border:"none",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:13}}>Try Again</button>
      </div>
    );
    return this.props.children;
  }
}


function AdminLogin({onSuccess,onCancel}){
  const[pass,setPass]=useState("");const[loading,setLoading]=useState(false);
  async function check(){setLoading(true);let ok=false;if(sb){const{data}=await sb.from("website_settings").select("value").eq("key","admin_pass").single();ok=data?.value===pass;}else ok=pass==="jameel@admin2026";setLoading(false);if(ok)onSuccess();else{setPass("");toast("Wrong password!","error");}}
  return(<div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)"}}>
    <div style={{background:"#faf9f7",padding:"44px 40px",width:"100%",maxWidth:360,textAlign:"center"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#111",marginBottom:4}}>Admin Panel</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#9a8f83",fontStyle:"italic",marginBottom:32}}>Jameel Fabrics</div>
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter password" onKeyDown={e=>e.key==="Enter"&&check()} style={{width:"100%",border:"none",borderBottom:"1px solid #d0ccc5",padding:"12px 0",fontSize:17,color:"#111",outline:"none",textAlign:"center",letterSpacing:5,marginBottom:24,fontFamily:"inherit",background:"transparent"}} onFocus={e=>e.target.style.borderBottomColor="#111"} onBlur={e=>e.target.style.borderBottomColor="#d0ccc5"}/>
      <button onClick={check} disabled={loading} style={{width:"100%",background:"#111",color:"#fff",border:"none",padding:14,fontSize:10,fontWeight:700,letterSpacing:3.5,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",textTransform:"uppercase",marginBottom:12,opacity:loading?.6:1}} onMouseEnter={e=>!loading&&(e.currentTarget.style.background="#2a2520")} onMouseLeave={e=>e.currentTarget.style.background="#111"}>{loading?"Verifying...":"Unlock"}</button>
      <button onClick={onCancel} style={{background:"none",border:"none",color:"#b5aba2",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
    </div>
  </div>);
}

const ACard=({children,style})=><div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,...style}}>{children}</div>;
const ABtn=({sm,children,...p})=><button {...p} style={{display:"inline-flex",alignItems:"center",gap:6,padding:sm?"5px 12px":"9px 18px",borderRadius:6,fontSize:sm?11:13,fontWeight:500,cursor:"pointer",border:"none",fontFamily:"inherit",transition:"all .15s",...p.style}}>{children}</button>;
function AI({...p}){return<input {...p} style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#111",outline:"none",fontFamily:"inherit",...p.style}} onFocus={e=>{e.target.style.borderColor="#111";p.onFocus&&p.onFocus(e);}} onBlur={e=>{e.target.style.borderColor="#e5e7eb";p.onBlur&&p.onBlur(e);}}/>;}
function AS({children,...p}){return<select {...p} style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#111",outline:"none",fontFamily:"inherit",cursor:"pointer",...p.style}}>{children}</select>;}
const Bdg=({c,children})=><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:c==="g"?"#dcfce7":c==="y"?"#fef9c3":c==="r"?"#fee2e2":c==="b"?"#dbeafe":"#f3f4f6",color:c==="g"?"#16a34a":c==="y"?"#ca8a04":c==="r"?"#dc2626":c==="b"?"#2563eb":"#6b7280"}}>{children}</span>;
const AH=({title,sub})=><div style={{marginBottom:22}}><div style={{fontSize:22,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:4,color:"#111"}}>{title}</div>{sub&&<div style={{fontSize:13,color:"#6b7280"}}>{sub}</div>}</div>;
const ALbl=({c})=><div style={{fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>{c}</div>;

function ADash({prods,orders,alerts,pending,todayOrders,todayRev,onNav}){
  const stats=[
    {l:"Today's Orders",v:todayOrders?.length||0,ic:<OrdIc/>,bg:"#fef3c7",ibc:"#92400e",change:"Today"},
    {l:"Revenue (Today)",v:"Rs."+(todayRev||0).toLocaleString(),ic:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,bg:"#dcfce7",ibc:"#16a34a",change:"Active"},
    {l:"Active Products",v:prods?.filter(p=>p.active).length||0,ic:<ProdIc/>,bg:"#dbeafe",ibc:"#2563eb",change:(pending?.length||0)+" pending"},
    {l:"Total Orders",v:orders?.length||0,ic:<ChartIc/>,bg:"#fee2e2",ibc:"#dc2626",change:"All time"},
  ];
  const barH=[45,70,55,88,60,95,38];
  const barD=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return(<div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:12,flexWrap:"wrap"}}>
      <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#111827"}}>Good Morning 👋</div><div style={{fontSize:13,color:"#6b7280",marginTop:3}}>Here's what's happening with your store today</div></div>
      <button onClick={()=>onNav("products")} style={{background:"#0f0d0a",color:"#fff",border:"none",padding:"9px 18px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}} onMouseEnter={e=>e.currentTarget.style.background="#2a2520"} onMouseLeave={e=>e.currentTarget.style.background="#0f0d0a"}>+ Add Product</button>
    </div>
    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:20}}>
      {stats.map(s=><div key={s.l} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:20,transition:"box-shadow .2s",cursor:"default"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 6px rgba(0,0,0,.07)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
          <div style={{width:36,height:36,borderRadius:8,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",color:s.ibc}}>{s.ic}</div>
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#111827",marginBottom:4}}>{s.v}</div>
        <div style={{fontSize:12,color:"#9ca3af"}}>{s.change}</div>
      </div>)}
    </div>
    {/* Chart + Alerts */}
    <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16,marginBottom:16}} className="two-col">
      {/* Chart */}
      <div className="adm-card">
        <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:15,fontWeight:600,color:"#111827"}}>Sales This Week</div><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Daily orders count</div></div>
          <span style={{background:"#dcfce7",color:"#16a34a",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>● Live</span>
        </div>
        <div style={{padding:20}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140,paddingTop:20}}>
            {barH.map((h,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,height:"100%"}}>
                <div style={{width:"100%",background:i===6?"#f3f4f6":"linear-gradient(to top,#c9a84c,#e8d5a3)",borderRadius:"4px 4px 0 0",height:h+"%",border:i===6?"1px dashed #e5e7eb":"none",cursor:"pointer",transition:"filter .2s"}} onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"} onMouseLeave={e=>e.currentTarget.style.filter="none"}/>
                <div style={{fontSize:9,color:"#9ca3af"}}>{barD[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Quick alerts */}
      <div className="adm-card">
        <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:15,fontWeight:600,color:"#111827"}}>Alerts</div>
          {aC>0&&<span style={{background:"#fee2e2",color:"#dc2626",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{aC} urgent</span>}
        </div>
        <div>
          {!alerts?.length?<div style={{padding:32,textAlign:"center",color:"#9ca3af",fontSize:13}}>All clear ✓</div>:
            alerts.slice(0,3).map(a=><div key={a.id} style={{padding:"14px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:a.alert_type==="sold"||a.type==="sold_out"?"#ef4444":"#f59e0b",marginTop:4,flexShrink:0}}/>
              <div><div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{a.product_name}</div><div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{a.message}</div></div>
            </div>)
          }
          {(pC>0)&&<div style={{padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#c9a84c",marginTop:4,flexShrink:0}}/>
            <div><div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{pC} Products Pending</div><div style={{fontSize:11,color:"#6b7280",marginTop:2}}>ERP se aaye — approval chahiye</div></div>
          </div>}
        </div>
      </div>
    </div>
    {/* Recent orders table */}
    <div className="adm-card">
      <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:600,color:"#111827"}}>Recent Orders</div><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Latest WhatsApp orders</div></div>
        <button onClick={()=>onNav("orders")} style={{background:"transparent",border:"1px solid #e5e7eb",padding:"6px 14px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",color:"#374151"}} onMouseEnter={e=>e.currentTarget.style.background="#f4f5f7"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>View All</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Order","Customer","Items","Total","Status","Time"].map(h=><th key={h} className="adm-th">{h}</th>)}</tr></thead>
          <tbody>
            {!orders?.length?<tr><td colSpan={6} style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No orders yet</td></tr>:
              orders.slice(0,5).map(o=><tr key={o.id}>
                <td className="adm-td"><span style={{fontWeight:700,color:"#c9a84c",fontSize:12}}>#{o.id.slice(-6).toUpperCase()}</span></td>
                <td className="adm-td"><div style={{fontWeight:500,fontSize:13}}>{o.customer_name||"Customer"}</div><div style={{fontSize:11,color:"#6b7280"}}>{o.customer_email||""}</div></td>
                <td className="adm-td" style={{color:"#6b7280"}}>{(o.items||[]).length} items</td>
                <td className="adm-td"><span style={{fontWeight:700}}>Rs.{Number(o.total||0).toLocaleString()}</span></td>
                <td className="adm-td"><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:o.status==="pending"?"#fef9c3":o.status==="confirmed"?"#dcfce7":"#dbeafe",color:o.status==="pending"?"#ca8a04":o.status==="confirmed"?"#16a34a":"#2563eb"}}>{o.status}</span></td>
                <td className="adm-td" style={{fontSize:12,color:"#9ca3af"}}>{new Date(o.created_at).toLocaleString()}</td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>);
}

function APending({pending,onRefresh}){
  async function approve(p){if(!sb)return;await sb.from("products").update({website_status:"approved",active:true}).eq("id",p.id);toast("Approved! Website pe live","success");onRefresh();}
  async function ignore(p){if(!sb)return;await sb.from("products").update({website_status:"ignored"}).eq("id",p.id);toast("Ignored");onRefresh();}
  return(<div><AH title="Pending Approval" sub="ERP se aaye products — approve ya ignore karo"/>
    {!pending.length?<ACard style={{padding:48,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:36,marginBottom:12}}>✓</div><div style={{fontWeight:600}}>No pending products</div></ACard>:
      pending.map(p=><ACard key={p.id} style={{padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:48,height:58,background:"#f5f2ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"1px solid #e5e7eb",flexShrink:0,overflow:"hidden"}}>{(p.img1||p.photo_url)?<img src={p.img1||p.photo_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:(p.icon||"👗")}</div>
          <div><div style={{fontWeight:700,fontSize:15,color:"#111"}}>{p.name}</div><div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{CAT_L[p.cat]||p.category||""} - Rs.{Number(p.sale_price||p.price||0).toLocaleString()} - Stock: {p.real_stock||p.stock||0}</div><div style={{display:"flex",gap:6,marginTop:6}}><Bdg c="">ERP</Bdg><Bdg c="y">Pending</Bdg></div></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <ABtn onClick={()=>approve(p)} style={{background:"#111",color:"#fff"}}>✓ Approve</ABtn>
          <ABtn onClick={()=>ignore(p)} style={{background:"transparent",color:"#6b7280",border:"1px solid #e5e7eb"}}>Ignore</ABtn>
        </div>
      </ACard>)
    }
  </div>);
}
function AAlerts({alerts,onRefresh}){
  async function minus(a){if(!sb)return;if(a.product_id){const{data:p}=await sb.from("products").select("real_stock,stock").eq("id",a.product_id).single();if(p)await sb.from("products").update({real_stock:Math.max(0,(p.real_stock||p.stock||0)-1)}).eq("id",a.product_id);}await sb.from("website_alerts").update({resolved:true}).eq("id",a.id);toast("-1 done","success");onRefresh();}
  async function remove(a){if(!sb)return;if(a.product_id)await sb.from("products").update({active:false,website_status:"removed"}).eq("id",a.product_id);await sb.from("website_alerts").update({resolved:true}).eq("id",a.id);toast("Removed","success");onRefresh();}
  async function resolve(a){if(!sb)return;await sb.from("website_alerts").update({resolved:true}).eq("id",a.id);toast("Resolved");onRefresh();}
  return(<div><AH title="Stock Alerts" sub="ERP pe sale hone ke baad updates"/>
    {!alerts.length?<ACard style={{padding:48,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:36,marginBottom:12}}>✓</div><div style={{fontWeight:600}}>No alerts</div></ACard>:
      alerts.map(a=><div key={a.id} style={{background:"#fff",border:"1px solid #e5e7eb",borderLeft:"3px solid "+(a.alert_type==="sold"||a.type==="sold_out"?"#ef4444":"#f59e0b"),borderRadius:8,padding:14,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:a.alert_type==="sold"||a.type==="sold_out"?"#fee2e2":"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.alert_type==="sold"||a.type==="sold_out"?"X":"!"}</div>
          <div><div style={{fontWeight:600,fontSize:13,color:"#111"}}>{a.product_name}</div><div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{a.message}</div>{a.qty_remaining!=null&&<div style={{fontSize:11,color:"#ef4444",fontWeight:700,marginTop:2}}>Remaining: {a.qty_remaining}</div>}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <ABtn sm onClick={()=>minus(a)} style={{background:"#fee2e2",color:"#dc2626"}}>-1 Stock</ABtn>
          <ABtn sm onClick={()=>remove(a)} style={{background:"#111",color:"#fff"}}>Remove</ABtn>
          <ABtn sm onClick={()=>resolve(a)} style={{background:"transparent",color:"#9ca3af",border:"1px solid #e5e7eb"}}>Ignore</ABtn>
        </div>
      </div>)
    }
  </div>);
}
function AProducts({products,onRefresh}){
  const[editP,setEditP]=useState(null);const[form,setForm]=useState({});
  function open(p){setEditP(p);setForm({...p,sizes:(p.sizes||[]).join(",")});}
  async function save(){
    if(!sb||!form.name){toast("Name required","error");return;}
    const data={...form,sizes:form.sizes?form.sizes.split(",").map(s=>s.trim()).filter(Boolean):[],active:form.active!==false,website_status:form.website_status||"approved",sale_price:parseFloat(form.sale_price||form.price)||0,price:parseFloat(form.sale_price||form.price)||0};
    if(editP?.id&&editP.id!=="new")await sb.from("products").update(data).eq("id",editP.id);
    else await sb.from("products").insert({...data,website_status:"approved",active:true});
    toast("Saved!","success");setEditP(null);onRefresh();
  }
  async function toggle(p){if(!sb)return;await sb.from("products").update({active:!p.active}).eq("id",p.id);onRefresh();}
  async function del(p){if(!sb||!window.confirm("Delete "+p.name+"?"))return;await sb.from("products").delete().eq("id",p.id);toast("Deleted");onRefresh();}
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
      <AH title="Products" sub={products.length+" total"}/>
      <ABtn onClick={()=>open({id:"new"})} style={{background:"#111",color:"#fff"}}>+ Add Product</ABtn>
    </div>
    {editP&&(
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",borderRadius:10,boxShadow:"0 25px 60px rgba(0,0,0,.25)"}}>
          <div style={{padding:"20px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#fff",zIndex:1}}>
            <div style={{fontSize:16,fontWeight:600,color:"#111"}}>{editP.id==="new"?"Add Product":"Edit Product"}</div>
            <button onClick={()=>setEditP(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#9ca3af"}}>x</button>
          </div>
          <div style={{padding:24}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              <div><ALbl c="Name *"/><AI value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Product name"/></div>
              <div><ALbl c="Category"/><AS value={form.cat||"WU"} onChange={e=>setForm({...form,cat:e.target.value})}><option value="WU">Women Unstitch</option><option value="WS">Women Stitch</option><option value="RS">Reshmi Suiting</option><option value="AB">Abayas</option><option value="MP">Mens Plain</option><option value="ME">Mens Embroidery</option><option value="KU">Kids Unstitch</option><option value="BS">Bedsheets</option><option value="BL">Blankets</option><option value="OT">Others</option><option value="HOT">Hot Sale</option><option value="NEW">New Arrivals</option><option value="2PC">2-Piece Sets</option></AS></div>
              <div><ALbl c="Price (Rs.) *"/><AI type="number" value={form.sale_price||form.price||""} onChange={e=>setForm({...form,sale_price:e.target.value,price:e.target.value})} placeholder="3500"/></div>
              <div><ALbl c="Old Price (Sale)"/><AI type="number" value={form.old_price||""} onChange={e=>setForm({...form,old_price:e.target.value})} placeholder="Leave empty"/></div>
              <div><ALbl c="Discount %"/><AI type="number" placeholder="e.g. 20 auto" onChange={e=>{const d=parseFloat(e.target.value);if(d&&(form.sale_price||form.price)){const o=parseFloat(form.sale_price||form.price);setForm({...form,old_price:o,sale_price:Math.round(o*(1-d/100)),price:Math.round(o*(1-d/100))});}}}/></div>
              <div><ALbl c="Real Stock (hidden)"/><AI type="number" value={form.real_stock||""} onChange={e=>setForm({...form,real_stock:e.target.value})} placeholder="10"/></div>
              <div style={{gridColumn:"1/-1"}}><ALbl c="Display Stock Text"/><AI value={form.display_stock_text||""} onChange={e=>setForm({...form,display_stock_text:e.target.value})} placeholder="e.g. Last 5 Pieces!"/></div>
              <div><ALbl c="Badge"/><AS value={form.badge||""} onChange={e=>setForm({...form,badge:e.target.value})}><option value="">None</option><option>NEW</option><option>SALE</option><option>HOT</option></AS></div>
              <div><ALbl c="Sizes (comma)"/><AI value={form.sizes||""} onChange={e=>setForm({...form,sizes:e.target.value})} placeholder="S,M,L,XL"/></div>
              <div><ALbl c="Brand Name"/><AI value={form.brand||""} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="e.g. Gul Ahmed"/></div>
              <div><ALbl c="Fabric Feel"/><AS value={form.feel||""} onChange={e=>setForm({...form,feel:e.target.value})}><option value="">Not specified</option>{FEEL_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</AS></div>
              <div><ALbl c="Season"/><AS value={form.season||""} onChange={e=>setForm({...form,season:e.target.value})}><option value="">Not specified</option>{SEASON_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</AS></div>
              <div><ALbl c="Care Instructions"/><AS value={form.care||""} onChange={e=>setForm({...form,care:e.target.value})}><option value="">Not specified</option>{CARE_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</AS></div>
              <div style={{gridColumn:"1/-1"}}><ALbl c="Color / Description"/><AI value={form.color||""} onChange={e=>setForm({...form,color:e.target.value})}/></div>
            </div>
            <ALbl c="Product Images (5 slots)"/>
            <div style={{display:"grid",gap:8,marginTop:6}}>
              {[1,2,3,4,5].map(n=>(
                <div key={n} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:50,background:"#f5f2ee",border:"1px solid "+(form["img"+n]||form["photo_url"+(n===1?"":n)]?"#111":"#e5e7eb"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:n===1?16:12,flexShrink:0,overflow:"hidden"}}>
                    {(form["img"+n]||form["photo_url"+(n===1?"":n)])?<img src={form["img"+n]||form["photo_url"+(n===1?"":n)]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:(n===1?"img":"+")}
                  </div>
                  <AI value={form["img"+n]||form["photo_url"+(n===1?"":n)]||""} onChange={e=>setForm({...form,["img"+n]:e.target.value,["photo_url"+(n===1?"":n)]:e.target.value})} placeholder={"Image "+n+(n===1?" (main — URL ya upload karo)":"")} style={{flex:1}}/>
                  <label style={{flexShrink:0,background:"#f0ede8",border:"1px solid #d0ccc5",padding:"8px 10px",cursor:"pointer",fontSize:11,fontWeight:600,color:"#9a8f83",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                      const file=e.target.files[0];
                      if(!file||!sb)return;
                      const ext=file.name.split('.').pop();
                      const path="products/"+Date.now()+"-"+n+"."+ext;
                      const{data,error}=await sb.storage.from("product-images").upload(path,file,{upsert:true});
                      if(error){toast("Upload failed: "+error.message,"error");return;}
                      const{data:{publicUrl}}=sb.storage.from("product-images").getPublicUrl(path);
                      setForm(f=>({...f,["img"+n]:publicUrl,["photo_url"+(n===1?"":n)]:publicUrl}));
                      toast("Image "+n+" uploaded!","success");
                    }}/>
                  </label>
                </div>
              ))}
            </div>
            <div style={{marginTop:14}}><ALbl c="WA Note"/><textarea value={form.note||""} onChange={e=>setForm({...form,note:e.target.value})} style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#111",outline:"none",fontFamily:"inherit",minHeight:60,resize:"vertical"}} placeholder="Note for WA order..."/></div>
            <div style={{display:"flex",gap:20,marginTop:14}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={form.active!==false} onChange={e=>setForm({...form,active:e.target.checked})} style={{accentColor:"#111"}}/>Show on website</label>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={form.featured||false} onChange={e=>setForm({...form,featured:e.target.checked})} style={{accentColor:"#111"}}/>Featured</label>
            </div>
          </div>
          <div style={{padding:"16px 24px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"flex-end",gap:8,position:"sticky",bottom:0,background:"#fff"}}>
            <ABtn onClick={()=>setEditP(null)} style={{background:"transparent",color:"#6b7280",border:"1px solid #e5e7eb"}}>Cancel</ABtn>
            <ABtn onClick={save} style={{background:saved?"#16a34a":"#111",color:"#fff",transition:"background .3s"}}>{saving?"Saving...":saved?"✓ Saved":"Save"}</ABtn>
          </div>
        </div>
      </div>
    )}
    <ACard><div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>{["Product","Category","Price","Stock Text","Status","Actions"].map(h=><th key={h} style={{padding:"10px 16px",fontSize:11,fontWeight:600,color:"#6b7280",textAlign:"left",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>
          {products.map(p=><tr key={p.id} style={{borderBottom:"1px solid #f3f4f6"}}>
            <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:40,height:48,background:"#f5f2ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:"1px solid #e5e7eb",flexShrink:0,overflow:"hidden"}}>{(p.img1||p.photo_url)?<img src={p.img1||p.photo_url} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:(p.icon||"👗")}</div><div><div style={{fontWeight:600,fontSize:13,color:"#111"}}>{p.name}</div><div style={{fontSize:11,color:"#9ca3af"}}>{p.color||""}</div></div></div></td>
            <td style={{padding:"12px 16px",fontSize:12,color:"#6b7280"}}>{CAT_L[p.cat]||p.category||""}</td>
            <td style={{padding:"12px 16px"}}><div style={{fontWeight:600,color:p.old_price?"#b91c1c":"#111"}}>Rs.{Number(p.sale_price||p.price||0).toLocaleString()}</div>{p.old_price&&<div style={{fontSize:11,textDecoration:"line-through",color:"#9ca3af"}}>Rs.{Number(p.old_price).toLocaleString()}</div>}</td>
            <td style={{padding:"12px 16px",fontSize:12,color:"#9a8f83",fontStyle:"italic"}}>{p.display_stock_text||"In Stock"}</td>
            <td style={{padding:"12px 16px"}}><Bdg c={p.active?"g":""}>{p.active?"Active":"Hidden"}</Bdg></td>
            <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:4}}>
              <ABtn sm onClick={()=>open(p)} style={{background:"transparent",border:"1px solid #e5e7eb",color:"#374151"}}>Edit</ABtn>
              <ABtn sm onClick={()=>toggle(p)} style={{background:"transparent",border:"1px solid #e5e7eb",color:"#374151"}}>{p.active?"Hide":"Show"}</ABtn>
              <ABtn sm onClick={()=>del(p)} style={{background:"#fee2e2",color:"#dc2626"}}>Del</ABtn>
            </div></td>
          </tr>)}
          {!products.length&&<tr><td colSpan={6} style={{padding:44,textAlign:"center",color:"#9ca3af"}}>No products yet</td></tr>}
        </tbody>
      </table>
    </div></ACard>
  </div>);
}
function AOrders({orders,wa}){
  async function upd(id,status){if(!sb)return;await sb.from("online_orders").update({status}).eq("id",id);toast("Status: "+status,"success");window.location.reload();}
  return(<div><AH title="Orders" sub="WhatsApp se aaye orders"/>
    <ACard><div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>{["Order","Customer","Items","Total","Status","Date","Actions"].map(h=><th key={h} style={{padding:"10px 14px",fontSize:11,fontWeight:600,color:"#6b7280",textAlign:"left",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>
          {orders.map(o=><tr key={o.id} style={{borderBottom:"1px solid #f3f4f6"}}>
            <td style={{padding:"12px 14px",fontWeight:700,color:"#c9a84c",fontSize:12}}>#{o.id.slice(-6).toUpperCase()}</td>
            <td style={{padding:"12px 14px"}}><div style={{fontWeight:600,fontSize:13,color:"#111"}}>{o.customer_name||"Customer"}</div><div style={{fontSize:11,color:"#9ca3af"}}>{o.customer_email||""}</div></td>
            <td style={{padding:"12px 14px",fontSize:12,color:"#6b7280"}}>{(o.items||[]).length}</td>
            <td style={{padding:"12px 14px",fontWeight:700,fontSize:13}}>Rs.{Number(o.total).toLocaleString()}</td>
            <td style={{padding:"12px 14px"}}><Bdg c={o.status==="pending"?"y":o.status==="confirmed"?"g":"b"}>{o.status}</Bdg></td>
            <td style={{padding:"12px 14px",fontSize:11,color:"#9ca3af"}}>{new Date(o.created_at).toLocaleDateString()}</td>
            <td style={{padding:"12px 14px"}}><div style={{display:"flex",gap:4}}>
              {o.status==="pending"&&<ABtn sm onClick={()=>upd(o.id,"confirmed")} style={{background:"#dcfce7",color:"#16a34a"}}>Confirm</ABtn>}
              {o.status==="confirmed"&&<ABtn sm onClick={()=>upd(o.id,"delivered")} style={{background:"#dbeafe",color:"#2563eb"}}>Delivered</ABtn>}
              <a href={"https://wa.me/"+wa} target="_blank" rel="noopener noreferrer"><ABtn sm style={{background:"#25D366",color:"#fff"}}>WA</ABtn></a>
            </div></td>
          </tr>)}
          {!orders.length&&<tr><td colSpan={7} style={{padding:44,textAlign:"center",color:"#9ca3af"}}>No orders yet</td></tr>}
        </tbody>
      </table>
    </div></ACard>
  </div>);
}
function ACoupons({coupons,onRefresh}){
  const[f,setF]=useState({code:"",type:"percent",value:"",min_order:"",expires_at:"",active:true});
  async function save(){if(!sb||!f.code||!f.value){toast("Code and value required","error");return;}await sb.from("coupons").insert({...f,code:f.code.toUpperCase(),value:parseFloat(f.value),min_order:parseFloat(f.min_order)||0,expires_at:f.expires_at||null});toast("Created!","success");setF({code:"",type:"percent",value:"",min_order:"",expires_at:"",active:true});onRefresh();}
  async function del(id){if(!sb||!window.confirm("Delete?"))return;await sb.from("coupons").delete().eq("id",id);onRefresh();}
  return(<div><AH title="Coupons" sub="Discount codes manage karo"/>
    <ACard style={{padding:20,marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Create Coupon</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{gridColumn:"1/-1"}}><ALbl c="Code *"/><AI value={f.code} onChange={e=>setF({...f,code:e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" style={{fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}/></div>
        <div><ALbl c="Type"/><AS value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="percent">Percentage (%)</option><option value="flat">Fixed (Rs.)</option></AS></div>
        <div><ALbl c="Value *"/><AI type="number" value={f.value} onChange={e=>setF({...f,value:e.target.value})} placeholder={f.type==="percent"?"20":"500"}/></div>
        <div><ALbl c="Min Order (Rs.)"/><AI type="number" value={f.min_order} onChange={e=>setF({...f,min_order:e.target.value})} placeholder="2000"/></div>
        <div><ALbl c="Expiry Date"/><AI type="date" value={f.expires_at} onChange={e=>setF({...f,expires_at:e.target.value})}/></div>
      </div>
      <ABtn onClick={save} style={{background:"#111",color:"#fff",marginTop:14}}>+ Create Coupon</ABtn>
    </ACard>
    {coupons.map(c=><ACard key={c.id} style={{padding:"16px 20px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
      <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,letterSpacing:2,color:"#111"}}>{c.code}</div><div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>{c.type==="percent"?c.value+"%":"Rs."+c.value} off{c.min_order?" - Min Rs."+c.min_order:""}{c.expires_at?" - Expires "+new Date(c.expires_at).toLocaleDateString():""}</div><div style={{display:"flex",gap:6,marginTop:6}}><Bdg c={c.active?"g":""}>{c.active?"Active":"Inactive"}</Bdg><Bdg c="">{c.used_count||0} used</Bdg></div></div>
      <ABtn onClick={()=>del(c.id)} style={{background:"#fee2e2",color:"#dc2626"}}>Delete</ABtn>
    </ACard>)}
  </div>);
}
function AContent({settings}){
  const[f,setF]=useState({});
  const[vidUploading,setVidUploading]=useState(false);
  const[vidProgress,setVidProgress]=useState(0);
  useEffect(()=>setF({...settings}),[settings]);
  async function uploadVideo(file){
    if(!sb)return alert("Supabase not connected");
    if(!file)return;
    if(file.size>100*1024*1024)return alert("Max 100MB video");
    setVidUploading(true);setVidProgress(0);
    const ext=file.name.split(".").pop();
    const path="videos/"+Date.now()+"."+ext;
    const{data,error}=await sb.storage.from("videos").upload(path,file,{contentType:file.type,upsert:true});
    if(error){alert("Upload failed: "+error.message);setVidUploading(false);return;}
    const{data:{publicUrl}}=sb.storage.from("videos").getPublicUrl(path);
    setF(p=>({...p,video_url:publicUrl,video_show:"true"}));
    await sb.from("website_settings").upsert({key:"video_url",value:publicUrl},{onConflict:"key"});
    await sb.from("website_settings").upsert({key:"video_show",value:"true"},{onConflict:"key"});
    setVidUploading(false);setVidProgress(100);
    toast("Video uploaded! ✅","success");
  }
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const debRef=useRef(null);
  function updateF(key,val){
    const nf={...f,[key]:val};
    setF(nf);
    // Debounced auto-save after 1.5s
    clearTimeout(debRef.current);
    setSaved(false);
    debRef.current=setTimeout(async()=>{
      if(!sb)return;
      setSaving(true);
      await Promise.all(Object.entries(nf).map(([k,v])=>sb.from("website_settings").upsert({key:k,value:String(v)},{onConflict:"key"})));
      setSaving(false);setSaved(true);
      setTimeout(()=>setSaved(false),2000);
    },1500);
  }
  async function save(){if(!sb)return;setSaving(true);await Promise.all(Object.entries(f).map(([k,v])=>sb.from("website_settings").upsert({key:k,value:String(v)},{onConflict:"key"})));setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);toast("Saved!","success");}
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
      <AH title="Website Content" sub="Sab content yahan se change karo"/>
      <ABtn onClick={save} style={{background:saved?"#16a34a":"#111",color:"#fff",transition:"background .3s"}}>{saving?"Saving...":saved?"✓ Saved":"Save All"}</ABtn>
    </div>
    {[{t:"Announcement Bar",fields:[["announcement","Messages (pipe | separated)"]]},{t:"Hero Section",fields:[["hlabel","Hero Label"],["hsub","Tagline"],["about","About Text",true]]},{t:"Video Section",fields:[["video_label","Label"],["video_title","Title"]],isVideo:true},
    {t:"Countdown Timer",fields:[["countdown_title","Sale Title (e.g. Eid Special Sale)"],["countdown_subtext","Sub Text (e.g. Up to 30% Off)"],["countdown_end","End Date & Time",false,true]]},
    {t:"Our Story Section",fields:[["about","Story Text (website pe dikhega)",true],["story_stat1","Stat 1 Number (e.g. 50+)"],["story_stat1_label","Stat 1 Label"],["story_stat2","Stat 2 Number"],["story_stat2_label","Stat 2 Label"],["story_stat3","Stat 3 Number"],["story_stat3_label","Stat 3 Label"]]},
    {t:"Our Features (6 Boxes in Dark Section)",fields:[
      ["feat1_title","Feature 1 Title"],["feat1_desc","Feature 1 Description"],
      ["feat2_title","Feature 2 Title"],["feat2_desc","Feature 2 Description"],
      ["feat3_title","Feature 3 Title"],["feat3_desc","Feature 3 Description"],
      ["feat4_title","Feature 4 Title"],["feat4_desc","Feature 4 Description"],
      ["feat5_title","Feature 5 Title"],["feat5_desc","Feature 5 Description"],
      ["feat6_title","Feature 6 Title"],["feat6_desc","Feature 6 Description"],
    ]},
  ].map(sec=><ACard key={sec.t} style={{padding:20,marginBottom:16}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>{sec.t}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {sec.fields.map(([k,lbl,full,isDate])=><div key={k} style={full?{gridColumn:"1/-1"}:{}}><ALbl c={lbl}/>{full?<textarea value={f[k]||""} onChange={e=>updateF(k,e.target.value)} style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#111",outline:"none",fontFamily:"inherit",minHeight:70,resize:"vertical"}}/>:isDate?<AI type="datetime-local" value={f[k]||""} onChange={e=>updateF(k,e.target.value)}/>:<AI value={f[k]||""} onChange={e=>updateF(k,e.target.value)}/>}</div>)}
        {sec.t.includes("Video")&&<div style={{gridColumn:"1/-1"}}>
          {/* Video upload from mobile gallery */}
          <div style={{background:"#f4f5f7",borderRadius:8,padding:14,marginBottom:10}}>
            <div style={{fontWeight:600,fontSize:13,color:"#111",marginBottom:8}}>📱 Upload Video (Mobile Gallery)</div>
            <input type="file" accept="video/*" capture="environment" onChange={e=>uploadVideo(e.target.files[0])} style={{fontSize:12,marginBottom:8,display:"block"}}/>
            {vidUploading&&<div style={{marginTop:6}}>
              <div style={{background:"#e5e7eb",borderRadius:4,height:6,overflow:"hidden"}}>
                <div style={{background:"#c9a84c",height:"100%",width:"60%",animation:"shimmer 1.5s infinite"}}/>
              </div>
              <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>Uploading to Supabase Storage...</div>
            </div>}
            {f.video_url&&!vidUploading&&<div style={{marginTop:8}}>
              <div style={{fontSize:11,color:"#16a34a",marginBottom:4}}>✅ Video uploaded</div>
              <video src={f.video_url} controls style={{width:"100%",maxHeight:160,borderRadius:6,background:"#000"}}/>
            </div>}
            <div style={{fontSize:11,color:"#9ca3af",marginTop:6}}>Or paste YouTube/MP4 URL below:</div>
            <AI value={f.video_url||""} onChange={e=>updateF("video_url",e.target.value)} placeholder="https://youtube.com/... or https://...mp4"/>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#111"}}>
            <input type="checkbox" checked={f.video_show==="true"||f.video_show===true} onChange={e=>updateF("video_show",String(e.target.checked))} style={{accentColor:"#111"}}/>
            Show video section on website
          </label>
        </div>}
        {sec.t.includes("Countdown")&&<div style={{gridColumn:"1/-1"}}><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#111"}}><input type="checkbox" checked={f.countdown_active==="true"||f.countdown_active===true} onChange={e=>updateF("countdown_active",String(e.target.checked))} style={{accentColor:"#b91c1c"}}/>Show countdown banner on website</label></div>}
      </div>
    </ACard>)}
  </div>);
}
function ASubs({subs}){
  function exp(){const csv="Email,Date\n"+safeSubs.map(s=>s.email+","+new Date(s.subscribed_at).toLocaleDateString()).join("\n");const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(csv);a.download="subscribers.csv";a.click();}
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
      <AH title="Subscribers" sub={safeSubs.length+" email subscribers"}/>
      <ABtn onClick={exp} style={{background:"transparent",color:"#374151",border:"1px solid #e5e7eb"}}>Export CSV</ABtn>
    </div>
    <ACard><div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>{["Email","Subscribed","Status"].map(h=><th key={h} style={{padding:"10px 16px",fontSize:11,fontWeight:600,color:"#6b7280",textAlign:"left",textTransform:"uppercase",letterSpacing:.5}}>{h}</th>)}</tr></thead>
        <tbody>
          {safeSubs.map(s=><tr key={s.id} style={{borderBottom:"1px solid #f3f4f6"}}><td style={{padding:"12px 16px",fontWeight:500,fontSize:13,color:"#111"}}>{s.email}</td><td style={{padding:"12px 16px",fontSize:12,color:"#9ca3af"}}>{new Date(s.subscribed_at).toLocaleDateString()}</td><td style={{padding:"12px 16px"}}><Bdg c={s.active?"g":""}>{s.active?"Active":"Unsubscribed"}</Bdg></td></tr>)}
          {!safeSubs.length&&<tr><td colSpan={3} style={{padding:44,textAlign:"center",color:"#9ca3af"}}>No subscribers yet</td></tr>}
        </tbody>
      </table>
    </div></ACard>
  </div>);
}
function ASettings({settings}){
  const[f,setF]=useState({});const[np,setNp]=useState("");const[cp,setCp]=useState("");
  useEffect(()=>setF({...settings}),[settings]);
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  async function save(){if(!sb)return;setSaving(true);await Promise.all(Object.entries(f).map(([k,v])=>sb.from("website_settings").upsert({key:k,value:String(v)},{onConflict:"key"})));setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);toast("Saved!","success");}
  async function chgPass(){if(!np||np.length<6){toast("Min 6 chars","error");return;}if(np!==cp){toast("Passwords don't match","error");return;}if(sb)await sb.from("website_settings").upsert({key:"admin_pass",value:np},{onConflict:"key"});toast("Password changed!","success");setNp("");setCp("");}
  async function backup(){const{data:p}=sb?await sb.from("products").select("*"):{data:[]};const{data:s}=sb?await sb.from("website_settings").select("*"):{data:[]};const d=JSON.stringify({v:1,ts:new Date().toISOString(),products:p,settings:s},null,2);const a=document.createElement("a");a.href="data:application/json,"+encodeURIComponent(d);a.download="jf-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();toast("Downloaded!","success");}
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
      <AH title="Settings"/><ABtn onClick={save} style={{background:"#111",color:"#fff"}}>Save</ABtn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>
      <div>
        <ACard style={{padding:20,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Store Info</div>
          <div style={{display:"grid",gap:12}}>
            {[["store_name","Store Name"],["wa_number","WhatsApp (923...)"],["phone","Phone"],["addr1","Address 1"],["addr2","Address 2"],["hours","Business Hours"]].map(([k,lbl])=><div key={k}><ALbl c={lbl}/><AI value={f[k]||""} onChange={e=>updateF(k,e.target.value)}/></div>)}
          </div>
        </ACard>
        <ACard style={{padding:20}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Social Links</div>
          <div style={{display:"grid",gap:12}}>
            {[["insta","Instagram URL"],["tiktok","TikTok URL"],["fb","Facebook URL"]].map(([k,lbl])=><div key={k}><ALbl c={lbl}/><AI value={f[k]||""} onChange={e=>updateF(k,e.target.value)} placeholder="https://..."/></div>)}
          </div>
        </ACard>
      </div>
      <div>
        <ACard style={{padding:20,marginBottom:16}}><div style={{fontSize:15,fontWeight:600,marginBottom:10,color:"#111"}}>Supabase Status</div><div style={{background:"#f9fafb",borderRadius:8,padding:12,fontSize:12,color:"#6b7280"}}>{SURL?"Connected":"Not connected - add env vars in Vercel"}</div></ACard>
        <ACard style={{padding:20,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Change Password</div>
          <div style={{display:"grid",gap:12}}>
            <div><ALbl c="New Password"/><AI type="password" value={np} onChange={e=>setNp(e.target.value)} placeholder="Min 6 characters"/></div>
            <div><ALbl c="Confirm"/><AI type="password" value={cp} onChange={e=>setCp(e.target.value)}/></div>
          </div>
          <ABtn onClick={chgPass} style={{background:"#111",color:"#fff",marginTop:12}}>Change</ABtn>
        </ACard>
        <ACard style={{padding:20}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Backup</div>
          <ABtn onClick={backup} style={{background:"#fef3c7",color:"#92400e"}}>Download Backup</ABtn>
        </ACard>

      <div>
        <ACard style={{padding:20,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>🚚 Free Shipping</div>
          <div style={{display:"grid",gap:10}}>
            <div><ALbl c="Minimum Amount (Rs.)"/><AI type="number" value={f.free_shipping_min||"2000"} onChange={e=>updateF("free_shipping_min",e.target.value)}/></div>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={f.free_shipping_active!=="false"} onChange={e=>updateF("free_shipping_active",e.target.checked?"true":"false")} style={{accentColor:"#c9a84c",width:16,height:16}}/> Enable Free Shipping Bar</label>
          </div>
        </ACard>
        <ACard style={{padding:20,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>💬 WhatsApp Message</div>
          <ALbl c="Greeting Message (customers see this when they tap WA)"/>
          <textarea value={f.wa_greeting||""} onChange={e=>updateF("wa_greeting",e.target.value)} rows={3} placeholder="Assalam! I'm interested in your fabrics..." style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:6,fontSize:12,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </ACard>
        <ACard style={{padding:20,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>🎂 Birthday Discount</div>
          <div style={{display:"grid",gap:10}}>
            <div><ALbl c="Discount % (default 10)"/><AI type="number" value={f.birthday_discount||"10"} onChange={e=>updateF("birthday_discount",e.target.value)}/></div>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={f.birthday_active!=="false"} onChange={e=>updateF("birthday_active",e.target.checked?"true":"false")} style={{accentColor:"#c9a84c",width:16,height:16}}/> Enable Birthday Discount</label>
          </div>
        </ACard>
        <ACard style={{padding:20,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>🌙 Eid Countdown</div>
          <div style={{display:"grid",gap:10}}>
            <div><ALbl c="Eid Date"/><AI type="date" value={f.eid_date||""} onChange={e=>updateF("eid_date",e.target.value)}/></div>
            <div><ALbl c="Title"/><AI value={f.eid_title||"Eid Collection"} onChange={e=>updateF("eid_title",e.target.value)}/></div>
            <div><ALbl c="Subtitle"/><AI value={f.eid_subtitle||"Exclusive Arrivals Coming Soon"} onChange={e=>updateF("eid_subtitle",e.target.value)}/></div>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={f.eid_show==="true"} onChange={e=>updateF("eid_show",e.target.checked?"true":"false")} style={{accentColor:"#c9a84c",width:16,height:16}}/> Show Eid Countdown</label>
          </div>
        </ACard>
        <ACard style={{padding:20}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>📦 Subscription Box</div>
          <div style={{display:"grid",gap:10}}>
            <div><ALbl c="Monthly Price (Rs.)"/><AI type="number" value={f.sub_price||"2500"} onChange={e=>updateF("sub_price",e.target.value)}/></div>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={f.sub_active!=="false"} onChange={e=>updateF("sub_active",e.target.checked?"true":"false")} style={{accentColor:"#c9a84c",width:16,height:16}}/> Show Subscription Box Section</label>
          </div>
        </ACard>
      </div>
      </div>
    </div>
  </div>);
}


function AReviews({onRefresh}){
  const{data:reviews}=useDB(()=>sb.from("reviews").select("*").order("created_at",{ascending:false}),[]);
  const[form,setForm]=useState({customer_name:"",review_text:"",rating:5,product_name:"",approved:true});
  const[loading,setLoading]=useState(false);
  async function add(){
    if(!sb||!form.customer_name||!form.review_text){toast("Name aur review required","error");return;}
    setLoading(true);
    await sb.from("reviews").insert({...form,source:"manual",created_at:new Date().toISOString()});
    setLoading(false);toast("Review added!","success");
    setForm({customer_name:"",review_text:"",rating:5,product_name:"",approved:true});
    onRefresh();
  }
  async function toggle(r){if(!sb)return;await sb.from("reviews").update({approved:!r.approved}).eq("id",r.id);onRefresh();}
  async function del(id){if(!sb||!window.confirm("Delete?"))return;await sb.from("reviews").delete().eq("id",id);onRefresh();}
  const stars=n=>"★".repeat(n)+"☆".repeat(5-n);
  return(<div>
    <AH title="Customer Reviews" sub="Website pe dikhne wale reviews manage karo"/>
    <ACard style={{padding:20,marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Add Review Manually</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><ALbl c="Customer Name *"/><AI value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} placeholder="Hamza Muhammadi"/></div>
        <div><ALbl c="Product Name"/><AI value={form.product_name} onChange={e=>setForm({...form,product_name:e.target.value})} placeholder="Embroidered Dress"/></div>
        <div><ALbl c="Rating"/>
          <select value={form.rating} onChange={e=>setForm({...form,rating:parseInt(e.target.value)})} style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:13,fontFamily:"inherit",outline:"none"}}>
            {[5,4,3,2,1].map(n=><option key={n} value={n}>{stars(n)} ({n}/5)</option>)}
          </select>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:18}}>
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13}}>
            <input type="checkbox" checked={form.approved} onChange={e=>setForm({...form,approved:e.target.checked})} style={{accentColor:"#111"}}/>
            Show on website
          </label>
        </div>
        <div style={{gridColumn:"1/-1"}}><ALbl c="Review Text *"/><textarea value={form.review_text} onChange={e=>setForm({...form,review_text:e.target.value})} placeholder="Bohat acha fabric tha, quality best hai!" style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#111",outline:"none",fontFamily:"inherit",minHeight:70,resize:"vertical"}}/></div>
      </div>
      <ABtn onClick={add} disabled={loading} style={{background:"#111",color:"#fff",marginTop:14,opacity:loading?.6:1}}>{loading?"Adding...":"+ Add Review"}</ABtn>
    </ACard>
    {!reviews?.length?<ACard style={{padding:48,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:36,marginBottom:12}}>⭐</div><div>No reviews yet</div></ACard>:
      reviews.map(r=><ACard key={r.id} style={{padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{fontWeight:600,fontSize:14,color:"#111"}}>{r.customer_name}</div>
            <div style={{color:"#f59e0b",fontSize:13}}>{stars(r.rating||5)}</div>
            <Bdg c={r.source==="manual"?"":"b"}>{r.source==="manual"?"Manual":"Customer"}</Bdg>
            <Bdg c={r.approved?"g":""}>{r.approved?"Visible":"Hidden"}</Bdg>
          </div>
          {r.product_name&&<div style={{fontSize:11,color:"#9ca3af",marginBottom:4}}>{r.product_name}</div>}
          <div style={{fontSize:13,color:"#374151",fontStyle:"italic"}}>"{r.review_text}"</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <ABtn sm onClick={()=>toggle(r)} style={{background:r.approved?"#fef9c3":"#dcfce7",color:r.approved?"#92400e":"#16a34a"}}>{r.approved?"Hide":"Show"}</ABtn>
          <ABtn sm onClick={()=>del(r.id)} style={{background:"#fee2e2",color:"#dc2626"}}>Del</ABtn>
        </div>
      </ACard>)
    }
  </div>);
}

function ASoldCounter({onRefresh}){
  const settings=useSettings();
  const[f,setF]=useState({});
  useEffect(()=>setF({...settings}),[settings]);
  const realSold=parseInt(f.real_sold_count)||0;
  const displayNum=parseInt(f.sold_display_count)||realSold;
  async function save(){
    if(!sb)return;
    await Promise.all(Object.entries(f).map(([k,v])=>sb.from("website_settings").upsert({key:k,value:String(v)},{onConflict:"key"})));
    toast("Saved!","success");onRefresh();
  }
  return(<div>
    <AH title="Sold Counter" sub="Website pe 'X pieces sold' dikhao"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
      <ACard style={{padding:20}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:4,color:"#111"}}>Current Numbers</div>
        <div style={{fontSize:12,color:"#9ca3af",marginBottom:16}}>Real orders se auto count + manual boost option</div>
        <div style={{display:"grid",gap:12}}>
          <div><ALbl c="Real Sold (auto from orders)"/>
            <div style={{border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 12px",fontSize:16,fontWeight:700,color:"#16a34a",background:"#f9fafb"}}>{realSold} pieces</div>
          </div>
          <div><ALbl c="Display Number (can add extra)"/>
            <AI type="number" value={f.sold_display_count||""} onChange={e=>setF({...f,sold_display_count:e.target.value})} placeholder={String(realSold+200)}/>
            <div style={{fontSize:10,color:"#9ca3af",marginTop:4}}>Yahan se manually boost kar sakte ho — e.g. +200 add karo starting count ke liye</div>
          </div>
          <div><ALbl c="Display Text"/>
            <AI value={f.sold_text||""} onChange={e=>setF({...f,sold_text:e.target.value})} placeholder="500+ pieces sold this month"/>
          </div>
          <div><ALbl c="Show on website"/>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginTop:4}}>
              <input type="checkbox" checked={f.sold_show==="true"||f.sold_show===true} onChange={e=>setF({...f,sold_show:String(e.target.checked)})} style={{accentColor:"#111"}}/>
              Show sold counter on homepage
            </label>
          </div>
        </div>
        <ABtn onClick={save} style={{background:"#111",color:"#fff",marginTop:14}}>Save</ABtn>
      </ACard>
      <ACard style={{padding:20}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Preview</div>
        <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:20,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>✅</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#111"}}>{displayNum}+</div>
          <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>{f.sold_text||"pieces sold this month"}</div>
        </div>
        <div style={{fontSize:11,color:"#9ca3af",marginTop:12,lineHeight:1.8}}>
          Yeh homepage pe ek trust badge ke taur pe dikhega. Customers dekh ke trust karte hain.
        </div>
      </ACard>
    </div>
  </div>);
}


function AAnalytics({settings={}}){
  const[gId,setGId]=useState(settings.ga_id||"");
  const[loading,setLoading]=useState(false);
  useEffect(()=>setGId(settings.ga_id||""),[settings]);
  async function saveGA(){
    if(!sb)return;setLoading(true);
    await sb.from("website_settings").upsert({key:"ga_id",value:gId},{onConflict:"key"});
    setLoading(false);toast("Saved! Page reload karo","success");
  }
  const stats=[
    {l:"Total Visitors",v:"—",ic:"👥",sub:"Google Analytics connect karo"},
    {l:"Page Views",v:"—",ic:"👁️",sub:"Data automatically aayega"},
    {l:"WA Button Clicks",v:"—",ic:"💬",sub:"Tracking required"},
    {l:"Avg. Session",v:"—",ic:"⏱️",sub:"Google mein dekho"},
  ];
  return(<div>
    <AH title="Google Analytics" sub="Website visitors ka data track karo"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14,marginBottom:20}}>
      {stats.map(s=><ACard key={s.l} style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
          <div style={{fontSize:22}}>{s.ic}</div>
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#9ca3af"}}>{s.v}</div>
        <div style={{fontSize:10,color:"#9ca3af",marginTop:4}}>{s.sub}</div>
      </ACard>)}
    </div>
    <ACard style={{padding:24,marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Google Analytics Setup</div>
      <div style={{display:"grid",gap:12,maxWidth:500}}>
        <div>
          <ALbl c="Measurement ID (G-XXXXXXXXXX)"/>
          <AI value={gId} onChange={e=>setGId(e.target.value)} placeholder="G-XXXXXXXXXX" style={{letterSpacing:2,fontWeight:600}}/>
        </div>
        <ABtn onClick={saveGA} disabled={loading} style={{background:"#111",color:"#fff",width:"fit-content",opacity:loading?.6:1}}>{loading?"Saving...":"Save & Enable"}</ABtn>
      </div>
    </ACard>
    <ACard style={{padding:24}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#111"}}>Setup Guide</div>
      <div style={{display:"grid",gap:12}}>
        {[
          ["1","analytics.google.com pe jao","Free Google account se login karo"],
          ["2","New Property banao","Website ka naam: Jameel Fabrics"],
          ["3","Measurement ID copy karo","G-XXXXXXXXXX format mein hoga"],
          ["4","Upar field mein paste karo","Save karo — 24 hours mein data aana shuru ho jaayega"],
          ["5","Real-time report dekho","Google Analytics dashboard mein live visitors dikhenge"],
        ].map(([n,t,d])=><div key={n} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:"1px solid #f3f4f6"}}>
          <div style={{width:28,height:28,background:"#111",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{n}</div>
          <div><div style={{fontWeight:600,fontSize:13,color:"#111"}}>{t}</div><div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{d}</div></div>
        </div>)}
      </div>
    </ACard>
  </div>);
}

/* ─ AReviews ─ */

function AdminPanel({onExit}){
  const[page,setPage]=useState("dashboard");
  const[col,setCol]=useState(false);
  const[mobOpen,setMobOpen]=useState(false);
  const settings=useSettings();
  const{data:allProds,loading:pLoad}=useDB(()=>sb.from("products").select("*").order("created_at",{ascending:false}),[]);
  const{data:pending}=useDB(()=>sb.from("products").select("*").eq("website_status","pending"),[]);
  const{data:orders}=useDB(()=>sb.from("online_orders").select("*").order("created_at",{ascending:false}),[]);
  const{data:alerts}=useDB(()=>sb.from("website_alerts").select("*").eq("resolved",false).order("created_at",{ascending:false}),[]);
  const{data:coupons}=useDB(()=>sb.from("coupons").select("*"),[]);
  const{data:subs}=useDB(()=>sb.from("subscribers").select("*").order("subscribed_at",{ascending:false}),[]);
  const{data:customers}=useDB(()=>sb.auth.admin?sb.from("profiles").select("*"):sb.from("online_orders").select("customer_email,customer_name").limit(50),[]);
  const refresh=()=>window.location.reload();
  const pC=pending?.length||0;
  const aC=alerts?.length||0;
  const oC=orders?.filter(o=>o.status==="pending").length||0;
  const todayOrders=orders?.filter(o=>new Date(o.created_at).toDateString()===new Date().toDateString())||[];
  const todayRev=todayOrders.reduce((s,o)=>s+Number(o.total||0),0);

  const NAV=[
    {section:"Main"},
    {id:"dashboard",ic:<DashIc/>,lbl:"Dashboard"},
    {id:"orders",ic:<OrdIc/>,lbl:"Orders",badge:oC,bc:"#f59e0b"},
    {section:"Catalogue"},
    {id:"pending",ic:<PendIc/>,lbl:"Pending (ERP)",badge:pC,bc:"#c9a84c"},
    {id:"products",ic:<ProdIc/>,lbl:"Products"},
    {id:"alerts",ic:<AlertIc/>,lbl:"Stock Alerts",badge:aC,bc:"#ef4444"},
    {id:"coupons",ic:<CoupIc/>,lbl:"Coupons"},
    {section:"Content"},
    {id:"reviews",ic:<StarIc/>,lbl:"Reviews"},
    {id:"sold",ic:<ChartIc/>,lbl:"Sold Counter"},
    {id:"analytics",ic:<AnalyticIc/>,lbl:"Analytics"},
    {id:"content",ic:<EditIc/>,lbl:"Website Content"},
    {id:"subscribers",ic:<MailIc/>,lbl:"Subscribers"},
    {id:"settings",ic:<SettIc/>,lbl:"Settings"},
  ];

  const TITLES={dashboard:"Dashboard",pending:"Pending Approval",alerts:"Stock Alerts",products:"Products",orders:"Orders",coupons:"Coupons",reviews:"Reviews",sold:"Sold Counter",analytics:"Analytics",content:"Website Content",subscribers:"Subscribers",settings:"Settings"};

  const PAGES={
    dashboard:()=><ADash prods={allProds||[]} orders={orders||[]} alerts={alerts||[]} pending={pending||[]} todayOrders={todayOrders||[]} todayRev={todayRev||0} onNav={setPage}/>,
    pending:()=><APending pending={pending||[]} onRefresh={refresh}/>,
    alerts:()=><AAlerts alerts={alerts||[]} onRefresh={refresh}/>,
    products:()=><AProducts products={allProds||[]} onRefresh={refresh}/>,
    orders:()=><AOrders orders={orders||[]} wa={settings.wa_number||WA_NUM}/>,
    coupons:()=><ACoupons coupons={coupons||[]} onRefresh={refresh}/>,
    reviews:()=><AReviews onRefresh={refresh}/>,
    sold:()=><ASoldCounter onRefresh={refresh}/>,
    analytics:()=><AAnalytics settings={settings||{}}/>,
    content:()=><AContent settings={settings||{}}/>,
    subscribers:()=><ASubs subs={subs||[]}/>,
    settings:()=><ASettings settings={settings||{}}/>,
  };

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',sans-serif",background:"#f4f5f7"}}>

      {/* Mobile overlay */}
      {mobOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:199}} onClick={()=>setMobOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`adm-sb${col?" col":""}${mobOpen?" mob-open":""}`}>
        {/* Logo */}
        <div style={{padding:"18px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:36,height:36,background:"#c9a84c",borderRadius:6,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:900,color:"#0a0907"}}>JF</div>
          {!col&&<div style={{overflow:"hidden",whiteSpace:"nowrap"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:"#fff",letterSpacing:1}}>JAMEEL FABRICS</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Admin Panel</div></div>}
        </div>

        {/* Nav items */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 8px"}}>
          {NAV.map((item,i)=>{
            if(item.section) return(
              <div key={i} style={{fontSize:10,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,.2)",padding:"10px 8px 4px",whiteSpace:"nowrap",overflow:"hidden",display:col?"none":"block"}}>{item.section}</div>
            );
            return(
              <button key={item.id} onClick={()=>{setPage(item.id);setMobOpen(false);}} className={`adm-sb-item${page===item.id?" act":""}`}>
                <span style={{flexShrink:0,display:"flex",width:18,alignItems:"center",justifyContent:"center",opacity:page===item.id?1:.65}}>{item.ic}</span>
                {!col&&<><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis"}}>{item.lbl}</span>{item.badge>0&&<span style={{background:item.bc||"#ef4444",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700,flexShrink:0}}>{item.badge}</span>}</>}
              </button>
            );
          })}
        </div>

        {/* Bottom user area */}
        <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          <button onClick={onExit} className="adm-sb-item" style={{color:"rgba(255,255,255,.35)"}}>
            <span style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            {!col&&"Exit to Store"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        {/* Topbar */}
        <div style={{height:60,background:"#fff",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",padding:"0 20px",gap:12,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.08)"}}>
          <button onClick={()=>{setCol(c=>!c);setMobOpen(m=>!m);}} style={{background:"none",border:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#6b7280",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#f4f5f7"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{fontSize:16,fontWeight:600,color:"#111827",flex:1}}>{TITLES[page]||page}</div>
          {/* Search */}
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#f4f5f7",border:"1px solid #e5e7eb",borderRadius:6,padding:"7px 12px",width:200}} className="hide-mob">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search..." style={{background:"none",border:"none",outline:"none",fontSize:13,color:"#111",width:"100%",fontFamily:"inherit"}}/>
          </div>
          {/* Alerts bell */}
          <button onClick={()=>setPage("alerts")} style={{background:"none",border:"none",cursor:"pointer",width:36,height:36,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#6b7280",position:"relative",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#f4f5f7"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {aC>0&&<span style={{position:"absolute",top:4,right:4,width:8,height:8,background:"#ef4444",borderRadius:"50%",border:"2px solid #fff"}}/>}
          </button>
          <button onClick={onExit} style={{background:"#0f0d0a",color:"#fff",border:"none",padding:"8px 16px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="#2a2520"} onMouseLeave={e=>e.currentTarget.style.background="#0f0d0a"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Store
          </button>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"clamp(16px,2vw,24px)",background:"#f4f5f7"}}>
          {sb?(()=>{try{return PAGES[page]?.()||<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>;}catch(e){return<div style={{padding:40,textAlign:"center"}}><div style={{fontSize:30}}>⚠️</div><div style={{color:"#ef4444",marginTop:8,fontSize:13}}>{e.message}</div></div>;}})():(
            <div style={{textAlign:"center",padding:60,color:"#9ca3af"}}>
              <div style={{fontSize:40,marginBottom:12}}>⚙️</div>
              <div style={{fontWeight:600,fontSize:16,color:"#374151"}}>Supabase Not Connected</div>
              <div style={{fontSize:13,marginTop:8}}>Add env vars in Vercel Settings</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* SVG Icons */
const DashIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const OrdIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></svg>;
const PendIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>;
const ProdIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const AlertIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CoupIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const StarIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
const ChartIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const AnalyticIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>;
const EditIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const MailIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SettIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

export default function App(){
  const[view,setView]=useState("intro");
  const[showAdminLogin,setShowAdminLogin]=useState(false);
  const[user,setUser]=useState(null);
  const toasts=useToast();
  useEffect(()=>{if(!sb)return;sb.auth.getSession().then(({data:{session}})=>setUser(session?.user||null));const{data:{subscription}}=sb.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>subscription.unsubscribe();},[]);
  useEffect(()=>{
    const handler=e=>{e.preventDefault();};
    window.addEventListener("beforeinstallprompt",handler);
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  useEffect(()=>{if(!sb)return;const ch=sb.channel("g_alerts").on("postgres_changes",{event:"INSERT",schema:"public",table:"website_alerts"},p=>{toast("New stock alert: "+(p.new?.product_name||""));}).subscribe();return()=>sb.removeChannel(ch);},[]);
  useEffect(()=>{
    function checkHash(){if(window.location.hash==="#jfadmin"){window.location.hash="";setShowAdminLogin(true);}}
    checkHash();
    window.addEventListener("hashchange",checkHash);
    return()=>window.removeEventListener("hashchange",checkHash);
  },[]);
  async function logout(){if(sb)await sb.auth.signOut();setUser(null);toast("Logged out");setView("store");}
  return(<>
    <style>{G}</style>
    {view==="intro"&&<Intro onEnter={()=>setView("store")}/>}
    {view==="store"&&<Store user={user} onLogout={logout} onAccount={()=>user?setView("account"):null} onAdmin={()=>setShowAdminLogin(true)}/>}
    {view==="account"&&user&&<AccountPage user={user} onBack={()=>setView("store")}/>}
    {view==="admin"&&<ErrorBoundary><AdminPanel onExit={()=>setView("store")}/></ErrorBoundary>}
    {showAdminLogin&&<AdminLogin onSuccess={()=>{setShowAdminLogin(false);setView("admin");}} onCancel={()=>setShowAdminLogin(false)}/>}
    <Toasts list={toasts}/>
  </>);
}
