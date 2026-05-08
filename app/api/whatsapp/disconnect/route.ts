import { NextResponse } from 'next/server'
import { disconnectWhatsApp } from '@/lib/whatsapp-singleton'

export async function POST() {
  await disconnectWhatsApp()
  return NextResponse.json({ ok: true })
}
