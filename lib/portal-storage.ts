const STORAGE_KEY = "vitanorm_portal_gonderimler"

export interface PortalGonderim {
  id: string
  danisanId: string
  tur: "fotograf" | "kilo" | "su" | "mesaj"
  deger: string
  fotografData?: string
  ogun?: string
  zaman: string
  onaylandi: boolean
  tahminiKalori?: number
  diyetisyenYorumu?: string
  yorumZaman?: string
  yorumOkundu?: boolean
}

export function getGonderimler(): PortalGonderim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function gonderimEkle(gonderim: Omit<PortalGonderim, "id" | "zaman" | "onaylandi">): PortalGonderim {
  const tumGonderimler = getGonderimler()
  const yeni: PortalGonderim = {
    ...gonderim,
    id: String(Date.now()),
    zaman: new Date().toISOString(),
    onaylandi: false,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([yeni, ...tumGonderimler]))
  } catch {
    // Kota doluysa eski fotoğrafları temizleyip tekrar dene
    const sadeceFotosuz = tumGonderimler.map(g => ({ ...g, fotografData: undefined }))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([yeni, ...sadeceFotosuz]))
    } catch {
      // Son çare: sadece son 5 kaydı tut
      localStorage.setItem(STORAGE_KEY, JSON.stringify([yeni, ...sadeceFotosuz.slice(0, 5)]))
    }
  }
  return yeni
}

export function gonderimOnayla(id: string) {
  const tumGonderimler = getGonderimler()
  const guncellenmis = tumGonderimler.map(g =>
    g.id === id ? { ...g, onaylandi: true } : g
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guncellenmis))
}

export function yorumEkle(id: string, yorum: string, kalori?: number) {
  const tumGonderimler = getGonderimler()
  const guncellenmis = tumGonderimler.map(g =>
    g.id === id
      ? {
          ...g,
          onaylandi: true,
          diyetisyenYorumu: yorum,
          yorumZaman: new Date().toISOString(),
          yorumOkundu: false,
          tahminiKalori: kalori ?? g.tahminiKalori,
        }
      : g
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guncellenmis))
}

export function gonderimSil(id: string) {
  const tumGonderimler = getGonderimler()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tumGonderimler.filter(g => g.id !== id)))
}

export function yorumuOkunduIsaretle(id: string) {
  const tumGonderimler = getGonderimler()
  const guncellenmis = tumGonderimler.map(g =>
    g.id === id ? { ...g, yorumOkundu: true } : g
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guncellenmis))
}

/** Öğüne göre gerçekçi kalori tahmini üretir */
export function kaloriTahminEt(ogun?: string): number {
  const ranges: Record<string, [number, number]> = {
    'Kahvaltı':      [320, 550],
    'Öğle yemeği':   [480, 720],
    'Akşam yemeği':  [420, 680],
    'Ara Öğün':      [120, 280],
    'Ara öğün':      [120, 280],
    'Kuşluk':        [150, 300],
    'İkindi':        [150, 300],
  }
  const defaultRange: [number, number] = [350, 600]
  const [min, max] = (ogun ? ranges[ogun] : null) ?? defaultRange
  const raw = Math.floor(Math.random() * (max - min + 1)) + min
  return Math.round(raw / 5) * 5 // 5'in katına yuvarla
}

export function zamanFormatla(isoString: string): string {
  const tarih = new Date(isoString)
  const simdi = new Date()
  const farkMs = simdi.getTime() - tarih.getTime()
  const farkDk = Math.floor(farkMs / 60000)
  const farkSaat = Math.floor(farkDk / 60)
  const farkGun = Math.floor(farkSaat / 24)

  if (farkDk < 1) return "Az önce"
  if (farkDk < 60) return `${farkDk} dakika önce`
  if (farkSaat < 24) return `${farkSaat} saat önce`
  if (farkGun === 1) return "Dün"
  return `${farkGun} gün önce`
}
