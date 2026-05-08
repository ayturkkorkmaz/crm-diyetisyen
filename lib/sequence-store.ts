/**
 * Sequence motoru için veri deposu.
 * sequences.json, gorevler.json, alarmlar.json dosyalarını yönetir.
 */

import fs from "fs"
import path from "path"
import crypto from "crypto"

const DATA_DIR = path.join(process.cwd(), ".data")
const SEQ_FILE = path.join(DATA_DIR, "sequences.json")
const GOREV_FILE = path.join(DATA_DIR, "gorevler.json")
const ALARM_FILE = path.join(DATA_DIR, "alarmlar.json")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function oku<T>(dosya: string): T[] {
  ensureDir()
  if (!fs.existsSync(dosya)) return []
  try { return JSON.parse(fs.readFileSync(dosya, "utf-8")) as T[] } catch { return [] }
}

function yaz<T>(dosya: string, veri: T[]) {
  ensureDir()
  fs.writeFileSync(dosya, JSON.stringify(veri, null, 2))
}

// ── Tipler ────────────────────────────────────────────────────────────────────

export type SequenceTetikleyici =
  | "yeni_kayit"
  | "no_show"
  | "aktivite_dusuk"
  | "paket_bitiyor"

export type AdimDurum = "bekliyor" | "gonderildi" | "iptal"

export interface SequenceAdim {
  adimNo: number
  planlanmisAt: string  // ISO
  durum: AdimDurum
  gonderildiAt?: string
}

export interface ActiveSequence {
  id: string
  danisanId: string
  tetikleyici: SequenceTetikleyici
  baslangicAt: string
  adimlar: SequenceAdim[]
}

export type GorevOnceligi = "dusuk" | "orta" | "yuksek" | "acil"
export type GorevDurum = "bekliyor" | "tamamlandi"

export interface Gorev {
  id: string
  danisanId?: string
  baslik: string
  aciklama?: string
  oncelik: GorevOnceligi
  durum: GorevDurum
  kaynak: string
  olusturulduAt: string
  tamamlandiAt?: string
}

export type AlarmTip = "sequence" | "gorev" | "sistem"

export interface Alarm {
  id: string
  tip: AlarmTip
  baslik: string
  mesaj: string
  danisanId?: string
  danisanAd?: string
  okundu: boolean
  olusturulduAt: string
}

// ── Sequence CRUD ─────────────────────────────────────────────────────────────

export function getSequences(): ActiveSequence[] {
  return oku<ActiveSequence>(SEQ_FILE)
}

export function saveSequences(data: ActiveSequence[]) {
  // 30 günden eski tamamlanmış sequence'ları temizle
  const esik = new Date()
  esik.setDate(esik.getDate() - 30)
  const esikStr = esik.toISOString()
  const temiz = data.filter(s =>
    s.adimlar.some(a => a.durum === "bekliyor") ||
    s.baslangicAt >= esikStr
  )
  yaz(SEQ_FILE, temiz)
}

/** Mükerrer önleme: aynı danişan + tetikleyici için aktif sequence varsa yeni eklenmez */
export function sequenceEkle(
  danisanId: string,
  tetikleyici: SequenceTetikleyici,
  adimlar: Omit<SequenceAdim, never>[],
): ActiveSequence | null {
  const mevcut = getSequences()
  const aktifVar = mevcut.some(
    s => s.danisanId === danisanId &&
      s.tetikleyici === tetikleyici &&
      s.adimlar.some(a => a.durum === "bekliyor")
  )
  if (aktifVar) return null

  const yeni: ActiveSequence = {
    id: crypto.randomUUID(),
    danisanId,
    tetikleyici,
    baslangicAt: new Date().toISOString(),
    adimlar,
  }
  saveSequences([...mevcut, yeni])
  return yeni
}

// ── Görev CRUD ────────────────────────────────────────────────────────────────

export function getGorevler(): Gorev[] {
  return oku<Gorev>(GOREV_FILE)
}

export function gorevEkle(gorev: Omit<Gorev, "id" | "olusturulduAt">): Gorev {
  const yeni: Gorev = {
    ...gorev,
    id: crypto.randomUUID(),
    olusturulduAt: new Date().toISOString(),
  }
  yaz(GOREV_FILE, [...getGorevler(), yeni])
  return yeni
}

export function gorevGuncelle(id: string, updates: Partial<Gorev>) {
  const guncellenmis = getGorevler().map(g =>
    g.id === id ? { ...g, ...updates } : g
  )
  yaz(GOREV_FILE, guncellenmis)
}

// ── Alarm CRUD ────────────────────────────────────────────────────────────────

export function getAlarmlar(): Alarm[] {
  return oku<Alarm>(ALARM_FILE)
    .sort((a, b) => b.olusturulduAt.localeCompare(a.olusturulduAt))
}

export function alarmEkle(alarm: Omit<Alarm, "id" | "okundu" | "olusturulduAt">): Alarm {
  const yeni: Alarm = {
    ...alarm,
    id: crypto.randomUUID(),
    okundu: false,
    olusturulduAt: new Date().toISOString(),
  }
  const mevcut = getAlarmlar()
  // Son 200 alarmı tut
  yaz(ALARM_FILE, [yeni, ...mevcut].slice(0, 200))
  return yeni
}

export function alarmlariOkuIslaretle(ids: string[]) {
  const guncellenmis = getAlarmlar().map(a =>
    ids.includes(a.id) ? { ...a, okundu: true } : a
  )
  yaz(ALARM_FILE, guncellenmis)
}

export function tumAlarmlariOku() {
  const guncellenmis = getAlarmlar().map(a => ({ ...a, okundu: true }))
  yaz(ALARM_FILE, guncellenmis)
}
