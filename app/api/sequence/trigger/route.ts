import { NextResponse } from "next/server"
import { tetikleNoShow, tetiklePaketBitiyor } from "@/lib/sequence-triggers"
import { sequenceAdimlariniCalistir } from "@/lib/sequence-runner"

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      event: string
      danisanId: string
      danisanAd: string
    }

    switch (body.event) {
      case "no_show":
        await tetikleNoShow(body.danisanId, body.danisanAd)
        // Anlık adımı hemen çalıştır (offset=0 olanlar)
        await sequenceAdimlariniCalistir()
        break
      case "paket_bitiyor":
        await tetiklePaketBitiyor(body.danisanId, body.danisanAd)
        break
      default:
        return NextResponse.json({ ok: false, hata: "Geçersiz event" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Sequence Trigger] Hata:", err)
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
