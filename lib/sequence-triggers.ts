/**
 * Event-based sequence tetikleyicileri.
 * API route'larından ve store sync'ten çağrılır.
 */

import { sequenceEkle, alarmEkle } from "./sequence-store"
import { SEQUENCE_TANIMLARI } from "./sequence-definitions"
import type { SequenceTetikleyici } from "./sequence-store"

function adimlarOlustur(tetikleyici: SequenceTetikleyici) {
  const tanimlar = SEQUENCE_TANIMLARI[tetikleyici]
  const baslangic = new Date()
  return tanimlar.map((t, i) => {
    const plan = new Date(baslangic)
    plan.setDate(plan.getDate() + t.offsetGun)
    // Offset 0 ise hemen tetiklensin (1 dk sonra)
    if (t.offsetGun === 0) {
      plan.setTime(baslangic.getTime() + 60 * 1000)
    } else {
      plan.setHours(t.offsetSaat, 0, 0, 0)
    }
    return { adimNo: i, planlanmisAt: plan.toISOString(), durum: "bekliyor" as const }
  })
}

/** Yeni danışan kaydolunca çağrılır */
export async function tetikleYeniKayit(danisanId: string, danisanAd: string) {
  const adimlar = adimlarOlustur("yeni_kayit")
  const seq = sequenceEkle(danisanId, "yeni_kayit", adimlar)

  if (seq) {
    alarmEkle({
      tip: "sequence",
      baslik: "Yeni danışan kaydı",
      mesaj: `${danisanAd} sisteme kaydoldu. Hoş geldin sequence'ı başlatıldı.`,
      danisanId,
      danisanAd,
    })
    console.log(`[Sequence] yeni_kayit başlatıldı: ${danisanAd}`)
  }
}

/** Randevu "gelmedi" işaretlenince çağrılır */
export async function tetikleNoShow(danisanId: string, danisanAd: string) {
  const adimlar = adimlarOlustur("no_show")
  const seq = sequenceEkle(danisanId, "no_show", adimlar)

  if (seq) {
    alarmEkle({
      tip: "gorev",
      baslik: "Randevuya gelmedi",
      mesaj: `${danisanAd} bugünkü randevusuna gelmedi. Görev ve mesaj hazırlandı.`,
      danisanId,
      danisanAd,
    })
    console.log(`[Sequence] no_show başlatıldı: ${danisanAd}`)
  }
}

/** Manuel veya cron'dan: paket bitiyor */
export async function tetiklePaketBitiyor(danisanId: string, danisanAd: string) {
  const adimlar = adimlarOlustur("paket_bitiyor")
  const seq = sequenceEkle(danisanId, "paket_bitiyor", adimlar)

  if (seq) {
    alarmEkle({
      tip: "sequence",
      baslik: "Paket bitiyor",
      mesaj: `${danisanAd} paketine 3 gün kaldı. Ödeme hatırlatma sequence'ı başlatıldı.`,
      danisanId,
      danisanAd,
    })
    console.log(`[Sequence] paket_bitiyor başlatıldı: ${danisanAd}`)
  }
}
