/**
 * Tanita Health Planet CSV Parser
 *
 * Health Planet uygulaması farklı dil/cihaz versiyonlarında farklı sütun adları kullanır.
 * Bu parser en yaygın İngilizce, Türkçe ve Japonca sütun isimlerini destekler.
 * CSV'nin son satırı (en güncel ölçüm) alınır.
 */

export interface TanitaOlcum {
  tarih?: string           // YYYY-MM-DD
  kilo_kg?: number
  bmi?: number
  yag_orani?: number       // %
  kas_orani?: number       // % (hesaplanır)
  sivi_orani?: number      // %
  ic_yaglanma?: number     // seviye (1-20)
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
}

// Sütun adı → alan eşleştirmesi (küçük harf, trim sonrası)
const KOLON_ESLEME: Record<string, keyof TanitaOlcum> = {
  // ── Tarih ─────────────────────────────────────────────────────────────────
  "date":                      "tarih",
  "tarih":                     "tarih",
  "measurement date":          "tarih",
  "ölçüm tarihi":              "tarih",
  "date/time":                 "tarih",

  // ── Kilo ─────────────────────────────────────────────────────────────────
  "weight":                    "kilo_kg",
  "weight(kg)":                "kilo_kg",
  "ağırlık":                   "kilo_kg",
  "ağırlık(kg)":               "kilo_kg",
  "kilo":                      "kilo_kg",
  "体重":                       "kilo_kg",

  // ── BMI ──────────────────────────────────────────────────────────────────
  "bmi":                       "bmi",

  // ── Yağ Oranı ────────────────────────────────────────────────────────────
  "body fat %":                "yag_orani",
  "body fat%":                 "yag_orani",
  "fat%":                      "yag_orani",
  "fat %":                     "yag_orani",
  "yağ oranı":                 "yag_orani",
  "yağ oranı(%)":              "yag_orani",
  "vücut yağ oranı":           "yag_orani",
  "体脂肪率":                   "yag_orani",

  // ── Kas Oranı ────────────────────────────────────────────────────────────
  "muscle %":                  "kas_orani",
  "muscle%":                   "kas_orani",
  "skeletal muscle %":         "kas_orani",
  "skeletal muscle rate":      "kas_orani",
  "kas oranı":                 "kas_orani",
  "kas oranı(%)":              "kas_orani",
  "筋肉率":                     "kas_orani",

  // ── Sıvı Oranı ───────────────────────────────────────────────────────────
  "body water %":              "sivi_orani",
  "body water%":               "sivi_orani",
  "tbw %":                     "sivi_orani",
  "tbw%":                      "sivi_orani",
  "total body water %":        "sivi_orani",
  "sıvı oranı":                "sivi_orani",
  "sıvı oranı(%)":             "sivi_orani",
  "体水分率":                   "sivi_orani",

  // ── İç Yağlanma ──────────────────────────────────────────────────────────
  "visceral fat":              "ic_yaglanma",
  "visceral fat level":        "ic_yaglanma",
  "visceral fat rating":       "ic_yaglanma",
  "iç yağlanma":               "ic_yaglanma",
  "iç yağ seviyesi":           "ic_yaglanma",
  "内臓脂肪レベル":              "ic_yaglanma",

  // ── Segmental — Sol Kol ──────────────────────────────────────────────────
  "left arm muscle mass":      "sol_kol_kas_kg",
  "left arm muscle mass(kg)":  "sol_kol_kas_kg",
  "left arm muscle(kg)":       "sol_kol_kas_kg",
  "sol kol kas kütlesi":       "sol_kol_kas_kg",
  "sol kol kas(kg)":           "sol_kol_kas_kg",
  "左腕筋肉量":                  "sol_kol_kas_kg",

  "left arm fat mass":         "sol_kol_yag_kg",
  "left arm fat mass(kg)":     "sol_kol_yag_kg",
  "left arm fat(kg)":          "sol_kol_yag_kg",
  "sol kol yağ kütlesi":       "sol_kol_yag_kg",
  "sol kol yağ(kg)":           "sol_kol_yag_kg",
  "左腕脂肪量":                  "sol_kol_yag_kg",

  // ── Segmental — Sağ Kol ──────────────────────────────────────────────────
  "right arm muscle mass":     "sag_kol_kas_kg",
  "right arm muscle mass(kg)": "sag_kol_kas_kg",
  "right arm muscle(kg)":      "sag_kol_kas_kg",
  "sağ kol kas kütlesi":       "sag_kol_kas_kg",
  "sağ kol kas(kg)":           "sag_kol_kas_kg",
  "右腕筋肉量":                  "sag_kol_kas_kg",

  "right arm fat mass":        "sag_kol_yag_kg",
  "right arm fat mass(kg)":    "sag_kol_yag_kg",
  "right arm fat(kg)":         "sag_kol_yag_kg",
  "sağ kol yağ kütlesi":       "sag_kol_yag_kg",
  "sağ kol yağ(kg)":           "sag_kol_yag_kg",
  "右腕脂肪量":                  "sag_kol_yag_kg",

  // ── Segmental — Gövde ────────────────────────────────────────────────────
  "trunk muscle mass":         "govde_kas_kg",
  "trunk muscle mass(kg)":     "govde_kas_kg",
  "trunk muscle(kg)":          "govde_kas_kg",
  "gövde kas kütlesi":         "govde_kas_kg",
  "gövde kas(kg)":             "govde_kas_kg",
  "体幹筋肉量":                  "govde_kas_kg",

  "trunk fat mass":            "govde_yag_kg",
  "trunk fat mass(kg)":        "govde_yag_kg",
  "trunk fat(kg)":             "govde_yag_kg",
  "gövde yağ kütlesi":         "govde_yag_kg",
  "gövde yağ(kg)":             "govde_yag_kg",
  "体幹脂肪量":                  "govde_yag_kg",

  // ── Segmental — Sol Bacak ────────────────────────────────────────────────
  "left leg muscle mass":      "sol_bacak_kas_kg",
  "left leg muscle mass(kg)":  "sol_bacak_kas_kg",
  "left leg muscle(kg)":       "sol_bacak_kas_kg",
  "sol bacak kas kütlesi":     "sol_bacak_kas_kg",
  "sol bacak kas(kg)":         "sol_bacak_kas_kg",
  "左脚筋肉量":                  "sol_bacak_kas_kg",

  "left leg fat mass":         "sol_bacak_yag_kg",
  "left leg fat mass(kg)":     "sol_bacak_yag_kg",
  "left leg fat(kg)":          "sol_bacak_yag_kg",
  "sol bacak yağ kütlesi":     "sol_bacak_yag_kg",
  "sol bacak yağ(kg)":         "sol_bacak_yag_kg",
  "左脚脂肪量":                  "sol_bacak_yag_kg",

  // ── Segmental — Sağ Bacak ────────────────────────────────────────────────
  "right leg muscle mass":     "sag_bacak_kas_kg",
  "right leg muscle mass(kg)": "sag_bacak_kas_kg",
  "right leg muscle(kg)":      "sag_bacak_kas_kg",
  "sağ bacak kas kütlesi":     "sag_bacak_kas_kg",
  "sağ bacak kas(kg)":         "sag_bacak_kas_kg",
  "右脚筋肉量":                  "sag_bacak_kas_kg",

  "right leg fat mass":        "sag_bacak_yag_kg",
  "right leg fat mass(kg)":    "sag_bacak_yag_kg",
  "right leg fat(kg)":         "sag_bacak_yag_kg",
  "sağ bacak yağ kütlesi":     "sag_bacak_yag_kg",
  "sağ bacak yağ(kg)":         "sag_bacak_yag_kg",
  "右脚脂肪量":                  "sag_bacak_yag_kg",
}

