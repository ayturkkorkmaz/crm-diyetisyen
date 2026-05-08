import { NextResponse } from "next/server"
import { getGorevler, gorevGuncelle, gorevEkle } from "@/lib/sequence-store"
import type { GorevDurum, GorevOnceligi } from "@/lib/sequence-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const durum = searchParams.get("durum") as GorevDurum | null
    let gorevler = getGorevler()
    if (durum) gorevler = gorevler.filter(g => g.durum === durum)
    gorevler = gorevler.sort((a, b) => b.olusturulduAt.localeCompare(a.olusturulduAt))
    return NextResponse.json({ ok: true, gorevler })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      aksiyon: "tamamla" | "ekle"
      id?: string
      gorev?: {
        danisanId?: string
        baslik: string
        aciklama?: string
        oncelik: GorevOnceligi
        kaynak: string
      }
    }

    if (body.aksiyon === "tamamla" && body.id) {
      gorevGuncelle(body.id, {
        durum: "tamamlandi",
        tamamlandiAt: new Date().toISOString(),
      })
    } else if (body.aksiyon === "ekle" && body.gorev) {
      gorevEkle({ ...body.gorev, durum: "bekliyor" })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
