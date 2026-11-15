"use client";
import { useEffect, useState } from "react";
import { Activity, Bell, FileText, LayoutDashboard, LogOut, MessageSquare, Shield, Users, Settings, LockKeyhole, RefreshCw, Ban, CheckCircle2, Trash2, Send, ClipboardList, Video, ExternalLink } from "lucide-react";

const menu = [
  { id:"overview", label:"نظرة عامة", icon:LayoutDashboard },
  { id:"support", label:"الدعم الفني", icon:MessageSquare },
  { id:"users", label:"إدارة الحسابات", icon:Users },
  { id:"content", label:"مراجعة المنشورات", icon:FileText },
  { id:"reels", label:"قائمة الريلز", icon:Video },
  { id:"audit", label:"سجل الإجراءات", icon:ClipboardList },
  { id:"security", label:"الأمان", icon:Shield },
];
type Row = Record<string, any>;

export default function Home() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [logged,setLogged]=useState(false);
  const [tab,setTab]=useState("overview");
  const [overview,setOverview]=useState<Row>({});
  const [tickets,setTickets]=useState<Row[]>([]);
  const [users,setUsers]=useState<Row[]>([]);
  const [posts,setPosts]=useState<Row[]>([]);
  const [reels,setReels]=useState<Row[]>([]);
  const [audit,setAudit]=useState<Row[]>([]);
  const [selectedTicket,setSelectedTicket]=useState<Row|null>(null);
  const [ticketMessages,setTicketMessages]=useState<Row[]>([]);
  const [reply,setReply]=useState("");
  const [loading,setLoading]=useState(false);

  async function api(path:string, method="GET", body?:Row) {
    const r=await fetch(path,{method,headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined,cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.detail||d.error||"تعذر تنفيذ الطلب");
    return d;
  }
  async function login(e:React.FormEvent) {
    e.preventDefault();setBusy(true);setError("");
    try { await api("/api/login","POST",{email,password});setLogged(true);setPassword(""); }
    catch(err:any){setError(err.message||"تعذر تسجيل الدخول");}
    finally{setBusy(false);}
  }
  async function loadTab(id=tab) {
    setLoading(true);setError("");setNotice("");
    try {
      if(id==="overview") setOverview(await api("/api/admin/overview"));
      if(id==="support") setTickets(await api("/api/support/tickets"));
      if(id==="users") setUsers(await api("/api/admin/users"));
      if(id==="content") setPosts(await api("/api/admin/posts"));
      if(id==="reels") setReels(await api("/api/admin/reels"));
      if(id==="audit") setAudit(await api("/api/admin/audit"));
    } catch(err:any){setError(err.message||"تعذر تحميل البيانات");}
    finally{setLoading(false);}
  }
  useEffect(()=>{if(logged) void loadTab(tab);},[logged,tab]);
  useEffect(()=>{if(!logged||tab!=="support")return;const timer=setInterval(()=>{api("/api/support/tickets").then(setTickets).catch(()=>undefined);if(selectedTicket){api(`/api/support/tickets/${selectedTicket.id}/messages`).then(setTicketMessages).catch(()=>undefined)}},12000);return()=>clearInterval(timer)},[logged,tab,selectedTicket?.id]);
  async function changeTab(id:string){setTab(id);setSelectedTicket(null);}
  async function logout(){await fetch("/api/logout",{method:"POST"});setLogged(false);setTab("overview");}
  async function openTicket(t:Row){
    setSelectedTicket(t);setError("");
    try{setTicketMessages(await api(`/api/support/tickets/${t.id}/messages`));}
    catch(err:any){setError(err.message);}
  }
  async function sendReply(){
    if(!selectedTicket||!reply.trim())return;
    try{
      await api(`/api/support/tickets/${selectedTicket.id}/messages`,"POST",{message:reply.trim()});
      setReply("");setTicketMessages(await api(`/api/support/tickets/${selectedTicket.id}/messages`));
      await loadTab("support");
      setNotice("تم إرسال الرد.");
    }catch(err:any){setError(err.message);}
  }
  async function ticketStatus(t:Row,status:string){
    try{await api(`/api/support/tickets/${t.id}/status?status=${status}`,"PATCH");setSelectedTicket({...t,status});await loadTab("support");setNotice("تم تحديث حالة التذكرة.");}
    catch(err:any){setError(err.message);}
  }
  async function suspendUser(u:Row,is_active:boolean){
    const reason=window.prompt(is_active?"سبب إعادة تفعيل الحساب:":"سبب إيقاف الحساب:");
    if(!reason||reason.trim().length<5)return;
    try{await api(`/api/admin/users/${u.id}/status`,"PATCH",{is_active,reason});await loadTab("users");setNotice("تم تحديث حالة الحساب وتسجيل الإجراء.");}
    catch(err:any){setError(err.message);}
  }
  async function removeItem(kind:"posts",item:Row){
    const reason=window.prompt("اكتب سبب الإزالة (5 أحرف على الأقل):");
    if(!reason||reason.trim().length<5)return;
    try{await api(`/api/admin/${kind}/${item.id}`,"DELETE",{reason});await loadTab(tab==="reels"?"reels":"content");setNotice("تمت الإزالة وتسجيل الإجراء.");}
    catch(err:any){setError(err.message);}
  }

  if(!logged) return <main className="login-wrap"><form className="login-card" onSubmit={login}>
    <div className="brand"><img className="brand-logo" src="/brand/vyra-logo.svg" alt="VYRA" /><span>VYRA <b>ADMIN</b></span></div>
    <h1>بوابة الإدارة</h1><p className="muted">دخول إداري مخصص، والتحقق يتم من خادم VYRA.</p>
    <div className="field"><label>البريد الإداري</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required /></div>
    <div className="field"><label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></div>
    {error&&<p className="error">{error}</p>}
    <button className="primary" disabled={busy}>{busy?"جارٍ التحقق...":"تسجيل الدخول الآمن"}</button>
    <p className="muted" style={{marginTop:18,fontSize:12,display:"flex",gap:7,alignItems:"center"}}><LockKeyhole size={14}/> الجلسة محفوظة في ملف ارتباط HttpOnly.</p>
  </form></main>;

  const title=menu.find(x=>x.id===tab)?.label||"نظرة عامة";
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><img className="brand-logo" src="/brand/vyra-logo.svg" alt="VYRA" /><span>VYRA ADMIN</span></div>
      <div><div className="side-label">مساحة الإدارة</div><nav className="nav">{menu.map(item=>{const Icon=item.icon;return <button key={item.id} className={tab===item.id?"active":""} onClick={()=>changeTab(item.id)}><Icon size={18}/><span>{item.label}</span></button>})}</nav></div>
      <div><div className="side-label">النظام</div><nav className="nav"><button onClick={()=>changeTab("security")}><Settings size={18}/><span>الإعدادات والأمان</span></button><button onClick={logout}><LogOut size={18}/><span>تسجيل الخروج</span></button></nav></div>
      <div className="side-foot">VYRA ADMIN · لوحة مستقلة<br/>صلاحيات مفروضة من الخادم</div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="topbar-title">{title}</div><div className="admin-chip"><span className="admin-live"><i/> متصل</span><span>مدير النظام</span><div className="avatar">A</div></div></header>
      <section className="content">
        <div className="page-head"><div><h1>{tab==="overview"?"مركز التحكم والإشراف":title}</h1><div className="muted">إدارة VYRA ومتابعة العمليات من لوحة واحدة.</div></div><button className="small-btn" onClick={()=>loadTab()}><RefreshCw size={15}/> تحديث</button></div>
        {error&&<p className="error">{error}</p>}{notice&&<p className="success">{notice}</p>}
        {loading&&<div className="panel">جارٍ تحميل البيانات...</div>}
        {tab==="overview"&&!loading&&<><div className="stats">{[
          ["إجمالي الحسابات",overview.users],["الحسابات النشطة",overview.active_users],["المنشورات",overview.posts],["تذاكر الدعم المفتوحة",overview.open_tickets]
        ].map(([label,value])=><article className="stat" key={String(label)}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Activity size={18}/></span></div><strong>{value??"—"}</strong><small>إحصاءات مباشرة من قاعدة بيانات VYRA</small></article>)}</div>
        <div className="panel"><h2>حالة النظام</h2><div className="activity"><div className="activity-row"><span>تسجيل الدخول والتحقق الإداري</span><span className="tag blue">مفعّل</span></div><div className="activity-row"><span>الدعم والرد على التذاكر</span><span className="tag blue">متصل</span></div><div className="activity-row"><span>إدارة الحسابات والمحتوى</span><span className="tag blue">متصل</span></div><div className="activity-row"><span>سجل التدقيق</span><span className="tag blue">مفعّل</span></div></div></div></>}
        {tab==="support"&&!loading&&<div className="grid-two"><div className="table-wrap"><table className="table"><thead><tr><th>الموضوع</th><th>المستخدم</th><th>الحالة</th><th>فتح</th></tr></thead><tbody>{tickets.map(t=><tr key={t.id}><td>{t.subject}</td><td>{t.user_name||t.user_id}</td><td>{t.status}</td><td><button className="small-btn" onClick={()=>openTicket(t)}>عرض</button></td></tr>)}{!tickets.length&&<tr><td colSpan={4}>لا توجد تذاكر حالياً.</td></tr>}</tbody></table></div>
        {selectedTicket&&<article className="panel"><h2>{selectedTicket.subject}</h2><p className="muted">رقم التذكرة: {selectedTicket.id}</p><div className="ticket-messages">{ticketMessages.map(m=><div className="notice" key={m.id}><b>{m.sender_role==="support"?"الدعم":"المستخدم"}</b><p>{m.message}</p><small>{String(m.created_at||"")}</small></div>)}</div><textarea className="reply-box" value={reply} onChange={e=>setReply(e.target.value)} placeholder="اكتب رد الدعم..." rows={4}/><button className="primary" onClick={sendReply}><Send size={16}/> إرسال الرد</button><button className="small-btn" onClick={()=>ticketStatus(selectedTicket,selectedTicket.status==="closed"?"open":"closed")}>{selectedTicket.status==="closed"?"إعادة فتح التذكرة":"إغلاق التذكرة"}</button></article>}</div>}
        {tab==="users"&&!loading&&<div className="table-wrap"><table className="table"><thead><tr><th>الاسم</th><th>البريد</th><th>تاريخ الإنشاء</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.display_name||u.username||"—"}</td><td>{u.email}</td><td>{String(u.created_at||"").slice(0,10)}</td><td>{u.is_active?"نشط":"موقوف"}</td><td><button className="small-btn" onClick={()=>suspendUser(u,!u.is_active)}>{u.is_active?<><Ban size={14}/> إيقاف</>:<><CheckCircle2 size={14}/> تفعيل</>}</button></td></tr>)}</tbody></table></div>}
        {tab==="content"&&!loading&&<div className="table-wrap"><table className="table"><thead><tr><th>الكاتب</th><th>المحتوى</th><th>الظهور</th><th>الإجراء</th></tr></thead><tbody>{posts.map(p=><tr key={p.id}><td>{p.author_name}</td><td className="clip">{p.body||"وسائط"}</td><td>{p.visibility}</td><td><button className="small-btn danger-btn" onClick={()=>removeItem("posts",p)}><Trash2 size={14}/> إزالة</button></td></tr>)}</tbody></table></div>}
        {tab==="reels"&&!loading&&<div className="table-wrap"><table className="table"><thead><tr><th>الناشر</th><th>الوصف</th><th>عدد الفيديوهات</th><th>الفيديو</th><th>التاريخ</th><th>الإجراء</th></tr></thead><tbody>{reels.map(item=><tr key={item.id}><td>{item.author_name||"عضو"}</td><td className="clip">{item.body||"فيديو بدون وصف"}</td><td>{Array.isArray(item.media)?item.media.length:0}</td><td>{item.media?.[0]?.url?<a href={item.media[0].url} target="_blank" rel="noreferrer" className="small-btn"><ExternalLink size={13}/> فتح الفيديو</a>:"—"}</td><td>{String(item.created_at||"").slice(0,10)}</td><td><button className="small-btn danger-btn" onClick={()=>removeItem("posts",item)}><Trash2 size={14}/> إزالة</button></td></tr>)}</tbody></table></div>}

        {tab==="audit"&&!loading&&<div className="table-wrap"><table className="table"><thead><tr><th>الإجراء</th><th>النوع</th><th>المعرّف</th><th>السبب</th><th>التاريخ</th></tr></thead><tbody>{audit.map(a=><tr key={a.id}><td>{a.action}</td><td>{a.target_type}</td><td>{a.target_id}</td><td>{a.reason}</td><td>{String(a.created_at||"").slice(0,19).replace("T"," ")}</td></tr>)}</tbody></table></div>}
        {tab==="security"&&!loading&&<article className="panel"><h2>ضوابط الحماية</h2><div className="activity"><div className="activity-row"><span>التحقق من هوية المدير على الخادم</span><span className="tag blue">مفعّل</span></div><div className="activity-row"><span>ملف ارتباط الجلسة HttpOnly</span><span className="tag blue">مفعّل</span></div><div className="activity-row"><span>منع الوصول من الواجهة وحدها</span><span className="tag blue">مفعّل</span></div><div className="activity-row"><span>سبب إلزامي لإجراءات الإشراف</span><span className="tag blue">مفعّل</span></div><div className="activity-row"><span>سجل تدقيق للإجراءات الإدارية</span><span className="tag blue">مفعّل</span></div></div><div className="notice">لا توجد مفاتيح API في المتصفح. جميع عمليات الإدارة تمر عبر الخادم وتُرفض إذا لم تتطابق هوية المدير المصرح بها.</div></article>}
      </section>
    </main>
  </div>;
}
