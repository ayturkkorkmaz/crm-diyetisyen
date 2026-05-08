import { NextResponse } from "next/server"
import {
  getDanisanLoyalty, getTumLoyalty, puanEkle,
} from "@/lib/loyalty-store"
import type { EylemTuru } from "@/lib/loyalty-definitions"

// GET /api/loyalty?danisanId=xxx  → tek danışan
// GET /api/loyalty                → tüm danışanlar (CRM)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const danisanId = searchParams.get("danisanId")

    if (danisanId) {
      const data = getDanisanLoyalty(danisanId)
      return NextResponse.json({ ok: true, ...data })
    }

    const tumler = getTumLoyalty()
    return NextResponse.json({ ok: true, tumler })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}

// POST /api/loyalty
// Body: { danisanId: string; tip: EylemTuru; notlar?: string }
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      danisanId: string
      tip: EylemTuru
      notlar?: string
    }

    if (!body.danisanId || !body.tip) {
      return NextResponse.json(
        { ok: false, hata: "danisanId ve tip zorunlu" },
        { status: 400 }
      )
    }

    const sonuc = puanEkle(body.danisanId, body.tip, body.notlar)
    return NextResponse.json({ ok: true, sonuc })
  } catch (err) {
    console.error("[Loyalty API]", err)
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
