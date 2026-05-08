import { NextResponse } from 'next/server'
import { connectWhatsApp, wa } from '@/lib/whatsapp-singleton'

export async function POST() {
  await connectWhatsApp()
  return NextResponse.json({ state: wa.state })
}
