import { NextResponse } from 'next/server'
import { wa } from '@/lib/whatsapp-singleton'
import QRCode from 'qrcode'

export async function GET() {
  let qrImage: string | null = null
  if (wa.qr) {
    qrImage = await QRCode.toDataURL(wa.qr, { width: 256, margin: 2 })
  }
  return NextResponse.json({ state: wa.state, qr: qrImage })
}
