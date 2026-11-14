import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const API=(process.env.VYRA_API_URL||"https://vyra-api-9pxl.onrender.com").replace(/\/+$/,"");
export async function GET() {
  const jar=await cookies(); const token=jar.get("vyra_admin_session")?.value;
  if(!token) return NextResponse.json({error:"انتهت الجلسة."},{status:401});
  try {
    const upstream=await fetch(`${API}/api/support/tickets`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
    const data=await upstream.json().catch(()=>({}));
    return NextResponse.json(data,{status:upstream.status});
  } catch { return NextResponse.json({error:"تعذر الاتصال بخادم VYRA."},{status:502}); }
}
