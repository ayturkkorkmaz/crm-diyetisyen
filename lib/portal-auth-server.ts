/**
 * Danışan portal kimlik doğrulama — Node.js crypto kullanır, harici bağımlılık yok.
 * Şifreler scrypt ile hash'lenir, oturumlar HMAC-SHA256 imzalı JWT ile yönetilir.
 */

import crypto from "crypto"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const ACCOUNTS_FILE = path.join(DATA_DIR, "portal-accounts.json")

// .env'de tanımlanmamışsa güçlü bir varsayılan üret (ilk çalıştırmada sabit kalır)
const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "vitanorm-portal-jwt-secret-gizli-2024"

// ── Hesap dosyası yönetimi ────────────────────────────────────────────────────

export interface PortalHesap {
  danisanId: string
  email: string        // küçük harf, trim edilmiş
  hash: string         // "salt:hashedPassword"
  olusturulma: string
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function getPortalHesaplar(): PortalHesap[] {
  ensureDir()
  if (!fs.existsSync(ACCOUNTS_FILE)) return []
  try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf-8")) as PortalHesap[] }
  catch { return [] }
}

function savePortalHesaplar(hesaplar: PortalHesap[]) {
  ensureDir()
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(hesaplar, null, 2))
}

// ── Şifre hash / doğrulama ────────────────────────────────────────────────────

function hashSifre(sifre: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(sifre, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function sifredogrula(sifre: string, kayitliHash: string): boolean {
  const [salt, hash] = kayitliHash.split(":")
  if (!salt || !hash) return false
  const yeniHash = crypto.scryptSync(sifre, salt, 64).toString("hex")
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(yeniHash, "hex"))
}

// ── JWT ───────────────────────────────────────────────────────────────────────

interface TokenPayload {
  danisanId: string
  email: string
  exp: number
}

function jwtIzaOlustur(payload: TokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const imza = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url")
  return `${header}.${body}.${imza}`
}

function jwtDogrula(token: string): TokenPayload | null {
  try {
    const [header, body, imza] = token.split(".")
    if (!header || !body || !imza) return null
    const beklenenImza = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url")
    if (!crypto.timingSafeEqual(Buffer.from(imza), Buffer.from(beklenenImza))) return null
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// ── Dışa açık fonksiyonlar ────────────────────────────────────────────────────

/** Diyetisyen danışan için portal hesabı oluşturur veya şifresini günceller */
export function portalHesapOlustur(danisanId: string, email: string, sifre: string) {
  const hesaplar = getPortalHesaplar()
  const emailNorm = email.toLowerCase().trim()
  const mevcutIdx = hesaplar.findIndex(h => h.danisanId === danisanId)

  const hesap: PortalHesap = {
    danisanId,
    email: emailNorm,
    hash: hashSifre(sifre),
    olusturulma: new Date().toISOString(),
  }

  if (mevcutIdx >= 0) {
    hesaplar[mevcutIdx] = hesap
  } else {
    hesaplar.push(hesap)
  }
  savePortalHesaplar(hesaplar)
}

/** E-posta + şifre doğrulama → JWT token döner, hata durumunda null */
export function portalGiris(email: string, sifre: string): string | null {
  const hesaplar = getPortalHesaplar()
  const hesap = hesaplar.find(h => h.email === email.toLowerCase().trim())
  if (!hesap) return null
  if (!sifredogrula(sifre, hesap.hash)) return null

  const token = jwtIzaOlustur({
    danisanId: hesap.danisanId,
    email: hesap.email,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 gün
  })
  return token
}

/** Cookie'den token doğrular → danisanId döner */
export function portalTokenDogrula(token: string): { danisanId: string; email: string } | null {
  const payload = jwtDogrula(token)
  if (!payload) return null
  return { danisanId: payload.danisanId, email: payload.email }
}

/** Danışanın portal hesabı var mı kontrol et */
export function portalHesapVarMi(danisanId: string): boolean {
  return getPortalHesaplar().some(h => h.danisanId === danisanId)
}
