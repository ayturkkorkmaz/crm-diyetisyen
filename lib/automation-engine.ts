/**
 * Otomasyon motoru — yalnızca 3 mesaj tipi desteklenir:
 *   1. Su hatırlatması
 *   2. Randevu hatırlatması
 *   3. Ödeme gecikti uyarısı
 *
 * GÜVENLİK: sendWhatsAppMessage çağrısı, alıcının CRM'de kayıtlı
 * aktif bir danışan olup olmadığını otomatik olarak doğrular.
 * Kayıtsız numaralara kesinlikle mesaj gönderilmez.
 */

import { getDanisanlar, getRandevular } from "./server-store"
import { wa, sendWhatsAppMessage } from "./whatsapp-singleton"
import type { Danisan, Randevu } from "./types"

// ── Yardımcılar ───────────────────────────────────────────────────────────────

const TURKCE_AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

function bugunStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function yarinStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function neZamanIfadesi(tarih: string): string {
  const bugun = bugunStr()
  const yarin = yarinStr()
  if (tarih === bugun) return "Bugün"
  if (tarih === yarin) return "Yarın"
  const d = new Date(tarih + "T00:00:00")
  return `${d.getDate()} ${TURKCE_AYLAR_KISA[d.getMonth()]}'da`
}

function mesajOlustur(sablon: string, danisan: Danisan, randevu?: Randevu): string {
  const neZaman = randevu ? neZamanIfadesi(randevu.tarih) : "—"
  return sablon
    .replace(/{{ad}}/g, danisan.ad)
    .replace(/{{soyad}}/g, danisan.soyad)
    .replace(/{{ne_zaman}}/g, neZaman)
    .replace(/{{saat}}/g, randevu?.saat ?? "—")
    .replace(/{{tur}}/g, randevu?.tur ?? "—")
    .replace(/{{tarih}}/g, randevu?.tarih ?? "—")
    .replace(/{{diyetisyen}}/g, "Diyetisyen")
}

async function gonder(telefon: string, mesaj: string, aciklama: string) {
  try {
    await sendWhatsAppMessage(telefon, mesaj)
    console.log(`[Otomasyon] ✓ Gönderildi → ${aciklama}`)
  } catch (err) {
    console.error(`[Otomasyon] ✗ Hata → ${aciklama}:`, err)
  }
}

// ── Mesaj Şablonları ──────────────────────────────────────────────────────────

const RANDEVU_SABLON = `Merhaba {{ad}} 👋

{{ne_zaman}} saat {{saat}}'deki beslenme danışmanlığı randevunuzu hatırlatmak istedim.

⏰ Saat: {{saat}}
📋 Seans: {{tur}}

Görüşmek üzere! 🥗
Dyt. {{diyetisyen}}`

const SU_SABLON = `💧 Su saati, {{ad}}!

Günlük su hedefinizi unutmayın. Sağlıklı günler! 🌿`

const ODEME_SABLON = `Merhaba {{ad}},

Hesabınızda gecikmiş bir ödeme bulunmaktadır. Herhangi bir sorun yaşıyorsanız lütfen bize bildirin.

Teşekkürler 🙏
Dyt. {{diyetisyen}}`

// ── Otomasyon Fonksiyonları ────────────────────────────────────────────────────

/**
 * 1. RANDEVU HATIRLATMASI
 * Yarınki planlanmış randevuları kontrol eder, danışana mesaj gönderir.
 * Her gün 20:00'de çalışır.
 */
export async function randevuHatirlatma() {
  if (wa.state !== "connected") {
    console.log("[Otomasyon] WhatsApp bağlı değil, randevu hatırlatma atlandı.")
    return
  }

  const danisanlar = getDanisanlar()
  const randevular = getRandevular()
  const hedefler = randevular.filter(r => r.tarih === yarinStr() && r.durum === "planlandi")

  if (hedefler.length === 0) {
    console.log("[Otomasyon] Yarın için randevu yok.")
    return
  }

  for (const rdv of hedefler) {
    const danisan = danisanlar.find(d => d.id === rdv.danisan_id)
    if (!danisan?.telefon) continue
    const mesaj = mesajOlustur(RANDEVU_SABLON, danisan, rdv)
    await gonder(danisan.telefon, mesaj, `${danisan.ad} ${danisan.soyad} – randevu hatırlatma`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * 2. SU HATIRLATMASI
 * Yalnızca aktif danışanlara su içme hatırlatması gönderir.
 * Her gün 09:00, 12:00, 15:00, 18:00'de çalışır.
 */
export async function suHatirlatma() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const aktifler = danisanlar.filter(d => d.durum === "aktif" && d.telefon)

  for (const d of aktifler) {
    const mesaj = mesajOlustur(SU_SABLON, d)
    await gonder(d.telefon!, mesaj, `${d.ad} ${d.soyad} – su hatırlatma`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * 3. ÖDEME GECİKTİ UYARISI
 * Ödemesi geciken danışanlara uyarı gönderir.
 * Cron veya manuel tetikleme ile çalışır.
 */
export async function odemGeciktiUyari(danisanId: string) {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const danisan = danisanlar.find(d => d.id === danisanId)
  if (!danisan?.telefon) return

  const mesaj = mesajOlustur(ODEME_SABLON, danisan)
  await gonder(danisan.telefon, mesaj, `${danisan.ad} ${danisan.soyad} – ödeme gecikti`)
}
