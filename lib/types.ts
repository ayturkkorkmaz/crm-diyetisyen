export type CinsiyetType = 'erkek' | 'kadin'
export type DanisanDurumu = 'aktif' | 'pasif' | 'beklemede'
export type RandevuDurumu = 'planlandi' | 'tamamlandi' | 'iptal' | 'gelmedi'
export type OdemeDurumu = 'odendi' | 'bekliyor' | 'gecikti'
export type HedefTuru = 'kilo_verme' | 'kilo_alma' | 'koruma' | 'kas_kazanimi'

export interface Danisan {
  id: string
  created_at: string
  ad: string
  soyad: string
  email: string
  telefon?: string
  dogum_tarihi?: string
  cinsiyet?: CinsiyetType
  boy_cm?: number
  baslangic_kilo?: number
  hedef_kilo?: number
  hedef_turu?: HedefTuru
  durum: DanisanDurumu
  alerjiler?: string[]
  hastaliklar?: string[]
  ilaclar?: string
  notlar?: string
  avatar_url?: string
  kayit_tarihi: string
}

export interface Olcum {
  id: string
  danisan_id: string
  tarih: string
  kilo_kg: number
  bmi?: number
  yag_orani?: number
  kas_orani?: number
  sivi_orani?: number
  ic_yaglanma?: number
  bel_cm?: number
  kalca_cm?: number
  gogus_cm?: number
  kol_cm?: number
  bacak_cm?: number
  // Segmental analiz (Tanita / akıllı terazi)
  sol_kol_kas_kg?: number
  sol_kol_yag_kg?: number
  sag_kol_kas_kg?: number
  sag_kol_yag_kg?: number
  govde_kas_kg?: number
  govde_yag_kg?: number
  sol_bacak_kas_kg?: number
  sol_bacak_yag_kg?: number
  sag_bacak_kas_kg?: number
  sag_bacak_yag_kg?: number
  notlar?: string
}

export interface Randevu {
  id: string
  danisan_id: string
  danisan?: Danisan
  tarih: string
  saat: string
  sure_dk: number
  tur: string
  durum: RandevuDurumu
  notlar?: string
  ucret?: number
}

export interface OgunItem {
  ad: string
  miktar: string
  kalori?: number
}

export interface Ogun {
  ad: 'Kahvaltı' | 'Ara Öğün 1' | 'Öğle' | 'Ara Öğün 2' | 'Akşam' | 'Gece'
  saat?: string
  items: OgunItem[]
  toplam_kalori?: number
}

export interface GunlukPlan {
  gun: string
  ogunler: Ogun[]
  toplam_kalori?: number
}

export interface DiyetPlani {
  id: string
  danisan_id: string
  danisan?: Danisan
  baslik: string
  baslangic_tarihi: string
  bitis_tarihi?: string
  gunluk_kalori_hedefi?: number
  notlar?: string
  haftalik_plan: GunlukPlan[]
  aktif: boolean
}

export interface Odeme {
  id: string
  danisan_id: string
  danisan?: Danisan
  tarih: string
  tutar: number
  aciklama: string
  durum: OdemeDurumu
  odeme_yontemi?: 'nakit' | 'kart' | 'havale'
}

export interface DashboardIstatistik {
  toplam_danisan: number
  aktif_danisan: number
  bugunki_randevu: number
  bu_ay_gelir: number
  ortalama_kilo_kaybi: number
  bekleyen_odeme: number
}
