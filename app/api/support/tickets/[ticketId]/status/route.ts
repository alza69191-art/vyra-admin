import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = (process.env.VYRA_API_URL || "https://vyra-api-9pxl.onrender.com").replace(/\/+$/, "");
type Context = { params: Promise<{ ticketId: string }> };
export async function PATCH(request: Request, context: Context) {
  const jar = await cookies();
  const token = jar.get("vyra_admin_session")?.value;
  if (!token) return NextResponse.json({ error: "انتهت الجلسة." }, { status: 401 });
  const { ticketId } = await context.params;
  const status = new URL(request.url).searchParams.get("status");
  if (!ticketId || ticketId.length > 64 || !["open", "closed"].includes(status || "")) {
    return NextResponse.json({ error: "بيانات تحديث التذكرة غير صالحة." }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${API}/api/support/tickets/${encodeURIComponent(ticketId)}/status?status=${status}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بخادم VYRA." }, { status: 502 });
  }
}
