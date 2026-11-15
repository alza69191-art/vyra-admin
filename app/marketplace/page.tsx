"use client";

import { useEffect, useState } from "react";
import { ArrowRight, PackagePlus, RefreshCw, Save, Store, ShieldCheck, Ban, CheckCircle2, Plus, ExternalLink } from "lucide-react";

type Settings = {
  marketplace_enabled:boolean; user_product_publishing:boolean; user_service_publishing:boolean;
  admin_only_publishing:boolean; product_approval_required:boolean;
  payment_methods:string[]; product_categories:string[]; service_categories:string[];
};
type Item = {id:string;title:string;description:string;item_type:"product"|"service";price:number;currency:string;category:string;payment_methods:string[];status:string;created_by_admin:boolean;image_url?:string};
const paymentLabels:Record<string,string>={manual_transfer:"تحويل بنكي",paypal:"PayPal",payoneer:"Payoneer",cash_on_delivery:"الدفع عند الاستلام",card:"بطاقة بنكية"};
const defaults:Settings={marketplace_enabled:true,user_product_publishing:true,user_service_publishing:true,admin_only_publishing:false,product_approval_required:true,payment_methods:["manual_transfer","paypal","payoneer"],product_categories:["تقنية وإلكترونيات","ملابس وإكسسوارات","منتجات رقمية","منزل ومكتب","أخرى"],service_categories:["برمجة وتطوير","تصميم وإبداع","تسويق رقمي","فيديو وموشن","كتابة وترجمة","أخرى"]};