function parseSayi(v: string): number | undefined {
  const n = parseFloat(v.replace(",", ".").trim())
  return isNaN(n) ? undefined : n
}

function parseTarih(v: string): string | undefined {
  // Desteklenen formatlar: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD, DD.MM.YYYY
  const s = v.trim()

  // YYYY-MM-DD veya YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`

  // DD/MM/YYYY veya DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`

  // Sadece ilk kısmı al (bazen "2024-05-11 09:32" formatında gelir)
  const dateOnly = s.split(/[\sT]/)[0]
  if (dateOnly !== s) return parseTarih(dateOnly)

  return undefined
}

function csvSatirAyir(line: string): string[] {
  // Tırnaklar içindeki virgülleri dikkate alan basit CSV parser
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === "," && !inQuotes) { result.push(current.trim().replace(/^"|"$/g, "")); current = "" }
    else { current += ch }
  }
  result.push(current.trim().replace(/^"|"$/g, ""))
  return result
}

export function tanitaCsvParse(csvText: string): TanitaOlcum | null {
  const satirlar = csvText.split(/\r?\n/).filter(s => s.trim())
  if (satirlar.length < 2) return null

  // Başlık satırını bul (genelde ilk satır, ama bazı cihazlar ek metadata ekler)
  let baslikIdx = 0
  for (let i = 0; i < Math.min(5, satirlar.length); i++) {
    const lower = satirlar[i].toLowerCase()
    if (lower.includes("weight") || lower.includes("ağırlık") || lower.includes("体重") || lower.includes("date") || lower.includes("tarih")) {
      baslikIdx = i
      break
    }
  }

  const basliklar = csvSatirAyir(satirlar[baslikIdx]).map(h => h.toLowerCase().trim())

  // Veri satırlarından boş olmayanları al, son satır en güncel
  const veriSatirlari = satirlar.slice(baslikIdx + 1).filter(s => s.trim() && !s.startsWith("#"))
  if (veriSatirlari.length === 0) return null

  // En son ölçüm = son satır
  const sonSatir = csvSatirAyir(veriSatirlari[veriSatirlari.length - 1])

  const olcum: TanitaOlcum = {}

  basliklar.forEach((baslik, i) => {
    const alan = KOLON_ESLEME[baslik]
    if (!alan) return
    const deger = sonSatir[i]?.trim()
    if (!deger || deger === "-" || deger === "") return

    if (alan === "tarih") {
      olcum.tarih = parseTarih(deger)
    } else {
      const sayi = parseSayi(deger)
      if (sayi !== undefined) (olcum as Record<string, number>)[alan] = sayi
    }
  })

  // En az kilo varsa geçerli say
  if (!olcum.kilo_kg) return null

  // Bugünden ileri tarihse tarihi bugün yap
  const bugun = new Date().toISOString().slice(0, 10)
  if (olcum.tarih && olcum.tarih > bugun) olcum.tarih = bugun

  return olcum
}
