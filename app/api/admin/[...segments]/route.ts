import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = (process.env.VYRA_API_URL || "https://vyra-api-9pxl.onrender.com").replace(/\/+$/, "");

async function forward(request: NextRequest, segments: string[], method: string) {
  const token = (await cookies()).get("vyra_admin_session")?.value;
  if (!token) return NextResponse.json({ error: "انتهت الجلسة الإدارية." }, { status: 401 });
  if (!segments.length || segments.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) {
    return NextResponse.json({ error: "مسار غير صالح." }, { status: 400 });
  }
  const incoming = new URL(request.url);
  const target = new URL(`${API}/api/admin/${segments.map(encodeURIComponent).join("/")}`);
  target.search = incoming.search;
  try {
    const body = method === "GET" ? undefined : await request.text();
    const upstream = await fetch(target, {
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
type Context = { params: Promise<{ segments: string[] }> };
export async function GET(request: NextRequest, context: Context) { return forward(request, (await context.params).segments, "GET"); }
export async function POST(request: NextRequest, context: Context) { return forward(request, (await context.params).segments, "POST"); }
export async function PATCH(request: NextRequest, context: Context) { return forward(request, (await context.params).segments, "PATCH"); }
export async function DELETE(request: NextRequest, context: Context) { return forward(request, (await context.params).segments, "DELETE"); }
