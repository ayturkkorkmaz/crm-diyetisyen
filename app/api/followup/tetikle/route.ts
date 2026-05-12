import { NextResponse } from "next/server"
import { randevuHatirlatma, suHatirlatma, odemGeciktiUyari } from "@/lib/automation-engine"
import { getFollowupLog } from "@/lib/followup-store"

export async function GET() {
  try {
    const log = getFollowupLog().slice(0, 50)
    return NextResponse.json({ ok: true, log })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { tip: string; danisanId?: string }

    switch (body.tip) {
      case "randevu_hatirlatma":
        await randevuHatirlatma()
        break
      case "su_hatirlatma":
        await suHatirlatma()
        break
      case "odeme_gecikti":
        if (!body.danisanId) {
          return NextResponse.json({ ok: false, hata: "danisanId zorunlu" }, { status: 400 })
        }
        await odemGeciktiUyari(body.danisanId)
        break
      default:
        return NextResponse.json({ ok: false, hata: "Geçersiz tip" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Otomasyon] Hata:", err)
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
