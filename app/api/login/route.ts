import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = (process.env.VYRA_API_URL || "https://vyra-api-9pxl.onrender.com").replace(/\/+$/, "");
const ADMIN = (process.env.ADMIN_EMAIL || "alza69191@gmail.com").trim().toLowerCase();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (String(email || "").trim().toLowerCase() !== ADMIN || typeof password !== "string") {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }
    const upstream = await fetch(`${API}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN, password }),
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || !data.access_token) {
      return NextResponse.json({ error: data.detail || "تعذر تسجيل الدخول." }, { status: upstream.status || 401 });
    }
    const jar = await cookies();
    jar.set("vyra_admin_session", data.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", path: "/", maxAge: Math.min(Number(data.expires_in) || 3600, 3600),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بخادم VYRA." }, { status: 502 });
  }
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get("vyra_admin_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  try {
    const upstream = await fetch(`${API}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (upstream.ok) return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false, error: "تعذر التحقق من الجلسة." }, { status: 502 });
  }
  jar.set("vyra_admin_session", "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "strict", path: "/", maxAge: 0,
  });
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
