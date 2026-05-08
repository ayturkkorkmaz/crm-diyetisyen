import { NextResponse } from "next/server"
import { getWaGonderimler, updateWaGonderim } from "@/lib/server-portal-store"

// WhatsApp'tan gelen ve danışanla eşleşen gönderimler
export function GET() {
  const gonderimler = getWaGonderimler()
  return NextResponse.json(gonderimler)
}

// Yorum ekle veya onaylama güncelle
export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json() as { id: string; [k: string]: unknown }
    updateWaGonderim(id, updates)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
