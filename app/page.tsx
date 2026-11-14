"use client";
import { useState } from "react";
import { Activity, Ban, Bell, CheckCircle2, CircleHelp, FileText, LayoutDashboard, LogOut, MessageSquare, Shield, Users, Search, Settings, LockKeyhole } from "lucide-react";

const menu = [
  { id:"overview", label:"نظرة عامة", icon:LayoutDashboard },
  { id:"support", label:"الدعم الفني", icon:MessageSquare },
  { id:"users", label:"إدارة الحسابات", icon:Users },
  { id:"content", label:"مراجعة المحتوى", icon:FileText },
  { id:"security", label:"الأمان والسجلات", icon:Shield },
];
const stats = [
  { label:"إجمالي الحسابات", value:"—", hint:"سيتم جلب البيانات بعد ربط واجهات الإدارة", icon:Users },
  { label:"تذاكر الدعم المفتوحة", value:"—", hint:"بانتظار ربط صلاحية الدعم على الخادم", icon:MessageSquare },
  { label:"بلاغات قيد المراجعة", value:"—", hint:"واجهة المراجعة جاهزة للربط", icon:Bell },
  { label:"إجراءات اليوم", value:"—", hint:"تُسجل بعد تفعيل سجل التدقيق", icon:Activity },
];

export default function Home() {
  const [email,setEmail]=useState("alza69191@gmail.com");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [logged,setLogged]=useState(false);
  const [tab,setTab]=useState("overview");
  const [tickets,setTickets]=useState<any[]>([]);
  const [loadingTickets,setLoadingTickets]=useState(false);

  async function login(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"تعذر تسجيل الدخول");
      setLogged(true); setPassword("");
    } catch(err:any) { setError(err.message||"حدث خطأ"); }
    finally { setBusy(false); }
  }
  async function loadTickets() {
    setLoadingTickets(true);
    try {
      const r=await fetch("/api/support",{cache:"no-store"});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"تعذر تحميل التذاكر");
      setTickets(Array.isArray(d)?d:[]);
    } catch(err:any) { setError(err.message||"تعذر تحميل التذاكر"); }
    finally { setLoadingTickets(false); }
  }
  async function logout() {
    await fetch("/api/logout",{method:"POST"}); setLogged(false); setTab("overview"); setTickets([]);
  }
  function changeTab(id:string) { setTab(id); if(id==="support") void loadTickets(); }

  if(!logged) return <main className="login-wrap"><form className="login-card" onSubmit={login}>
    <div className="brand"><div className="brand-mark">V</div><span>VYRA <b>ADMIN</b></span></div>
    <h1>بوابة الإدارة</h1><p className="muted">مساحة إدارية مخصصة ومحمية لمنصة VYRA.</p>
    <div className="field"><label>البريد الإداري</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required /></div>
    <div className="field"><label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></div>
    {error&&<p className="error">{error}</p>}
    <button className="primary" disabled={busy}>{busy?"جارٍ التحقق...":"تسجيل الدخول الآمن"}</button>
    <p className="muted" style={{marginTop:18,fontSize:12,display:"flex",gap:7,alignItems:"center"}}><LockKeyhole size={14}/> يتم التحقق من الحساب عبر خادم VYRA.</p>
  </form></main>;

  const title=menu.find(x=>x.id===tab)?.label||"نظرة عامة";
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">V</div><span>VYRA ADMIN</span></div>
      <div><div className="side-label">مساحة الإدارة</div><nav className="nav">{menu.map(item=>{const Icon=item.icon;return <button key={item.id} className={tab===item.id?"active":""} onClick={()=>changeTab(item.id)}><Icon size={18}/><span>{item.label}</span></button>})}</nav></div>
      <div><div className="side-label">النظام</div><nav className="nav"><button onClick={()=>changeTab("settings")}><Settings size={18}/><span>الإعدادات</span></button><button onClick={logout}><LogOut size={18}/><span>تسجيل الخروج</span></button></nav></div>
      <div className="side-foot">VYRA ADMIN · لوحة مستقلة<br/>وصول إداري محدود</div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="topbar-title">{title}</div><div className="admin-chip"><span>مدير النظام</span><div className="avatar">A</div></div></header>
      <section className="content">
        <div className="page-head"><div><h1>{tab==="overview"?"مرحباً بك في لوحة VYRA":title}</h1><div className="muted">مركز الإشراف وإدارة المنصة من مكان واحد.</div></div><span className="tag blue">جلسة إدارية</span></div>
        {tab==="overview"&&<><div className="stats">{stats.map(s=>{const Icon=s.icon;return <article className="stat" key={s.label}><div className="stat-top"><span>{s.label}</span><span className="stat-icon"><Icon size={18}/></span></div><strong>{s.value}</strong><small>{s.hint}</small></article>})}</div>
          <div className="grid-two"><article className="panel"><h2>حالة التكامل</h2><div className="activity"><div className="activity-row"><span>واجهة الإدارة المستقلة</span><span className="tag blue">جاهزة مبدئياً</span></div><div className="activity-row"><span>تسجيل الدخول عبر VYRA API</span><span className="tag blue">متصل بالكود</span></div><div className="activity-row"><span>صلاحية الدعم على API</span><span className="tag">تحتاج إعداد الخادم</span></div><div className="activity-row"><span>إدارة الحظر والإشراف</span><span className="tag gray">بانتظار API آمن</span></div></div></article>
          <article className="panel"><h2>مركز الأمان</h2><div className="notice">لا يتم تنفيذ أي حظر أو تعديل حساب من الواجهة وحدها. كل إجراء إداري يجب أن يتحقق منه الخادم ويسجله مع هوية المدير والسبب والتوقيت.</div></article></div>
        </>}
        {tab==="support"&&<><div className="page-head"><div className="muted">قائمة تذاكر الدعم الواردة من مستخدمي VYRA.</div><button className="small-btn" onClick={loadTickets}>تحديث القائمة</button></div>{error&&<p className="error">{error}</p>}{loadingTickets?<div className="panel">جارٍ تحميل التذاكر...</div>:<div className="table-wrap"><table className="table"><thead><tr><th>الموضوع</th><th>صاحب الطلب</th><th>آخر رسالة</th><th>الحالة</th></tr></thead><tbody>{tickets.map(t=><tr key={t.id}><td>{t.subject}</td><td>{t.user_name||t.user_id}</td><td>{t.last_message}</td><td><span className={t.status==="closed"?"tag gray":"tag"}>{t.status==="closed"?"مغلقة":"مفتوحة"}</span></td></tr>)}{!tickets.length&&<tr><td colSpan={4}>لا توجد تذاكر ظاهرة أو أن صلاحية الدعم غير مفعّلة على الخادم.</td></tr>}</tbody></table></div>}</>}
        {["users","content","security","settings"].includes(tab)&&<article className="panel"><h2>هذه الوحدة قيد الربط الآمن</h2><div className="notice">لن تظهر أدوات الحظر أو حذف المحتوى أو تعديل الحسابات قبل إضافة نقاط API خلفية تتحقق من صلاحية المدير، وتفرض سبب الإجراء، وتكتب سجلاً غير قابل للتلاعب. لن نعرض أزراراً وهمية توحي بأن الإجراء نُفّذ.</div></article>}
      </section>
    </main>
  </div>;
}
