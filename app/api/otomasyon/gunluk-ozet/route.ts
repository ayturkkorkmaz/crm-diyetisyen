import { NextResponse } from "next/server"
import { gunlukOzetGonder } from "@/lib/automation-engine"

export async function POST(request: Request) {
  try {
    const { adminTelefon } = await request.json() as { adminTelefon: string }
    if (!adminTelefon) {
      return NextResponse.json({ ok: false, hata: "adminTelefon gerekli" }, { status: 400 })
    }
    await gunlukOzetGonder(adminTelefon)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, hata: String(err) }, { status: 500 })
  }
}
