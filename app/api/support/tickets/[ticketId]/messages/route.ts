import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = (process.env.VYRA_API_URL || "https://vyra-api-9pxl.onrender.com").replace(/\/+$/, "");
type Context = { params: Promise<{ ticketId: string }> };
async function proxy(request: Request, context: Context, method: "GET" | "POST") {
  const jar = await cookies();
  const token = jar.get("vyra_admin_session")?.value;
  if (!token) return NextResponse.json({ error: "انتهت الجلسة." }, { status: 401 });
  const { ticketId } = await context.params;
  if (!ticketId || ticketId.length > 64) return NextResponse.json({ error: "معرّف التذكرة غير صالح." }, { status: 400 });
  try {
    const body = method === "POST" ? await request.text() : undefined;
    const upstream = await fetch(`${API}/api/support/tickets/${encodeURIComponent(ticketId)}/messages`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بخادم VYRA." }, { status: 502 });
  }
}
export async function GET(request: Request, context: Context) { return proxy(request, context, "GET"); }
export async function POST(request: Request, context: Context) { return proxy(request, context, "POST"); }
