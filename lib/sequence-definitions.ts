/**
 * Sequence adım tanımları.
 * Her tetikleyici için kaç gün sonra, hangi görev/alarm üretilip üretilmeyeceği.
 * WhatsApp gönderimi KALDIRILDI.
 */

import type { SequenceTetikleyici, GorevOnceligi, AlarmTip } from "./sequence-store"

export interface AdimAksiyon {
  gorev?: {
    baslik: string
    aciklama: string
    oncelik: GorevOnceligi
  }
  alarm?: {
    tip: AlarmTip
    baslik: string
    mesaj: string
  }
  /** Koşul varsa → false döndürürse adım iptal edilir */
  kosulAnahtar?: "aktivite_hala_dusuk" | "odeme_hala_yok"
}

export interface AdimTanim {
  offsetGun: number
  offsetSaat: number
  aksiyon: AdimAksiyon
}

// ── Sequence Tanımları ────────────────────────────────────────────────────────

export const SEQUENCE_TANIMLARI: Record<SequenceTetikleyici, AdimTanim[]> = {

  yeni_kayit: [
    {
      offsetGun: 0,
      offsetSaat: 9,
      aksiyon: {
        alarm: {
          tip: "sequence",
          baslik: "Yeni danışan kaydı",
          mesaj: "{{ad}} {{soyad}} sisteme kaydoldu.",
        },
      },
    },
    {
      offsetGun: 7,
      offsetSaat: 10,
      aksiyon: {
        gorev: {
          baslik: "7. gün check-in",
          aciklama: "{{ad}} {{soyad}} ile 7. gün kontrolü yapın.",
          oncelik: "orta",
        },
        alarm: {
          tip: "gorev",
          baslik: "7. gün check-in hatırlatması",
          mesaj: "{{ad}} {{soyad}} programda 1 haftayı tamamladı. Check-in zamanı!",
        },
      },
    },
  ],

  no_show: [
    {
      offsetGun: 0,
      offsetSaat: 0,
      aksiyon: {
        gorev: {
          baslik: "No-show — yeniden planla",
          aciklama: "{{ad}} {{soyad}} randevuya gelmedi. Yeniden randevu ayarlayın.",
          oncelik: "yuksek",
        },
        alarm: {
          tip: "gorev",
          baslik: "Randevuya gelmedi",
          mesaj: "{{ad}} {{soyad}} bugünkü randevusuna gelmedi. Görev oluşturuldu.",
        },
      },
    },
  ],

  aktivite_dusuk: [
    {
      offsetGun: 0,
      offsetSaat: 10,
      aksiyon: {
        alarm: {
          tip: "sequence",
          baslik: "Hareketsiz danışan",
          mesaj: "{{ad}} {{soyad}} 5 gündür aktivite yok.",
        },
      },
    },
    {
      offsetGun: 3,
      offsetSaat: 11,
      aksiyon: {
        gorev: {
          baslik: "Aktivitesiz danışanla iletişim kur",
          aciklama: "{{ad}} {{soyad}} 8 gündür aktivite yok. Kişisel iletişim kurun.",
          oncelik: "yuksek",
        },
        alarm: {
          tip: "gorev",
          baslik: "Uzun süreli aktivite yok",
          mesaj: "{{ad}} {{soyad}} 8+ gündür platformda yok. Görev oluşturuldu.",
        },
        kosulAnahtar: "aktivite_hala_dusuk",
      },
    },
  ],

  paket_bitiyor: [
    {
      offsetGun: 0,
      offsetSaat: 10,
      aksiyon: {
        alarm: {
          tip: "sequence",
          baslik: "Paket bitiyor (3 gün kaldı)",
          mesaj: "{{ad}} {{soyad}} paketinin bitmesine 3 gün kaldı.",
        },
      },
    },
    {
      offsetGun: 3,
      offsetSaat: 9,
      aksiyon: {
        gorev: {
          baslik: "Paket bitti — ödeme bekliyor",
          aciklama: "{{ad}} {{soyad}} paket süresi doldu, ödeme/yenileme yok.",
          oncelik: "acil",
        },
        alarm: {
          tip: "gorev",
          baslik: "Paket süresi doldu",
          mesaj: "{{ad}} {{soyad}} paketi bitti ve ödeme/yenileme yapılmadı.",
        },
        kosulAnahtar: "odeme_hala_yok",
      },
    },
  ],
}
