import { NextResponse } from "next/server"
import { portalHesapOlustur } from "@/lib/portal-auth-server"

export async function POST(request: Request) {
  try {
    const { danisanId, email, sifre } = await request.json() as {
      danisanId: string
      email: string
      sifre: string
    }
    if (!danisanId || !email?.trim() || !sifre?.trim()) {
      return NextResponse.json({ ok: false, hata: "Tüm alanlar gereklidir." }, { status: 400 })
    }
    if (sifre.length < 6) {
      return NextResponse.json({ ok: false, hata: "Şifre en az 6 karakter olmalıdır." }, { status: 400 })
    }
    portalHesapOlustur(danisanId, email, sifre)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, hata: "Sunucu hatası." }, { status: 500 })
  }
}
