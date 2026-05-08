// ── Loyalty / Gamification Tanımları ─────────────────────────────────────────

export type EylemTuru =
  | "su_takibi"
  | "ogun_log"
  | "kilo_giris"
  | "randevu_geldi"
  | "streak_7"
  | "streak_30"
  | "arkadasDavet"
  | "diyet_sadik"
  | "challenge_tamamla"

export const EYLEM_PUANLARI: Record<EylemTuru, number> = {
  su_takibi: 10,
  ogun_log: 15,
  kilo_giris: 20,
  randevu_geldi: 50,
  streak_7: 100,
  streak_30: 500,
  arkadasDavet: 200,
  diyet_sadik: 25,
  challenge_tamamla: 30,
}

export const EYLEM_ETIKETLER: Record<EylemTuru, string> = {
  su_takibi: "Su Takibi",
  ogun_log: "Öğün Kaydı",
  kilo_giris: "Kilo Girişi",
  randevu_geldi: "Randevuya Katıldı",
  streak_7: "7 Günlük Seri Bonusu",
  streak_30: "30 Günlük Seri Bonusu",
  arkadasDavet: "Arkadaş Daveti",
  diyet_sadik: "Diyete Sadık",
  challenge_tamamla: "Görev Tamamlandı",
}

// Günlük tekrar koruması — bu eylemler günde bir kez puan verir
export const GUNLUK_DEDUP: EylemTuru[] = ["su_takibi", "ogun_log", "diyet_sadik"]

// ── Seviyeler ──────────────────────────────────────────────────────────────

export interface Seviye {
  id: number
  ad: string
  ikon: string
  minPuan: number
}

export const SEVIYELER: Seviye[] = [
  { id: 1, ad: "Başlangıç",  ikon: "🌱", minPuan: 0    },
  { id: 2, ad: "Gelişiyor",  ikon: "🌿", minPuan: 200  },
  { id: 3, ad: "Kararlı",    ikon: "💪", minPuan: 500  },
  { id: 4, ad: "Azimli",     ikon: "🔥", minPuan: 1000 },
  { id: 5, ad: "Şampiyon",   ikon: "⭐", minPuan: 2000 },
  { id: 6, ad: "Efsane",     ikon: "👑", minPuan: 5000 },
]

// Tailwind'de dinamik class purging sorununu önlemek için sabit lookup
export const SEVIYE_STIL: Record<number, { bg: string; text: string; ring: string }> = {
  1: { bg: "bg-slate-100",   text: "text-slate-700",   ring: "ring-slate-200"   },
  2: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  3: { bg: "bg-blue-100",    text: "text-blue-700",    ring: "ring-blue-200"    },
  4: { bg: "bg-violet-100",  text: "text-violet-700",  ring: "ring-violet-200"  },
  5: { bg: "bg-amber-100",   text: "text-amber-700",   ring: "ring-amber-200"   },
  6: { bg: "bg-red-100",     text: "text-red-700",     ring: "ring-red-200"     },
}

export function seviyeHesapla(puan: number): Seviye {
  return [...SEVIYELER].reverse().find(s => puan >= s.minPuan) ?? SEVIYELER[0]
}

export function sonrakiSeviye(puan: number): Seviye | null {
  const mevcut = seviyeHesapla(puan)
  return SEVIYELER.find(s => s.id === mevcut.id + 1) ?? null
}

export function seviyeIlerleme(puan: number): number {
  const mevcut = seviyeHesapla(puan)
  const sonraki = sonrakiSeviye(puan)
  if (!sonraki) return 100
  const aralik = sonraki.minPuan - mevcut.minPuan
  const ilerleme = puan - mevcut.minPuan
  return Math.min(100, Math.round((ilerleme / aralik) * 100))
}

// ── Rozetler ───────────────────────────────────────────────────────────────

export interface RozetKosulInput {
  toplamPuan: number
  enUzunSeri: number
  eylemler: Array<{ tip: EylemTuru; tarih: string }>
}

export interface Rozet {
  id: string
  ad: string
  aciklama: string
  ikon: string
  kosul: (input: RozetKosulInput) => boolean
}

