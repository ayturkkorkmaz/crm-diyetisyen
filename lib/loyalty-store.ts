/**
 * Loyalty / Gamification — Sunucu tarafı veri deposu.
 * .data/loyalty.json içinde tüm danışan loyalty verisi saklanır.
 * Tüm I/O senkron (mevcut server-store.ts ile tutarlı).
 */

import fs from "fs"
import path from "path"
import {
  EYLEM_PUANLARI,
  GUNLUK_DEDUP,
  ROZETLER,
  CHALLENGE_SABLONLARI,
  seviyeHesapla,
  type EylemTuru,
  type RozetKosulInput,
} from "./loyalty-definitions"

const DATA_DIR = path.join(process.cwd(), ".data")
const LOYALTY_FILE = path.join(DATA_DIR, "loyalty.json")

// ── Tipler ────────────────────────────────────────────────────────────────

export interface EylemKaydi {
  id: string
  tip: EylemTuru
  puan: number
  tarih: string  // ISO
  notlar?: string
}

export interface AktifChallenge {
  sablonId: string
  baslaAt: string   // ISO
  tamamlandi: boolean
  tamamlandiAt?: string
}

export interface DanisanLoyalty {
  danisanId: string
  toplamPuan: number
  seviyeId: number
  mevcutSeri: number
  enUzunSeri: number
  sonAktifTarih: string  // YYYY-MM-DD, "" ilk kayıtta
  kazanilmisRozetler: string[]
  aktifChallenge: AktifChallenge | null
  gecmis: EylemKaydi[]  // son 100 kayıt
}

export interface PuanEkleResult {
  yeniPuan: number
  toplamPuan: number
  seviyeAtladi: boolean
  yeniSeviyeId: number
  kazanilanRozetler: string[]
  challengeTamamlandi: boolean
  seriKoptu: boolean
  mevcutSeri: number
  streakMilestone?: 7 | 30
  dedupAtlandi: boolean
}

type LoyaltyStore = Record<string, DanisanLoyalty>

// ── Dosya I/O ─────────────────────────────────────────────────────────────

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function okuStore(): LoyaltyStore {
  ensureDir()
  try {
    if (!fs.existsSync(LOYALTY_FILE)) return {}
    return JSON.parse(fs.readFileSync(LOYALTY_FILE, "utf8")) as LoyaltyStore
  } catch { return {} }
}

function yazStore(store: LoyaltyStore) {
  ensureDir()
  fs.writeFileSync(LOYALTY_FILE, JSON.stringify(store, null, 2), "utf8")
}

function bos(danisanId: string): DanisanLoyalty {
  return {
    danisanId,
    toplamPuan: 0,
    seviyeId: 1,
    mevcutSeri: 0,
    enUzunSeri: 0,
    sonAktifTarih: "",
    kazanilmisRozetler: [],
    aktifChallenge: null,
    gecmis: [],
  }
}

// ── Pure Yardımcılar ──────────────────────────────────────────────────────

function bugunStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function seriHesapla(
  sonAktifTarih: string,
  mevcutSeri: number,
  bugun: string,
): { yeniSeri: number; seriKoptu: boolean } {
  if (!sonAktifTarih) return { yeniSeri: 1, seriKoptu: false }
  if (sonAktifTarih === bugun) return { yeniSeri: mevcutSeri, seriKoptu: false }

  const dun = new Date(bugun)
  dun.setDate(dun.getDate() - 1)
  const dunStr = dun.toISOString().slice(0, 10)

  if (sonAktifTarih === dunStr) {
    return { yeniSeri: mevcutSeri + 1, seriKoptu: false }
  }
  return { yeniSeri: 1, seriKoptu: true }
}

function gunlukDedupVar(gecmis: EylemKaydi[], tip: EylemTuru, bugun: string): boolean {
  if (!GUNLUK_DEDUP.includes(tip)) return false
  return gecmis.some(k => k.tip === tip && k.tarih.slice(0, 10) === bugun)
}

