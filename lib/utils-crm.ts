import type { DanisanDurumu, RandevuDurumu, OdemeDurumu, HedefTuru, CinsiyetType } from './types'

export function formatPara(tutar: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(tutar)
}

export function formatTarih(tarihStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tarihStr))
}

export function formatTarihKisa(tarihStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(tarihStr))
}

export function hesaplaYas(dogumTarihi: string): number {
  const bugun = new Date()
  const dogum = new Date(dogumTarihi)
  let yas = bugun.getFullYear() - dogum.getFullYear()
  const ay = bugun.getMonth() - dogum.getMonth()
  if (ay < 0 || (ay === 0 && bugun.getDate() < dogum.getDate())) yas--
  return yas
}

export function hesaplaBMI(kilo: number, boyCm: number): number {
  const boyM = boyCm / 100
  return Math.round((kilo / (boyM * boyM)) * 10) / 10
}

export function bmiyeGoreEtiket(bmi: number): { etiket: string; variant: 'secondary' | 'success' | 'warning' | 'destructive' } {
  if (bmi < 18.5) return { etiket: 'Zayıf', variant: 'warning' }
  if (bmi < 25) return { etiket: 'Normal', variant: 'success' }
  if (bmi < 30) return { etiket: 'Fazla Kilolu', variant: 'warning' }
  return { etiket: 'Obez', variant: 'destructive' }
}

export function getDanisanDurumLabel(durum: DanisanDurumu): string {
  return { aktif: 'Aktif', pasif: 'Pasif', beklemede: 'Beklemede' }[durum]
}

export function getDanisanDurumVariant(durum: DanisanDurumu): 'success' | 'secondary' | 'warning' {
  return { aktif: 'success', pasif: 'secondary', beklemede: 'warning' }[durum] as 'success' | 'secondary' | 'warning'
}

export function getRandevuDurumLabel(durum: RandevuDurumu): string {
  return { planlandi: 'Planlandı', tamamlandi: 'Tamamlandı', iptal: 'İptal', gelmedi: 'Gelmedi' }[durum]
}

export function getRandevuDurumVariant(durum: RandevuDurumu): 'info' | 'success' | 'secondary' | 'destructive' {
  return { planlandi: 'info', tamamlandi: 'success', iptal: 'secondary', gelmedi: 'destructive' }[durum] as 'info' | 'success' | 'secondary' | 'destructive'
}

export function getOdemeDurumLabel(durum: OdemeDurumu): string {
  return { odendi: 'Ödendi', bekliyor: 'Bekliyor', gecikti: 'Gecikti' }[durum]
}

export function getOdemeDurumVariant(durum: OdemeDurumu): 'success' | 'warning' | 'destructive' {
  return { odendi: 'success', bekliyor: 'warning', gecikti: 'destructive' }[durum] as 'success' | 'warning' | 'destructive'
}

export function getHedefLabel(hedef: HedefTuru): string {
  return { kilo_verme: 'Kilo Verme', kilo_alma: 'Kilo Alma', koruma: 'Kilo Koruma', kas_kazanimi: 'Kas Kazanımı' }[hedef]
}

export function getInitials(ad: string, soyad: string): string {
  return `${ad[0]}${soyad[0]}`.toUpperCase()
}
