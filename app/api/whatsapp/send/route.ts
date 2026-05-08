import { NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp-singleton'

export async function POST(request: Request) {
  const { to, message } = await request.json() as { to: string; message: string }

  if (!to || !message) {
    return NextResponse.json({ ok: false, error: 'to ve message zorunlu' }, { status: 400 })
  }

  try {
    await sendWhatsAppMessage(to, message)
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bilinmeyen hata'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