function rozetKontrol(loyalty: DanisanLoyalty): string[] {
  const input: RozetKosulInput = {
    toplamPuan: loyalty.toplamPuan,
    enUzunSeri: loyalty.enUzunSeri,
    eylemler: loyalty.gecmis.map(k => ({ tip: k.tip, tarih: k.tarih })),
  }
  return ROZETLER
    .filter(r => !loyalty.kazanilmisRozetler.includes(r.id) && r.kosul(input))
    .map(r => r.id)
}

/** Challenge ata — aktif yoksa ilk uygun sablonu seç */
function challengeAta(loyalty: DanisanLoyalty) {
  if (loyalty.aktifChallenge && !loyalty.aktifChallenge.tamamlandi) return

  // Daha önce tamamlananlar
  const tamamlananIds = loyalty.gecmis
    .filter(k => k.tip === "challenge_tamamla" && k.notlar)
    .map(k => k.notlar!)

  const uygun = CHALLENGE_SABLONLARI.filter(s => !tamamlananIds.includes(s.id))
  const havuz = uygun.length > 0 ? uygun : CHALLENGE_SABLONLARI
  const secilen = havuz[0]

  loyalty.aktifChallenge = {
    sablonId: secilen.id,
    baslaAt: new Date().toISOString(),
    tamamlandi: false,
  }
}

/** Challenge tamamlanma kontrolü — SADECE challenge_tamamla değilse çağır */
function challengeKontrol(
  loyalty: DanisanLoyalty,
  tip: EylemTuru,
  bugun: string,
): { sablonId: string; bonus: number } | null {
  const aktif = loyalty.aktifChallenge
  if (!aktif || aktif.tamamlandi) return null

  const sablon = CHALLENGE_SABLONLARI.find(s => s.id === aktif.sablonId)
  if (!sablon || sablon.hedefEylem !== tip) return null

  const pencereBaslangic = new Date(bugun)
  pencereBaslangic.setDate(pencereBaslangic.getDate() - sablon.pencereGun)
  const pencereStr = pencereBaslangic.toISOString().slice(0, 10)

  // gecmis zaten bu eylem dahil (step 2'de eklendi)
  const sayi = loyalty.gecmis.filter(
    k => k.tip === tip && k.tarih.slice(0, 10) >= pencereStr
  ).length

  if (sayi >= sablon.hedefSayi) {
    return { sablonId: aktif.sablonId, bonus: sablon.bonus }
  }
  return null
}

// ── Ana Motor ──────────────────────────────────────────────────────────────

