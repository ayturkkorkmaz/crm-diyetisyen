/**
 * Sequence cron worker.
 * Her gün 08:30'da çalışır, bekleyen adımları işler.
 * WhatsApp gönderimi KALDIRILDI — sadece görev ve alarm oluşturur.
 */

import { getDanisanlar, getOlcumler } from "./server-store"
import {
  getSequences,
  saveSequences,
  gorevEkle,
  alarmEkle,
  type AdimDurum,
} from "./sequence-store"
import { SEQUENCE_TANIMLARI, type AdimTanim } from "./sequence-definitions"
import type { Danisan } from "./types"

function metiDoldur(metin: string, danisan: Danisan): string {
  return metin
    .replace(/{{ad}}/g, danisan.ad)
    .replace(/{{soyad}}/g, danisan.soyad)
}

async function kosulKontrol(
  anahtar: string | undefined,
  danisan: Danisan,
): Promise<boolean> {
  if (!anahtar) return true

  if (anahtar === "aktivite_hala_dusuk") {
    const olcumler = getOlcumler()
    const esik = new Date()
    esik.setDate(esik.getDate() - 5)
    const esikStr = esik.toISOString().slice(0, 10)
    const son = olcumler
      .filter(o => o.danisan_id === danisan.id)
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]
    return !son || son.tarih < esikStr
  }

  if (anahtar === "odeme_hala_yok") {
    return true
  }

  return true
}

export async function sequenceAdimlariniCalistir() {
  const sequences = getSequences()
  const danisanlar = getDanisanlar()
  const simdi = new Date()
  let degisti = false

  for (const seq of sequences) {
    const danisan = danisanlar.find(d => d.id === seq.danisanId)
    if (!danisan) continue

    const tanim = SEQUENCE_TANIMLARI[seq.tetikleyici]
    if (!tanim) continue

    for (const adim of seq.adimlar) {
      if (adim.durum !== "bekliyor") continue
      if (new Date(adim.planlanmisAt) > simdi) continue

      const adimTanim: AdimTanim = tanim[adim.adimNo]
      if (!adimTanim) {
        adim.durum = "iptal" as AdimDurum
        degisti = true
        continue
      }

      const { aksiyon } = adimTanim

      const kosulSaglandi = await kosulKontrol(aksiyon.kosulAnahtar, danisan)
      if (!kosulSaglandi) {
        adim.durum = "iptal" as AdimDurum
        adim.gonderildiAt = new Date().toISOString()
        degisti = true
        console.log(`[Sequence] Adım iptal edildi (koşul sağlanmadı): ${danisan.ad} ${danisan.soyad} — ${seq.tetikleyici}[${adim.adimNo}]`)
        continue
      }

      // Görev oluştur
      if (aksiyon.gorev) {
        gorevEkle({
          danisanId: danisan.id,
          baslik: metiDoldur(aksiyon.gorev.baslik, danisan),
          aciklama: metiDoldur(aksiyon.gorev.aciklama, danisan),
          oncelik: aksiyon.gorev.oncelik,
          durum: "bekliyor",
          kaynak: seq.tetikleyici,
        })
      }

      // Alarm oluştur
      if (aksiyon.alarm) {
        alarmEkle({
          tip: aksiyon.alarm.tip,
          baslik: metiDoldur(aksiyon.alarm.baslik, danisan),
          mesaj: metiDoldur(aksiyon.alarm.mesaj, danisan),
          danisanId: danisan.id,
          danisanAd: `${danisan.ad} ${danisan.soyad}`,
        })
      }

      adim.durum = "gonderildi" as AdimDurum
      adim.gonderildiAt = new Date().toISOString()
      degisti = true
    }
  }

  if (degisti) {
    saveSequences(sequences)
    console.log("[Sequence] Adımlar işlendi, sequences güncellendi.")
  } else {
    console.log("[Sequence] Bekleyen adım yok.")
  }
}

/** Cron: Her gün tüm aktif danışanları aktivite düşüşü için tara */
export async function aktiviteDususTara() {
  const danisanlar = getDanisanlar()
  const olcumler = getOlcumler()
  const { sequenceEkle } = await import("./sequence-store")
  const { SEQUENCE_TANIMLARI } = await import("./sequence-definitions")

  const esik = new Date()
  esik.setDate(esik.getDate() - 5)
  const esikStr = esik.toISOString().slice(0, 10)

  for (const danisan of danisanlar.filter(d => d.durum === "aktif")) {
    const son = olcumler
      .filter(o => o.danisan_id === danisan.id)
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]

    const aktiviteDusuk = !son || son.tarih < esikStr
    if (!aktiviteDusuk) continue

    const adimTanimlar = SEQUENCE_TANIMLARI["aktivite_dusuk"]
    const baslangic = new Date()
    const adimlar = adimTanimlar.map((t, i) => {
      const plan = new Date(baslangic)
      plan.setDate(plan.getDate() + t.offsetGun)
      plan.setHours(t.offsetSaat, 0, 0, 0)
      return { adimNo: i, planlanmisAt: plan.toISOString(), durum: "bekliyor" as const }
    })

    sequenceEkle(danisan.id, "aktivite_dusuk", adimlar)
  }
}

/** Cron: Paket bitiş tarihine göre danışanları tara */
export async function paketBitiyorTara() {
  const danisanlar = getDanisanlar()
  const { sequenceEkle } = await import("./sequence-store")
  const { SEQUENCE_TANIMLARI } = await import("./sequence-definitions")

  const simdi = new Date()

  for (const danisan of danisanlar.filter(d => d.durum === "aktif")) {
    // @ts-expect-error — paket_bitis_tarihi tip genişletmesi yapılabilir
    const bitisStr: string | undefined = danisan.paket_bitis_tarihi
    if (!bitisStr) continue

    const bitis = new Date(bitisStr + "T00:00:00")
    const farkGun = Math.ceil((bitis.getTime() - simdi.getTime()) / (1000 * 60 * 60 * 24))

    if (farkGun !== 3) continue

    const adimTanimlar = SEQUENCE_TANIMLARI["paket_bitiyor"]
    const baslangic = new Date()
    const adimlar = adimTanimlar.map((t, i) => {
      const plan = new Date(baslangic)
      plan.setDate(plan.getDate() + t.offsetGun)
      plan.setHours(t.offsetSaat, 0, 0, 0)
      return { adimNo: i, planlanmisAt: plan.toISOString(), durum: "bekliyor" as const }
    })

    sequenceEkle(danisan.id, "paket_bitiyor", adimlar)
  }
}
