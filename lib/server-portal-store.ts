/**
 * Sunucu tarafı portal gönderim deposu.
 * WhatsApp'tan gelen ve danışana eşleşen mesajları kalıcı olarak saklar.
 */

import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const WA_FILE = path.join(DATA_DIR, "wa-gonderimler.json")

export interface WaGonderim {
  id: string
  danisanId: string
  danisanAd: string
  from: string        // WA JID (örn: 905321234567@s.whatsapp.net)
  tur: "mesaj" | "fotograf"
  deger: string       // Mesaj metni veya "[Fotoğraf]"
  zaman: string       // ISO string
  onaylandi: boolean
  diyetisyenYorumu?: string
  yorumZaman?: string
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function getWaGonderimler(): WaGonderim[] {
  ensureDir()
  if (!fs.existsSync(WA_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(WA_FILE, "utf-8")) as WaGonderim[]
  } catch {
    return []
  }
}

export function addWaGonderim(g: WaGonderim) {
  const mevcut = getWaGonderimler()
  fs.writeFileSync(WA_FILE, JSON.stringify([g, ...mevcut], null, 2))
}

export function updateWaGonderim(id: string, updates: Partial<WaGonderim>) {
  const mevcut = getWaGonderimler()
  const guncellenmis = mevcut.map(g => g.id === id ? { ...g, ...updates } : g)
  fs.writeFileSync(WA_FILE, JSON.stringify(guncellenmis, null, 2))
}
