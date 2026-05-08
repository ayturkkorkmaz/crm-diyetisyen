import { NextResponse } from 'next/server'
import { wa } from '@/lib/whatsapp-singleton'

// Gelen WhatsApp mesajlarını döndür ve kuyruğu temizle
export function GET() {
  const mesajlar = [...(wa as { gelenMesajlar: { from: string; text: string; zaman: string }[] }).gelenMesajlar]
  ;(wa as { gelenMesajlar: unknown[] }).gelenMesajlar = []
  return NextResponse.json({ count: mesajlar.length, mesajlar })
}
