/**
 * Client store değişince buraya POST eder.
 * Sunucu tarafı dosya deposunu günceller → otomasyon motoru güncel veriyi okur.
 */

import { NextResponse } from "next/server"
import { saveDanisanlar, saveRandevular, saveOlcumler, getDanisanlar, getRandevular } from "@/lib/server-store"
import type { Danisan, Randevu, Olcum } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      danisanlar?: Danisan[]
      randevular?: Randevu[]
      diyetPlanlari?: unknown
      olcumler?: Olcum[]
      odemeler?: unknown
    }

    // Yeni danışan tespiti → yeni_kayit sequence tetikle
    if (body.danisanlar) {
      const mevcutlar = getDanisanlar()
      const mevcutIds = new Set(mevcutlar.map(d => d.id))
      const yeniler = body.danisanlar.filter(d => !mevcutIds.has(d.id))
      saveDanisanlar(body.danisanlar)

      for (const yeni of yeniler) {
        try {
          const { tetikleYeniKayit } = await import("@/lib/sequence-triggers")
          await tetikleYeniKayit(yeni.id, `${yeni.ad} ${yeni.soyad}`)
        } catch { /* sessiz — sequence hatası sync'i engellemesin */ }
      }
    }

    if (body.randevular) {
      // No-show tespiti → no_show sequence tetikle
      const mevcutRandevular = getRandevular()
      saveDanisanlar(getDanisanlar()) // no-op, sadece aşağıdaki saveRandevular için
      saveRandevular(body.randevular)

      const yeniGelmedi = body.randevular.filter(r => {
        const eskisi = mevcutRandevular.find(m => m.id === r.id)
        return r.durum === "gelmedi" && eskisi?.durum !== "gelmedi"
      })

      if (yeniGelmedi.length > 0) {
        const danisanlar = getDanisanlar()
        for (const rdv of yeniGelmedi) {
          const danisan = danisanlar.find(d => d.id === rdv.danisan_id)
          if (danisan) {
            try {
              const { tetikleNoShow } = await import("@/lib/sequence-triggers")
              const { sequenceAdimlariniCalistir } = await import("@/lib/sequence-runner")
              await tetikleNoShow(danisan.id, `${danisan.ad} ${danisan.soyad}`)
              await sequenceAdimlariniCalistir()
            } catch { /* sessiz */ }
          }
        }
      }
    }

    if (body.olcumler) saveOlcumler(body.olcumler)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Store Sync] Hata:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
