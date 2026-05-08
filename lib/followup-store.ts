/**
 * Follow-up gönderim kaydı — aynı danışana aynı gün mükerrer mesaj gitmesini önler.
 * .data/followup-log.json dosyasına yazar.
 */

import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const LOG_FILE = path.join(DATA_DIR, "followup-log.json")

export type FollowupTip =
  | "randevu_sonrasi"
  | "hareketsiz_danisan"
  | "olcum_hatirlatma"
  | "randevu_yok"

interface FollowupKayit {
  danisanId: string
  tip: FollowupTip
  tarih: string // YYYY-MM-DD
  gonderildi: string // ISO timestamp
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function okuLog(): FollowupKayit[] {
  ensureDir()
  if (!fs.existsSync(LOG_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8")) as FollowupKayit[]
  } catch {
    return []
  }
}

function yazLog(kayitlar: FollowupKayit[]) {
  ensureDir()
  // Son 90 günün kayıtlarını tut, eskilerini temizle
  const esik = new Date()
  esik.setDate(esik.getDate() - 90)
  const esikStr = esik.toISOString().slice(0, 10)
  const temizlenmis = kayitlar.filter(k => k.tarih >= esikStr)
  fs.writeFileSync(LOG_FILE, JSON.stringify(temizlenmis, null, 2))
}

/** Bu danışana bu tipte bugün follow-up gönderildi mi? */
export function gonderildiMi(danisanId: string, tip: FollowupTip, tarih: string): boolean {
  const kayitlar = okuLog()
  return kayitlar.some(k => k.danisanId === danisanId && k.tip === tip && k.tarih === tarih)
}

/** Bu danışana bu tipte son kaç gün içinde follow-up gönderildi mi? */
export function sonGunIcinde(danisanId: string, tip: FollowupTip, gunSayisi: number): boolean {
  const kayitlar = okuLog()
  const esik = new Date()
  esik.setDate(esik.getDate() - gunSayisi)
  const esikStr = esik.toISOString().slice(0, 10)
  return kayitlar.some(k => k.danisanId === danisanId && k.tip === tip && k.tarih >= esikStr)
}

/** Follow-up gönderimini kayıt et */
export function kaydetGonderim(danisanId: string, tip: FollowupTip, tarih: string) {
  const kayitlar = okuLog()
  kayitlar.push({ danisanId, tip, tarih, gonderildi: new Date().toISOString() })
  yazLog(kayitlar)
}

/** Tüm follow-up geçmişi (UI için) */
export function getFollowupLog(): FollowupKayit[] {
  return okuLog().sort((a, b) => b.gonderildi.localeCompare(a.gonderildi))
}
