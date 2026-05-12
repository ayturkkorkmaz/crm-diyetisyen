import makeWASocket, {
  DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import { getDanisanlar } from './server-store'

type WaState = 'disconnected' | 'connecting' | 'connected'

interface WaSingleton {
  socket: ReturnType<typeof makeWASocket> | null
  state: WaState
  qr: string | null
}

const g = globalThis as Record<string, unknown>
if (!g.__wa) {
  g.__wa = { socket: null, state: 'disconnected', qr: null } satisfies WaSingleton
}

export const wa = g.__wa as WaSingleton

export async function connectWhatsApp() {
  if (wa.state === 'connected' || wa.state === 'connecting') return

  wa.state = 'connecting'
  wa.qr = null

  const authFolder = path.join(process.cwd(), '.wa-auth')
  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: {
      level: 'silent', trace: () => {}, debug: () => {}, info: () => {},
      warn: () => {}, error: () => {}, child: () => ({
        level: 'silent', trace: () => {}, debug: () => {}, info: () => {},
        warn: () => {}, error: () => {}, child: () => ({} as never),
      }),
    } as never,
  })

  wa.socket = sock
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      wa.qr = qr
      wa.state = 'connecting'
    }
    if (connection === 'open') {
      wa.state = 'connected'
      wa.qr = null
      console.log('[WhatsApp] Bağlandı')
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      wa.state = 'disconnected'
      wa.socket = null
      if (shouldReconnect) {
        connectWhatsApp()
      }
    }
  })
}

export async function disconnectWhatsApp() {
  if (wa.socket) {
    await wa.socket.logout()
  }
  wa.socket = null
  wa.state = 'disconnected'
  wa.qr = null
}

/**
 * Mesaj gönderir.
 * GÜVENLİK: Alıcı telefon numarası CRM'de kayıtlı aktif bir danışana ait olmalıdır.
 * Kayıtsız numaralara kesinlikle mesaj gönderilmez.
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  if (!wa.socket || wa.state !== 'connected') {
    throw new Error('WhatsApp bağlı değil')
  }

  const digits = to.replace(/\D/g, '')

  // ── Güvenlik Kontrolü ──────────────────────────────────────────────────────
  const danisanlar = getDanisanlar()
  const kayitliMi = danisanlar.some(d => {
    if (!d.telefon) return false
    const dDigits = d.telefon.replace(/\D/g, '')
    // Son 10 hane karşılaştırması (ülke kodu farkları için)
    return dDigits.slice(-10) === digits.slice(-10)
  })

  if (!kayitliMi) {
    console.warn(`[WhatsApp] BLOKE: ${to} numarası CRM'de kayıtlı değil. Mesaj gönderilmedi.`)
    throw new Error('Bu numara sistemde kayıtlı bir danışana ait değil. Güvenlik kuralı gereği mesaj gönderilemez.')
  }
  // ──────────────────────────────────────────────────────────────────────────

  const jid = `${digits}@s.whatsapp.net`
  await wa.socket.sendMessage(jid, { text: message })
}
