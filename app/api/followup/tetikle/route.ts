import { NextResponse } from "next/server"
import {
  randevuSonrasiFollowup,
  olcumHatirlatmaFollowup,
  hareketsizDanisanFollowup,
  randevuYokFollowup,
} from "@/lib/automation-engine"
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
    const body = await request.json() as { tip: string }

    switch (body.tip) {
      case "randevu_sonrasi":
        await randevuSonrasiFollowup()
        break
      case "olcum_hatirlatma":
        await olcumHatirlatmaFollowup()
        break
      case "hareketsiz_danisan":
        await hareketsizDanisanFollowup()
        break
      case "randevu_yok":
        await randevuYokFollowup()
        break
      default:
        return NextResponse.json({ ok: false, hata: "Geçersiz tip" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Follow-up] Hata:", err)
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
