import type { Danisan, Olcum, Randevu, DiyetPlani, Odeme, DashboardIstatistik } from './types'

export const demoDanisanlar: Danisan[] = []
export const demoOlcumler: Olcum[] = []
export const demoRandevular: Randevu[] = []
export const demoDiyetPlanlari: DiyetPlani[] = []
export const demoOdemeler: Odeme[] = []

export const demoDashboardIstatistik: DashboardIstatistik = {
  toplam_danisan: 0,
  aktif_danisan: 0,
  bugunki_randevu: 0,
  bu_ay_gelir: 0,
  ortalama_kilo_kaybi: 0,
  bekleyen_odeme: 0,
}
