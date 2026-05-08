/**
 * Otomasyon motoru — cron job'lar bu fonksiyonları çağırır.
 * Sunucu tarafında çalışır, Baileys üzerinden mesaj gönderir.
 */

import { getDanisanlar, getRandevular, getOlcumler } from "./server-store"
import { gonderildiMi, sonGunIcinde, kaydetGonderim } from "./followup-store"
import type { FollowupTip } from "./followup-store"
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
    .replace(/{{sure}}/g, "—")
    .replace(/{{tutar}}/g, "—")
    .replace(/{{kalori}}/g, "—")
    .replace(/{{su}}/g, "—")
}

async function gonder(telefon: string, mesaj: string, aciklama: string) {
  try {
    await sendWhatsAppMessage(telefon, mesaj)
    console.log(`[Otomasyon] ✓ Gönderildi → ${aciklama}`)
  } catch (err) {
    console.error(`[Otomasyon] ✗ Hata → ${aciklama}:`, err)
  }
}

// ── Otomasyon Sablonları ───────────────────────────────────────────────────────

const RANDEVU_SABLON = `Merhaba {{ad}} 👋

{{ne_zaman}} saat {{saat}}'deki beslenme danışmanlığı randevunuzu hatırlatmak istedim.

⏰ Saat: {{saat}}
📋 Seans: {{tur}}

Görüşmek üzere! 🥗
Dyt. {{diyetisyen}}`

const MOTIVASYON_SABLON = `Günaydın {{ad}}! ☀️

Yeni haftaya enerjik başlayalım! 💪

Soruların için her zaman buradayım.
Dyt. {{diyetisyen}} 🥗`

const SU_SABLON = `💧 Su saati, {{ad}}!

Günlük su hedefinizi unutmayın. Portale girerek ne kadar içtiğinizi işaretleyebilirsiniz.

Sağlıklı günler! 🌿`

const TARTI_SABLON = `⚖️ Tartı günü geldi, {{ad}}!

Sabah aç karnına ve tuvaletten sonra tartılıp kilonu portale girer misin?

Ben de senin ilerlemenle birlikte takip ediyorum 🎯`

// ── Otomasyon Fonksiyonları ────────────────────────────────────────────────────

/**
 * Yarınki randevuları kontrol edip hatırlatma mesajı gönderir.
 * Her gün 09:00 ve 20:00'de çalışır.
 */
export async function randevuHatirlatma() {
  if (wa.state !== "connected") {
    console.log("[Otomasyon] WhatsApp bağlı değil, randevu hatırlatma atlandı.")
    return
  }

  const danisanlar = getDanisanlar()
  const randevular = getRandevular()

  // Yarınki planlanmış randevular
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
  }
}

/**
 * Bugünkü randevulara 1 saat kala hatırlatma.
 * Her saat başı çalışır, o saatte randevusu olanları gönderir.
 */
export async function randevuBugunHatirlatma() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const randevular = getRandevular()

  const simdi = new Date()
  const birSaatSonra = new Date(simdi.getTime() + 60 * 60 * 1000)
  const hedefSaat = `${String(birSaatSonra.getHours()).padStart(2, "0")}:${String(birSaatSonra.getMinutes()).padStart(2, "0")}`

  // Bugün, 1 saat sonra randevusu olanlar
  const hedefler = randevular.filter(r =>
    r.tarih === bugunStr() &&
    r.saat === hedefSaat &&
    r.durum === "planlandi"
  )

  for (const rdv of hedefler) {
    const danisan = danisanlar.find(d => d.id === rdv.danisan_id)
    if (!danisan?.telefon) continue
    const mesaj = mesajOlustur(RANDEVU_SABLON, danisan, rdv)
    await gonder(danisan.telefon, mesaj, `${danisan.ad} ${danisan.soyad} – 1 saat öncesi`)
  }
}

/**
 * Tüm aktif danışanlara haftalık motivasyon mesajı.
 * Her Pazartesi 08:30'da çalışır.
 */
