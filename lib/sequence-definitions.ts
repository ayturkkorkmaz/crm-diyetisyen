/**
 * Sequence adım tanımları.
 * Her tetikleyici için kaç gün sonra, hangi şablon, görev/alarm üretilip üretilmeyeceği.
 */

import type { SequenceTetikleyici, GorevOnceligi, AlarmTip } from "./sequence-store"

export interface AdimAksiyon {
  whatsapp?: { sablon: string }
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
  email?: {
    konu: string
    icerik: string
  }
  /** Koşul varsa → false döndürürse adım iptal edilir */
  kosulAnahtar?: "aktivite_hala_dusuk" | "odeme_hala_yok"
}

export interface AdimTanim {
  offsetGun: number      // baslangicAt'e göre kaç gün sonra
  offsetSaat: number     // günün kaçında (0-23)
  aksiyon: AdimAksiyon
}

// ── Şablonlar ──────────────────────────────────────────────────────────────────

export const SABLONLAR = {
  hosgeldin: `Merhaba {{ad}}! 🎉

VitaNorm programına hoş geldiniz!

Diyetisyeniniz sizin için kişisel bir plan hazırlıyor. Bu süreçte:
📱 Portal üzerinden kilo ve su takibinizi yapabilirsiniz
📸 Öğün fotoğraflarınızı paylaşabilirsiniz
💬 Her türlü sorunuz için bana yazabilirsiniz

Sağlıklı günler! 🥗
Dyt. {{diyetisyen}}`,

  su_hatirlatma_ilk: `💧 Merhaba {{ad}}!

Programınızın ilk günlerinde su tüketimi çok önemli. Günlük 2-2.5 litre su hedefinizi takip etmeyi unutmayın.

Portale girip su takibinizi başlatabilirsiniz 👇
İlk adım her zaman en önemlisidir! 🌿

Dyt. {{diyetisyen}}`,

  kilo_giris_kontrolu: `⚖️ Merhaba {{ad}}!

Programınıza başlayalı 3 gün oldu. İlk kilonuzu portale girdiniz mi?

Sabah aç karnına tartılıp sonucu girin, birlikte ilerlemenizi takip edelim 💪

Dyt. {{diyetisyen}}`,

  nasil_gidiyor_7gun: `Merhaba {{ad}}! 😊

Programınıza başlayalı bir hafta oldu. Nasıl hissediyorsunuz?

✅ Su hedefinizi tutturabiliyor musunuz?
✅ Öğünlerinizi düzenli yiyor musunuz?
✅ Kendinizi nasıl hissediyorsunuz?

Sorularınız veya paylaşmak istedikleriniz varsa her zaman buradayım 🌟

Dyt. {{diyetisyen}}`,

  no_show_danisan: `Merhaba {{ad}} 👋

Bugünkü seans randevunuza ulaşamadım. Umarım her şey yolundadır.

Yeni bir randevu belirlemek için lütfen bana yazın. Program devam etsin! 💪

Dyt. {{diyetisyen}}`,

  aktivite_dusuk_motivasyon: `Merhaba {{ad}}! 🌟

Birkaç gündür sizi göremedim. Hiç sorun değil — bazen dur nefes al günler gerekiyor.

Süreklilik > Mükemmellik ✨

Küçük bir adım atmak yeter. Portale gir, sadece bugünkü kilonu yaz. O kadar 🙏

Dyt. {{diyetisyen}}`,

  aktivite_dusuk_kampanya: `Merhaba {{ad}} 💙

Bir süredir haberleşemiyoruz. Sizi programda tutmak için özel bir teklif hazırladım.

Yarın veya öbür gün 15 dakikalık ücretsiz check-in görüşmesi yapalım mı?

Sadece "evet" yazmanız yeterli 🤝

Dyt. {{diyetisyen}}`,

  paket_bitiyor_1: `Merhaba {{ad}} 👋

Beslenme programınızın bitmesine *3 gün* kaldı!

Bu süreçte harika bir ilerleme kaydetttiniz. Devam etmek ister misiniz?

Yeni paket için randevu almak veya bilgi almak için bana yazabilirsiniz 🌱

Dyt. {{diyetisyen}}`,

  paket_bitiyor_2: `Merhaba {{ad}}!

Programınız *yarın* sona eriyor. Devam etmek için son gün!

Şimdi randevu alırsanız seanslar arasında kesinti olmaz ✅

Dyt. {{diyetisyen}}`,
}

// ── Sequence Tanımları ────────────────────────────────────────────────────────

export const SEQUENCE_TANIMLARI: Record<SequenceTetikleyici, AdimTanim[]> = {

  yeni_kayit: [
    {
      offsetGun: 0,
      offsetSaat: 9,
      aksiyon: {
        whatsapp: { sablon: "hosgeldin" },
        alarm: {
          tip: "sequence",
          baslik: "Yeni danışan kaydı",
          mesaj: "{{ad}} {{soyad}} sisteme kaydoldu. Hoş geldin mesajı gönderildi.",
        },
      },
    },
    {
      offsetGun: 1,
      offsetSaat: 9,
      aksiyon: {
        whatsapp: { sablon: "su_hatirlatma_ilk" },
      },
    },
    {
      offsetGun: 3,
      offsetSaat: 10,
      aksiyon: {
        whatsapp: { sablon: "kilo_giris_kontrolu" },
        alarm: {
          tip: "gorev",
          baslik: "Kilo girişi kontrolü",
          mesaj: "{{ad}} {{soyad}} — 3. gün kilo girişi kontrolü. Portal'da henüz ölçüm yok.",
        },
      },
    },
    {
      offsetGun: 7,
      offsetSaat: 10,
      aksiyon: {
        whatsapp: { sablon: "nasil_gidiyor_7gun" },
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
        whatsapp: { sablon: "no_show_danisan" },
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
        whatsapp: { sablon: "aktivite_dusuk_motivasyon" },
        alarm: {
          tip: "sequence",
          baslik: "Hareketsiz danışan",
          mesaj: "{{ad}} {{soyad}} 5 gündür aktivite yok. Motivasyon mesajı gönderildi.",
        },
      },
    },
    {
      offsetGun: 3,
      offsetSaat: 11,
      aksiyon: {
        whatsapp: { sablon: "aktivite_dusuk_kampanya" },
        gorev: {
          baslik: "Özel teklif — aktivitesiz danışan",
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
        whatsapp: { sablon: "paket_bitiyor_1" },
      },
    },
    {
      offsetGun: 2,
      offsetSaat: 10,
      aksiyon: {
        whatsapp: { sablon: "paket_bitiyor_2" },
        kosulAnahtar: "odeme_hala_yok",
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