export function puanEkle(
  danisanId: string,
  tip: EylemTuru,
  notlar?: string,
): PuanEkleResult {
  const store = okuStore()
  const loyalty = store[danisanId] ?? bos(danisanId)
  const bugun = bugunStr()

  const baseResult: PuanEkleResult = {
    yeniPuan: 0,
    toplamPuan: loyalty.toplamPuan,
    seviyeAtladi: false,
    yeniSeviyeId: loyalty.seviyeId,
    kazanilanRozetler: [],
    challengeTamamlandi: false,
    seriKoptu: false,
    mevcutSeri: loyalty.mevcutSeri,
    dedupAtlandi: false,
  }

  // 1. Günlük dedup
  if (gunlukDedupVar(loyalty.gecmis, tip, bugun)) {
    store[danisanId] = loyalty
    yazStore(store)
    return { ...baseResult, dedupAtlandi: true }
  }

  // 2. Puan ekle + kayıt oluştur
  const puan = EYLEM_PUANLARI[tip]
  loyalty.gecmis.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tip,
    puan,
    tarih: new Date().toISOString(),
    notlar,
  })
  loyalty.toplamPuan += puan
  baseResult.yeniPuan = puan

  // 3. Seri güncelle (milestone eylemlerini atlat)
  const milestoneEylemler: EylemTuru[] = ["streak_7", "streak_30", "challenge_tamamla"]
  if (!milestoneEylemler.includes(tip)) {
    const { yeniSeri, seriKoptu } = seriHesapla(loyalty.sonAktifTarih, loyalty.mevcutSeri, bugun)
    const eskiSeri = loyalty.mevcutSeri

    loyalty.mevcutSeri = yeniSeri
    loyalty.sonAktifTarih = bugun
    baseResult.seriKoptu = seriKoptu
    baseResult.mevcutSeri = yeniSeri

    if (yeniSeri > loyalty.enUzunSeri) loyalty.enUzunSeri = yeniSeri

    // Seri milestone bonusları (threshold geçişinde tek seferlik)
    const seriOncesi = seriKoptu ? 0 : eskiSeri
    if (yeniSeri >= 30 && seriOncesi < 30) {
      const mPuan = EYLEM_PUANLARI["streak_30"]
      loyalty.gecmis.push({
        id: `${Date.now()}-ms30`,
        tip: "streak_30",
        puan: mPuan,
        tarih: new Date().toISOString(),
        notlar: "30-gün milestone",
      })
      loyalty.toplamPuan += mPuan
      baseResult.yeniPuan += mPuan
      baseResult.streakMilestone = 30
    } else if (yeniSeri >= 7 && seriOncesi < 7) {
      const mPuan = EYLEM_PUANLARI["streak_7"]
      loyalty.gecmis.push({
        id: `${Date.now()}-ms7`,
        tip: "streak_7",
        puan: mPuan,
        tarih: new Date().toISOString(),
        notlar: "7-gün milestone",
      })
      loyalty.toplamPuan += mPuan
      baseResult.yeniPuan += mPuan
      baseResult.streakMilestone = 7
    }
  }

  // 4. Seviye kontrolü
  const eskiSeviye = loyalty.seviyeId
  const yeniSeviye = seviyeHesapla(loyalty.toplamPuan)
  loyalty.seviyeId = yeniSeviye.id
  if (yeniSeviye.id > eskiSeviye) {
    baseResult.seviyeAtladi = true
    baseResult.yeniSeviyeId = yeniSeviye.id
  }
  baseResult.toplamPuan = loyalty.toplamPuan

  // 5. Rozet kontrolü
  const yeniRozetler = rozetKontrol(loyalty)
  loyalty.kazanilmisRozetler.push(...yeniRozetler)
  baseResult.kazanilanRozetler = yeniRozetler

  // 6. Challenge kontrolü (sonsuz döngü koruması)
  if (tip !== "challenge_tamamla") {
    challengeAta(loyalty)
    const tamamlanan = challengeKontrol(loyalty, tip, bugun)
    if (tamamlanan && loyalty.aktifChallenge) {
      loyalty.aktifChallenge.tamamlandi = true
      loyalty.aktifChallenge.tamamlandiAt = new Date().toISOString()

      const challengePuan = EYLEM_PUANLARI["challenge_tamamla"] + tamamlanan.bonus
      loyalty.gecmis.push({
        id: `${Date.now()}-ch`,
        tip: "challenge_tamamla",
        puan: challengePuan,
        tarih: new Date().toISOString(),
        notlar: tamamlanan.sablonId,
      })
      loyalty.toplamPuan += challengePuan
      baseResult.yeniPuan += challengePuan
      baseResult.toplamPuan = loyalty.toplamPuan
      baseResult.challengeTamamlandi = true
    }
  }

  // gecmis son 100 kayıt
  if (loyalty.gecmis.length > 100) {
    loyalty.gecmis = loyalty.gecmis.slice(-100)
  }

  store[danisanId] = loyalty
  yazStore(store)
  return baseResult
}

// ── Okuma Fonksiyonları ────────────────────────────────────────────────────

export function getDanisanLoyalty(danisanId: string): DanisanLoyalty {
  const store = okuStore()
  return store[danisanId] ?? bos(danisanId)
}

export function getTumLoyalty(): DanisanLoyalty[] {
  const store = okuStore()
  return Object.values(store)
}

export function getDanisanGecmis(danisanId: string, limit = 20): EylemKaydi[] {
  const loyalty = getDanisanLoyalty(danisanId)
  return [...loyalty.gecmis].reverse().slice(0, limit)
}