export async function motivasyonGonder() {
  if (wa.state !== "connected") {
    console.log("[Otomasyon] WhatsApp bağlı değil, motivasyon mesajı atlandı.")
    return
  }

  const danisanlar = getDanisanlar()
  const aktifler = danisanlar.filter(d => d.durum === "aktif" && d.telefon)

  for (const d of aktifler) {
    const mesaj = mesajOlustur(MOTIVASYON_SABLON, d)
    await gonder(d.telefon!, mesaj, `${d.ad} ${d.soyad} – motivasyon`)
    // Spam önlemi: mesajlar arası 2 saniye bekle
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * Tüm aktif danışanlara su hatırlatma.
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
 * Günlük özet mesajı — diyetisyenin kendi numarasına gider.
 * Bugünkü randevular ve aktif danışan sayısını içerir.
 */
export async function gunlukOzetGonder(adminTelefon: string) {
  if (wa.state !== "connected") {
    console.log("[Otomasyon] WhatsApp bağlı değil, günlük özet atlandı.")
    return
  }

  const danisanlar = getDanisanlar()
  const randevular = getRandevular()

  const bugunRdv = randevular
    .filter(r => r.tarih === bugunStr() && r.durum === "planlandi")
    .sort((a, b) => a.saat.localeCompare(b.saat))

  const aktifSayi = danisanlar.filter(d => d.durum === "aktif").length

  const tarihStr = new Date().toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long",
  })

  let ozet = `🌅 *Günaydın! Bugünkü özetiniz:*\n\n`
  ozet += `📅 ${tarihStr}\n\n`

  if (bugunRdv.length === 0) {
    ozet += `📋 Bugün randevu planlanmamış.\n\n`
  } else {
    ozet += `📋 *Bugünkü Randevular (${bugunRdv.length} adet):*\n`
    for (const rdv of bugunRdv) {
      const d = danisanlar.find(x => x.id === rdv.danisan_id)
      if (d) {
        const not = rdv.notlar ? ` — _${rdv.notlar.slice(0, 40)}${rdv.notlar.length > 40 ? "…" : ""}_` : ""
        ozet += `  ⏰ ${rdv.saat} → ${d.ad} ${d.soyad} (${rdv.tur})${not}\n`
      }
    }
    ozet += "\n"
  }

  ozet += `👥 Aktif danışan: *${aktifSayi}* kişi\n\n`
  ozet += `İyi çalışmalar! 🥗`

  await gonder(adminTelefon, ozet, "Admin günlük özet")
}

// ── Follow-up Şablonları ──────────────────────────────────────────────────────

const RANDEVU_SONRASI_SABLON = `Merhaba {{ad}} 👋

Dünkü seanstan sonra nasıl hissediyorsunuz?

Kafanızda takılan bir soru veya paylaşmak istediğiniz bir şey varsa her zaman yazabilirsiniz. 🌿

Dyt. {{diyetisyen}}`

const HAREKETSIZ_SABLON = `Merhaba {{ad}}! 🌼

Bir süredir haber alamadım, nasılsınız?

Programınıza devam ediyor musunuz? Sormak istediğiniz bir şey varsa veya zor bir dönemde hissediyorsanız buraya yazabilirsiniz 💪

Dyt. {{diyetisyen}}`

const OLCUM_HATIRLATMA_SABLON = `⚖️ Merhaba {{ad}}!

Kilonu portale girmeyeli birkaç gün oldu. Sabah aç karnına tartılıp sonucu girebilir misin?

İlerlemenizi birlikte takip etmek için bu veri çok önemli 🎯

Dyt. {{diyetisyen}}`

const RANDEVU_YOK_SABLON = `Merhaba {{ad}} 👋

Uzun süredir görüşemedik! Nasıl gidiyor?

Yeni bir randevu alarak programınıza devam etmek ister misiniz? Uygun bir zaman belirleyelim 📅

Dyt. {{diyetisyen}}`

// ── Follow-up Yardımcısı ─────────────────────────────────────────────────────

async function followupGonder(
  telefon: string,
  mesaj: string,
  danisanId: string,
  tip: FollowupTip,
  tarih: string,
  aciklama: string,
) {
  await gonder(telefon, mesaj, aciklama)
  kaydetGonderim(danisanId, tip, tarih)
}

// ── Follow-up Fonksiyonları ───────────────────────────────────────────────────

/**
 * Dün tamamlanan randevuların danışanlarına follow-up mesajı gönderir.
 * Her gün 10:00'da çalışır.
 */
