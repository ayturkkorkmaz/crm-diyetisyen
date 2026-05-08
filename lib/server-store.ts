/**
 * Sunucu tarafı dosya tabanlı veri deposu.
 * Otomasyon motoru buradan okur, client /api/store/sync ile buraya yazar.
 */

import fs from "fs"
import path from "path"
import { demoDanisanlar, demoRandevular, demoOlcumler } from "./demo-data"
import type { Danisan, Randevu, Olcum } from "./types"

const DATA_DIR = path.join(process.cwd(), ".data")
const DANISANLAR_FILE = path.join(DATA_DIR, "danisanlar.json")
const RANDEVULAR_FILE = path.join(DATA_DIR, "randevular.json")
const OLCUMLER_FILE = path.join(DATA_DIR, "olcumler.json")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function getDanisanlar(): Danisan[] {
  ensureDir()
  if (!fs.existsSync(DANISANLAR_FILE)) return demoDanisanlar
  try {
    return JSON.parse(fs.readFileSync(DANISANLAR_FILE, "utf-8")) as Danisan[]
  } catch {
    return demoDanisanlar
  }
}

export function getRandevular(): Randevu[] {
  ensureDir()
  if (!fs.existsSync(RANDEVULAR_FILE)) return demoRandevular
  try {
    return JSON.parse(fs.readFileSync(RANDEVULAR_FILE, "utf-8")) as Randevu[]
  } catch {
    return demoRandevular
  }
}

export function saveDanisanlar(data: Danisan[]) {
  ensureDir()
  fs.writeFileSync(DANISANLAR_FILE, JSON.stringify(data, null, 2))
}

export function saveRandevular(data: Randevu[]) {
  ensureDir()
  fs.writeFileSync(RANDEVULAR_FILE, JSON.stringify(data, null, 2))
}

export function getOlcumler(): Olcum[] {
  ensureDir()
  if (!fs.existsSync(OLCUMLER_FILE)) return demoOlcumler
  try {
    return JSON.parse(fs.readFileSync(OLCUMLER_FILE, "utf-8")) as Olcum[]
  } catch {
    return demoOlcumler
  }
}

export function saveOlcumler(data: Olcum[]) {
  ensureDir()
  fs.writeFileSync(OLCUMLER_FILE, JSON.stringify(data, null, 2))
}