export default function MarketplaceAdmin(){
 const [settings,setSettings]=useState<Settings>(defaults);
 const [items,setItems]=useState<Item[]>([]);
 const [tab,setTab]=useState<"settings"|"products"|"create">("settings");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const [logged,setLogged]=useState(false);
 const [form,setForm]=useState({title:"",description:"",item_type:"product" as "product"|"service",price:"",currency:"USD",category:"",payment_methods:["manual_transfer"],image_url:""});
 const [productCategoriesText,setProductCategoriesText]=useState(defaults.product_categories.join(", "));
 const [serviceCategoriesText,setServiceCategoriesText]=useState(defaults.service_categories.join(", "));
 async function api(path:string,method="GET",body?:any){const r=await fetch(path,{method,headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined,cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.detail||d.error||"تعذر تنفيذ العملية");return d;}
 async function refresh(){setBusy(true);setError("");try{const [s,p]=await Promise.all([api("/api/admin/marketplace/settings"),api("/api/admin/marketplace/products")]);setSettings(s);setItems(p);setProductCategoriesText(s.product_categories.join(", "));setServiceCategoriesText(s.service_categories.join(", "));}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 useEffect(()=>{fetch("/api/login",{cache:"no-store"}).then(r=>{if(r.ok){setLogged(true);void refresh();}}).catch(()=>setError("تعذر الاتصال بلوحة الإدارة."));},[]);
 function toggle(key:keyof Settings){if(typeof settings[key]==="boolean")setSettings({...settings,[key]:!settings[key]});}
 function togglePayment(method:string){const selected=settings.payment_methods.includes(method)?settings.payment_methods.filter(x=>x!==method):[...settings.payment_methods,method];setSettings({...settings,payment_methods:selected});}
 async function saveSettings(){setBusy(true);setError("");setNotice("");try{const saved=await api("/api/admin/marketplace/settings","PATCH",{...settings,product_categories:productCategoriesText.split(",").map(x=>x.trim()).filter(Boolean),service_categories:serviceCategoriesText.split(",").map(x=>x.trim()).filter(Boolean)});setSettings(saved);setNotice("تم حفظ إعدادات المتجر وتطبيقها من الخادم.");}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function createItem(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{await api("/api/admin/marketplace/products","POST",{...form,price:Number(form.price),payment_methods:form.payment_methods,status:"active"});setForm({...form,title:"",description:"",price:"",image_url:""});await refresh();setTab("products");setNotice("تم نشر العنصر في كتالوج المتجر.");}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function setStatus(item:Item,status:string){const reason=window.prompt("سبب تغيير حالة العنصر:");if(!reason||reason.trim().length<3)return;try{await api(`/api/admin/marketplace/products/${item.id}/status`,"PATCH",{status,reason});await refresh();setNotice("تم تحديث حالة العنصر.");}catch(e:any){setError(e.message);}}
 const categories=form.item_type==="service"?settings.service_categories:settings.product_categories;
 if(!logged)return <main className="gate"><div className="gate-card"><ShieldCheck size={34}/><h1>بوابة إدارة متجر VYRA</h1><p>سجّل دخولك أولاً من لوحة الإدارة الرئيسية.</p><a href="/">الانتقال لتسجيل الدخول</a></div></main>;
 return <main className="admin-market">
  <header className="market-top"><a href="/" className="back"><ArrowRight size={17}/> لوحة الإدارة الرئيسية</a><div className="mark"><span>V</span> VYRA <small>MARKET CONTROL</small></div><div style={{display:"flex",gap:8,alignItems:"center"}}><a href="/catalog" className="refresh" style={{textDecoration:"none"}}>الكتالوج والمخزون المتقدم</a><button onClick={refresh} className="refresh"><RefreshCw size={16}/> تحديث</button></div></header>
  <section className="market-head"><div><span className="eyebrow">مركز التحكم التجاري</span><h1>إدارة المتجر <em>والنشر.</em></h1><p>تحكم بسياسة النشر، المنتجات والخدمات، الأسعار، التصنيفات ووسائل الدفع من هنا دون تعديل الكود.</p></div><div className="head-icon"><Store size={35}/></div></section>
  <nav className="tabs"><button className={tab==="settings"?"selected":""} onClick={()=>setTab("settings")}>سياسات المتجر</button><button className={tab==="products"?"selected":""} onClick={()=>setTab("products")}>المنتجات والخدمات ({items.length})</button><button className={tab==="create"?"selected":""} onClick={()=>setTab("create")}><Plus size={15}/> إضافة عنصر</button></nav>
  {error&&<div className="alert error">{error}</div>}{notice&&<div className="alert success">{notice}</div>}
  {busy&&<div className="busy">جارٍ تنفيذ العملية…</div>}
  {tab==="settings"&&<section className="settings-layout">
   <article className="box"><div className="box-title"><div><h2>صلاحيات النشر والتحكم</h2><p>تُطبّق هذه الخيارات فور حفظها على واجهات API.</p></div><ShieldCheck/></div>
    {([["marketplace_enabled","تفعيل المتجر بالكامل","إيقاف المتجر يمنع عرض المنتجات والخدمات العامة."],["admin_only_publishing","النشر من الإدارة فقط","عند تفعيله يُمنع المستخدمون من إنشاء منتجات أو خدمات."],["user_product_publishing","السماح للمستخدمين بإضافة السلع","يمكن للمستخدمين إنشاء منتجات عند تفعيل الخيار وعدم حصر النشر بالإدارة."],["user_service_publishing","السماح للمستخدمين بإضافة الخدمات","يمكن للمستقلين نشر خدماتهم من حساباتهم."],["product_approval_required","مراجعة المنشورات قبل النشر","المنتجات الجديدة من المستخدمين تبقى قيد المراجعة حتى اعتمادها."] ] as const).map(([key,title,desc])=><div className="switch-row" key={key}><div><b>{title}</b><small>{desc}</small></div><button className={settings[key]?"switch on":"switch"} onClick={()=>toggle(key)} aria-label={title}><i/></button></div>)}
   </article>
   <article className="box"><div className="box-title"><div><h2>وسائل الدفع المعروضة</h2><p>تحدد الطرق التي يمكن اختيارها عند نشر كل عنصر.</p></div></div>
    {Object.entries(paymentLabels).map(([key,label])=><label className="check-row" key={key}><input type="checkbox" checked={settings.payment_methods.includes(key)} onChange={()=>togglePayment(key)}/><span>{label}</span></label>)}
    <div className="note">تنبيه: تفعيل طريقة هنا يتيح اختيارها وعرضها فقط. تنفيذ التحصيل الفعلي يتطلب ربط حساب التاجر ومفاتيح مزود الدفع بشكل آمن في الخادم.</div>
   </article>
   <article className="box"><div className="box-title"><div><h2>تصنيفات المنتجات</h2><p>افصل التصنيفات بفاصلة عربية أو إنجليزية.</p></div></div><textarea value={productCategoriesText} onChange={e=>setProductCategoriesText(e.target.value)}/></article>
   <article className="box"><div className="box-title"><div><h2>تصنيفات الخدمات</h2><p>تظهر هذه التصنيفات في نموذج نشر الخدمات.</p></div></div><textarea value={serviceCategoriesText} onChange={e=>setServiceCategoriesText(e.target.value)}/></article>
   <div className="save-row"><button className="save" onClick={saveSettings} disabled={busy}><Save size={17}/> حفظ وتطبيق الإعدادات</button></div>
  </section>}
  {tab==="products"&&<section className="box products-box"><div className="box-title"><div><h2>كتالوج المنتجات والخدمات</h2><p>إدارة ما نشرته الإدارة أو المستخدمون واعتماد العناصر أو إيقافها.</p></div><button className="add" onClick={()=>setTab("create")}><Plus size={15}/> إضافة منتج أو خدمة</button></div>
   <div className="table-scroll"><table><thead><tr><th>العنصر</th><th>النوع</th><th>السعر</th><th>الصنف</th><th>النشر</th><th>الحالة</th><th>التحكم</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><b>{item.title}</b><small>{item.created_by_admin?"أضيف من الإدارة":"أضيف بواسطة مستخدم"}</small></td><td>{item.item_type==="service"?"خدمة":"سلعة"}</td><td>{item.price} {item.currency}</td><td>{item.category}</td><td>{item.payment_methods.map(x=>paymentLabels[x]||x).join("، ")}</td><td><span className={"status "+item.status}>{({active:"منشور",pending:"قيد المراجعة",paused:"موقوف",rejected:"مرفوض"} as any)[item.status]||item.status}</span></td><td><div className="row-actions">{item.status!=="active"&&<button onClick={()=>setStatus(item,"active")}><CheckCircle2 size={14}/> نشر</button>}{item.status!=="paused"&&<button className="stop" onClick={()=>setStatus(item,"paused")}><Ban size={14}/> إيقاف</button>}{item.status!=="rejected"&&<button className="stop" onClick={()=>setStatus(item,"rejected")}>رفض</button>}</div></td></tr>)}{!items.length&&<tr><td colSpan={7}>لا توجد منتجات حالياً. أضف أول عنصر من زر «إضافة عنصر».</td></tr>}</tbody></table></div>
  </section>}
  {tab==="create"&&<section className="box create-box"><div className="box-title"><div><h2>إضافة منتج أو خدمة من الإدارة</h2><p>العناصر التي تنشئها الإدارة تُنشر مباشرة في الكتالوج.</p></div><PackagePlus/></div>
   <form onSubmit={createItem} className="product-form">
    <label>نوع العنصر<select value={form.item_type} onChange={e=>setForm({...form,item_type:e.target.value as any,category:""})}><option value="product">سلعة / منتج</option><option value="service">خدمة</option></select></label>
    <label>اسم المنتج أو الخدمة<input required minLength={3} maxLength={160} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="مثال: تصميم هوية تجارية"/></label>
    <label className="wide">الوصف<textarea required minLength={10} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="اكتب وصفاً واضحاً للعنصر..."/></label>
    <label>السعر<input required type="number" min="0.01" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
    <label>العملة<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}><option>USD</option><option>EUR</option><option>ILS</option><option>SAR</option><option>AED</option></select></label>
    <label>الصنف<select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">اختر الصنف</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>رابط الصورة<input type="url" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://..."/></label>
    <div className="wide"><b className="field-title">طرق الدفع المتاحة لهذا العنصر</b><div className="payment-picks">{settings.payment_methods.map(method=><label key={method}><input type="checkbox" checked={form.payment_methods.includes(method)} onChange={()=>setForm({...form,payment_methods:form.payment_methods.includes(method)?form.payment_methods.filter(x=>x!==method):[...form.payment_methods,method]})}/>{paymentLabels[method]||method}</label>)}</div></div>
    <button className="save wide" disabled={busy}><PackagePlus size={17}/> إنشاء ونشر العنصر</button>
   </form>
  </section>}
  <footer>VYRA Admin · إدارة المتجر والصلاحيات من الخادم</footer>
 </main>;
}
