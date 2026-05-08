import makeWASocket, {
  DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion,
  downloadMediaMessage,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import { yemekAnalizEt, besinMesajiOlustur } from './food-analyzer'
import { getDanisanlar } from './server-store'
import { addWaGonderim } from './server-portal-store'

type WaState = 'disconnected' | 'connecting' | 'connected'

export interface GelenMesaj {
  from: string
  text: string
  zaman: string
}

interface WaSingleton {
  socket: ReturnType<typeof makeWASocket> | null
  state: WaState
  qr: string | null
  gelenMesajlar: GelenMesaj[]
}

const g = globalThis as Record<string, unknown>
if (!g.__wa) {
  g.__wa = { socket: null, state: 'disconnected', qr: null, gelenMesajlar: [] } satisfies WaSingleton
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
      console.log('[WhatsApp] Bağlandı — yemek fotoğrafı analizi aktif')
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

  // ── Gelen mesajları dinle ─────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // Sadece yeni gelen gerçek mesajlar
    if (type !== 'notify') return

    for (const msg of messages) {
      // Kendi gönderdiğimiz mesajları atla
      if (msg.key.fromMe) continue

      const from = msg.key.remoteJid
      if (!from) continue

      // Tüm gelen mesajları kuyruğa ekle (bildirim için)
      const imageMsg = msg.message?.imageMessage
      const textContent =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        (imageMsg ? '[Fotoğraf]' : null)
      if (textContent) {
        ;(wa as WaSingleton).gelenMesajlar.push({ from, text: textContent, zaman: new Date().toISOString() })
      }

      // Danışana eşleştirip CRM'e kaydet
      if (textContent) {
        try {
          const fromDigits = from.replace('@s.whatsapp.net', '').replace(/\D/g, '')
          const danisanlar = getDanisanlar()
          const danisan = danisanlar.find(d => {
            if (!d.telefon) return false
            const dd = d.telefon.replace(/\D/g, '')
            return fromDigits.endsWith(dd) || dd.endsWith(fromDigits) || fromDigits === dd
          })
          if (danisan) {
            addWaGonderim({
              id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              danisanId: danisan.id,
              danisanAd: `${danisan.ad} ${danisan.soyad}`,
              from,
              tur: imageMsg ? 'fotograf' : 'mesaj',
              deger: textContent,
              zaman: new Date().toISOString(),
              onaylandi: false,
            })
            console.log(`[CRM] Mesaj eşleşti → ${danisan.ad} ${danisan.soyad}`)
          }
        } catch (e) {
          console.error('[CRM] Danışan eşleştirme hatası:', e)
        }
      }

      if (!imageMsg) continue

      console.log(`[YemekAI] ${from} adresinden yemek fotoğrafı geldi`)

      try {
        // "Analiz ediyorum..." mesajı gönder
        await sock.sendMessage(from, {
          text: '🔍 Yemeğiniz analiz ediliyor...',
        })

        // Görseli indir
        const buffer = await downloadMediaMessage(msg, 'buffer', {}) as Buffer

        // HuggingFace ile analiz et
        const analiz = await yemekAnalizEt(buffer)

        if (!analiz) {
          await sock.sendMessage(from, {
            text: '❌ Yemek tespit edilemedi. Lütfen daha net bir fotoğraf gönderin.',
          })
          continue
        }

        // Besin değerlerini gönder
        const yanit = besinMesajiOlustur(analiz)
        await sock.sendMessage(from, { text: yanit })

        console.log(`[YemekAI] Analiz tamamlandı: ${analiz.yemek} (%${analiz.guven})`)
      } catch (err) {
        const mesaj = err instanceof Error ? err.message : 'Bilinmeyen hata'
        console.error('[YemekAI] Hata:', mesaj)

        await sock.sendMessage(from, {
          text: `⚠️ Analiz sırasında hata oluştu: ${mesaj}`,
        }).catch(() => {})
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

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!wa.socket || wa.state !== 'connected') {
    throw new Error('WhatsApp bağlı değil')
  }
  const digits = to.replace(/\D/g, '')
  const jid = `${digits}@s.whatsapp.net`
  await wa.socket.sendMessage(jid, { text: message })
}
