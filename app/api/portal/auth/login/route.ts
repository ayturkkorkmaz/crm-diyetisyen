import { NextResponse } from "next/server"
import { portalGiris } from "@/lib/portal-auth-server"

export async function POST(request: Request) {
  try {
    const { email, sifre } = await request.json() as { email: string; sifre: string }
    if (!email?.trim() || !sifre?.trim()) {
      return NextResponse.json({ ok: false, hata: "E-posta ve şifre gereklidir." }, { status: 400 })
    }

    const token = portalGiris(email, sifre)
    if (!token) {
      return NextResponse.json({ ok: false, hata: "E-posta veya şifre hatalı." }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set("portal_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
    return response
  } catch {
    return NextResponse.json({ ok: false, hata: "Sunucu hatası." }, { status: 500 })
  }
}