export const ROZETLER: Rozet[] = [
  {
    id: "ilk_adim",
    ad: "İlk Adım",
    aciklama: "İlk eylemini tamamladın",
    ikon: "👣",
    kosul: ({ eylemler }) => eylemler.length >= 1,
  },
  {
    id: "su_sevdalisi",
    ad: "Su Sevdalısı",
    aciklama: "7 farklı gün su takibi yaptın",
    ikon: "💧",
    kosul: ({ eylemler }) => {
      const gunler = new Set(
        eylemler.filter(e => e.tip === "su_takibi").map(e => e.tarih.slice(0, 10))
      )
      return gunler.size >= 7
    },
  },
  {
    id: "su_ustasi",
    ad: "Su Ustası",
    aciklama: "14 farklı gün su takibi yaptın",
    ikon: "🌊",
    kosul: ({ eylemler }) => {
      const gunler = new Set(
        eylemler.filter(e => e.tip === "su_takibi").map(e => e.tarih.slice(0, 10))
      )
      return gunler.size >= 14
    },
  },
  {
    id: "kilo_takipcisi",
    ad: "Kilo Takipçisi",
    aciklama: "5 kez kilo girişi yaptın",
    ikon: "⚖️",
    kosul: ({ eylemler }) => eylemler.filter(e => e.tip === "kilo_giris").length >= 5,
  },
  {
    id: "seri_7",
    ad: "7 Günlük Seri",
    aciklama: "7 günlük aktivite serisi kurdu",
    ikon: "🔥",
    kosul: ({ enUzunSeri }) => enUzunSeri >= 7,
  },
  {
    id: "seri_30",
    ad: "Disiplin Seviyesi",
    aciklama: "30 günlük aktivite serisi — çılgın disiplin!",
    ikon: "⚡",
    kosul: ({ enUzunSeri }) => enUzunSeri >= 30,
  },
  {
    id: "uclu_hedef",
    ad: "Üçlü Hedef",
    aciklama: "Aynı günde su, öğün ve kilo takibini yaptın",
    ikon: "🎯",
    kosul: ({ eylemler }) => {
      const gunMap = new Map<string, Set<string>>()
      eylemler.forEach(e => {
        const gun = e.tarih.slice(0, 10)
        if (!gunMap.has(gun)) gunMap.set(gun, new Set())
        gunMap.get(gun)!.add(e.tip)
      })
      return [...gunMap.values()].some(
        tips => tips.has("su_takibi") && tips.has("ogun_log") && tips.has("kilo_giris")
      )
    },
  },
  {
    id: "metabolik_savasco",
    ad: "Metabolik Savaşçı",
    aciklama: "1000 puana ulaştın",
    ikon: "💎",
    kosul: ({ toplamPuan }) => toplamPuan >= 1000,
  },
  {
    id: "sadik_danisan",
    ad: "Sadık Danışan",
    aciklama: "3 randevuya katıldın",
    ikon: "🏆",
    kosul: ({ eylemler }) => eylemler.filter(e => e.tip === "randevu_geldi").length >= 3,
  },
  {
    id: "efsane",
    ad: "Efsane",
    aciklama: "5000 puana ulaştın — sen gerçek bir efsanesin",
    ikon: "👑",
    kosul: ({ toplamPuan }) => toplamPuan >= 5000,
  },
]

// ── Challengeler ───────────────────────────────────────────────────────────

export interface ChallengeSablonu {
  id: string
  baslik: string
  aciklama: string
  hedefEylem: EylemTuru
  hedefSayi: number   // pencere içinde bu kadar eylem
  pencereGun: number  // kaç günlük süre
  bonus: number       // challenge_tamamla puanına ek bonus
}

export const CHALLENGE_SABLONLARI: ChallengeSablonu[] = [
  {
    id: "c_su_3gun",
    baslik: "3 Günlük Su Serisi",
    aciklama: "3 gün üst üste su takibi yap. Küçük ama güçlü.",
    hedefEylem: "su_takibi",
    hedefSayi: 3,
    pencereGun: 4,
    bonus: 40,
  },
  {
    id: "c_ogun_5gun",
    baslik: "5 Günlük Öğün Serisi",
    aciklama: "5 gün boyunca öğün kaydet. Bilinç başarının temelidir.",
    hedefEylem: "ogun_log",
    hedefSayi: 5,
    pencereGun: 7,
    bonus: 65,
  },
  {
    id: "c_kilo_3",
    baslik: "Tartıya Çık",
    aciklama: "Bu ay 3 kez kilo girişi yap.",
    hedefEylem: "kilo_giris",
    hedefSayi: 3,
    pencereGun: 30,
    bonus: 40,
  },
  {
    id: "c_su_bugün",
    baslik: "Bugün Sadece Su Yap",
    aciklama: "Bugün su hedefini tamamla, yeter! Mikro adım, makro etki.",
    hedefEylem: "su_takibi",
    hedefSayi: 1,
    pencereGun: 1,
    bonus: 10,
  },
  {
    id: "c_diyet_7",
    baslik: "7 Günlük Diyet Uyumu",
    aciklama: "7 gün boyunca diyet uyumu kaydet.",
    hedefEylem: "diyet_sadik",
    hedefSayi: 7,
    pencereGun: 8,
    bonus: 120,
  },
]
