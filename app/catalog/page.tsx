"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Barcode, Boxes, PackageSearch, Plus, RefreshCw, Save, Tags, AlertTriangle } from "lucide-react";

type Product = {id:string;title:string;item_type:string;price:number;currency:string;category:string;status:string;sku?:string|null;stock_qty?:number};
type Brand = {id:string;name:string;slug:string;active:boolean};
type LowStock = {product_id:string;title:string;sku:string|null;stock_qty:number;threshold:number;category:string};

const field:React.CSSProperties={width:"100%",padding:"12px 14px",border:"1px solid #e3e7ed",borderRadius:12,background:"#fff",color:"#202938",outline:"none"};
const button:React.CSSProperties={border:0,borderRadius:12,padding:"11px 15px",background:"#ff5a1f",color:"#fff",fontWeight:800,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8};

export default function CatalogAdmin(){
 const [products,setProducts]=useState<Product[]>([]);const [brands,setBrands]=useState<Brand[]>([]);const [low,setLow]=useState<LowStock[]>([]);
 const [selected,setSelected]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);const [logged,setLogged]=useState(false);
 const [meta,setMeta]=useState({sku:"",barcode:"",brand_id:"",attributes:"{}",tags:"",weight_grams:"",min_order_qty:"1",max_order_qty:"",low_stock_threshold:"5",track_inventory:true});
 const [brand,setBrand]=useState({name:"",slug:"",description:""});
 async function api(path:string,method="GET",body?:unknown){const r=await fetch(path,{method,headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined,cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.detail||d.error||"تعذر تنفيذ العملية");return d;}
 async function refresh(){setBusy(true);setError("");try{const [p,b,l]=await Promise.all([api("/api/admin/marketplace/products"),api("/api/admin/catalog/brands"),api("/api/admin/catalog/low-stock")]);setProducts(p.filter((x:Product)=>x.item_type==="product"));setBrands(b);setLow(l);}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 useEffect(()=>{fetch("/api/login",{cache:"no-store"}).then(r=>{if(r.ok){setLogged(true);void refresh();}}).catch(()=>setError("تعذر الاتصال بلوحة الإدارة."));},[]);
 function choose(p:Product){setSelected(p.id);setMeta({sku:p.sku||"",barcode:"",brand_id:"",attributes:"{}",tags:"",weight_grams:"",min_order_qty:"1",max_order_qty:"",low_stock_threshold:"5",track_inventory:true});}
 async function saveMeta(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{let attributes={};try{attributes=JSON.parse(meta.attributes||"{}");}catch{throw new Error("صيغة الخصائص يجب أن تكون JSON صحيحة.");}await api("/api/admin/catalog/products/"+selected+"/meta","PATCH",{sku:meta.sku||null,barcode:meta.barcode||null,brand_id:meta.brand_id||null,attributes,tags:meta.tags.split(",").map(x=>x.trim()).filter(Boolean),weight_grams:meta.weight_grams?Number(meta.weight_grams):null,min_order_qty:Number(meta.min_order_qty),max_order_qty:meta.max_order_qty?Number(meta.max_order_qty):null,low_stock_threshold:Number(meta.low_stock_threshold),track_inventory:meta.track_inventory});setNotice("تم حفظ بيانات الكتالوج المتقدمة.");await refresh();}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function addBrand(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{await api("/api/admin/catalog/brands","POST",brand);setBrand({name:"",slug:"",description:""});await refresh();setNotice("تمت إضافة العلامة التجارية.");}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 if(!logged)return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f6f8fb",color:"#253044"}}><div style={{background:"#fff",padding:32,borderRadius:20}}>سجّل الدخول إلى لوحة الإدارة أولاً.</div></main>;
 return <main dir="rtl" style={{minHeight:"100vh",background:"#f5f7fa",color:"#202938",padding:"24px",fontFamily:"Arial,sans-serif"}}>
  <div style={{maxWidth:1250,margin:"auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:28}}>
    <a href="/marketplace" style={{color:"#445064",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}><ArrowRight size={18}/> إدارة المتجر</a>
    <div style={{fontWeight:900,letterSpacing:2,color:"#182334"}}>VYRA <span style={{color:"#ff5a1f"}}>CATALOG</span></div>
    <button style={{...button,background:"#26364b"}} onClick={refresh}><RefreshCw size={16}/> تحديث البيانات</button>
   </header>
   <section style={{marginBottom:22}}><div style={{color:"#ff5a1f",fontWeight:800,fontSize:12}}>المرحلة الأولى · الكتالوج والمخزون</div><h1 style={{fontSize:32,margin:"8px 0"}}>إدارة الكتالوج المتقدمة</h1><p style={{color:"#667085",margin:0}}>SKU والباركود، العلامات التجارية، خصائص المنتجات، المتغيرات، ومراقبة المخزون.</p></section>
   {error&&<div style={{padding:14,background:"#fff0ed",color:"#b42318",borderRadius:12,marginBottom:12}}>{error}</div>}{notice&&<div style={{padding:14,background:"#eaf8ef",color:"#18794e",borderRadius:12,marginBottom:12}}>{notice}</div>}{busy&&<div style={{color:"#667085",padding:8}}>جارٍ تنفيذ العملية…</div>}
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,marginBottom:22}}>
    <article style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:20}}><PackageSearch color="#ff5a1f"/><div style={{fontSize:28,fontWeight:900,marginTop:12}}>{products.length}</div><div style={{color:"#667085"}}>منتجات في الكتالوج</div></article>
    <article style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:20}}><Tags color="#3867d6"/><div style={{fontSize:28,fontWeight:900,marginTop:12}}>{brands.length}</div><div style={{color:"#667085"}}>علامات تجارية</div></article>
    <article style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:20}}><AlertTriangle color="#d97706"/><div style={{fontSize:28,fontWeight:900,marginTop:12}}>{low.length}</div><div style={{color:"#667085"}}>منتجات منخفضة المخزون</div></article>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"minmax(260px,1fr) minmax(320px,1.2fr)",gap:18,alignItems:"start"}}>
    <section style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:18}}>
     <h2 style={{fontSize:18,marginTop:0,display:"flex",alignItems:"center",gap:8}}><Boxes size={18}/> اختر منتجاً</h2>
     <div style={{display:"grid",gap:8,maxHeight:550,overflowY:"auto"}}>{products.map(p=><button key={p.id} onClick={()=>choose(p)} style={{textAlign:"right",padding:13,borderRadius:12,border:selected===p.id?"1px solid #ff5a1f":"1px solid #e6eaf0",background:selected===p.id?"#fff5f0":"#fff",cursor:"pointer",color:"#202938"}}><b>{p.title}</b><div style={{fontSize:12,color:"#667085",marginTop:5}}>{p.price} {p.currency} · {p.category}</div></button>)}{!products.length&&<p style={{color:"#667085"}}>لا توجد منتجات منشورة بعد.</p>}</div>
    </section>
    <section style={{display:"grid",gap:18}}>
     <form onSubmit={saveMeta} style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:20}}>
      <h2 style={{fontSize:18,marginTop:0}}>بيانات المنتج المتقدمة</h2><p style={{color:"#667085",fontSize:13}}>اختر منتجاً من القائمة أولاً. هذه البيانات تُحفظ في قاعدة البيانات وتظهر عبر API العام.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
       <label>SKU<input style={field} value={meta.sku} onChange={e=>setMeta({...meta,sku:e.target.value})}/></label>
       <label>الباركود<input style={field} value={meta.barcode} onChange={e=>setMeta({...meta,barcode:e.target.value})}/></label>
       <label>العلامة التجارية<select style={field} value={meta.brand_id} onChange={e=>setMeta({...meta,brand_id:e.target.value})}><option value="">بدون علامة</option>{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
       <label>الوزن بالجرام<input type="number" min="0" style={field} value={meta.weight_grams} onChange={e=>setMeta({...meta,weight_grams:e.target.value})}/></label>
       <label>أقل كمية للطلب<input type="number" min="1" style={field} value={meta.min_order_qty} onChange={e=>setMeta({...meta,min_order_qty:e.target.value})}/></label>
       <label>أعلى كمية للطلب<input type="number" min="1" style={field} value={meta.max_order_qty} onChange={e=>setMeta({...meta,max_order_qty:e.target.value})}/></label>
       <label>حد التنبيه للمخزون<input type="number" min="0" style={field} value={meta.low_stock_threshold} onChange={e=>setMeta({...meta,low_stock_threshold:e.target.value})}/></label>
       <label>الوسوم (بفواصل)<input style={field} value={meta.tags} onChange={e=>setMeta({...meta,tags:e.target.value})}/></label>
      </div>
      <label style={{display:"block",marginTop:10}}>خصائص المنتج بصيغة JSON<textarea style={{...field,minHeight:90,fontFamily:"monospace"}} value={meta.attributes} onChange={e=>setMeta({...meta,attributes:e.target.value})}/></label>
      <label style={{display:"flex",alignItems:"center",gap:9,margin:"14px 0"}}><input type="checkbox" checked={meta.track_inventory} onChange={e=>setMeta({...meta,track_inventory:e.target.checked})}/> تفعيل تتبع المخزون</label>
      <button disabled={!selected||busy} style={{...button,opacity:!selected?.5:1}}><Save size={16}/> حفظ بيانات المنتج</button>
     </form>
     <form onSubmit={addBrand} style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:20}}>
      <h2 style={{fontSize:18,marginTop:0}}>إضافة علامة تجارية</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><label>الاسم<input required minLength={2} style={field} value={brand.name} onChange={e=>setBrand({...brand,name:e.target.value})}/></label><label>الرابط المختصر (slug)<input required pattern="[a-z0-9-]+" style={field} value={brand.slug} onChange={e=>setBrand({...brand,slug:e.target.value})}/></label></div><label style={{display:"block",marginTop:10}}>الوصف<input style={field} value={brand.description} onChange={e=>setBrand({...brand,description:e.target.value})}/></label><button style={{...button,marginTop:12}}><Plus size={16}/> إضافة العلامة</button>
     </form>
     <section style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:20}}><h2 style={{fontSize:18,marginTop:0}}>تنبيهات انخفاض المخزون</h2>{low.length?low.map(x=><div key={x.product_id} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #eef0f3"}}><span>{x.title}<small style={{display:"block",color:"#667085"}}>{x.sku||"بدون SKU"}</small></span><b style={{color:"#c2410c"}}>{x.stock_qty} / {x.threshold}</b></div>):<p style={{color:"#667085"}}>لا توجد منتجات تحت حد التنبيه.</p>}</section>
    </section>
   </div>
  </div>
 </main>;
}
