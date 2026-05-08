import { NextResponse } from "next/server"
import { getAlarmlar, alarmlariOkuIslaretle, tumAlarmlariOku } from "@/lib/sequence-store"

export async function GET() {
  try {
    const alarmlar = getAlarmlar().slice(0, 50)
    const bekleyen = alarmlar.filter(a => !a.okundu).length
    return NextResponse.json({ ok: true, alarmlar, bekleyen })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ids?: string[]; tumunu?: boolean }
    if (body.tumunu) {
      tumAlarmlariOku()
    } else if (body.ids) {
      alarmlariOkuIslaretle(body.ids)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