export async function randevuSonrasiFollowup() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const randevular = getRandevular()
  const bugun = bugunStr()

  const dun = new Date()
  dun.setDate(dun.getDate() - 1)
  const dunStr = dun.toISOString().slice(0, 10)

  const tamamlananlar = randevular.filter(
    r => r.tarih === dunStr && r.durum === "tamamlandi"
  )

  for (const rdv of tamamlananlar) {
    const danisan = danisanlar.find(d => d.id === rdv.danisan_id)
    if (!danisan?.telefon) continue
    if (gonderildiMi(danisan.id, "randevu_sonrasi", bugun)) continue

    const mesaj = mesajOlustur(RANDEVU_SONRASI_SABLON, danisan, rdv)
    await followupGonder(danisan.telefon, mesaj, danisan.id, "randevu_sonrasi", bugun,
      `${danisan.ad} ${danisan.soyad} – randevu sonrası follow-up`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * 7+ gündür ölçüm girmeyen aktif danışanlara hatırlatma gönderir.
 * Her Perşembe 09:00'da çalışır.
 */
export async function olcumHatirlatmaFollowup() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const olcumler = getOlcumler()
  const bugun = bugunStr()

  const esik = new Date()
  esik.setDate(esik.getDate() - 7)
  const esikStr = esik.toISOString().slice(0, 10)

  const aktifler = danisanlar.filter(d => d.durum === "aktif" && d.telefon)

  for (const danisan of aktifler) {
    const sonOlcum = olcumler
      .filter(o => o.danisan_id === danisan.id)
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]

    if (sonOlcum && sonOlcum.tarih >= esikStr) continue
    if (sonGunIcinde(danisan.id, "olcum_hatirlatma", 7)) continue

    const mesaj = mesajOlustur(OLCUM_HATIRLATMA_SABLON, danisan)
    await followupGonder(danisan.telefon!, mesaj, danisan.id, "olcum_hatirlatma", bugun,
      `${danisan.ad} ${danisan.soyad} – ölçüm hatırlatma follow-up`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * 7+ gündür portal aktivitesi olmayan aktif danışanlara mesaj gönderir.
 * Her Pazartesi 11:00'de çalışır.
 */
export async function hareketsizDanisanFollowup() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const olcumler = getOlcumler()
  const bugun = bugunStr()

  const esik = new Date()
  esik.setDate(esik.getDate() - 7)
  const esikStr = esik.toISOString().slice(0, 10)

  const aktifler = danisanlar.filter(d => d.durum === "aktif" && d.telefon)

  for (const danisan of aktifler) {
    const sonOlcum = olcumler
      .filter(o => o.danisan_id === danisan.id)
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]

    if (sonOlcum && sonOlcum.tarih >= esikStr) continue
    if (sonGunIcinde(danisan.id, "hareketsiz_danisan", 14)) continue

    const mesaj = mesajOlustur(HAREKETSIZ_SABLON, danisan)
    await followupGonder(danisan.telefon!, mesaj, danisan.id, "hareketsiz_danisan", bugun,
      `${danisan.ad} ${danisan.soyad} – hareketsiz danışan follow-up`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * 30+ gündür randevusu olmayan aktif danışanlara yeni randevu önerir.
 * Her Pazar 18:00'de çalışır.
 */
export async function randevuYokFollowup() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const randevular = getRandevular()
  const bugun = bugunStr()

  const esik = new Date()
  esik.setDate(esik.getDate() - 30)
  const esikStr = esik.toISOString().slice(0, 10)

  const aktifler = danisanlar.filter(d => d.durum === "aktif" && d.telefon)

  for (const danisan of aktifler) {
    const sonRandevu = randevular
      .filter(r => r.danisan_id === danisan.id && r.durum !== "iptal")
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]

    if (sonRandevu && sonRandevu.tarih >= esikStr) continue
    if (sonGunIcinde(danisan.id, "randevu_yok", 30)) continue

    const mesaj = mesajOlustur(RANDEVU_YOK_SABLON, danisan)
    await followupGonder(danisan.telefon!, mesaj, danisan.id, "randevu_yok", bugun,
      `${danisan.ad} ${danisan.soyad} – randevu yok follow-up`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

/**
 * Tüm aktif danışanlara tartı günü hatırlatması.
 * Her Pazartesi 07:00'de çalışır.
 */
export async function tartiGunuHatirlatma() {
  if (wa.state !== "connected") return

  const danisanlar = getDanisanlar()
  const aktifler = danisanlar.filter(d => d.durum === "aktif" && d.telefon)

  for (const d of aktifler) {
    const mesaj = mesajOlustur(TARTI_SABLON, d)
    await gonder(d.telefon!, mesaj, `${d.ad} ${d.soyad} – tartı günü`)
    await new Promise(r => setTimeout(r, 2000))
  }
}
